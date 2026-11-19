import { UserRole } from "../types";
import { getTabsForRole } from "./accounts";

const roleTabs: Partial<Record<UserRole, string[]>> = {
  Administrator: ["*"],
  Cashier: [
    "dashboard",
    "dashboard-activities",
    "active-rentals",
    "new-rental",
    "rental-history",
    "drivers",
    "register-driver",
    "payments",
  ],
  "Battery Releasing Officer": [
    "dashboard",
    "active-rentals",
    "rental-history",
    "battery-release",
    "battery-return",
    "unit-release-return",
    "inventory-summary",
    "batteries",
    "units",
    "soc-monitoring",
    "maintenance",
  ],
  "Branch Personnel": [
    "dashboard",
    "dashboard-activities",
    "active-rentals",
    "new-rental",
    "rental-history",
    "inventory-summary",
    "batteries",
    "units",
    "drivers",
    "register-driver",
  ],
};

export const canAccessTab = (role: UserRole, tab: string) =>
  tab === "staff-accounts"
    ? role === "Administrator"
    : (getTabsForRole(role) ?? roleTabs[role] ?? []).includes("*") ||
      (getTabsForRole(role) ?? roleTabs[role] ?? []).includes(tab);

export const defaultTabForRole = (role: UserRole) =>
  role === "Battery Releasing Officer" ? "active-rentals" : "dashboard";
