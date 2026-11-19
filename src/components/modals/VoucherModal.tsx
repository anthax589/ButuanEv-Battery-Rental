import React from 'react';
import { useRental } from '../../context/RentalContext';
import { Printer, X, CheckCircle2, Battery, Car, MapPin, Calendar, Clock, User, ShieldCheck } from 'lucide-react';

export const VoucherModal: React.FC = () => {
  const { activeVoucherModal, setActiveVoucherModal, setCurrentTab } = useRental();

  if (!activeVoucherModal) return null;

  const rental = activeVoucherModal;

  const handlePrint = () => {
    window.print();
  };

  const handleProceedToRelease = () => {
    setActiveVoucherModal(null);
    setCurrentTab('battery-release');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Top Action Bar (hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <span className="font-semibold text-sm">Official Rental Voucher Generated</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Voucher</span>
            </button>
            <button
              onClick={() => setActiveVoucherModal(null)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div className="print-card p-6 md:p-8 bg-white text-slate-900 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-950 font-display">BXUEV</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">RENTAL PASS</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Smart Battery Swapping & Clean EV Fleet Operations</p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {rental.branch}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Voucher Number</span>
              <span className="text-xl font-bold font-mono text-emerald-700 tracking-wider block">{rental.voucherNumber}</span>
              <span className="text-xs font-mono text-slate-500 block mt-1">TRX ID: {rental.id}</span>
            </div>
          </div>

          {/* Barcode Simulation */}
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-3 text-center">
            <div className="flex justify-center items-center gap-1 h-8 opacity-80 mb-1">
              {Array.from({ length: 48 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`bg-slate-900 h-full ${i % 3 === 0 ? 'w-1.5' : i % 2 === 0 ? 'w-0.5' : 'w-1'}`} 
                />
              ))}
            </div>
            <span className="text-[11px] font-mono tracking-widest text-slate-600 uppercase">
              *{rental.voucherNumber}*
            </span>
          </div>

          {/* Driver & Assignment Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-1.5">
              <div className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Driver Details</div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-500" />
                {rental.driverName}
              </div>
              <div className="text-slate-600 font-mono">Contact: {rental.driverPhone}</div>
              <div className="text-slate-500">Driver ID: {rental.driverId}</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-1.5">
              <div className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Rental Schedule</div>
              <div className="text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Issue: {rental.rentalDate}</span>
              </div>
              <div className="text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Return Due: {rental.expectedReturnDate}</span>
              </div>
              <div className="text-emerald-700 font-medium">Type: {rental.rentalType} Rental</div>
            </div>
          </div>

          {/* Reserved Inventory Item(s) */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
              Reserved Equipment For Release
            </div>
            <div className="p-4 space-y-3 divide-y divide-slate-100">
              {rental.batteryCode && (
                <div className="flex items-center justify-between text-xs pt-1 first:pt-0">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-800 font-mono">{rental.batteryCode}</span>
                      <span className="text-slate-500 ml-2">({rental.batteryType})</span>
                    </div>
                  </div>
                  <span className="font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-medium">
                    Verified Healthy
                  </span>
                </div>
              )}
              {rental.unitCode && (
                <div className="flex items-center justify-between text-xs pt-3 first:pt-0">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-bold text-slate-800 font-mono">{rental.unitCode}</span>
                      <span className="text-slate-500 ml-2">({rental.unitType} - {rental.unitModel})</span>
                    </div>
                  </div>
                  <span className="font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium">
                    Inspected
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Status Summary */}
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs">
            <div>
              <span className="text-emerald-900 font-semibold block">
                Payment Status: {rental.paymentStatus.toUpperCase()}
              </span>
              <span className="text-emerald-700 text-[11px]">
                Paid ₱{rental.amountPaid.toFixed(2)} via {rental.paymentMethod || 'Cash'} (Ref: {rental.paymentReference || 'N/A'})
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-emerald-800 block">Remaining Due</span>
              <span className="text-sm font-bold font-mono text-emerald-950">
                ₱{rental.remainingBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Officer Verification Lines for Sign-off */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
            <div className="space-y-6">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Releasing Officer Verification</span>
                <div className="h-9 border-b border-slate-300 mt-1 flex items-end">
                  <span className="text-[11px] font-mono text-slate-600">Starting SOC: [ _____ % ]</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Signature & Date</span>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Driver Acknowledgment</span>
                <div className="h-9 border-b border-slate-300 mt-1 flex items-end">
                  <span className="text-[11px] text-slate-500 italic">Received in good operating order</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">{rental.driverName} Signature</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
            <strong>Important:</strong> Present this voucher to the Releasing Officer at {rental.branch}. Ensure battery is returned with at least 15-20% SOC to maintain good driver loyalty discount standing.
          </div>
        </div>

        {/* Footer Actions (hidden on print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setActiveVoucherModal(null)}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleProceedToRelease}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Go to Battery Release Desk</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
