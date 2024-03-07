import React, { useState } from "react";
import useSWR from "swr";
import {
  Member,
  MemberRepository,
  SaleRepository,
} from "../features/sales/Repositories";
import { Loading } from "./loading";
import {
  MemberType,
  HOURS,
  MINUTES,
  DayOfWeekType,
  DaysType,
  MonthType,
  YearType,
  STATUS,
  WEATHERS,
  WeatherType,
  OptionalType,
} from "../features/const";
import { Select } from "./Select";
import { DatePickerForm } from "./DatePickerForm";
import { SaleLabelSection } from "./SaleLabelSection";
import { SaleFormSection } from "./SaleFormSection";
import { SuppliersFormSection, SuppliersType } from "./SuppliersFormSection";
import { ChangesFormSection, ChangesType } from "./ChangesFormSection";
import { AttendaceFormSection } from "./AttendaceFormSection";
import { LabelWithSaleInfo } from "./Label";
import { Sale, SaleData } from "../features/sales/Entities";
import { SubmitButton } from "./Submit";

export const hasNoGuests = (sale: SaleData) => {
  return !sale.guests && (sale.cash || sale.card || sale.eMoney);
};
export const hasOnDutyMembers = (members: MemberType[]) => {
  return members.some((m) => m.status === "出勤");
};
export const hasEmptyName = (optional: OptionalType) => {
  return optional.value && !optional.name;
};
// 給料計算を分割
export const sumSalaries = (members: MemberType[]) => {
  return members.reduce((total, m) => total + m.amount, 0);
};
export const roundUp = (value: number) => {
  return Math.ceil(value);
};

export const createMembers = ({ members }: { members: Member[] }) =>
  members.map((member) => ({
    name: member.name,
    status: STATUS.offWork,
    fromHour: HOURS[0],
    fromMin: MINUTES[0],
    toHour: HOURS[0],
    toMin: MINUTES[0],
    hourly: member.salary,
    amount: 0,
  }));

