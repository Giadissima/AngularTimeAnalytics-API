import * as morgan from 'morgan';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { exit } from 'process';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json');

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.use(morgan('dev'));
  /* attivazione di Swagger e configurazione*/
  if (configService.get<boolean>('enableSwagger')) {
    const config = new DocumentBuilder()
      .setTitle('Send-Wise API')
      .setVersion(version);
    // .addBearerAuth();
    const document = SwaggerModule.createDocument(app, config.build());
    SwaggerModule.setup(`/swagger`, app, document, {
      customSiteTitle: 'Send-Wise API Config',
      swaggerOptions: {
        persistAuthorization: true,
      },
      customCss: `
          .swagger-ui .topbar { display: none; }
          .swagger-ui .info .title::before { display: inline-block; width: 226px; height: 65px; margin: -50px 0; position: relative; content: ''; vertical-align: middle; background-size: contain; background-repeat: no-repeat; background-position: left center; background-image: url(https://log-in.benetti.3logic.it/assets/img/logo.png); }
          `,
    });
  }
  try {
    await app.listen(configService.get<number>('PORT', 3000));
  } catch (ex) {
    logger.error(ex);
    await app.close().catch(() => { });
    exit(1);
  }
}
bootstrap();
