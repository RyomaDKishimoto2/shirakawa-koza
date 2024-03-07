import { FC, useMemo } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";

export const CHANGES = {
  Ichiman: "1万円",
  Gosen: "5千円",
  Nisen: "2千円",
  Sen: "1千円",
  Gohyaku: "500円",
  Hyaku: "100円",
  Gojyu: "50円",
  Jyu: "10円",
  Go: "5円",
  Ichi: "1円",
} as const;
type ChangesNameKey = keyof typeof CHANGES; // keyだけの型

export type ChangesType = {
  [key in ChangesNameKey]: number;
};

const CHANGE_VALUES = {
  Ichiman: 10000,
  Gosen: 5000,
  Nisen: 2000,
  Sen: 1000,
  Gohyaku: 500,
  Hyaku: 100,
  Gojyu: 50,
  Jyu: 10,
  Go: 5,
  Ichi: 1,
} as const;

const calculateChange = ({
  key,
  changeValue,
}: {
  key: ChangesNameKey;
  changeValue: number;
}): number => {
  return CHANGE_VALUES[key] * changeValue;
};

type ChangesFormSectionProps = {
  changes: ChangesType;
  setChanges: React.Dispatch<React.SetStateAction<ChangesType>>;
};

const ChangeList: FC<{
  title: string;
  cost: number;
  value: number;
  setChanges: (v: number) => void;
  setIncrement: () => void;
  setDecrement: () => void;
}> = ({ title, cost, setIncrement, setChanges, setDecrement, value }) => {
  return (
    <li className="flex items-center justify-between gap-x-6 py-5">
      <div className="min-w-[80px]">{title}</div>
      <div className="max-w-xs mx-auto">
        <div className="relative flex items-center max-w-[8rem]">
          <button
            onClick={setDecrement}
            type="button"
            id="decrement-button"
            data-input-counter-decrement="quantity-input"
            className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 focus:ring-2 focus:outline-none"
          >
            <MinusIcon className="w-3 h-3 text-gray-900" />
          </button>
          <input
            type="text"
            id="quantity-input"
            data-input-counter
            aria-describedby="helper-text-explanation"
            className="bg-gray-50 border border-x-0 border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 w-full py-2.5"
            placeholder="0"
            value={value}
            onClick={() => setChanges}
            required
          />
          <button
            onClick={setIncrement}
            type="button"
            id="increment-button"
            data-input-counter-increment="quantity-input"
            className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 focus:ring-2 focus:outline-none"
          >
            <PlusIcon className="w-3 h-3 text-gray-900" />
          </button>
        </div>
      </div>
      <div className="text-right min-w-[80px]">
        {cost.toLocaleString("ja-JP", {
          style: "currency",
          currency: "JPY",
        })}
      </div>
    </li>
  );
};

export const ChangesFormSection: FC<ChangesFormSectionProps> = ({
  changes,
  setChanges,
}) => {
  const changesTotal = useMemo(() => {
    return Object.entries(changes)
      .map(([key, value]) => {
        return calculateChange({
          key: key as ChangesNameKey,
          changeValue: value,
        });
      })
      .reduce((partialSum, a) => partialSum + a, 0);
  }, [changes]); // 依存配列に changes を含めます

  const keyOrder = [
    "Ichiman",
    "Gosen",
    "Nisen",
    "Sen",
    "Gohyaku",
    "Hyaku",
    "Gojyu",
    "Jyu",
    "Go",
    "Ichi",
  ];

  return (
    <>
      <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <span className="ms-3 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 truncate text-sm leading-5 text-gray-500 ring-1 ring-inset ring-gray-700/10">
            差額:
            {(changesTotal - 50000).toLocaleString("ja-JP", {
              style: "currency",
              currency: "JPY",
            })}
          </span>
          <h5 className="text-xl font-bold leading-none text-gray-900">
            {changesTotal.toLocaleString("ja-JP", {
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
            {keyOrder.map((key) => {
              const value = changes[key as ChangesNameKey];
              return (
                <ChangeList
                  key={key}
                  value={value}
                  title={CHANGES[key as ChangesNameKey]}
                  cost={calculateChange({
                    key: key as ChangesNameKey,
                    changeValue: value,
                  })}
                  setChanges={(v) =>
                    setChanges((prev) => ({
                      ...prev,
                      [key]: Number(v),
                    }))
                  }
                  setDecrement={() =>
                    setChanges((prev) => ({
                      ...prev,
                      [key]: changes[key as ChangesNameKey] - 1,
                    }))
                  }
                  setIncrement={() =>
                    setChanges((prev) => ({
                      ...prev,
                      [key]: changes[key as ChangesNameKey] + 1,
                    }))
                  }
                />
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};
