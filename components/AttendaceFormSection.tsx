import { FC, useCallback, useState } from 'react';
import {
  HOURS,
  HourType,
  MINUTES,
  MemberType,
  MinuteType,
  STATUS,
  StatusType,
} from '../features/const';
import { Thead } from './Thead';
import { Select } from './Select';
import { Sale } from '../features/sales/Entities';
import AttendanceDetails from './attendanceDetails';

type AttendanceFormSectionProps = {
  sales: Sale[];
  members: MemberType[];
  setMembers: React.Dispatch<React.SetStateAction<MemberType[]>>;
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

  const getMinuteSalary = useCallback(
    (fromHour: number, toHour: number, minResult: number, hourly: number) => {
      if (Math.abs(minResult) === 0) {
        return 0;
      }

      const isNight = fromHour >= 22 || toHour >= 22;
      const rate = isNight ? 1.25 : 1;

      if (Math.abs(minResult) === 15) {
        return hourly * 0.25 * rate;
      } else if (Math.abs(minResult) === 30) {
        return hourly * 0.5 * rate;
      } else if (Math.abs(minResult) === 45) {
        return hourly * 0.75 * rate;
      } else {
        return hourly * minResult * rate;
      }
    },
    []
  );

  const calculateNightWorkHour = useCallback(
    (toHour: number, hourly: number) => {
      if (toHour >= 23) {
        const nightWordHour = toHour - 22;
        return nightWordHour * (hourly * 0.25);
      }
      return 0;
    },
    []
  );

  type CalcSalaryProps = {
    fromHour: number;
    fromMin: number;
    toHour: number;
    toMin: number;
    hourly: number;
  };

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
      setMembers((prevMembers) => updateMember(prevMembers, member, { status }));
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
      <table className='w-full text-left text-lg'>
        <Thead th={['名前', '勤怠', '勤務時間', '時給', '金額']} />
        <tbody>
          {members.map((member) => {
            const monthlyTotalSalary = calcMonthlyTotalSalary(
              member.name,
              sales
            );
            return (
              <tr key={member.name} className='border-b'>
                <td className='py-4 text-lg w-1/5 whitespace-nowrap'>
                  <div className='min-w-0 flex-auto gap-x-4'>
                    <p className='font-semibold leading-6 text-gray-900'>
                      {member.name}
                    </p>
                    <div className='my-2 flex items-center text-sm text-gray-500'>
                      <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-md font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                        {monthlyTotalSalary.toLocaleString('ja-JP', {
                          style: 'currency',
                          currency: 'JPY',
                        })}
                      </span>
                    </div>
                    <button
                      type='button'
                      className='inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'
                      onClick={() => setShowAttendanceByName(member.name)}
                    >
                      詳細を確認
                    </button>
                  </div>
                </td>
                <td className='py-4'>
                  <Select
                    options={Object.values(STATUS).map((st) => st)}
                    htmlFor='kintai'
                    textSize='text-lg'
                    value={member.status}
                    onChange={(e) =>
                      handleStatusChange(member, e.target.value as StatusType)
                    }
                  />
                </td>
                <td className='py-4'>
                  <div className='flex items-center'>
                    <Select
                      options={[...HOURS]}
                      htmlFor={'fromHours'}
                      textSize={'text-lg'}
                      name={'fromHours'}
                      value={member.fromHour}
                      onChange={(e) => {
                        const fromHour = Number(e.target.value) as HourType;
                        const salary = calculateSalary(
                          fromHour,
                          member.fromMin,
                          member.toHour,
                          member.toMin,
                          member.hourly,
                          1.25,
                          22,
                          0
                        );
                        handleFromHourChange(fromHour, member, salary);
                        // const amount = calculateSalary({
                        //   fromHour,
                        //   fromMin: member.fromMin,
                        //   toHour: member.toHour,
                        //   toMin: member.toMin,
                        //   hourly: member.hourly,
                        // });
                        // handleFromHourChange(fromHour, member, amount);
                      }}
                      disabled={member.status === '休み'}
                    />
                    <span className='mx-1 text-xl'>:</span>
                    <Select
                      options={[...MINUTES]}
                      htmlFor={'fromMin'}
                      textSize={'text-lg'}
                      name={'fromMin'}
                      value={member.fromMin}
                      onChange={(e) => {
                        const fromMin = Number(e.target.value) as MinuteType;
                        // const amount = calculateSalary({
                        //   fromHour: member.fromHour,
                        //   fromMin,
                        //   toHour: member.toHour,
                        //   toMin: member.toMin,
                        //   hourly: member.hourly,
                        // });
                        // handleFromMinChange(fromMin, member, amount);
                        const salary = calculateSalary(
                          member.fromHour,
                          fromMin,
                          member.toHour,
                          member.toMin,
                          member.hourly,
                          1.25,
                          22,
                          0
                        );
                        handleFromMinChange(fromMin, member, salary);
                      }}
                      disabled={member.status === '休み'}
                    />
                    <span className='mx-1 text-xl'>~</span>
                    <Select
                      options={[
                        ...HOURS.filter((hour) => {
                          return hour >= member.fromHour;
                        }),
                      ]}
                      htmlFor={'toHours'}
                      textSize={'text-lg'}
                      name={'toHours'}
                      value={member.toHour}
                      onChange={(e) => {
                        const toHour = Number(e.target.value) as HourType;
                        const salary = calculateSalary(
                          member.fromHour,
                          member.fromMin,
                          toHour,
                          member.toMin,
                          member.hourly,
                          1.25,
                          22,
                          0
                        );
                        handleToHourChange(toHour, member, salary);
                        // const amount = calculateSalary({
                        //   fromHour: member.fromHour,
                        //   fromMin: member.fromMin,
                        //   toHour,
                        //   toMin: member.toMin,
                        //   hourly: member.hourly,
                        // });
                        // handleToHourChange(toHour, member, Math.max(amount, 0));
                      }}
                      disabled={member.status === '休み'}
                    />
                    <span className='mx-1 text-xl'>:</span>
                    <Select
                      options={[...MINUTES]}
                      htmlFor={'toMin'}
                      textSize={'text-lg'}
                      name={'toMin'}
                      value={member.toMin}
                      onChange={(e) => {
                        const toMin = Number(e.target.value) as MinuteType;
                        const salary = calculateSalary(
                          member.fromHour,
                          member.fromMin,
                          member.toHour,
                          toMin,
                          member.hourly,
                          1.25,
                          22,
                          0
                        );
                        handleToMinChange(toMin, member, salary);
                        // const amount = calculateSalary({
                        //   fromHour: member.fromHour,
                        //   fromMin: member.fromMin,
                        //   toHour: member.toHour,
                        //   toMin,
                        //   hourly: member.hourly,
                        // });
                        // handleToMinChange(toMin, member, Math.max(amount, 0));
                      }}
                      disabled={member.status === '休み'}
                    />
                  </div>
                </td>
                <td className='py-4'>{member.hourly}</td>
                <td
                  className={`py-4 text-lg ${
                    member.amount < 0 ? 'text-red-700' : ''
                  }`}
                >
                  {member.amount.toLocaleString('ja-JP', {
                    style: 'currency',
                    currency: 'JPY',
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <AttendanceDetails
        sales={sales}
        name={showAttendanceByName}
        setName={setShowAttendanceByName}
      />
      <div className='mt-5 flex justify-end text-right'>
        <div>
          <label
            htmlFor='total'
            className='block leading-6 text-gray-400 text-xl'
          >
            お給料合計
          </label>
          <div className='mt-2.5 text-3xl flex items-center'>
            <span className='mr-3 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-lg font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10'>
              出勤者数
              {members.filter((mem) => mem.status === '出勤').length}人
            </span>
            {laborTotal().toLocaleString('ja-JP', {
              style: 'currency',
              currency: 'JPY',
            })}
          </div>
        </div>
      </div>
    </>
  );
};
