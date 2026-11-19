import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { X, Battery, Car, Calendar, User, Clock, CheckCircle2, AlertTriangle, Printer, CreditCard, ShieldAlert } from 'lucide-react';
import { PaymentMethod } from '../../types';

export const RentalDetailModal: React.FC = () => {
  const { 
    activeRentalDetailModal, 
    setActiveRentalDetailModal, 
    setActiveVoucherModal, 
    recordPayment, 
    flagRentalIssue,
    setCurrentTab
  } = useRental();

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');
  const [payRef, setPayRef] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [showFlagInput, setShowFlagInput] = useState(false);

  if (!activeRentalDetailModal) return null;

  const rental = activeRentalDetailModal;

  const handleSettlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    const res = recordPayment({
      transactionId: rental.id,
      amount,
      paymentMethod: payMethod,
      referenceNumber: payRef || `PAY-BAL-${Date.now().toString().slice(-4)}`,
      notes: 'Balance settlement from Rental Detail screen'
    });

    if (res.success) {
      setShowPaymentForm(false);
      setPayAmount('');
      setActiveRentalDetailModal(null);
    }
  };

  const handleFlagIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagReason.trim()) return;
    flagRentalIssue(rental.id, flagReason.trim());
    setShowFlagInput(false);
    setActiveRentalDetailModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base font-display">Rental Details: {rental.id}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  rental.status === 'Active' ? 'bg-blue-500 text-white' :
                  rental.status === 'Reserved' ? 'bg-amber-500 text-white' :
                  rental.status === 'Completed' ? 'bg-emerald-500 text-white' :
                  'bg-slate-600 text-white'
                }`}>
                  {rental.status}
                </span>
              </div>
            <p className="text-xs text-cyan-200 mt-0.5">Voucher: <span className="font-mono text-emerald-300 font-semibold">{rental.voucherNumber}</span> · {rental.branch}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveRentalDetailModal(null);
                setActiveVoucherModal(rental);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Voucher</span>
            </button>
            <button
              onClick={() => setActiveRentalDetailModal(null)}
            className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Flag Alert if any */}
          {rental.flaggedIssue?.isFlagged && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-red-900 block">Operational Issue Flagged</span>
                <p className="text-red-700 mt-0.5">{rental.flaggedIssue.reason}</p>
                <span className="text-[11px] text-red-500 mt-1 block">
                  Reported by {rental.flaggedIssue.flaggedBy} on {rental.flaggedIssue.flaggedAt}
                </span>
              </div>
            </div>
          )}

          {/* Driver & Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Driver Details</span>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                {rental.driverName}
              </div>
              <div className="text-slate-600 font-mono">Contact: {rental.driverPhone}</div>
              <div className="text-slate-500">ID: {rental.driverId}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Timeline</span>
              <div className="text-slate-700 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Created: {rental.rentalDate}</span>
              </div>
              <div className="text-slate-700 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Expected Return: {rental.expectedReturnDate}</span>
              </div>
              {rental.actualReturnDate && (
                <div className="text-emerald-700 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Returned: {rental.actualReturnDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Equipment */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <div className="bg-slate-100 px-4 py-2 font-semibold text-slate-700">
              Assigned Equipment & SOC Metrics
            </div>
            <div className="p-4 space-y-3 divide-y divide-slate-100">
              {rental.batteryCode ? (
                <div className="flex items-center justify-between pt-2 first:pt-0">
                  <div className="flex items-center gap-3">
                    <Battery className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-900 font-mono text-sm">{rental.batteryCode}</div>
                      <div className="text-slate-500 text-[11px]">{rental.batteryType}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-600 font-mono">
                      Starting SOC: <span className="font-bold text-slate-900">{rental.startingSoc !== undefined ? `${rental.startingSoc}%` : 'Pending Release'}</span>
                    </div>
                    {rental.endingSoc !== undefined && (
                      <div className="text-emerald-700 font-mono text-[11px]">
                        Ending SOC: <span className="font-bold">{rental.endingSoc}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {rental.unitCode ? (
                <div className="flex items-center justify-between pt-3 first:pt-0">
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-bold text-slate-900 font-mono text-sm">{rental.unitCode}</div>
                      <div className="text-slate-500 text-[11px]">{rental.unitType} - {rental.unitModel}</div>
                    </div>
                  </div>
                  <div className="text-right text-slate-600">
                    Condition: <span className="font-medium text-slate-800">{rental.returnCondition || 'Nominal'}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Staff Record */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Releasing Officer</span>
              <span className="text-slate-800 font-medium">{rental.releaseOfficer || 'Awaiting physical release'}</span>
              {rental.releaseDateTime && <span className="text-[11px] text-slate-500 block font-mono">{rental.releaseDateTime}</span>}
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Return Receiving Officer</span>
              <span className="text-slate-800 font-medium">{rental.returnOfficer || 'Not yet returned'}</span>
              {rental.returnDateTime && <span className="text-[11px] text-slate-500 block font-mono">{rental.returnDateTime}</span>}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Base Rental Fee:</span>
              <span className="font-mono">₱{rental.baseRentalFee.toFixed(2)}</span>
            </div>
            {rental.loyaltyDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Driver Loyalty Discount:</span>
                <span className="font-mono">-₱{rental.loyaltyDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-100">
              <span>Total Amount Due:</span>
              <span className="font-mono">₱{rental.totalAmountDue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Amount Paid:</span>
              <span className="font-mono">₱{rental.amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-900 pt-1 border-t border-slate-100 font-bold">
              <span>Remaining Balance:</span>
              <span className={`font-mono text-sm ${rental.remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                ₱{rental.remainingBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Settlement Form if balance remains */}
          {rental.remainingBalance > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-amber-900">Outstanding Balance: ₱{rental.remainingBalance.toFixed(2)}</h4>
                  <p className="text-[11px] text-amber-700">Driver has an unpaid rental balance.</p>
                </div>
                {!showPaymentForm && (
                  <button
                    onClick={() => {
                      setShowPaymentForm(true);
                      setPayAmount(String(rental.remainingBalance));
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Record Payment</span>
                  </button>
                )}
              </div>

              {showPaymentForm && (
                <form onSubmit={handleSettlePayment} className="pt-2 border-t border-amber-200 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Amount to Pay (₱)</label>
                      <input
                        type="number"
                        step="0.01"
                        max={rental.remainingBalance}
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="Cash">Cash</option>
                        <option value="GCash">GCash</option>
                        <option value="Maya">Maya</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Reference No.</label>
                      <input
                        type="text"
                        placeholder="e.g. CSH-99214"
                        value={payRef}
                        onChange={(e) => setPayRef(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer"
                    >
                      Confirm Payment Receipt
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Flag Issue Drawer */}
          {showFlagInput && (
            <form onSubmit={handleFlagIssue} className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-3 text-xs">
              <label className="font-bold text-red-900 block">Describe Operational or Technical Issue:</label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                rows={2}
                placeholder="e.g., Driver reported unusual heat from battery port; battery latch sticking; overdue follow-up."
                required
                className="w-full px-3 py-2 border border-red-300 rounded-lg bg-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFlagInput(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer"
                >
                  Submit Flag
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!rental.flaggedIssue?.isFlagged && !showFlagInput && (
              <button
                onClick={() => setShowFlagInput(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Flag Issue</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {rental.status === 'Reserved' && (
              <button
                onClick={() => {
                  setActiveRentalDetailModal(null);
                  setCurrentTab('battery-release');
                }}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer"
              >
                Go to Release Desk
              </button>
            )}
            {rental.status === 'Active' && (
              <button
                onClick={() => {
                  setActiveRentalDetailModal(null);
                  setCurrentTab('battery-return');
                }}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer"
              >
                Process Return
              </button>
            )}
            <button
              onClick={() => setActiveRentalDetailModal(null)}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
