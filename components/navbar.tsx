import { RoleType } from "@/lib/user";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import {
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  DocumentPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { isTachikawa } from "@/utils";
import { DaysType, MonthType, YearType } from "../features/const";

const now = new Date();
const year = now.getFullYear() as YearType;
const month = (now.getMonth() + 1) as MonthType;
const day = now.getDate() as DaysType;

const navigationForZirishi = [
  {
    name: "日報",
    href: `/${year}/${month}/${day}`,
    icon: <DocumentPlusIcon className="h-6 w-6" aria-hidden="true" />,
  },
];
const navigationForUser = [
  {
    name: "日報",
    href: `/${year}/${month}/${day}`,
    icon: <DocumentPlusIcon className="h-6 w-6" aria-hidden="true" />,
  },
  {
    name: "勤怠",
    href: "/shift",
    icon: <CalendarDaysIcon className="h-6 w-6" aria-hidden="true" />,
  },
];
const navigationForAdmin = [
  {
    name: "日報",
    href: `/${year}/${month}/${day}`,
    icon: <DocumentPlusIcon className="h-6 w-6" aria-hidden="true" />,
  },
  {
    name: "勤怠",
    href: "/shift",
    icon: <CalendarDaysIcon className="h-6 w-6" aria-hidden="true" />,
  },
  {
    name: "アルバイト",
    href: "/members",
    icon: <UsersIcon className="h-6 w-6" aria-hidden="true" />,
  },
  {
    name: "調整",
    href: "/adjustment",
    icon: <CurrencyDollarIcon className="h-6 w-6" aria-hidden="true" />,
  },
];

export default function Navbar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logOut } = useAuth();
  const handleLogout = async () => {
    try {
      await logOut();
      router.push("/login");
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <>
      <div className="bg-gray-900 mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center">
            <p className="border border-white text-white inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm">
              <UserCircleIcon
                className="-ml-0.5 mr-1.5 h-6 w-6"
                aria-hidden="true"
              />
              {user && user.role === RoleType.ADMIN
                ? "管理者（コザ店）"
                : user && user.role === RoleType.USER
                ? "一般ユーザー（コザ店）"
                : user && user.role === RoleType.ZEIRISHI
                ? "仮ユーザー（コザ店）"
                : "未ログイン"}
            </p>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <div className="relative ml-3">
              <span className="relative flex rounded-full bg-gray-900 text-sm sm:ml-3">
                {user ? (
                  <a
                    onClick={handleLogout}
                    className="text-sm font-semibold leading-6 text-white"
                  >
                    Log out
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                ) : (
                  <Link href="/login" legacyBehavior>
                    <a className="text-sm font-semibold leading-6 text-white">
                      Log in
                      <span aria-hidden="true">&larr;</span>
                    </a>
                  </Link>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      {children}
      {!user ? null : (
        <div className="fixed inset-x-0 bottom-0 border border-black">
          <div className="flex h-14 justify-around border-t border-gray-200 bg-white  shadow-lg">
            {user.role === RoleType.ADMIN &&
              navigationForAdmin.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center justify-center text-gray-950"
                >
                  {item.icon}
                  <div className="text-sm">{item.name}</div>
                </a>
              ))}
            {user.role === RoleType.USER &&
              navigationForUser.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center justify-center text-gray-950"
                >
                  {item.icon}
                  <div className="text-sm">{item.name}</div>
                </a>
              ))}
            {isTachikawa(user.userId) && (
              <Link href="/members" legacyBehavior>
                <a className="flex flex-col items-center justify-center text-gray-950">
                  <UsersIcon className="h-6 w-6" aria-hidden="true" />,
                  <div className="text-sm">アルバイト</div>
                </a>
              </Link>
            )}
            {user.role === RoleType.ZEIRISHI &&
              navigationForZirishi.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center justify-center text-gray-950"
                >
                  {item.icon}
                  <div className="text-sm">{item.name}</div>
                </a>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
