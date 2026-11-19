import React from "react";
import { useRental } from "../../context/RentalContext";
import {
  Building2,
  ChevronDown,
  LogOut,
  Menu,
  Plus,
  UserRound,
} from "lucide-react";
import { BranchName } from "../../types";
import { canAccessTab } from "../../auth/rolePermissions";

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const {
    currentTab,
    setCurrentTab,
    currentRole,
    currentBranch,
    setCurrentBranch,
    currentUser,
    signOut,
  } = useRental();
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        !event.target.closest("[data-profile-menu]")
      ) {
        setProfileMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const getBreadcrumb = (): [string, string] => {
    switch (currentTab) {
      case "dashboard":
        return ["Dashboard", "Overview"];
      case "dashboard-activities":
        return ["Dashboard", "Today's Activities"];
      case "active-rentals":
        return ["Rentals", "Active Monitoring"];
      case "rental-history":
        return ["Rentals", "Complete History"];
      case "new-rental":
        return ["Rentals", "New Rental Workflow"];
      case "battery-release":
        return ["Rentals", "Battery Release Desk"];
      case "battery-return":
        return ["Rentals", "Battery Return Desk"];
      case "unit-release-return":
        return ["Rentals", "EV Unit Release & Return"];
      case "batteries":
        return ["Inventory", "Batteries Fleet"];
      case "units":
        return ["Inventory", "EV Fleet Units"];
      case "soc-monitoring":
        return ["Inventory", "Battery SOC Real-time Health"];
      case "maintenance":
        return ["Inventory", "Maintenance & Quarantined"];
      case "drivers":
        return ["Drivers", "Registered Directory"];
      case "register-driver":
        return ["Drivers", "New Driver Enrollment"];
      case "payments":
        return ["Finance", "Payments & Accounting Ledger"];
      case "rental-reports":
        return ["Reports", "Rental Operations"];
      case "payment-reports":
        return ["Reports", "Revenue & Collections"];
      case "inventory-reports":
        return ["Reports", "Fleet Availability"];
      case "loyalty-reports":
        return ["Reports", "Driver Loyalty Rewards"];
      case "settings":
        return ["System", "Configuration & Pricing Rates"];
      case "staff-accounts":
        return ["System", "Staff & Accounts"];
      default:
        return ["ButuanEV", "Management"];
    }
  };

  const [section, page] = getBreadcrumb();
  const canCreateRental = currentTab !== "new-rental" && canAccessTab(currentRole, "new-rental");
  const branchLabel = currentBranch === "All"
    ? "All Branches"
    : currentBranch === "Branch 1 - Main Hub"
      ? "Branch 1"
      : "Branch 2";
  const profileMenu = (
    <div
      role="menu"
      aria-label="Account options"
      className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-[0_12px_30px_-12px_rgba(9,40,78,0.28)]"
    >
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Signed in as</p>
        <p className="mt-1 truncate text-sm font-bold text-slate-900">{currentUser.split(" (")[0]}</p>
        <p className="mt-0.5 text-xs text-slate-600">{currentRole}</p>
        <p className="mt-1 text-[11px] text-slate-500">{branchLabel}</p>
      </div>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setProfileMenuOpen(false);
          signOut();
        }}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:bg-slate-50"
      >
        <LogOut className="h-4 w-4 text-slate-500" />
        Sign out
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200/90 bg-white/95 px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur-sm sm:px-6">
      {/* Left Zone: Mobile Toggle & Context Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--logo-primary)] shadow-[0_0_0_3px_rgba(6,186,209,0.13)]" />
          <p className="hidden shrink-0 text-xs font-semibold text-slate-500 sm:block">
            {section}
          </p>
          <span className="hidden h-4 w-px shrink-0 bg-slate-200 sm:block" />
          <h1 className="truncate font-display text-sm font-bold text-slate-900 sm:text-[15px]">
            {page}
          </h1>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-1 md:flex">
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-slate-700">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            {currentRole === "Administrator" ? (
              <select
                value={currentBranch}
                onChange={(e) => setCurrentBranch(e.target.value as "All" | BranchName)}
                aria-label="Current branch"
                className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Branches</option>
                <option value="Branch 1 - Main Hub">Branch 1</option>
                <option value="Branch 2 - Metro Station">Branch 2</option>
              </select>
            ) : (
              <span>{branchLabel}</span>
            )}
          </div>
          <span className="h-5 w-px bg-slate-200" />
          <div className="relative" data-profile-menu>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              aria-label={`Account menu for ${currentUser.split(" (")[0]}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--logo-primary-strong)]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-100 text-[11px] font-bold text-slate-800" aria-hidden="true">
                {currentUser.split(" ").slice(0, 2).map((part) => part[0]).join("")}
              </span>
              <span className="max-w-36">
                <span className="block truncate text-xs font-bold text-slate-800">{currentUser.split(" (")[0]}</span>
                <span className="block truncate text-[10px] text-slate-500">{currentRole}</span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {profileMenuOpen && profileMenu}
          </div>
        </div>

        <div className="relative md:hidden" data-profile-menu>
          <button
            type="button"
            onClick={() => setProfileMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            aria-label={`Account menu for ${currentUser.split(" (")[0]}`}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 text-slate-700 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--logo-primary-strong)]"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {profileMenuOpen && profileMenu}
        </div>

        {canCreateRental && (
          <button
            onClick={() => setCurrentTab("new-rental")}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[var(--logo-secondary)] px-3 text-xs font-bold text-white shadow-[0_2px_5px_rgba(0,35,83,0.18)] transition-colors hover:bg-slate-800 cursor-pointer sm:px-3.5"
            aria-label="Start a new rental"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Rental</span>
          </button>
        )}
      </div>
    </header>
  );
};
