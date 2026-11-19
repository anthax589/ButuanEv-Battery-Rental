import React, { useState, useMemo } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Eye, 
  Battery, 
  Car, 
  Download,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { RentalType, RentalStatus } from '../../types';

export const RentalHistoryView: React.FC = () => {
  const { 
    rentals, 
    currentBranch, 
    setActiveRentalDetailModal, 
    setActiveVoucherModal,
    exportReportToCSV 
  } = useRental();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RentalStatus>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | RentalType>('All');

  const filteredHistory = useMemo(() => {
    return rentals.filter(r => {
      if (currentBranch !== 'All' && r.branch !== currentBranch) return false;
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (typeFilter !== 'All' && r.rentalType !== typeFilter) return false;
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
    exportReportToCSV('rental_history', filteredHistory.map(r => ({
      TransactionID: r.id,
      VoucherNumber: r.voucherNumber,
      DriverName: r.driverName,
      RentalType: r.rentalType,
      BatteryCode: r.batteryCode || 'N/A',
      UnitCode: r.unitCode || 'N/A',
      Branch: r.branch,
      RentalDate: r.rentalDate,
      ReturnDate: r.actualReturnDate || r.expectedReturnDate,
      StartingSOC: r.startingSoc || 'N/A',
      EndingSOC: r.endingSoc || 'N/A',
      TotalFee: r.totalAmountDue,
      AmountPaid: r.amountPaid,
      Balance: r.remainingBalance,
      Status: r.status
    })));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Master Transaction Archives</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
            Complete Rental Transaction History ({rentals.length} Records)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Auditable archive of all created, active, and completed equipment contracts.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Driver Name, TRX ID, Voucher Number, or Equipment Code..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Active">Active</option>
            <option value="Reserved">Reserved</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer font-medium"
          >
            <option value="All">All Types</option>
            <option value="Battery">Battery</option>
            <option value="Unit">Unit</option>
            <option value="Combined">Combined</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto text-xs">
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No rental transactions match your query.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="px-4 py-3">TRX ID</th>
                  <th className="px-4 py-3">Voucher</th>
                  <th className="px-4 py-3">Driver Name</th>
                  <th className="px-4 py-3">Rental Type</th>
                  <th className="px-4 py-3">Equipment</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Return Date</th>
                  <th className="px-4 py-3 text-right">Fee</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{r.id}</td>
                    <td className="px-4 py-3 font-mono text-emerald-700 font-medium">{r.voucherNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{r.driverName}</td>
                    <td className="px-4 py-3 text-slate-700">{r.rentalType}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {r.batteryCode || ''} {r.unitCode ? `· ${r.unitCode}` : ''}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{r.rentalDate.split(' ')[0]}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {r.actualReturnDate ? r.actualReturnDate.split(' ')[0] : r.expectedReturnDate.split(' ')[0]}
                    </td>
                    <td className="px-4 py-3 font-mono text-right font-medium">
                      ₱{r.totalAmountDue.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setActiveRentalDetailModal(r)}
                          title="View Details"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveVoucherModal(r)}
                          title="Reprint Voucher"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
