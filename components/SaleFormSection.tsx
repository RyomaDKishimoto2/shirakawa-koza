import { FC } from "react";
import { Sale, SaleData } from "../features/sales/Entities";

const isGuestsEmpty = (sales: SaleData): boolean => {
  return !!(!sales.guests && (sales.cash || sales.card || sales.eMoney));
};

type SaleFormSectionProps<T> = {
  todayCash: number;
  todaySale: SaleData;
  setTodaySale: React.Dispatch<React.SetStateAction<T>>;
};

const SaleList: FC<{
  name: string;
  value: number;
  onChange(value: number): void;
  invalid?: boolean;
}> = ({ name, value, onChange, invalid = false }) => {
  return (
    <li className="flex items-center justify-between gap-x-6 py-5">
      <div className="min-w-[100px]">{name}</div>
      <div className="w-full mx-auto">
        <input
          type="text"
          inputMode="numeric"
          id="quantity-input"
          data-input-counter
          aria-describedby="helper-text-explanation"
          className={`${
            invalid && "border border-red-500"
          } border border-gray-300 bg-gray-50 rounded border border-gray-300 h-11 text-right text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
          placeholder="0"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          required
        />
        {invalid && (
          <div className="absolute h-14 -left-4 -top-6 text-red-500 whitespace-nowrap">
            項目名が未入力です
          </div>
        )}
      </div>
    </li>
  );
};

export const SaleFormSection = <T extends Sale | SaleData>(
  props: SaleFormSectionProps<T>
) => {
  const { todayCash, todaySale, setTodaySale } = props;
  return (
    <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="ms-3 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 truncate text-sm leading-5 text-gray-500 ring-1 ring-inset ring-gray-700/10">
          売り上げ合計
        </span>
        <h5 className="text-xl font-bold leading-none text-gray-900">
          {todaySale.total.toLocaleString("ja-JP", {
            style: "currency",
            currency: "JPY",
          })}
        </h5>
      </div>
      <div className="flow-root">
        <ul
          role="list"
          className="grid justify-items-stretch gap-y-2 grid-cols-1 divide-y divide-gray-200"
        >
          <SaleList
            value={todayCash}
            name="現金"
            onChange={(value) => {
              setTodaySale((sale) => ({
                ...sale,
                cash: value,
                total: sale.card + sale.eMoney + sale.uber + value,
              }));
            }}
          />
          <SaleList
            value={todaySale.card}
            name="カード"
            onChange={(value) => {
              setTodaySale((sale) => ({
                ...sale,
                card: value,
                total: sale.cash + sale.eMoney + sale.uber + value, // totalの計算を修正
              }));
            }}
          />
          <SaleList
            value={todaySale.eMoney}
            name="電子マネー"
            onChange={(value) => {
              setTodaySale((sale) => ({
                ...sale,
                eMoney: value,
                total: sale.cash + sale.card + sale.uber + value,
              }));
            }}
          />
          <SaleList
            value={todaySale.uber}
            name="Uber"
            onChange={(value) => {
              setTodaySale((sale) => ({
                ...sale,
                uber: value,
                total: sale.cash + sale.card + sale.eMoney + value, // totalも同様に修正
              }));
            }}
          />
          <SaleList
            value={todaySale.guests}
            invalid={isGuestsEmpty(todaySale)}
            name="来客数"
            onChange={(value) => {
              setTodaySale((sale) => ({
                ...sale,
                guests: value,
              }));
            }}
          />
        </ul>
      </div>
    </div>
  );
};
