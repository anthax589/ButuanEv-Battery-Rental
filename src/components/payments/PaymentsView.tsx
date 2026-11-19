import React, { useState, useMemo } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Receipt, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  X,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { PaymentRecord, PaymentStatus, PaymentMethod } from '../../types';

export const PaymentsView: React.FC = () => {
  const { 
    payments, 
    rentals, 
    currentBranch, 
    recordPayment, 
    setActiveReceiptModal, 
    setActiveRentalDetailModal,
    exportReportToCSV
  } = useRental();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'All' | PaymentMethod>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');

  // Record payment modal for unpaid/partially paid rentals
  const [selectedRentalForPayment, setSelectedRentalForPayment] = useState<string>('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Unpaid or partially paid rentals eligible for balance recording
  const unpaidRentals = rentals.filter(r => r.remainingBalance > 0);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (currentBranch !== 'All' && p.branch !== currentBranch) return false;
      if (statusFilter !== 'All' && p.paymentStatus !== statusFilter) return false;
      if (methodFilter !== 'All' && p.paymentMethod !== methodFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          p.driverName.toLowerCase().includes(q) ||
          p.transactionId.toLowerCase().includes(q) ||
          p.voucherNumber.toLowerCase().includes(q) ||
          p.referenceNumber.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [payments, currentBranch, statusFilter, methodFilter, searchQuery]);

  // Aggregate sums
  const totalCollections = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalReceivables = rentals.reduce((sum, r) => sum + r.remainingBalance, 0);

  const handleOpenRecordPaymentModal = (rentalId?: string) => {
    if (rentalId) {
      setSelectedRentalForPayment(rentalId);
      const r = rentals.find(item => item.id === rentalId);
      if (r) setPayAmount(r.remainingBalance);
    } else if (unpaidRentals.length > 0) {
      setSelectedRentalForPayment(unpaidRentals[0].id);
      setPayAmount(unpaidRentals[0].remainingBalance);
    }
    setShowPaymentModal(true);
  };

  const handleRentalSelectionChange = (id: string) => {
    setSelectedRentalForPayment(id);
    const r = rentals.find(item => item.id === id);
    if (r) setPayAmount(r.remainingBalance);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRentalForPayment || payAmount <= 0) return;

    const res = recordPayment({
      transactionId: selectedRentalForPayment,
      amount: payAmount,
      paymentMethod: payMethod,
      referenceNumber: payRef || `${payMethod.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-5)}`,
      notes: payNotes || 'Balance settlement recorded via Finance desk'
    });

    if (res.success) {
      setShowPaymentModal(false);
      setPayAmount(0);
      setPayRef('');
      setPayNotes('');
    }
  };

  const handleExport = () => {
    exportReportToCSV('payments_ledger', filteredPayments.map(p => ({
      PaymentID: p.id,
      TransactionID: p.transactionId,
      VoucherNumber: p.voucherNumber,
      DriverName: p.driverName,
      RentalType: p.rentalType,
      AmountPaid: p.amountPaid,
      Balance: p.balance,
      PaymentMethod: p.paymentMethod,
      ReferenceNumber: p.referenceNumber,
      Collector: p.collector,
      PaymentStatus: p.paymentStatus,
      Date: p.paymentDate,
      Branch: p.branch
    })));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>Accounting & Ledger</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
            Rental Payments & Financial Collection
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Every transaction is linked directly to a rental contract, preventing duplicates and tracking balances.
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
          {unpaidRentals.length > 0 && (
            <button
              onClick={() => handleOpenRecordPaymentModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-400 text-[11px] block uppercase font-medium">Total Revenue Collected</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-900">
              ₱{totalCollections.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">{payments.length} Receipts</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-400 text-[11px] block uppercase font-medium">Outstanding Driver Receivables</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-800">
              ₱{totalReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-amber-700 font-semibold">{unpaidRentals.length} Pending</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-400 text-[11px] block uppercase font-medium">Payment Settlement Rate</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {rentals.length > 0 
                ? `${Math.round(((rentals.length - unpaidRentals.length) / rentals.length) * 100)}%` 
                : '100%'}
            </span>
            <span className="text-xs text-slate-500">Full Clearance</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Driver Name, Receipt ID, TRX ID, or Voucher Ref..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer font-medium"
          >
            <option value="All">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="GCash">GCash</option>
            <option value="Maya">Maya</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card">Card</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer font-medium"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Paid">Fully Paid</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No payment ledger entries found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="px-4 py-3">Receipt ID</th>
                  <th className="px-4 py-3">Transaction / Voucher</th>
                  <th className="px-4 py-3">Driver / Payor</th>
                  <th className="px-4 py-3">Rental Type</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Collector</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      {p.id}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className="text-slate-900 font-bold block">{p.voucherNumber}</span>
                      <span className="text-[10px] text-slate-400">{p.transactionId}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {p.driverName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {p.rentalType}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">
                      ₱{p.amountPaid.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      {p.balance > 0 ? (
                        <span className="text-amber-700">₱{p.balance.toFixed(2)}</span>
                      ) : (
                        <span className="text-emerald-700">₱0.00</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">{p.paymentMethod}</span>
                      <span className="block text-[10px] font-mono text-slate-400">{p.referenceNumber}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {p.paymentDate.split(' ')[0]}
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[120px]">
                      {p.collector.split(' ')[0]}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setActiveReceiptModal(p)}
                        title="Print Official Receipt"
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <span className="font-bold text-base font-display">Record Rental Payment Receipt</span>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 text-slate-300 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Rental Contract With Balance</label>
                <select
                  value={selectedRentalForPayment}
                  onChange={(e) => handleRentalSelectionChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                >
                  {unpaidRentals.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.voucherNumber} · {r.driverName} (Balance: ₱{r.remainingBalance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount to Collect (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                    <option value="Maya">Maya</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reference Number</label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="e.g. CSH-00129"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Remarks</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Final balance settlement on return."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Record & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
