import { FC, useCallback, useState } from "react";
import {
  HOURS,
  HourType,
  MINUTES,
  MemberType,
  MinuteType,
  STATUS,
  StatusType,
} from "../features/const";
import { Select } from "./Select";
import { Sale } from "../features/sales/Entities";
import AttendanceDetails from "./attendanceDetails";
import { Switch } from "@headlessui/react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

type AttendanceFormSectionProps = {
  sales: Sale[];
  members: MemberType[];
  setMembers: React.Dispatch<React.SetStateAction<MemberType[]>>;
};

const WorkOrOffToggleButton: FC<{
  status: StatusType;
  onChangeStatus: (status: StatusType) => void;
}> = ({ status, onChangeStatus }) => {
  return (
    <div className="flex items-center gap-1 truncate text-sm leading-5 text-gray-500">
      {status}
      {status === "出勤" ? (
        <SunIcon className="w-5 h-5 text-orange-500" />
      ) : (
        <MoonIcon className="w-4 h-4 text-yellow-500" />
      )}
      <Switch
        checked={status === "出勤"}
        onChange={(bool) => onChangeStatus(bool ? "出勤" : "休み")}
        className={`${
          status === "出勤" ? "bg-gray-900" : "bg-gray-400"
        } relative inline-flex h-6 w-11 items-center rounded-full`}
      >
        <span className="sr-only">Enable notifications</span>
        <span
          className={`${
            status === "出勤" ? "translate-x-1" : "translate-x-6"
          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
        />
      </Switch>
    </div>
  );
};

const MemberList: FC<{
  member: MemberType;
  monthlyTotal: number;
  onChangeStatus: (status: StatusType) => void;
  onChangeFromHour: (hour: HourType) => void;
  onChangeToHour: (hour: HourType) => void;
  onChangeFromMin: (min: MinuteType) => void;
  onChangeToMin: (min: MinuteType) => void;
  showDetail: (status: string) => void;
}> = ({
  member,
  monthlyTotal,
  onChangeStatus,
  onChangeFromHour,
  onChangeToHour,
  onChangeFromMin,
  onChangeToMin,
  showDetail,
}) => {
  return (
    <li
      className={`p-3 sm:py-4 border rounded-md ${
        member.status === "出勤" ? "bg-white" : "bg-gray-200"
      }`}
    >
      <div className="flex items-center">
        <div className="flex-1 min-w-0 ms-4 grid gap-y-2">
          <p className="text-sm font-semibold leading-6 text-gray-900">
            {member.name}
          </p>
          <p className="truncate text-sm leading-5 text-gray-500">
            {member.hourly.toLocaleString("ja-JP", {
              style: "currency",
              currency: "JPY",
            })}
          </p>
          <p
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
            onClick={() => showDetail(member.name)}
          >
            詳細を確認<span aria-hidden="true">&rarr;</span>
          </p>
        </div>
        <div className="inline-flex items-center text-sm leading-6 text-gray-900">
          {monthlyTotal.toLocaleString("ja-JP", {
            style: "currency",
            currency: "JPY",
          })}
        </div>
      </div>
      <div className="flex items-center my-3 pb-3 border-b border-gray-100">
        <Select
          options={[...HOURS]}
          htmlFor={"fromHours"}
          name={"fromHours"}
          value={member.fromHour}
          onChange={(e) => onChangeFromHour(Number(e.target.value) as HourType)}
          disabled={member.status === "休み"}
        />
        <span className="mx-1 text-xl">:</span>
        <Select
          options={[...MINUTES]}
          htmlFor={"fromMin"}
          name={"fromMin"}
          value={member.fromMin}
          onChange={(e) =>
            onChangeFromMin(Number(e.target.value) as MinuteType)
          }
          disabled={member.status === "休み"}
        />
        <span className="mx-1 text-xl">~</span>
        <Select
          options={[
            ...HOURS.filter((hour) => {
              return hour >= member.fromHour;
            }),
          ]}
          htmlFor="toHours"
          name="toHours"
          value={member.toHour}
          onChange={(e) => onChangeToHour(Number(e.target.value) as HourType)}
          disabled={member.status === "休み"}
        />
        <span className="mx-1 text-xl">:</span>
        <Select
          options={[...MINUTES]}
          htmlFor="toMin"
          name="toMin"
          value={member.toMin}
          onChange={(e) => onChangeToMin(Number(e.target.value) as MinuteType)}
          disabled={member.status === "休み"}
        />
      </div>

      <div className="flex justify-end">
        <WorkOrOffToggleButton
          status={member.status}
          onChangeStatus={onChangeStatus}
        />
      </div>
    </li>
  );
};

export const AttendaceFormSection: FC<AttendanceFormSectionProps> = ({
  sales,
  members,
  setMembers,
}) => {
  const [showAttendanceByName, setShowAttendanceByName] = useState<
    string | null
  >(null);

  const calcMonthlyTotalSalary = useCallback((name: string, sales: Sale[]) => {
    return sales.reduce((accum, s) => {
      if (!Array.isArray(s.members)) {
        return accum;
      }

      const memberSalary = s.members
        .filter((m) => m.name === name)
        .reduce((sum, member) => sum + member.amount, 0);

      return accum + memberSalary;
    }, 0);
  }, []); // 依存配列が空なので、コンポーネントがマウントされる時にのみ関数が生成されます

  const calculateSalary = useCallback(
    (
      startHour: number,
      startMinute: number,
      endHour: number,
      endMinute: number,
      hourlyRate: number,
      enhancedRateMultiplier: number, // 基本時給に対する増加率を表します。この例では、22時以降の時給は基本時給の1.25倍になるとされています
      enhancedRateHour: number, // 増加後の時給が適用される開始時間の「時」部分を表しています
      enhancedRateMinute: number // 増加後の時給が適用される開始時間の「分」部分を表しています
    ) => {
      // 時間と分を小数で表す関数
      function timeToDecimal(hour: number, minute: number) {
        return hour + minute / 60;
      }

      // 基本時給と増加後の時給を計算
      const startDecimal = timeToDecimal(startHour, startMinute);
      const endDecimal = timeToDecimal(endHour, endMinute);
      const enhancedStartDecimal = timeToDecimal(
        enhancedRateHour,
        enhancedRateMinute
      );
      const enhancedRate = hourlyRate * enhancedRateMultiplier;

      // 22時までと22時以降の勤務時間を計算
      const hoursBeforeEnhanced =
        Math.min(endDecimal, enhancedStartDecimal) - startDecimal;
      const hoursAfterEnhanced = Math.max(0, endDecimal - enhancedStartDecimal);

      // 給料の計算
      const salary =
        hoursBeforeEnhanced * hourlyRate + hoursAfterEnhanced * enhancedRate;
      return salary;
    },
    []
  );

  type MemberKeys = keyof MemberType;
  type MemberKeyValue =
    | { [P in MemberKeys]: MemberType[P] }
    | Partial<Pick<MemberType, MemberKeys>>;
  // メンバーを更新する共通のロジック
  const updateMember = (
    prevMembers: MemberType[],
    member: MemberType,
    updatedData: MemberKeyValue
  ) => {
    return prevMembers.map((m) => {
      if (m.name === member.name) {
        return { ...m, ...updatedData };
      } else {
        return m;
      }
    });
  };

  const handleStatusChange = useCallback(
    (member: MemberType, status: StatusType) => {
      setMembers((prevMembers) =>
        updateMember(prevMembers, member, { status })
      );
    },
    []
  );

  const handleFromHourChange = useCallback(
    (fromHour: HourType, member: MemberType, amount: number) => {
      setMembers((prevMembers) =>
        updateMember(prevMembers, member, { fromHour, amount })
      );
    },
    []
  );

  const handleFromMinChange = useCallback(
    (fromMin: MinuteType, member: MemberType, amount: number) => {
      setMembers((prevMembers) =>
        updateMember(prevMembers, member, { fromMin, amount })
      );
    },
    []
  );

  const handleToHourChange = useCallback(
    (toHour: HourType, member: MemberType, amount: number) => {
      setMembers((prevMembers) =>
        updateMember(prevMembers, member, { toHour, amount })
      );
    },
    []
  );

  const handleToMinChange = useCallback(
    (toMin: MinuteType, member: MemberType, amount: number) => {
      setMembers((prevMembers) =>
        updateMember(prevMembers, member, { toMin, amount })
      );
    },
    []
  );

  const laborTotal = useCallback(() => {
    return members
      .filter((m) => m.status === STATUS.working)
      .reduce((partialSum, a) => partialSum + a.amount, 0);
  }, [members]);

  return (
    <>
      <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <span className="ms-3 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 truncate text-sm leading-5 text-gray-500 ring-1 ring-inset ring-gray-700/10">
            出勤人数
            {members.filter((mem) => mem.status === "出勤").length}人
          </span>
          <h5 className="text-xl font-bold leading-none text-gray-900">
            {laborTotal().toLocaleString("ja-JP", {
              style: "currency",
              currency: "JPY",
            })}
          </h5>
        </div>
        <div className="flow-root">
          <ul
            role="list"
            className="grid gap-y-2 grid-cols-1 divide-y divide-gray-200"
          >
            {members.map((member) => {
              const monthlyTotalSalary = calcMonthlyTotalSalary(
                member.name,
                sales
              );
              return (
                <MemberList
                  key={member.name}
                  member={member}
                  monthlyTotal={monthlyTotalSalary}
                  onChangeStatus={(status) =>
                    handleStatusChange(member, status as StatusType)
                  }
                  onChangeFromHour={(hour) => {
                    const salary = calculateSalary(
                      hour,
                      member.fromMin,
                      member.toHour,
                      member.toMin,
                      member.hourly,
                      1.25,
                      22,
                      0
                    );
                    handleFromHourChange(hour, member, salary);
                  }}
                  onChangeToHour={(hour) => {
                    const salary = calculateSalary(
                      member.fromHour,
                      member.fromMin,
                      hour,
                      member.toMin,
                      member.hourly,
                      1.25,
                      22,
                      0
                    );
                    handleToHourChange(hour, member, salary);
                  }}
                  onChangeFromMin={(min) => {
                    const salary = calculateSalary(
                      member.fromHour,
                      min,
                      member.toHour,
                      member.toMin,
                      member.hourly,
                      1.25,
                      22,
                      0
                    );
                    handleFromMinChange(min, member, salary);
                  }}
                  onChangeToMin={(min) => {
                    const salary = calculateSalary(
                      member.fromHour,
                      member.fromMin,
                      member.toHour,
                      min,
                      member.hourly,
                      1.25,
                      22,
                      0
                    );
                    handleToMinChange(min, member, salary);
                  }}
                  showDetail={(name) => setShowAttendanceByName(name)}
                />
              );
            })}
          </ul>
        </div>
      </div>

      <AttendanceDetails
        sales={sales}
        name={showAttendanceByName}
        setName={setShowAttendanceByName}
      />
    </>
  );
};
