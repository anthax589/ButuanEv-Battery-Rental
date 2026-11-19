import React from "react";
import { useRental } from "../../context/RentalContext";
import { canAccessTab } from "../../auth/rolePermissions";
import {
  Battery,
  BatteryCharging,
  Car,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Zap,
  TrendingUp,
  Receipt,
} from "lucide-react";

export const DashboardView: React.FC = () => {
  const {
    batteries,
    units,
    rentals,
    payments,
    activities,
    currentBranch,
    currentRole,
    setCurrentTab,
    setActiveRentalDetailModal,
    setActiveVoucherModal,
    sendBatteryToCharging,
  } = useRental();

  // Filter based on selected branch
  const filteredBatteries =
    currentBranch === "All"
      ? batteries
      : batteries.filter((b) => b.branch === currentBranch);

  const filteredUnits =
    currentBranch === "All"
      ? units
      : units.filter((u) => u.branch === currentBranch);

  const filteredRentals =
    currentBranch === "All"
      ? rentals
      : rentals.filter((r) => r.branch === currentBranch);

  const filteredPayments =
    currentBranch === "All"
      ? payments
      : payments.filter((p) => p.branch === currentBranch);

  // Summary Metrics
  const totalBatteries = filteredBatteries.length;
  const availableBatteries = filteredBatteries.filter(
    (b) => b.status === "Available",
  ).length;
  const rentedBatteries = filteredBatteries.filter(
    (b) => b.status === "Rented",
  ).length;
  const chargingBatteries = filteredBatteries.filter(
    (b) => b.status === "Charging",
  ).length;
  const damagedBatteries = filteredBatteries.filter(
    (b) => b.status === "Damaged",
  ).length;

  const totalUnits = filteredUnits.length;
  const availableUnits = filteredUnits.filter(
    (u) => u.status === "Available",
  ).length;
  const rentedUnits = filteredUnits.filter((u) => u.status === "Rented").length;

  const activeRentals = filteredRentals.filter((r) => r.status === "Active");
  const todayRentals = filteredRentals.filter((r) =>
    r.rentalDate.startsWith(new Date().toISOString().split("T")[0]),
  );
  const todayCollection = filteredPayments
    .filter((p) =>
      p.paymentDate.startsWith(new Date().toISOString().split("T")[0]),
    )
    .reduce((sum, p) => sum + p.amountPaid, 0);

  // Important Alerts:
  const criticalSocBatteries = filteredBatteries.filter((b) => b.soc < 5);
  const damagedOrMaintBatteries = filteredBatteries.filter(
    (b) => b.status === "Damaged" || b.status === "Maintenance",
  );
  const maintUnits = filteredUnits.filter(
    (u) => u.status === "Maintenance" || u.status === "Damaged",
  );
  const outstandingRentals = filteredRentals.filter(
    (r) => r.remainingBalance > 0,
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Operational Quick-Start */}
      <div className="bg-linear-to-r from-slate-900 via-slate-850 to-slate-900 rounded-xl p-5 md:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-cyan-200">
              Operations Center · {currentBranch}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-1 font-display">
            Battery & EV Unit Daily Management
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Streamlined rental checkout, instant voucher generation, SOC
            verification, and fleet tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {canAccessTab(currentRole, "new-rental") && (
            <button
              onClick={() => setCurrentTab("new-rental")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-50 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Process New Rental</span>
            </button>
          )}
          {canAccessTab(currentRole, "battery-release") && (
            <button
              onClick={() => setCurrentTab("battery-release")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-50 rounded-lg transition-colors border border-slate-600 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 text-cyan-200" />
              <span>Release Desk</span>
            </button>
          )}
          {canAccessTab(currentRole, "battery-return") && (
            <button
              onClick={() => setCurrentTab("battery-return")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-50 rounded-lg transition-colors border border-slate-600 cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4 text-cyan-200" />
              <span>Return Desk</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards Grid (11 Required Metrics) */}
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          Key Fleet & Financial Metrics
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Batteries Summary */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-900 text-xs font-medium">
              <span>Total Batteries</span>
              <Battery className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {totalBatteries}
              </span>
              <span className="text-[10px] text-slate-400">Target: 48</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-700 text-xs font-medium">
              <span>Available Batteries</span>
              <CheckCircle2 className="w-4 h-4 text-slate-600" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {availableBatteries}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Ready
              </span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-700 text-xs font-medium">
              <span>Rented Batteries</span>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {rentedBatteries}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                In Field
              </span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-700 text-xs font-medium">
              <span>Charging Batteries</span>
              <BatteryCharging className="w-4 h-4 text-slate-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {chargingBatteries}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Bays
              </span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-700 text-xs font-medium">
              <span>Damaged Batteries</span>
              <AlertTriangle className="w-4 h-4 text-slate-600" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {damagedBatteries}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Quarantined
              </span>
            </div>
          </div>

          {/* Units Summary */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-900 text-xs font-medium">
              <span>Total EV Units</span>
              <Car className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {totalUnits}
              </span>
              <span className="text-[10px] text-slate-400">
                Bikes/Cargo/Bus
              </span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-700 text-xs font-medium">
              <span>Available Units</span>
              <CheckCircle2 className="w-4 h-4 text-slate-600" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {availableUnits}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Deployed
              </span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-700 text-xs font-medium">
              <span>Rented Units</span>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {rentedUnits}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                On Trip
              </span>
            </div>
          </div>

          {/* Daily Operations */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-600 text-xs font-medium">
              <span>Active Rentals</span>
              <Zap className="w-4 h-4 text-slate-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {activeRentals.length}
              </span>
              <span className="text-[10px] text-slate-500">Live</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-600 text-xs font-medium">
              <span>Today's Rentals</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {todayRentals.length}
              </span>
              <span className="text-[10px] text-slate-500">Issued</span>
            </div>
          </div>

          {canAccessTab(currentRole, "payments") && <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-slate-50/50">
            <div className="flex items-center justify-between text-slate-800 text-xs font-semibold">
              <span>Today's Collection</span>
              <Receipt className="w-4 h-4 text-slate-600" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-950">
                ₱
                {todayCollection.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Recorded
              </span>
            </div>
          </div>}
        </div>
      </div>

      {/* Important Alerts Strip */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Important Operational Alerts (
          {criticalSocBatteries.length +
            damagedOrMaintBatteries.length +
            maintUnits.length +
            outstandingRentals.length}
          )
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Critical SOC Alert */}
          <div
            className={`p-3 rounded-lg border ${criticalSocBatteries.length > 0 ? "bg-red-50/80 border-red-200" : "bg-slate-50 border-slate-200"}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 font-bold text-red-900">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>SOC Below 5%</span>
              </div>
              <span className="font-mono font-bold text-slate-700">
                {criticalSocBatteries.length}
              </span>
            </div>
            {criticalSocBatteries.length > 0 ? (
              <div className="space-y-1 mt-1 text-[11px] text-slate-700">
                {criticalSocBatteries.map((b) => (
                  <div key={b.id} className="flex items-center justify-between">
                    <span className="font-mono font-bold">
                      {b.code} ({b.soc}% SOC)
                    </span>
                    <button
                      onClick={() => sendBatteryToCharging(b.id)}
                      className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-medium cursor-pointer"
                    >
                      Dock to Charge
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                No batteries below 5% threshold.
              </p>
            )}
          </div>

          {/* Damaged Batteries Alert */}
          <div
            className={`p-3 rounded-lg border ${damagedOrMaintBatteries.length > 0 ? "bg-amber-50/80 border-amber-200" : "bg-slate-50 border-slate-200"}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Damaged Batteries</span>
              </div>
              <span className="font-mono font-bold text-slate-700">
                {damagedOrMaintBatteries.length}
              </span>
            </div>
            {damagedOrMaintBatteries.length > 0 ? (
              <div className="space-y-1 mt-1 text-[11px]">
                {damagedOrMaintBatteries.slice(0, 2).map((b) => (
                  <div key={b.id} className="truncate">
                    <span className="font-mono font-bold">{b.code}</span>:{" "}
                    {b.damageNotes || "Needs inspection"}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                No damaged batteries reported.
              </p>
            )}
          </div>

          {/* Units Maintenance */}
          <div
            className={`p-3 rounded-lg border ${maintUnits.length > 0 ? "bg-amber-50/80 border-amber-200" : "bg-slate-50 border-slate-200"}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Car className="w-4 h-4 text-amber-600" />
                <span>Units Maintenance</span>
              </div>
              <span className="font-mono font-bold text-slate-700">
                {maintUnits.length}
              </span>
            </div>
            {maintUnits.length > 0 ? (
              <div className="space-y-1 mt-1 text-[11px] text-slate-700">
                {maintUnits.map((u) => (
                  <div key={u.id} className="truncate">
                    <span className="font-mono font-bold">{u.code}</span>:{" "}
                    {u.remarks || "Under service"}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                All EV units in good operational order.
              </p>
            )}
          </div>

          {/* Outstanding Payments */}
          {canAccessTab(currentRole, "payments") && <div
            className={`p-3 rounded-lg border ${outstandingRentals.length > 0 ? "bg-slate-100 border-slate-300" : "bg-slate-50 border-slate-200"}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span>Unpaid Balances</span>
              </div>
              <span className="font-mono font-bold text-slate-800">
                {outstandingRentals.length}
              </span>
            </div>
            {outstandingRentals.length > 0 ? (
              <div className="text-[11px] text-slate-600 mt-1 space-y-1">
                {outstandingRentals.slice(0, 2).map((r) => (
                  <div key={r.id} className="flex justify-between">
                    <span className="truncate">{r.driverName}</span>
                    <span className="font-mono font-bold text-amber-700">
                      ₱{r.remainingBalance.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                Zero outstanding balances.
              </p>
            )}
          </div>}
        </div>
      </div>

      {/* Two Column Layout: Current Active Rentals & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Current Active Rentals */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">
                Current Active Rentals
              </h3>
              <p className="text-xs text-slate-500">
                Live monitoring of deployed batteries and units
              </p>
            </div>
            <button
              onClick={() => setCurrentTab("active-rentals")}
              className="text-xs text-slate-700 hover:text-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({activeRentals.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {activeRentals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active rentals at the moment. Use "New Rental" to deploy
                equipment.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                    <th className="px-4 py-2.5">Driver Name</th>
                    <th className="px-4 py-2.5">Battery / Unit</th>
                    <th className="px-4 py-2.5">Branch</th>
                    <th className="px-4 py-2.5">Rental Time</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Payment</th>
                    <th className="px-4 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeRentals.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {r.driverName}
                        <span className="block text-[10px] text-slate-400 font-normal font-mono">
                          {r.id}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div className="text-slate-800 font-bold">
                          {r.batteryCode || "—"}
                        </div>
                        {r.unitCode && (
                          <div className="text-slate-500 text-[11px]">
                            {r.unitCode} ({r.unitType})
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-30">
                        {r.branch
                          .replace(" - Main Hub", "")
                          .replace(" - Metro Station", "")}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {r.rentalDate.split(" ")[0]}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            r.paymentStatus === "Paid"
                              ? "bg-slate-100 text-slate-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {r.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setActiveRentalDetailModal(r)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Activities */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">
                Recent Activities
              </h3>
              <p className="text-xs text-slate-500">
                Live operational transaction feed
              </p>
            </div>
            <button
              onClick={() => setCurrentTab("dashboard-activities")}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              All Logs
            </button>
          </div>

          <div className="p-4 space-y-3.5 max-h-95 overflow-y-auto divide-y divide-slate-100 text-xs">
            {activities.slice(0, 6).map((act) => (
              <div key={act.id} className="pt-3 first:pt-0">
                <div className="flex items-start justify-between gap-2">
                  <span className={`font-semibold text-xs text-slate-700`}>
                    {act.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {act.timestamp.split(" ")[1] || act.timestamp}
                  </span>
                </div>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  {act.description}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                  <span>By {act.actor}</span>
                  <span>·</span>
                  <span>
                    {act.branch
                      .replace(" - Main Hub", "")
                      .replace(" - Metro Station", "")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