const CreateForm = ({
  year,
  month,
  day,
  dayOfWeek,
  staff,
  sales,
}: {
  year: YearType;
  month: MonthType;
  day: DaysType;
  dayOfWeek: DayOfWeekType;
  staff: MemberType[];
  sales: Sale[];
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [members, setMembers] = useState<MemberType[]>(staff);
  const [sale, setSale] = useState<SaleData>({
    year: year,
    month: month,
    day: day,
    dayOfWeek: dayOfWeek,
    cash: 0,
    card: 0,
    eMoney: 0,
    uber: 0,
    guests: 0,
    weather: "晴れ" as WeatherType,
    total: 0,
    impression: "",
    staffSalaries: 0,
    optionals: [],
  });

  const [suppliers, setSuppliers] = useState<SuppliersType>({
    ganaha: 0,
    BEEFshin: 0,
    sumi: 0,
    suehiro: 0,
    sakihama: 0,
    miyazato: 0,
    sunny: 0,
    shopping: 0,
    furikomiFee: 0,
    cardFee: 0,
    eigyou: 0,
    koutuhi: 0,
    yachin: 0,
    kounetuhi: 0,
    tushinhi: 0,
    zappi: 0,
    gyoumu: 0,
  });

  const [changes, setChanges] = useState<ChangesType>({
    Ichiman: 0,
    Gosen: 0,
    Nisen: 0,
    Sen: 0,
    Gohyaku: 0,
    Hyaku: 0,
    Gojyu: 0,
    Jyu: 0,
    Go: 0,
    Ichi: 0,
  });

  const onSubmit = async () => {
    try {
      setLoading(true);
      if (hasNoGuests(sale)) {
        throw new Error("来客数が未入力です");
      }
      const onDutyMembers = members.filter((m) => m.status === "出勤");
      if (!hasOnDutyMembers(onDutyMembers)) {
        throw new Error("出勤者が未入力です");
      }
      sale.optionals?.forEach((op) => {
        if (hasEmptyName(op)) {
          throw new Error("項目名が未入力です");
        }
      });
      // 主要ロジックがシンプルに
      const staffSalaries = roundUp(sumSalaries(onDutyMembers));
      const param = {
        ...sale,
        staffSalaries,
        suppliers,
        changes,
        members,
        fakeCash: 0,
      };
      await SaleRepository.create(param);
      alert("🚀今日もお疲れ様でした😊");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="保存中.." />;
  return (
    <>
      <div className="grid grid-cols-3 gap-2 mx-auto max-w-3xl">
        <div className="col-span-3 md:col-span-1">
          <Select
            options={[...WEATHERS]}
            htmlFor={"weather"}
            textSize={"text-3xl"}
            value={sale.weather}
            onChange={(e) => {
              setSale((sale) => ({
                ...sale,
                weather: e.target.value as WeatherType,
              }));
            }}
            fullWidth
          />
        </div>
        <div className="col-span-3 md:col-span-2 flex justify-center">
          <DatePickerForm
            year={year}
            month={month}
            day={day}
            dayOfWeek={dayOfWeek}
          />
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-3xl sm:mt-20 sm:rounded-lg">
        <SaleLabelSection
          currentDay={day}
          todaySale={sale}
          monthlySales={sales}
          month={month}
        />
      </div>
      <div className="mx-auto mt-16 max-w-3xl overflow-x-auto sm:mt-20 sm:rounded-lg">
        <SaleFormSection<SaleData>
          todaySale={sale}
          setTodaySale={setSale}
          todayCash={sale.cash}
        />
        <div className="mt-5 flex justify-end text-right">
          <LabelWithSaleInfo
            name="total"
            value={sale.cash + sale.card + sale.eMoney}
            label="売上合計"
          />
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-3xl overflow-x-auto sm:mt-20 sm:rounded-lg">
        <SuppliersFormSection<SaleData>
          sales={sales}
          setSale={setSale}
          optionals={sale.optionals}
          suppliers={suppliers}
          setSuppliers={setSuppliers}
        />
      </div>
      <div className="mx-auto mt-16 max-w-3xl overflow-x-auto sm:mt-20 sm:rounded-lg">
        <ChangesFormSection changes={changes} setChanges={setChanges} />
      </div>
      <div className="mx-auto mt-16 max-w-3xl overflow-x-auto sm:mt-20 sm:rounded-lg">
        <AttendaceFormSection
          sales={sales}
          members={members}
          setMembers={setMembers}
        />
      </div>
      <div className="mx-auto mt-16 max-w-3xl sm:mt-20">
        <div className="mt-10 sm:col-span-2">
          <h5 className="text-3xl text-gray-400">所感</h5>
          <div className="mt-2.5">
            <textarea
              name="message"
              id="message"
              rows={8}
              className="block w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
              value={sale.impression}
              onChange={(e) =>
                setSale((sale) => ({
                  ...sale,
                  impression: e.target.value,
                }))
              }
              placeholder="業務連絡・報告事項・改善点など記入してください"
            />
          </div>
        </div>
        <div className="w-11/12 h-16 fixed inset-x-0 mx-auto bottom-16 flex justify-center items-center">
          <SubmitButton
            title={`${month}月${day}日(${dayOfWeek})の日報として保存する`}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </>
  );
};

export const CreateFormContent = ({
  year,
  month,
  day,
  dayOfWeek,
  sales,
}: {
  year: YearType;
  month: MonthType;
  day: DaysType;
  dayOfWeek: DayOfWeekType;
  sales: Sale[];
}) => {
  const { data: staff } = useSWR("/admin/members", () =>
    MemberRepository.getMembers()
  );
  if (!staff) return <Loading message="読み込み中.." />;
  const members = createMembers({ members: staff });

  return (
    <CreateForm
      year={year}
      month={month}
      day={day}
      dayOfWeek={dayOfWeek}
      staff={members}
      sales={sales}
    />
  );
};
