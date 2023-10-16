import { ValidateApiProperty } from "src/ultils/utils";

export interface DataChart {
  name: string;
  value: number;
}

export interface DataChartResponse {
  response: DataChart[];
}

export class FiltersBarChartDataRequest {
  @ValidateApiProperty()
  dateBeginSelected: Date;
  @ValidateApiProperty()
  dateEndSelected: Date;
  @ValidateApiProperty()
  interval: string;
  @ValidateApiProperty()
  container: string;
  @ValidateApiProperty()
  dataAssets: "alarms" | "people";
}

export class FiltersPieChartDataRequest {
  @ValidateApiProperty()
  dateBeginSelected: Date;
  @ValidateApiProperty()
  dateEndSelected: Date;
  @ValidateApiProperty()
  dataAssets: "alarms" | "people";
}