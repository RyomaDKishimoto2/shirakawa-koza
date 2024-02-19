import { FC, useCallback, useMemo } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Sale, SaleData } from "../features/sales/Entities";

const SUPPLIERS = {
  suehiro: "末広物流",
  sakihama: "崎浜商店",
  miyazato: "宮里洋酒店",
  ganaha: "ガナハミート",
  BEEFshin: "BEEFshin",
  sumi: "炭のまるしん商会",
  sunny: "サニークリン",
  shopping: "買い物",
  zappi: "雑費",
  gyoumu: "業務委託費",
  furikomiFee: "振込手数料",
  cardFee: "カード手数料",
  eigyou: "営業経費",
  koutuhi: "旅費・交通費",
  yachin: "家賃",
  kounetuhi: "水道光熱費",
  tushinhi: "通信費",
} as const;
type SupplierNameKey = keyof typeof SUPPLIERS; // keyだけの型

export type SuppliersType = {
  [key in SupplierNameKey]: number;
};

// 各業者の合計コスト金額を計算する
const calcTotalExpenseCost = ({
  supplierName,
  sales,
}: {
  supplierName: SupplierNameKey;
  sales: Sale[];
}) => {
  const dailyCost = sales.map((s) => s.suppliers[supplierName] ?? 0);
  return dailyCost.reduce((accum, sale) => accum + sale, 0);
};

const isOptionalNameEmpty = (optional: {
  name: string;
  value: number;
}): boolean => {
  return !!(optional.value && !optional.name);
};

type SuppliersFormSectionProps<T> = {
  sales: Sale[];
  setSale: React.Dispatch<React.SetStateAction<T>>;
  optionals: { name: string; value: number }[];
  suppliers: SuppliersType;
  setSuppliers: React.Dispatch<React.SetStateAction<SuppliersType>>;
};

const SupplierList: FC<{
  name: string;
  totalCost: number;
  value: number;
  onChange(value: number): void;
}> = ({ name, totalCost, value, onChange }) => {
  return (
    <li className="flex items-center justify-between gap-x-6 py-5">
      <div className="min-w-[100px]">{name}</div>
      <div className="max-w-xs mx-auto">
        <input
          type="text"
          id="quantity-input"
          data-input-counter
          aria-describedby="helper-text-explanation"
          className="bg-gray-50 rounded border border-gray-300 h-11 text-right text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
          placeholder="0"
          value={value}
          onChange={(e) => {
            onChange(Number(e.target.value));
          }}
          required
        />
      </div>
      <div className="text-right min-w-[80px]">
        {totalCost.toLocaleString("ja-JP", {
          style: "currency",
          currency: "JPY",
        })}
      </div>
    </li>
  );
};

const SupplierListOptional: FC<{
  name: string;
  totalCost: number;
  value: number;
  onChange(value: number): void;
  onChangeName(name: string): void;
  invalid: boolean;
}> = ({ name, totalCost, value, onChange, onChangeName, invalid = false }) => {
  return (
    <li className="flex items-center justify-between gap-x-6 py-5">
      <div className="relative min-w-[80px]">
        <input
          type="text"
          name={name}
          id={name}
          value={name}
          placeholder="項目名を入力"
          className={`${
            invalid && "border border-red-500"
          } border border-gray-300 bg-gray-50 rounded border border-gray-300 h-11 text-left text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`}
          onChange={(e) => onChangeName(String(e.target.value))}
        />
        {invalid && (
          <div className="absolute h-14 -left-4 -top-6 text-red-500 whitespace-nowrap">
            項目名が未入力です
          </div>
        )}
      </div>
      <div className="max-w-xs mx-auto">
        <input
          type="number"
          name="quantity"
          id="quantity"
          step="1"
          min="0"
          data-input-counter
          aria-describedby="helper-text-explanation"
          className="bg-gray-50 rounded border border-gray-300 h-11 text-right text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          required
        />
      </div>
      <div className="text-right min-w-[80px]">
        {totalCost.toLocaleString("ja-JP", {
          style: "currency",
          currency: "JPY",
        })}
      </div>
    </li>
  );
};

