import { DaysType, MonthType, SalesType, YearType } from '../const';
import { Members, Sale, StaffInfo } from './Entities';
import { CreateMemberInput, Member } from './Repositories';

const createFromResponse = (responses: SalesType[]) => {
  return responses.map((res) => {
    return new Sale(
      res.year as YearType,
      res.month as MonthType,
      res.day as DaysType,
      res.dayOfWeek,
      res.cash,
      res.card,
      res.eMoney,
      res.uber,
      res.guests,
      res.weather,
      res.total,
      res.impression,
      res.suppliers,
      res.staffSalaries,
      res.changes,
      res.members,
      res.optionals,
      res.fakeCash
    );
  });
};

export const SalesFactory = {
  createFromResponse,
};

const createFromMemberResponse = (response: Member[]) => {
  return response.map((res) => {
    return new Members(res.name, res.salary, res.createdAt);
  });
};

const createFromStaffInfoResponse = (response: CreateMemberInput[]) => {
  return response.map((res) => {
    return new StaffInfo(
      res.name,
      res.email,
      res.password,
      res.isDeleted,
      res.createdAt,
      res.salary
    );
  });
};

export const MembersFactory = {
  createFromMemberResponse,
  createFromStaffInfoResponse,
};
