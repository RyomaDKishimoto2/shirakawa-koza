import { MonthType, YearType, SalesType, HouryType } from "../const";
import { MembersFactory, SalesFactory } from "./Factories";
import { CreateFakeCashInput } from "@/lib/sales";
import { deleteMember, updateSalary } from "@/lib/member";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  CollectionReference,
} from "firebase/firestore";
import { db } from "../../config/firebase";

type GetSalesInput = {
  year: YearType;
  month: MonthType;
};

export type CreateSaleInput = {
  param: SalesType;
};

const getSales = async ({ year, month }: GetSalesInput) => {
  const COLLECTION_NAME = `${year}年${month}月`;
  const col = collection(db, COLLECTION_NAME) as CollectionReference<SalesType>;
  const docs = await getDocs(col);
  const docsData = docs.docs.map((doc) => doc.data());
  return SalesFactory.createFromResponse(docsData);
};

const create = async (param: SalesType) => {
  const FILED_NAME = `${param.year}年${param.month}月`;
  const newSalesRef = doc(collection(db, FILED_NAME), `${param.day}日`);
  return await setDoc(newSalesRef, param);
};

const updateFakeCash = async ({
  year,
  month,
  day,
  fakeCash,
}: CreateFakeCashInput) => {
  const FILED_NAME = `${year}年${month}月`;
  const newSalesRef = doc(collection(db, FILED_NAME), `${day}日`);
  return await setDoc(newSalesRef, { fakeCash: fakeCash }, { merge: true });
};

export const SaleRepository = {
  getSales,
  create,
  updateFakeCash,
};

const MINIMAM_INFO_FILED_NAME = "STAFF_MINIMAM_INFO";
const getMembers = async () => {
  const col = collection(
    db,
    MINIMAM_INFO_FILED_NAME
  ) as CollectionReference<Member>;
  const docs = await getDocs(col);
  const docsData = docs.docs.map((doc) => doc.data());
  return MembersFactory.createFromMemberResponse(docsData);
};

export type Member = {
  name: string;
  salary: HouryType;
  createdAt: Date;
};

export type CreateMemberInput = {
  name: string;
  salary: number;
  createdAt: Date;
  password: string;
  email: string;
  isDeleted: boolean;
};

const INFO_FILED_NAME = "STAFF_INFO";
const addNewMember = async (member: CreateMemberInput) => {
  const staffInfoRef = doc(collection(db, INFO_FILED_NAME), `${member.name}`);
  const staffMinimamInfoRef = doc(
    collection(db, MINIMAM_INFO_FILED_NAME),
    `${member.name}`
  );
  await setDoc(staffMinimamInfoRef, {
    name: member.name,
    createdAt: member.createdAt,
    salary: member.salary,
    isDeleted: false,
  });
  await setDoc(staffInfoRef, member);
};

const getStaffs = async () => {
  const col = collection(
    db,
    INFO_FILED_NAME
  ) as CollectionReference<CreateMemberInput>;
  const docs = await getDocs(col);
  const docsData = docs.docs.map((doc) => doc.data());
  return MembersFactory.createFromStaffInfoResponse(docsData);
};

export const MemberRepository = {
  getMembers,
  getStaffs,
  addNewMember,
  deleteMember,
  updateSalary,
};
