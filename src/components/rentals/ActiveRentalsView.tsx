import React, { useState, useMemo } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  PlayCircle, 
  Search, 
  Filter, 
  Battery, 
  Car, 
  ArrowDownLeft, 
  AlertTriangle, 
  Printer, 
  Eye, 
  Clock, 
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Download
} from 'lucide-react';
import { RentalType, RentalStatus, BranchName } from '../../types';

export const ActiveRentalsView: React.FC = () => {
  const { 
    rentals, 
    batteries, 
    currentBranch, 
    setActiveRentalDetailModal, 
    setActiveVoucherModal, 
    setCurrentTab,
    exportReportToCSV
  } = useRental();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | RentalType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Reserved'>('All');

  // Filter rentals
  const filteredRentals = useMemo(() => {
    return rentals.filter(r => {
      // Branch check
      if (currentBranch !== 'All' && r.branch !== currentBranch) return false;

      // Status check (we focus on ongoing: Active and Reserved)
      if (statusFilter === 'All') {
        if (r.status !== 'Active' && r.status !== 'Reserved') return false;
      } else {
        if (r.status !== statusFilter) return false;
      }

      // Type check
      if (typeFilter !== 'All' && r.rentalType !== typeFilter) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          r.driverName.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.voucherNumber.toLowerCase().includes(q) ||
          (r.batteryCode && r.batteryCode.toLowerCase().includes(q)) ||
          (r.unitCode && r.unitCode.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [rentals, currentBranch, statusFilter, typeFilter, searchQuery]);

  const handleExport = () => {
    exportReportToCSV('active_rentals', filteredRentals.map(r => ({
      TransactionID: r.id,
      VoucherNumber: r.voucherNumber,
      DriverName: r.driverName,
      RentalType: r.rentalType,
      BatteryCode: r.batteryCode || 'N/A',
      UnitCode: r.unitCode || 'N/A',
      Branch: r.branch,
      RentalDate: r.rentalDate,
      ExpectedReturn: r.expectedReturnDate,
      Status: r.status,
      StartingSOC: r.startingSoc || 'N/A',
      TotalDue: r.totalAmountDue,
      AmountPaid: r.amountPaid,
      Balance: r.remainingBalance,
      PaymentStatus: r.paymentStatus
    })));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <PlayCircle className="w-4 h-4" />
            <span>Live Field Monitoring</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
            Active Rentals & Equipment In-Field
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time track of all equipment currently deployed or reserved across branches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setCurrentTab('new-rental')}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer shadow-xs"
          >
            + New Rental
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Driver Name, TRX ID, Voucher, Battery, or Unit..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer"
          >
            <option value="All">All Ongoing (Active + Reserved)</option>
            <option value="Active">Active Only</option>
            <option value="Reserved">Reserved Awaiting Release</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer"
          >
            <option value="All">All Rental Types</option>
            <option value="Battery">Battery Only</option>
            <option value="Unit">Unit Only</option>
            <option value="Combined">Combined</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {filteredRentals.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No ongoing rentals matching the filter criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="px-4 py-3">Driver Name</th>
                  <th className="px-4 py-3">Rental Type</th>
                  <th className="px-4 py-3">Battery Code</th>
                  <th className="px-4 py-3">EV Unit</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Rental Start</th>
                  <th className="px-4 py-3">Expected Return</th>
                  <th className="px-4 py-3">Starting SOC</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRentals.map(r => {
                  const bat = r.batteryId ? batteries.find(b => b.id === r.batteryId) : undefined;
                  const isFlagged = r.flaggedIssue?.isFlagged;

                  return (
                    <tr key={r.id} className={`hover:bg-slate-50/80 transition-colors ${isFlagged ? 'bg-red-50/40' : ''}`}>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {r.driverName}
                        <span className="block font-mono text-[10px] text-slate-400 font-normal">{r.id}</span>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        <span className="font-medium">{r.rentalType}</span>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        {r.batteryCode ? (
                          <div className="flex items-center gap-1.5">
                            <Battery className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{r.batteryCode}</span>
                          </div>
                        ) : '—'}
                      </td>

                      <td className="px-4 py-3 font-mono">
                        {r.unitCode ? (
                          <div className="flex items-center gap-1.5 text-blue-700">
                            <Car className="w-3.5 h-3.5 text-blue-600" />
                            <span>{r.unitCode}</span>
                          </div>
                        ) : '—'}
                      </td>

                      <td className="px-4 py-3 text-slate-600 truncate max-w-[120px]">
                        {r.branch.replace(' - Main Hub', '').replace(' - Metro Station', '')}
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                        {r.rentalDate.split(' ')[0]}
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                        {r.expectedReturnDate.split(' ')[0]}
                      </td>

                      <td className="px-4 py-3 font-mono">
                        {r.startingSoc !== undefined ? (
                          <span className="font-bold text-slate-800">{r.startingSoc}%</span>
                        ) : (
                          <span className="text-amber-700 text-[10px] font-medium bg-amber-50 px-1.5 py-0.5 rounded">Pending Handover</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          r.paymentStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {r.paymentStatus}
                        </span>
                        {r.remainingBalance > 0 && (
                          <span className="block text-[10px] font-mono text-amber-700 mt-0.5">
                            Bal: ₱{r.remainingBalance.toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                          r.status === 'Reserved' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {r.status}
                        </span>
                        {isFlagged && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-red-600 font-bold ml-1">
                            <ShieldAlert className="w-3 h-3" />
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActiveRentalDetailModal(r)}
                            title="View Full Details & Financials"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setActiveVoucherModal(r)}
                            title="Print Voucher"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {r.status === 'Active' && (
                            <button
                              onClick={() => {
                                if (r.rentalType === 'Unit') {
                                  setCurrentTab('unit-release-return');
                                } else {
                                  setCurrentTab('battery-return');
                                }
                              }}
                              title="Process Return"
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                            >
                              Return
                            </button>
                          )}

                          {r.status === 'Reserved' && (
                            <button
                              onClick={() => {
                                if (r.rentalType === 'Unit') {
                                  setCurrentTab('unit-release-return');
                                } else {
                                  setCurrentTab('battery-release');
                                }
                              }}
                              title="Process Release"
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                            >
                              Release
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
