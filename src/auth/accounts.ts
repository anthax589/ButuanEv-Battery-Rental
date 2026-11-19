import { BranchName, UserRole } from "../types";

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch: "All" | BranchName;
}

export interface ManagedRole {
  name: UserRole;
  tabs: string[];
}

export interface AccountDirectory {
  accounts: StaffAccount[];
  roles: ManagedRole[];
}

const STORAGE_KEY = "butuanev_staff_accounts_v1";

export const appTabOptions = [
  ["dashboard", "Dashboard"],
  ["dashboard-activities", "Today's Activities"],
  ["active-rentals", "Active Rentals"],
  ["new-rental", "New Rental"],
  ["rental-history", "Rental History"],
  ["battery-release", "Battery Release"],
  ["battery-return", "Battery Return"],
  ["unit-release-return", "Unit Release / Return"],
  ["inventory-summary", "Inventory Summary"],
  ["batteries", "Batteries"],
  ["units", "Units"],
  ["soc-monitoring", "Battery SOC Monitoring"],
  ["maintenance", "Maintenance / Damaged"],
  ["drivers", "Driver List"],
  ["register-driver", "Register Driver"],
  ["payments", "Payments & Accounting"],
  ["rental-reports", "Rental Reports"],
  ["inventory-reports", "Inventory Reports"],
  ["loyalty-reports", "Loyalty Reports"],
  ["settings", "System Settings & Rates"],
] as const;

export const defaultAccountDirectory: AccountDirectory = {
  accounts: [
    { id: "acct-cashier", name: "Cashier", email: "cashier@butuanev.ph", role: "Cashier", branch: "Branch 1 - Main Hub" },
    { id: "acct-branch", name: "Branch Personnel", email: "branch@butuanev.ph", role: "Branch Personnel", branch: "Branch 1 - Main Hub" },
    { id: "acct-admin", name: "Alex Rivera", email: "admin@butuanev.ph", role: "Administrator", branch: "All" },
    { id: "acct-releasing-officer", name: "Releasing Officer", email: "releasingofficer@butuanev.ph", role: "Battery Releasing Officer", branch: "Branch 1 - Main Hub" },
    { id: "acct-releasing", name: "Releasing Staff", email: "releasing@butuanev.ph", role: "Battery Releasing Officer", branch: "Branch 1 - Main Hub" },
  ],
  roles: [
    { name: "Administrator", tabs: ["*"] },
    { name: "Cashier", tabs: ["dashboard", "dashboard-activities", "active-rentals", "new-rental", "rental-history", "drivers", "register-driver", "payments"] },
    { name: "Battery Releasing Officer", tabs: ["dashboard", "active-rentals", "rental-history", "battery-release", "battery-return", "unit-release-return", "inventory-summary", "batteries", "units", "soc-monitoring", "maintenance"] },
    { name: "Branch Personnel", tabs: ["dashboard", "dashboard-activities", "active-rentals", "new-rental", "rental-history", "inventory-summary", "batteries", "units", "drivers", "register-driver"] },
  ],
};

export const loadAccountDirectory = (): AccountDirectory => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultAccountDirectory;
    const parsed = JSON.parse(saved) as AccountDirectory;
    if (!Array.isArray(parsed.accounts) || !Array.isArray(parsed.roles)) return defaultAccountDirectory;
    return {
      ...parsed,
      accounts: parsed.accounts.map((account) =>
        account.email?.toLowerCase() === "admin@butuanev.ph" && account.name === "Administrator"
          ? { ...account, name: "Alex Rivera" }
          : account,
      ),
    };
  } catch {
    return defaultAccountDirectory;
  }
};

export const saveAccountDirectory = (directory: AccountDirectory) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(directory));
};

export const getAccountForEmail = (email: string): StaffAccount | undefined =>
  loadAccountDirectory().accounts.find(
    (account) => account.email.trim().toLowerCase() === email.trim().toLowerCase(),
  );

export const getTabsForRole = (role: UserRole): string[] | undefined =>
  loadAccountDirectory().roles.find((item) => item.name === role)?.tabs;
