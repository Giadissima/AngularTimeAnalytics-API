import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions } from "@nestjs/swagger";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength, ValidationOptions } from "class-validator";
import { IsEmail, Max, ValidateNested, ValidationArguments, isMongoId, registerDecorator } from 'class-validator';
import { Transform, Type, } from "class-transformer";
import { inheritPropertyInitializers, inheritTransformationMetadata, inheritValidationMetadata } from '@nestjs/mapped-types';
import nest, { BadRequestException, applyDecorators } from "@nestjs/common";

import { parseISO } from "date-fns";

export function ValidateApiProperty(
  options?: ApiPropertyOptions & { isEmail?: boolean, enum?: Record<string, any>, debug?: boolean },
) {
  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [];
  const isArray = options?.isArray === true || Array.isArray(options?.type);
  const validationOptions: ValidationOptions = {
    each: isArray,
  };

  if (Array.isArray(options?.type) && !options?.type.length) {
    throw new Error('Cannot have a property type with an empty array');
  }

  // let type = Array.isArray(options?.type) ? options!.type[0] : (options?.type ?? String);
  let type: any;
  if (Array.isArray(options?.type)) {
    type = options!.type[0];
  } else if (!options?.enum) {
    type = options?.type ?? String;
  }

  const constructorName = type?.prototype?.constructor?.name;

  // Apply the Swagger [ApiProperty] decorator accordinly
  // If property is not required, it will be marked as [IsOptional] to class validator
  if (options?.required) {
    decorators.push(ApiProperty(options));
  } else {
    decorators.push(
      ApiPropertyOptional(options),
      IsOptional(validationOptions),
    );
  }

  // Apply [Type] transformer if type param is a function (constructor)
  // Since the type is a function, also apply the [ValidateNested]
  if (typeof type === 'function') {
    if (!['String', 'Date'].includes(constructorName) && !isMongoId) {
      decorators.push(Type(() => type));
    }

    if (constructorName === 'String') {
      decorators.push(IsString(validationOptions));

      // Applies [MaxLength] validator
      if (options?.maxLength != null) {
        decorators.push(MaxLength(options.maxLength));
      }

      // Applies [MinLength] validator
      if (options?.minLength != null) {
        decorators.push(MinLength(options.minLength));
      }

      if (options?.isEmail) {
        decorators.push(IsEmail(undefined, validationOptions));
      }

    } else if (constructorName === 'Number') {
      decorators.push(IsNumber());

      // Applies [Min] validator
      if (options?.minimum) {
        decorators.push(Min(options.minimum));
      }

      // Applies [Max] validator
      if (options?.maximum) {
        decorators.push(Max(options.maximum));
      }
    } else if (constructorName === 'Boolean') {
      decorators.push(IsBoolean(validationOptions));
      decorators.push(
        Transform(({ obj, key }) => obj[key] === 'true' || obj[key] === true),
      );
    } else if (constructorName === 'Date') {
      decorators.push(
        Transform(({ obj, key }) => {
          try {
            if (!options?.required && !obj[key]) return undefined;
            return parseISO(obj[key]);
          } catch (_) {
            throw new BadRequestException(
              'INVALID_DATE',
              'date must be a valid ISO 8601 date string',
            );
          }
        }),
      );
    } else {
      decorators.push(ValidateNested(validationOptions));
    }
  }

  // Apply [IsArray] validator
  // Also check for length constraints
  if (isArray) {
    // Ensure that the received value is an array
    decorators.push(
      Transform(({ value }: any) => {
        if (typeof value === 'string') return value.split(',');
        return value;
      }),
    );

    decorators.push(IsArray());

    // Applies [MaxLength] validator
    if (options?.maxItems != null) {
      decorators.push(ArrayMaxSize(options.maxItems));
    }

    // Applies [MinLength] validator
    if (options?.minItems != null) {
      decorators.push(ArrayMinSize(options.minItems));
    }
  }

  // Apply [IsEnum] validator
  if (options?.enum) {
    decorators.push(
      Transform((v) => {
        const value = options.enum?.[v.value] || options.enum?.[v.value.toUpperCase()];
        return options.enum?.[value] || options.enum?.[value.toUpperCase()] || value;
      }),
      IsEnum(options.enum, validationOptions),
    );
  }

  return applyDecorators(...decorators);
}