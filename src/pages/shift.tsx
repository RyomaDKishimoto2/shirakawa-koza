import ProtectedRoute from "../../components/ProtectedRoute";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { MonthType, YearType, DaysType } from "../../features/const";
import useSWR from "swr";
import { SaleRepository } from "../../features/sales/Repositories";
import { FC, Fragment, useEffect, useState } from "react";
import { calcTotalSalary, calculateTotalWorkHours } from "@/utils";
import { MemberRepository } from "../../features/sales/Repositories";
import DatePicker, { registerLocale } from "react-datepicker";
import { Listbox, Tab, Transition } from "@headlessui/react";
import "react-datepicker/dist/react-datepicker.css";
import ja from "date-fns/locale/ja";
import { CheckIcon, ChevronUpDownIcon, ClockIcon, CurrencyYenIcon } from "@heroicons/react/24/solid";
import { Members } from "../../features/sales/Entities";
registerLocale("ja", ja);

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const ShitPage: NextPage = () => {
  const router = useRouter();
  const now = new Date();
  const year = Number(router.query.year || now.getFullYear()) as YearType;
  const month = Number(router.query.month || now.getMonth() + 1) as MonthType;
  const day = Number(router.query.day || now.getDate()) as DaysType;
  const [active, setActive] = useState<string>("");
  const [selected, setSelected] = useState<Members | null>(null);
  const [startDate, setStartDate] = useState<Date>(
    new Date(`${year}/${month}/${day}`)
  );
  const [totalSalary, setTotalSalary] = useState<number>(0);
  const [totalWorkHours, setTotalWorkHours] = useState<number>(0);

  const handleChange = (date: Date) => {
    setStartDate(date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    router.replace({
      query: {
        ...router.query,
        year,
        month,
      },
    });
  };

  const { data, mutate } = useSWR(
    year && month ? `/api/sales/${year}/${month}/${day}` : null,
    async () => {
      return await SaleRepository.getSales({ year, month });
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    }
  );
  
  const { data: staff } = useSWR(
    "/admin/members",
    async () => {
      return await MemberRepository.getMembers();
    },
    { refreshWhenHidden: false }
  );

  useEffect(() => {
    if (!data) {
      return;
    }
    const totalSalary = calcTotalSalary({
      name: active,
      sales: data,
    });
    setTotalSalary(totalSalary);
  }, [data]);

  useEffect(() => {
    mutate();
  }, [month]);

  useEffect(() => {
    if (!staff) {
      return;
    }
    setActive(staff[0].name);
    setSelected(staff[0]);
  }, [staff]);

  useEffect(() => {
    if (!data) {
      return;
    }
    const totalSalary = calcTotalSalary({
      name: active,
      sales: data,
    });
    setTotalSalary(totalSalary);
  }, [active]);

  useEffect(() => {
    if (!selected || !data) {
      return;
    }
    const totalSalary = calcTotalSalary({
      name: selected.name,
      sales: data,
    });
    setTotalSalary(totalSalary);

    const totalWorkHours = calculateTotalWorkHours({
      name: selected.name,
      sales: data,
    });
    setTotalWorkHours(totalWorkHours);
  }, [selected]);

  const SalaryHoursSection: FC<{ isMobile: boolean }> = ({ isMobile }) => {
    return (
      <div className={`${isMobile ? "md:hidden" : "hidden sm:block"}`}>
        <div
          className={`grid gap-2 mt-3 mb-8 md:grid-cols-2 p-3 ${
            isMobile ? null : "xl:grid-cols-2"
          }`}
        >
          <div className="min-w-0 overflow-hidden bg-white border border-gray-200 rounded-lg shadow">
            <div className="p-4 flex items-center">
              <div className="p-3 rounded-full text-orange-500 bg-orange-500 mr-4">
                <CurrencyYenIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {month}月の委託費
                </p>
                <p className="text-lg font-semibold text-black">
                  {totalSalary.toLocaleString("ja-JP", {
                    style: "currency",
                    currency: "JPY",
                  })}
                </p>
              </div>
            </div>
          </div>
          <div className="min-w-0 overflow-hidden bg-white border border-gray-200 rounded-lg shadow dark:bg-darker">
            <div className="p-4 flex items-center">
              <div className="p-3 rounded-full text-orange-500 bg-orange-500 mr-4">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {month}月の労働時間
                </p>
                <p className="text-lg font-semibold text-black">
                  {totalWorkHours}時間
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="isolate bg-gray-50 py-14 px-5 pb-14 sm:pb-14 lg:px-8">
        <div className="grid grid-cols-3 gap-2 mx-auto max-w-3xl">
          <div className="col-span-5 flex justify-center items-center">
            <div className="relative inline-flex items-center text-center px-3">
              <DatePicker
                portalId="root-portal"
                locale={ja}
                className="p-2.5 border border-gray-400 rounded-md cursor-pointer text-3xl w-full"
                selected={startDate}
                onChange={handleChange}
                dateFormat="yyyy/MM"
                showMonthYearPicker
                showFullMonthYearPicker
              />
              <div className="absolute inline-flex items-center justify-center text-md font-bold bg-gray-900 text-white border-2 border-white rounded-full -bottom-5 right-5  px-3 py-1 w-fit">
                月の勤怠表
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="block sm:hidden p-3 pb-20 border">
        <Listbox value={selected} onChange={setSelected}>
          {({ open }) => (
            <>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6">
                  <span className="flex items-center">
                    <span className="ml-3 block truncate">
                      {selected?.name}
                    </span>
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>

                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {staff?.map((person) => (
                      <Listbox.Option
                        key={person.name}
                        className={({ active }) =>
                          classNames(
                            active ? "bg-gray-900 text-white" : "text-gray-900",
                            "relative cursor-default select-none py-2 pl-3 pr-9"
                          )
                        }
                        value={person}
                      >
                        {({ selected, active }) => (
                          <>
                            <div className="flex items-center">
                              <span
                                className={classNames(
                                  selected ? "font-semibold" : "font-normal",
                                  "ml-3 block truncate"
                                )}
                              >
                                {person.name}
                              </span>
                            </div>

                            {selected ? (
                              <span
                                className={classNames(
                                  active ? "text-white" : "text-indigo-600",
                                  "absolute inset-y-0 right-0 flex items-center pr-4"
                                )}
                              >
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </>
          )}
        </Listbox>
        <SalaryHoursSection isMobile={true} />
        <div className="flex overflow-x-auto border p-2 mt-2 rounded">
          <div className="flex-none">
            {staff?.map((s) => {
              return (
                <div
                  key={s.name}
                  id="tabs-with-underline-1"
                  role="tabpanel"
                  aria-labelledby="tabs-with-underline-item-1"
                  className={`${selected?.name === s.name ? "" : "hidden"}`}
                >
                  <table className="table-auto w-full mt-3">
                    <thead>
                      <tr className="text-left">
                        <th className="px-4 py-2">日付</th>
                        <th className="px-4 py-2">勤怠</th>
                        <th className="px-4 py-2">開始時間</th>
                        <th className="px-4 py-2">終了時間</th>
                        <th className="px-4 py-2">時給</th>
                        <th className="px-4 py-2">日給</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data
                        ?.sort((a, b) => a.day - b.day)
                        .map((d) => {
                          return d.members.map((m) => {
                            return m.name === s.name ? (
                              <tr key={`${d.day}_${s.name}`} className="break-all">
                                <td className="border px-4 py-2">
                                  {d.day}({d.dayOfWeek})
                                </td>
                                <td className="border px-4 py-2">{m.status}</td>
                                <td className="border px-4 py-2">
                                  {m.status === "出勤"
                                    ? m.fromHour +
                                      ":" +
                                      (m.fromMin === 0 ? "00" : m.fromMin)
                                    : "---"}
                                </td>
                                <td className="border px-4 py-2">
                                  {m.status === "出勤"
                                    ? m.toHour +
                                      ":" +
                                      (m.toMin === 0 ? "00" : m.toMin)
                                    : "---"}
                                </td>
                                <td className="border px-4 py-2">
                                  {m.status === "出勤"
                                    ? m.hourly.toLocaleString("ja-JP", {
                                        style: "currency",
                                        currency: "JPY",
                                      })
                                    : "---"}
                                </td>
                                <td className="border px-4 py-2">
                                  {m.status === "出勤"
                                    ? Math.ceil(m.amount).toLocaleString("ja-JP", {
                                        style: "currency",
                                        currency: "JPY",
                                      })
                                    : "---"}
                                </td>
                              </tr>
                            ) : null;
                          });
                        })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <SalaryHoursSection isMobile={false} />
      <div className="flex border p-2">
        <Tab.Group vertical>
          <Tab.List className="flex flex-col w-40 p-3 space-y-1 bg-white border hidden sm:block">
            {staff?.map((s) => {
              return (
                <Tab
                  key={s.name}
                  className={({ selected }) =>
                    (selected ? "bg-gray-900 text-white" : "text-gray-400") +
                    " p-2 rounded-md"
                  }
                  onClick={() => setActive(s.name)}
                >
                  {s.name}
                </Tab>
              );
            })}
          </Tab.List>
          <Tab.Panels className="flex-1 hidden sm:block">
            {staff?.map((s) => {
              return (
                <Tab.Panel
                  key={s.name}
                  className="p-4 bg-white border border-l-0"
                >
                  <div
                    key={s.name}
                    id="tabs-with-underline-1"
                    role="tabpanel"
                    aria-labelledby="tabs-with-underline-item-1"
                    className={`${active === s.name ? "" : "hidden"}`}
                  >
                    <table className="table-auto w-full">
                      <thead>
                        <tr className="text-left">
                          <th className="px-4 py-2">日付</th>
                          <th className="px-4 py-2">勤怠</th>
                          <th className="px-4 py-2">開始時間</th>
                          <th className="px-4 py-2">終了時間</th>
                          <th className="px-4 py-2">時給</th>
                          <th className="px-4 py-2">日給</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data
                          ?.sort((a, b) => a.day - b.day)
                          .map((d) => {
                            return d.members.map((m) => {
                              return m.name === s.name ? (
                                <tr key={`${d.day}_${s.name}`}>
                                  <td className="border px-4 py-2">
                                    {d.day}({d.dayOfWeek})
                                  </td>
                                  <td className="border px-4 py-2">
                                    {m.status}
                                  </td>
                                  <td className="border px-4 py-2">
                                    {m.status === "出勤"
                                      ? m.fromHour +
                                        ":" +
                                        (m.fromMin === 0 ? "00" : m.fromMin)
                                      : "---"}
                                  </td>
                                  <td className="border px-4 py-2">
                                    {m.status === "出勤"
                                      ? m.toHour +
                                        ":" +
                                        (m.toMin === 0 ? "00" : m.toMin)
                                      : "---"}
                                  </td>
                                  <td className="border px-4 py-2">
                                    {m.status === "出勤"
                                      ? m.hourly.toLocaleString("ja-JP", {
                                          style: "currency",
                                          currency: "JPY",
                                        })
                                      : "---"}
                                  </td>
                                  <td className="border px-4 py-2">
                                    {m.status === "出勤"
                                      ? Math.ceil(m.amount).toLocaleString(
                                          "ja-JP",
                                          {
                                            style: "currency",
                                            currency: "JPY",
                                          }
                                        )
                                      : "---"}
                                  </td>
                                </tr>
                              ) : null;
                            });
                          })}
                      </tbody>
                    </table>
                    <div className="mt-5 flex justify-end text-right">
                      <div>
                        <label
                          htmlFor="total"
                          className="block leading-6 text-gray-400 text-xl"
                        >
                          月合計
                        </label>
                        <div className="mt-2.5 text-3xl flex items-center">
                          {totalSalary.toLocaleString("ja-JP", {
                            style: "currency",
                            currency: "JPY",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Panel>
              );
            })}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </ProtectedRoute>
  );
};

export default ShitPage;
