import {
  ChangeStateType,
  MemberType,
  DayOfWeekType,
  WeatherType,
  SupplierType,
  HouryType,
  OptionalType,
  YearType,
  MonthType,
  DaysType,
} from "../const";

export type CashData = {
  cash: number;
  fakeCash?: number;
};

export type SaleData = {
  year: YearType;
  month: MonthType;
  day: DaysType;
  dayOfWeek: DayOfWeekType;
  cash: number;
  card: number;
  eMoney: number;
  uber: number;
  guests: number;
  weather: WeatherType;
  total: number;
  impression: string;
  staffSalaries: number;
  optionals: OptionalType[];
};

export class Sale {
  constructor(
    public year: YearType,
    public month: MonthType,
    public day: DaysType,
    public dayOfWeek: DayOfWeekType,
    public cash: number,
    public card: number,
    public eMoney: number,
    public uber: number,
    public guests: number,
    public weather: WeatherType,
    public total: number,
    public impression: string,
    public suppliers: SupplierType,
    public staffSalaries: number,
    // 固有のフィールド
    public changes: ChangeStateType,
    public members: MemberType[],
    public optionals: OptionalType[],
    public fakeCash: number
  ) {}
}

export class Members {
  constructor(
    public name: string,
    public salary: HouryType,
    public createdAt: Date
  ) {}
}

export class StaffInfo {
  constructor(
    public name: string,
    public email: string,
    public password: string,
    public isDeleted: boolean,
    public createdAt: Date,
    public salary: number
  ) {}
}
