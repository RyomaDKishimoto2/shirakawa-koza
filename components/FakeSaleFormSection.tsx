import { FC } from 'react';
import { InputWithLabel } from './Input';
import { SaleData } from '../features/sales/Entities';

type FakeSaleFormSectionProps = {
  todayCash: number;
  todaySale: SaleData;
};

export const FakeSaleFormSection: FC<FakeSaleFormSectionProps> = ({
  todayCash,
  todaySale,
}) => {
  return (
    <div className='grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-3'>
      <InputWithLabel
        name={'cash'}
        value={todayCash}
        label={'現金'}
        labelSize='text-xl'
        InputSize='text-xl'
        onChange={() => {
          //
        }}
        disabled
      />
      <InputWithLabel
        name={'card'}
        value={todaySale.card}
        label={'カード'}
        labelSize='text-xl'
        InputSize='text-xl'
        onChange={() => {
          //
        }}
        disabled
      />
      <InputWithLabel
        name={'eMoney'}
        value={todaySale.eMoney}
        label={'電子マネー'}
        labelSize='text-xl'
        InputSize='text-xl'
        onChange={() => {
          //
        }}
        disabled
      />
      <InputWithLabel
        name="Uber"
        value={todaySale.uber}
        label="Uber"
        labelSize='text-xl'
        InputSize='text-xl'
        onChange={() => {
          //
        }}
        disabled
      />
      <InputWithLabel
        name={'guests'}
        value={todaySale.guests}
        label={'来客数'}
        labelSize={'text-lg'}
        onChange={() => {
          //
        }}
        disabled
      />
    </div>
  );
};
