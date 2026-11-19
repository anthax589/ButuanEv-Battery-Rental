import React, { useState, useMemo } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  BarChart3, 
  FileText, 
  CreditCard, 
  Layers, 
  ShieldCheck, 
  Download, 
  Printer, 
  Search, 
  Calendar, 
  Building2,
  CheckCircle2,
  ArrowUpRight,
  Filter
} from 'lucide-react';

type ReportCategory = 'rentals' | 'financial' | 'inventory' | 'loyalty';

export const ReportsView: React.FC = () => {
  const { rentals, payments, batteries, units, drivers, currentBranch, exportReportToCSV } = useRental();

  const [category, setCategory] = useState<ReportCategory>('rentals');
  const [subType, setSubType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  const handlePrint = () => {
    window.print();
  };

  // Compile data according to selected category and subtype
  const reportData = useMemo(() => {
    if (category === 'rentals') {
      return rentals.filter(r => {
        if (currentBranch !== 'All' && r.branch !== currentBranch) return false;
        if (subType === 'active' && r.status !== 'Active') return false;
        if (subType === 'returned' && r.status !== 'Completed') return false;
        if (subType === 'battery' && r.rentalType !== 'Battery') return false;
        if (subType === 'unit' && r.rentalType !== 'Unit') return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return r.driverName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.voucherNumber.toLowerCase().includes(q);
        }
        return true;
      });
    }

    if (category === 'financial') {
      return payments.filter(p => {
        if (currentBranch !== 'All' && p.branch !== currentBranch) return false;
        if (subType === 'unpaid' && p.balance <= 0) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return p.driverName.toLowerCase().includes(q) || p.transactionId.toLowerCase().includes(q) || p.referenceNumber.toLowerCase().includes(q);
        }
        return true;
      });
    }

    if (category === 'inventory') {
      if (subType === 'units') {
        return units.filter(u => {
          if (currentBranch !== 'All' && u.branch !== currentBranch) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return u.code.toLowerCase().includes(q) || u.modelName.toLowerCase().includes(q);
          }
          return true;
        });
      }
      return batteries.filter(b => {
        if (currentBranch !== 'All' && b.branch !== currentBranch) return false;
        if (subType === 'damaged' && b.status !== 'Damaged' && b.status !== 'Maintenance') return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return b.code.toLowerCase().includes(q) || b.batteryType.toLowerCase().includes(q);
        }
        return true;
      });
    }

    if (category === 'loyalty') {
      return drivers.filter(d => {
        if (currentBranch !== 'All' && d.branch !== currentBranch) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
        }
        return true;
      });
    }

    return [];
  }, [category, subType, currentBranch, searchQuery, rentals, payments, batteries, units, drivers]);

  const handleExportCSV = () => {
    let rows: Record<string, any>[] = [];
    if (category === 'rentals') {
      rows = (reportData as typeof rentals).map(r => ({
        TRX_ID: r.id,
        Voucher: r.voucherNumber,
        Driver: r.driverName,
        RentalType: r.rentalType,
        Equipment: `${r.batteryCode || ''} ${r.unitCode || ''}`.trim(),
        RentalDate: r.rentalDate,
        ReturnDate: r.actualReturnDate || r.expectedReturnDate,
        TotalFee: r.totalAmountDue,
        Paid: r.amountPaid,
        Status: r.status
      }));
    } else if (category === 'financial') {
      rows = (reportData as typeof payments).map(p => ({
        ReceiptID: p.id,
        TRX_ID: p.transactionId,
        Voucher: p.voucherNumber,
        Driver: p.driverName,
        AmountPaid: p.amountPaid,
        BalanceRemaining: p.balance,
        PaymentMethod: p.paymentMethod,
        Date: p.paymentDate,
        Branch: p.branch
      }));
    } else if (category === 'inventory') {
      rows = (reportData as any[]).map(item => ({
        Code: item.code,
        Type: item.batteryType || item.unitType,
        Status: item.status,
        Condition: item.condition,
        Branch: item.branch,
        Details: item.soc !== undefined ? `${item.soc}% SOC` : `${item.mileageKm} km`
      }));
    } else if (category === 'loyalty') {
      rows = (reportData as typeof drivers).map(d => ({
        DriverID: d.id,
        Name: d.name,
        TotalRentals: d.totalRentalsCount,
        LoyaltyDiscount: `${d.currentLoyaltyPercent}%`,
        Branch: d.branch
      }));
    }

    exportReportToCSV(`report_${category}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (hidden on print) */}
      <div className="no-print bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Operations Intelligence</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
            Reports & Operational Statements
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Export formatted audit summaries for operations, revenue collections, fleet health, and driver loyalty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Category Tabs (hidden on print) */}
      <div className="no-print flex flex-wrap gap-2 text-xs font-semibold">
        {[
          { id: 'rentals', label: 'Rental Operations', icon: FileText },
          { id: 'financial', label: 'Financial & Collections', icon: CreditCard },
          { id: 'inventory', label: 'Fleet & Availability', icon: Layers },
          { id: 'loyalty', label: 'Driver Loyalty Standing', icon: ShieldCheck },
        ].map(cat => {
          const Icon = cat.icon;
          const isActive = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id as ReportCategory);
                setSubType('all');
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Sub-selection Bar (hidden on print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report entries..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {category === 'rentals' && (
            <select
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer font-medium"
            >
              <option value="all">All Rentals</option>
              <option value="active">Active Rentals Only</option>
              <option value="returned">Completed & Returned</option>
              <option value="battery">Battery Only</option>
              <option value="unit">Unit Only</option>
            </select>
          )}

          {category === 'financial' && (
            <select
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer font-medium"
            >
              <option value="all">All Payment Collections</option>
              <option value="unpaid">Entries with Outstanding Balance</option>
            </select>
          )}

          {category === 'inventory' && (
            <select
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer font-medium"
            >
              <option value="all">All Fleet Assets</option>
              <option value="batteries">Batteries Only</option>
              <option value="units">EV Units Only</option>
              <option value="damaged">Damaged & Quarantined Only</option>
            </select>
          )}
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs print-card">
        {/* Printable Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-950 font-display">BXUEV SYSTEM REPORT</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded uppercase">
                {category}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Clean Mobility Operations & Fleet Intelligence</p>
            <p className="text-xs text-slate-400 mt-0.5">Scope: {currentBranch} · Generated: {new Date().toLocaleString()}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase font-medium">Matching Records</span>
            <span className="text-2xl font-bold font-mono text-slate-900">{reportData.length}</span>
          </div>
        </div>

        {/* Dynamic Table based on Category */}
        <div className="overflow-x-auto text-xs">
          {category === 'rentals' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="px-4 py-3">TRX ID</th>
                  <th className="px-4 py-3">Voucher</th>
                  <th className="px-4 py-3">Driver Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Battery / Unit</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3 text-right">Fee</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(reportData as typeof rentals).map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">{r.id}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700 font-medium">{r.voucherNumber}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{r.driverName}</td>
                    <td className="px-4 py-2.5 text-slate-700">{r.rentalType}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{r.batteryCode || ''} {r.unitCode ? `· ${r.unitCode}` : ''}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-500">{r.rentalDate.split(' ')[0]}</td>
                    <td className="px-4 py-2.5 font-mono text-right font-medium">₱{r.totalAmountDue.toFixed(2)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.status === 'Active' ? 'bg-slate-100 text-slate-800' :
                        r.status === 'Completed' ? 'bg-slate-100 text-slate-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {category === 'financial' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="px-4 py-3">Receipt No.</th>
                  <th className="px-4 py-3">TRX Ref</th>
                  <th className="px-4 py-3">Driver Name</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3 text-right">Remaining Balance</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(reportData as typeof payments).map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">{p.id}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{p.voucherNumber}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{p.driverName}</td>
                    <td className="px-4 py-2.5 text-slate-700">{p.paymentMethod}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-500">{p.referenceNumber}</td>
                    <td className="px-4 py-2.5 font-mono text-right font-bold text-slate-800">₱{p.amountPaid.toFixed(2)}</td>
                    <td className="px-4 py-2.5 font-mono text-right text-slate-700">₱{p.balance.toFixed(2)}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-500">{p.paymentDate.split(' ')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {category === 'inventory' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="px-4 py-3">Asset Code</th>
                  <th className="px-4 py-3">Asset Type</th>
                  <th className="px-4 py-3">Branch Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Metric</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(reportData as any[]).map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">{item.code}</td>
                    <td className="px-4 py-2.5 text-slate-700">{item.batteryType || item.unitType}</td>
                    <td className="px-4 py-2.5 text-slate-600">{item.branch}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{item.condition}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">
                      {item.soc !== undefined ? `${item.soc}% SOC` : `${item.mileageKm} km`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {category === 'loyalty' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="px-4 py-3">Driver ID</th>
                  <th className="px-4 py-3">Driver Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Home Branch</th>
                  <th className="px-4 py-3 text-center">Completed Rentals</th>
                  <th className="px-4 py-3 text-center">Loyalty Discount Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(reportData as typeof drivers).map(d => (
                  <tr key={d.id}>
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">{d.id}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{d.name}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{d.contactNumber}</td>
                    <td className="px-4 py-2.5 text-slate-600">{d.branch}</td>
                    <td className="px-4 py-2.5 text-center font-mono font-bold">{d.totalRentalsCount}</td>
                    <td className="px-4 py-2.5 text-center font-mono font-bold text-slate-800">
                      {d.currentLoyaltyPercent}%
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