export const SuppliersFormSection = <T extends Sale | SaleData>(
  props: SuppliersFormSectionProps<T>
) => {
  const { sales, setSale, optionals, suppliers, setSuppliers } = props;
  const totalCosts = useMemo(
    () =>
      Object.keys(suppliers).reduce((acc, key) => {
        const supplierKey = key as SupplierNameKey;
        acc[supplierKey] = calcTotalExpenseCost({
          supplierName: supplierKey,
          sales: sales,
        });
        return acc;
      }, {} as SuppliersType),
    [sales, suppliers]
  );

  const handleSupplierChange = useCallback(
    (key: SupplierNameKey, newValue: number) => {
      setSuppliers((prevSuppliers) => ({
        ...prevSuppliers,
        [key]: newValue,
      }));
    },
    [setSuppliers]
  );

  const handleOptionalNameChange = useCallback(
    (name: string, i: number) => {
      setSale((prev) => ({
        ...prev,
        optionals: [
          ...(prev.optionals
            ? prev.optionals.map((op, j) =>
                i === j ? { ...op, name: name } : op
              )
            : []),
        ],
      }));
    },
    [setSale]
  );

  const handleOptionalValueChange = useCallback(
    (v: number, i: number) => {
      setSale((prev) => ({
        ...prev,
        optionals: [
          ...(prev.optionals
            ? prev.optionals.map((op, j) =>
                i === j ? { ...op, value: v } : op
              )
            : []),
        ],
      }));
    },
    [setSale]
  );

  const handleAddOptional = useCallback(() => {
    setSale((prev) => ({
      ...prev,
      optionals: [
        ...(prev.optionals ? prev.optionals : []),
        { name: "", value: 0 },
      ],
    }));
  }, [setSale]);

  const paymentTotal = useMemo(() => {
    const optionalsTotal = optionals.reduce((sum, op) => sum + op.value, 0);
    const suppliersTotal = Object.values(suppliers).reduce(
      (sum, value) => sum + value,
      0
    );

    return optionalsTotal + suppliersTotal;
  }, [optionals, suppliers]);

  return (
    <>
      <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <span className="ms-3 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 truncate text-sm leading-5 text-gray-500 ring-1 ring-inset ring-gray-700/10">
            支払い合計
          </span>
          <h5 className="text-xl font-bold leading-none text-gray-900">
            {paymentTotal.toLocaleString("ja-JP", {
              style: "currency",
              currency: "JPY",
            })}
            <button
              type="button"
              className="rounded-md border border-gray-300 rounded ml-3 py-2 px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={handleAddOptional}
            >
              <PlusIcon
                className="-ml-0.5 h-4 w-4 text-gray-900 inline"
                aria-hidden="true"
              />
            </button>
          </h5>
        </div>
        <div className="flow-root">
          <ul
            role="list"
            className="grid justify-items-stretch gap-y-2 grid-cols-1 divide-y divide-gray-200"
          >
            {optionals.length > 0 &&
              optionals.map((optional, i) => {
                return (
                  <SupplierListOptional
                    key={i}
                    name={optional.name}
                    value={optional.value}
                    totalCost={optional.value}
                    onChangeName={(name: string) =>
                      handleOptionalNameChange(name, i)
                    }
                    onChange={(v: number) => handleOptionalValueChange(v, i)}
                    invalid={isOptionalNameEmpty(optional)}
                  />
                );
              })}
            {Object.entries(suppliers)
              .sort((a, b) => (a[0] > b[0] ? 1 : -1))
              .map(([key, value]) => {
                return (
                  <SupplierList
                    key={key}
                    name={SUPPLIERS[key as SupplierNameKey]}
                    onChange={(newValue: number) =>
                      handleSupplierChange(key as SupplierNameKey, newValue)
                    }
                    value={value}
                    totalCost={totalCosts[key as SupplierNameKey]}
                  />
                );
              })}
          </ul>
        </div>
      </div>
    </>
  );
};
