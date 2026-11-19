import React from 'react';
import { useRental } from '../../context/RentalContext';
import { Printer, X, Receipt, CheckCircle, MapPin, Calendar, CreditCard } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { activeReceiptModal, setActiveReceiptModal } = useRental();

  if (!activeReceiptModal) return null;

  const payment = activeReceiptModal;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Top Action Bar */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-300" />
            <span className="font-semibold text-xs">Official Payment Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={() => setActiveReceiptModal(null)}
              className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="print-card p-6 bg-white text-slate-900 space-y-5">
          <div className="text-center border-b border-slate-200 pb-4">
            <h2 className="text-xl font-black text-slate-950 font-display">BXUEV PHILIPPINES</h2>
            <p className="text-xs text-slate-500">Clean Energy Mobility & Swapping Operations</p>
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {payment.branch}
            </p>
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Payment Confirmed</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Receipt No:</span>
              <span className="font-mono font-bold text-slate-800">{payment.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="font-mono text-slate-700">{payment.transactionId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Voucher Reference:</span>
              <span className="font-mono font-medium text-emerald-700">{payment.voucherNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Date & Time:</span>
              <span className="font-mono text-slate-700">{payment.paymentDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Driver / Payor:</span>
              <span className="font-semibold text-slate-900">{payment.driverName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-medium text-slate-800">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Payment Reference:</span>
              <span className="font-mono text-slate-700">{payment.referenceNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Received By:</span>
              <span className="text-slate-700">{payment.collector}</span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Rental Amount:</span>
              <span className="font-mono">₱{payment.amountDue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-emerald-800 pt-1 border-t border-slate-200">
              <span>Amount Paid:</span>
              <span className="font-mono text-base">₱{payment.amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Remaining Balance:</span>
              <span className="font-mono font-semibold text-slate-900">
                ₱{payment.balance.toFixed(2)}
              </span>
            </div>
          </div>

          {payment.notes && (
            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded">
              Note: {payment.notes}
            </p>
          )}

          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            Thank you for powering with BXUEV. Keep this receipt for records.
          </div>
        </div>

        {/* Footer */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end">
          <button
            onClick={() => setActiveReceiptModal(null)}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
