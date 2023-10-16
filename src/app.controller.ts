import { Body, Controller, Get, Post } from '@nestjs/common';
import { DataChartResponse, FiltersBarChartDataRequest } from './model/model';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('chart/bar/data')
  postBarChartData(@Body() filters: FiltersBarChartDataRequest): DataChartResponse {
    return this.appService.postBarChartData(filters);
  }

  @Post('chart/pie/data')
  postPieChartData(@Body() filters: FiltersBarChartDataRequest): DataChartResponse {
    return this.appService.postPieChartData(filters);
  }
}
