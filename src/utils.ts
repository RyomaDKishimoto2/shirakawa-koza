import { HourType, MinuteType, SalesType, tachikaraUid } from '../features/const';

export const isNumber = (data: number | undefined) => {
  return !data ? 0 : data;
};

export const createPassword = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const alphabetUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const passBase = alphabet + alphabetUpper + numbers;
  const len = 8; // 8桁
  let password = '';
  for (var i = 0; i < len; i++) {
    password += passBase.charAt(Math.floor(Math.random() * passBase.length));
  }
  return password;
};

export const calsFakeMonthlyTotal = ({ sales }: { sales: SalesType[] }) => {
  return sales.reduce(
    (accum, sale) => accum + (sale.fakeCash ? sale.fakeCash : 0),
    0
  );
};

export const createFakeCash = ({ sale }: { sale: SalesType }): number => {
  return sale.fakeCash ? sale.fakeCash : 0;
};

export const calcTotalSalary = ({
  name,
  sales,
}: {
  name: string;
  sales: SalesType[];
}) => {
  const salary = sales.flatMap((s) => {
    if (!Array.isArray(s.members)) {
      return [];
    }
    return s.members.filter((m) => m.name === name);
  });
  return salary.reduce((accum, sale) => accum + sale.amount, 0);
};

export const isTachikawa = (uid: string) => {
  return uid === tachikaraUid;
};

// 時間と分を扱うためのヘルパー関数
export function calculateDailyHours(
  fromHour: HourType,
  fromMin: MinuteType,
  toHour: HourType,
  toMin: MinuteType
): number {
  const startMinutes = fromHour * 60 + fromMin;
  const endMinutes = toHour * 60 + toMin;
  const dailyMinutes = endMinutes - startMinutes;
  return dailyMinutes / 60; // 時間単位で返す
}

export const calculateTotalWorkHours = ({
  name,
  sales,
}: {
  name: string;
  sales: SalesType[];
}) => {
  const salary = sales.flatMap((s) => {
    if (!Array.isArray(s.members)) {
      return [];
    }
    const members = s.members.filter((m) => m.name === name);
    let totalHours = 0;
    for (const member of members) {
      const dailyHours = calculateDailyHours(
        member.fromHour,
        member.fromMin,
        member.toHour,
        member.toMin
      );
      totalHours += dailyHours;
    }
    return totalHours;
  });

  return salary.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
};
