import {
  BanknoteUndoIcon,
  BoxIcon,
  CartIcon,
  DollarIcon,
  GearIcon,
  LayoutGridIcon,
  PieChartIcon,
  TruckDeliveryIcon,
  UserDollarIcon,
  UsersIcon,
} from "@/icons";
import type { NavItem } from "./types";

export const navItems: NavItem[] = [
  {
    icon: <LayoutGridIcon className="size-6" />,
    key: "dashboard",
    path: "/",
  },
  {
    icon: <DollarIcon className="size-6" />,
    key: "pos",
    path: "/pos",
  },
  {
    icon: <BoxIcon className="size-6" />,
    key: "inventory",
    path: "/inventory",
  },
  {
    icon: <CartIcon className="size-6" />,
    key: "sales",
    path: "/sales",
  },
  {
    icon: <BanknoteUndoIcon className="size-6" />,
    key: "daybook",
    path: "/daybook",
  },
  {
    icon: <TruckDeliveryIcon className="size-6" />,
    key: "purchases",
    path: "/purchases",
  },
  {
    icon: <UsersIcon className="size-6" />,
    key: "customers",
    path: "/customers",
  },
  {
    icon: <UserDollarIcon className="size-6" />,
    key: "suppliers",
    path: "/suppliers",
  },
  {
    icon: <PieChartIcon className="size-6" />,
    key: "reports",
    path: "/reports",
  },
  {
    icon: <GearIcon className="size-6" />,
    key: "settings",
    path: "/settings",
  },
];

export const othersItems: NavItem[] = [];

export const supportItems: NavItem[] = [];
