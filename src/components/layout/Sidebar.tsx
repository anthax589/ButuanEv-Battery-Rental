/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import Logo from "../../assets/img/ButuanEvLogo.png";
import React from "react";
import { useRental } from "../../context/RentalContext";
import { canAccessTab } from "../../auth/rolePermissions";
import {
  LayoutDashboard,
  KeyRound,
  PlusCircle,
  PlayCircle,
  RotateCcw,
  ArrowUpRight,
  ArrowDownLeft,
  Layers,
  Battery,
  Car,
  Gauge,
  AlertOctagon,
  Users,
  UserPlus,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Zap,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  highlight?: boolean;
  count?: number;
}

interface NavSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  setMobileOpen,
}) => {
  const { currentTab, setCurrentTab, currentRole, batteries, units, rentals } =
    useRental();

  // --- Dropdown state: which sections are expanded ---
  const [openSections, setOpenSections] = React.useState(new Set<number>());

  // --- Navigation data (kept unchanged) ---
  const activeRentalsCount = rentals.filter(
    (r) => r.status === "Active",
  ).length;
  const pendingReleasesCount = rentals.filter(
    (r) => r.status === "Reserved",
  ).length;
  const criticalSocCount = batteries.filter((b) => b.soc < 5).length;
  const damagedOrMaintCount =
    batteries.filter(
      (b) => b.status === "Damaged" || b.status === "Maintenance",
    ).length +
    units.filter((u) => u.status === "Damaged" || u.status === "Maintenance")
      .length;

  const navigateTo = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileOpen(false);
  };

  const navSections: NavSection[] = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      items: [
        { id: "dashboard", label: "Overview", icon: LayoutDashboard },
        {
          id: "dashboard-activities",
          label: "Today's Activities",
          icon: KeyRound,
        },
        {
          id: "active-rentals",
          label: "Active Rentals",
          icon: PlayCircle,
          badge: activeRentalsCount,
        },
        { id: "inventory-summary", label: "Inventory Summary", icon: Layers },
      ],
    },
    {
      title: "Rentals",
      icon: PlusCircle,
      items: [
        {
          id: "new-rental",
          label: "New Rental",
          icon: PlusCircle,
          highlight: true,
        },
        { id: "rental-history", label: "Rental History", icon: FileText },
        {
          id: "battery-release",
          label: "Battery Release",
          icon: ArrowUpRight,
          badge: pendingReleasesCount > 0 ? pendingReleasesCount : undefined,
          badgeColor: "bg-[var(--logo-primary-strong)]",
        },
        { id: "battery-return", label: "Battery Return", icon: ArrowDownLeft },
        {
          id: "unit-release-return",
          label: "Unit Release / Return",
          icon: RotateCcw,
        },
      ],
    },
    {
      title: "Inventory",
      icon: Battery,
      items: [
        {
          id: "batteries",
          label: "Batteries",
          icon: Battery,
          count: batteries.length,
        },
        { id: "units", label: "Units", icon: Car, count: units.length },
        {
          id: "soc-monitoring",
          label: "Battery SOC Monitoring",
          icon: Gauge,
          badge: criticalSocCount > 0 ? `${criticalSocCount} Low` : undefined,
          badgeColor: "bg-[var(--logo-accent-strong)]",
        },
        {
          id: "maintenance",
          label: "Maintenance / Damaged",
          icon: AlertOctagon,
          badge: damagedOrMaintCount > 0 ? damagedOrMaintCount : undefined,
          badgeColor: "bg-[var(--logo-primary-strong)]",
        },
      ],
    },
    {
      title: "Drivers",
      icon: Users,
      items: [
        { id: "drivers", label: "Driver List", icon: Users },
        { id: "register-driver", label: "Register Driver", icon: UserPlus },
        { id: "rental-history", label: "Rental History", icon: FileText },
      ],
    },
    {
      title: "Reports & Accounting",
      icon: BarChart3,
      items: [
        { id: "payments", label: "Payments & Accounting", icon: CreditCard },
        { id: "rental-reports", label: "Rental Reports", icon: BarChart3 },
        // { id: "payment-reports", label: "Payment Reports", icon: CreditCard },
        // { id: "inventory-reports", label: "Inventory Reports", icon: Layers },
        // { id: "loyalty-reports", label: "Loyalty Reports", icon: ShieldCheck },
      ],
    },
  ];

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessTab(currentRole, item.id)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-50 text-slate-900 flex flex-col border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200/80 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">

              <img src={Logo} alt="BXUEV Logo" className="w-10 h-10" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-black font-display block leading-none">
                ButuanEV
              </span>
              <span className="text-[10px] tracking-wider text-slate-400 font-medium uppercase mt-0.5 block">
                Battery Rental System
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List with dropdown sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
          {visibleSections.map((sec, idx) => {
            const isSectionOpen = openSections.has(idx);
            // Compute a simple badge count for the section title (number of child items)
            const sectionBadge =
              sec.items.length > 0 ? sec.items.length : undefined;

            // Title button that toggles the section
            const titleOnClick = () => {
              if (isSectionOpen) {
                setOpenSections((prev) => {
                  const next = new Set(prev);
                  next.delete(idx);
                  return next;
                });
              } else {
                setOpenSections((prev) => {
                  const next = new Set(prev);
                  next.add(idx);
                  return next;
                });
              }
            };

            return (
              <div key={idx} className="space-y-1.5">
                {/* Section title with toggle arrow */}
                <button
                  onClick={titleOnClick}
                  className={`w-full flex items-center justify-between px-3 py-1 text-md font-semibold rounded-md transition-all cursor-pointer ${
                    isSectionOpen
                      ? "bg-slate-100 text-slate-800"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <sec.icon className="w-3.5 h-3.5 shrink-0 text-[var(--logo-primary-strong)]" />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 opacity-70 ${
                      isSectionOpen ? "rotate-180" : "rotate-0"
                    } transition-transform`}
                  />
                </button>

                {/* Child items – shown only when the section is open */}
                {isSectionOpen && (
                  <div className="px-3 rounded-md bg-slate-50 text-sm">
                    {sec.items.map((item, itemIdx) => {
                      const isActive = currentTab === item.id;
                      const Icon = item.icon;

                      if (item.highlight) {
                        return (
                          <button
                            key={itemIdx}
                            onClick={() => navigateTo(item.id)}
                            className={`w-full flex items-center justify-between px-3  text-md font-semibold  transition-all cursor-pointer ${
                              isActive
                                ? "bg-[var(--logo-accent-strong)] text-white font-semibold border-l-2 border-[var(--logo-primary)]"
                                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                            }`}
                          >
                            <div className="flex items-center gap-2 group-hover:rotate-180">
                              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-700"}`} />
                              <span>{item.label}</span>
                            </div>
                            {/* <ChevronRight className="w-3.5 h-3.5 opacity-70  group-hover:rotate-180" /> */}
                          </button>
                        );
                      }

                      return (
                        <button
                          key={itemIdx}
                          onClick={() => navigateTo(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-1  transition-colors cursor-pointer ${
                            isActive
                              ? "bg-white text-slate-900 font-semibold border-l-2 border-[var(--logo-primary-strong)]"
                              : "text-slate-600 hover:text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[var(--logo-primary-strong)]" : "text-slate-500"}`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge !== undefined && (
                            <span
                              className={`px-1.5 py-1.2 rounded-full text-[10px] whitespace-nowrap font-mono font-bold text-white ${item.badgeColor || "bg-[var(--logo-accent-strong)]"}`}
                            >
                              {item.badge}
                            </span>
                          )}

                          {item.count !== undefined && !item.badge && (
                            <span className="text-[10px] font-mono text-slate-500">
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* System Settings for Admin */}
          {canAccessTab(currentRole, "settings") && (
            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={() => navigateTo("settings")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-md rounded-md transition-colors cursor-pointer ${
                  currentTab === "settings"
                    ? "bg-slate-50 text-slate-900 font-medium"
                    : "text-slate-600 hover:text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>System Settings & Rates</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
