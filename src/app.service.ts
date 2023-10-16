import { DataChart, DataChartResponse, FiltersBarChartDataRequest, FiltersPieChartDataRequest } from "./model/model";
import { addHours, addMinutes, compareAsc, differenceInDays, differenceInHours, parseISO } from "date-fns";

import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }

  postBarChartData(filters: FiltersBarChartDataRequest): DataChartResponse {
    let result: DataChart[] = [];
    let offset: number = 24;
    let dateBegin = parseISO((String)(filters.dateBeginSelected));
    let dateEnd = parseISO((String)(filters.dateEndSelected));
    let hour_selected: boolean = false
    dateBegin.setMinutes(0);
    dateEnd.setMinutes(0);
    dateBegin.setSeconds(0);
    dateEnd.setSeconds(0);

    
    if (differenceInDays(dateEnd, dateBegin) < 4){
      offset = Number(filters.interval[0]);
    }

    console.log(differenceInHours(dateEnd, dateBegin) == 1)
    if (differenceInHours(dateEnd, dateBegin) == 1){
      hour_selected = true;
    }

    while (compareAsc(dateBegin, dateEnd) == -1) {
      let value: number;
      
      filters.container == "Tutti"
      ? (value = Math.random() * 20)
      : (value = Math.random() * 10);
      if (filters.dataAssets == "alarms" && value >= 10) value -= 10;
      
      result.push({ name: String(dateBegin), value: Math.floor(value) });
      if(hour_selected)
      dateBegin = addMinutes(dateBegin, 5);
      else
    dateBegin = addHours(dateBegin, offset);
    }

    return { response: result };
  }

  postPieChartData(filters: FiltersPieChartDataRequest): DataChartResponse {
    const TOT_CONTAINERS = 3
    let result: DataChart[] = [];
    const diffDays = differenceInDays(parseISO((String)(filters.dateEndSelected)), parseISO((String)(filters.dateBeginSelected)))
    
    for (let i = 1; i <= TOT_CONTAINERS; i++) {
      let value = Math.floor(Math.random() * 20 * ((diffDays+1) *1.25));
      if (filters.dataAssets == "alarms" && value >= 10) value -= 10;
      result.push({ name: `Container ${i}`, value });
    }

    return { response: result };
  }
}
