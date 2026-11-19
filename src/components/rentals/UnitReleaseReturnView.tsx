import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Car, 
  Bike, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  User, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { UnitCondition, RentalTransaction } from '../../types';

export const UnitReleaseReturnView: React.FC = () => {
  const { rentals, units, releaseUnit, returnUnit, currentUser, setCurrentTab, setActiveRentalDetailModal } = useRental();

  const [mode, setMode] = useState<'release' | 'return'>('release');

  // Release state
  const [releaseVoucherInput, setReleaseVoucherInput] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [releaseSuccess, setReleaseSuccess] = useState<RentalTransaction | null>(null);

  // Return state
  const [returnUnitInput, setReturnUnitInput] = useState('');
  const [returnCondition, setReturnCondition] = useState<UnitCondition>('Good');
  const [returnDamageNotes, setReturnDamageNotes] = useState('');
  const [returnRemarks, setReturnRemarks] = useState('');
  const [returnError, setReturnError] = useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = useState<RentalTransaction | null>(null);

  // Pending unit releases
  const pendingUnitReleases = rentals.filter(r => r.status === 'Reserved' && r.unitId);

  // Active unit rentals
  const activeUnitRentals = rentals.filter(r => r.status === 'Active' && r.unitId);

  // Matched unit for return
  const matchedReturnUnit = units.find(u => {
    const val = returnUnitInput.trim().toUpperCase();
    return val && (u.code.toUpperCase() === val || u.id.toUpperCase() === val);
  });

  const matchedReturnRental = matchedReturnUnit
    ? rentals.find(r => r.unitId === matchedReturnUnit.id && r.status === 'Active')
    : undefined;

  // Matched rental for release
  const matchedReleaseRental = rentals.find(r => {
    const val = releaseVoucherInput.trim().toUpperCase();
    return val && (r.voucherNumber.toUpperCase() === val || r.id.toUpperCase() === val) && r.unitId;
  });

  const handleConfirmUnitRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseVoucherInput.trim()) {
      setReleaseError('Please enter or scan a voucher number.');
      return;
    }
    const res = releaseUnit({
      voucherNumber: releaseVoucherInput.trim(),
      conditionNotes: releaseNotes
    });
    if (res.success && res.rental) {
      setReleaseSuccess(res.rental);
      setReleaseError(null);
      setReleaseVoucherInput('');
      setReleaseNotes('');
    } else {
      setReleaseError(res.error || 'Failed to release EV unit.');
    }
  };

  const handleConfirmUnitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnUnitInput.trim()) {
      setReturnError('Please enter or scan an EV unit code.');
      return;
    }
    const res = returnUnit({
      unitCode: returnUnitInput.trim(),
      condition: returnCondition,
      damageReport: returnDamageNotes || undefined,
      remarks: returnRemarks || undefined
    });
    if (res.success && res.rental) {
      setReturnSuccess(res.rental);
      setReturnError(null);
      setReturnUnitInput('');
      setReturnDamageNotes('');
      setReturnRemarks('');
    } else {
      setReturnError(res.error || 'Failed to return EV unit.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Segmented Mode Control */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => {
            setMode('release');
            setReleaseSuccess(null);
            setReturnSuccess(null);
          }}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mode === 'release' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          <span>EV Unit Release ({pendingUnitReleases.length} Pending)</span>
        </button>
        <button
          onClick={() => {
            setMode('return');
            setReleaseSuccess(null);
            setReturnSuccess(null);
          }}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mode === 'return' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-blue-600" />
          <span>EV Unit Return ({activeUnitRentals.length} Active in Field)</span>
        </button>
      </div>

      {/* RELEASE MODE */}
      {mode === 'release' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 font-display">EV Vehicle Release Desk</h3>
            <p className="text-xs text-slate-500 mt-1">
              Verify driver identity, inspect physical unit body and brakes, and confirm departure handover.
            </p>

            <div className="mt-5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Enter or Scan Voucher Number
              </label>
              <div className="relative">
                <Scan className="w-5 h-5 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={releaseVoucherInput}
                  onChange={(e) => {
                    setReleaseVoucherInput(e.target.value);
                    setReleaseError(null);
                    setReleaseSuccess(null);
                  }}
                  placeholder="e.g. VCH-90412..."
                  className="w-full pl-12 pr-4 py-3 text-sm font-mono font-bold tracking-wider bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
            </div>

            {pendingUnitReleases.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Pending Unit Handover:
                </span>
                <div className="flex flex-wrap gap-2">
                  {pendingUnitReleases.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setReleaseVoucherInput(r.voucherNumber)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                    >
                      {r.voucherNumber} · {r.unitCode} ({r.driverName.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {releaseSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <h4 className="font-bold text-slate-900 text-sm">EV Unit Handover Authorized!</h4>
                <p className="text-emerald-800 mt-0.5">
                  Unit <strong>{releaseSuccess.unitCode}</strong> ({releaseSuccess.unitType}) has been officially released to <strong>{releaseSuccess.driverName}</strong>.
                </p>
              </div>
            </div>
          )}

          {releaseError && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-xs text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{releaseError}</span>
            </div>
          )}

          {matchedReleaseRental && !releaseSuccess && (
            <form onSubmit={handleConfirmUnitRelease} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 text-xs shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-medium block">Driver</span>
                  <span className="font-bold text-slate-900 text-sm block mt-1">{matchedReleaseRental.driverName}</span>
                  <span className="text-slate-600 font-mono">{matchedReleaseRental.driverPhone}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-medium block">EV Vehicle</span>
                  <span className="font-bold font-mono text-slate-900 text-sm block mt-1">{matchedReleaseRental.unitCode}</span>
                  <span className="text-slate-600">{matchedReleaseRental.unitType} - {matchedReleaseRental.unitModel}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-medium block">Payment Status</span>
                  <span className="font-bold text-emerald-700 text-sm block mt-1">{matchedReleaseRental.paymentStatus}</span>
                  <span className="text-slate-500">Paid: ₱{matchedReleaseRental.amountPaid.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pre-departure Inspection Notes</label>
                <input
                  type="text"
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="e.g. Tires inspected, brakes tested, side mirrors adjusted, helmet provided."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Confirm Unit Release
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* RETURN MODE */}
      {mode === 'return' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 font-display">EV Vehicle Return Desk</h3>
            <p className="text-xs text-slate-500 mt-1">
              Scan unit code, perform post-trip inspection, check for cosmetic or mechanical damages, and close rental.
            </p>

            <div className="mt-5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Scan or Enter EV Unit Code
              </label>
              <div className="relative">
                <Scan className="w-5 h-5 text-blue-600 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={returnUnitInput}
                  onChange={(e) => {
                    setReturnUnitInput(e.target.value);
                    setReturnError(null);
                    setReturnSuccess(null);
                  }}
                  placeholder="e.g. BX-EB-101 or BX-CARGO-301..."
                  className="w-full pl-12 pr-4 py-3 text-sm font-mono font-bold tracking-wider bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
            </div>

            {activeUnitRentals.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Units in Field:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeUnitRentals.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setReturnUnitInput(r.unitCode || '')}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                    >
                      {r.unitCode} ({r.driverName.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {returnSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <h4 className="font-bold text-slate-900 text-sm">EV Unit Return Completed!</h4>
                <p className="text-emerald-800 mt-0.5">
                  Unit <strong>{returnSuccess.unitCode}</strong> returned by <strong>{returnSuccess.driverName}</strong>. Condition recorded as <strong>{returnSuccess.returnCondition}</strong>.
                </p>
              </div>
            </div>
          )}

          {returnError && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-xs text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{returnError}</span>
            </div>
          )}

          {matchedReturnRental && !returnSuccess && (
            <form onSubmit={handleConfirmUnitReturn} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 text-xs shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-medium block">Driver</span>
                  <span className="font-bold text-slate-900 text-sm block mt-1">{matchedReturnRental.driverName}</span>
                  <span className="text-slate-600 font-mono">{matchedReturnRental.driverPhone}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-medium block">EV Vehicle</span>
                  <span className="font-bold font-mono text-slate-900 text-sm block mt-1">{matchedReturnRental.unitCode}</span>
                  <span className="text-slate-600">{matchedReturnRental.unitType} - {matchedReturnRental.unitModel}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-medium block">Contract ID</span>
                  <span className="font-bold text-slate-900 text-sm block mt-1 font-mono">{matchedReturnRental.id}</span>
                  <span className="text-slate-500">Released by: {matchedReturnRental.releaseOfficer || 'Staff'}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-900 font-semibold mb-2">Inspect Unit Condition</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'Excellent', label: 'Excellent (Clean)' },
                    { value: 'Good', label: 'Good (Nominal)' },
                    { value: 'Fair', label: 'Fair (Minor Wear)' },
                    { value: 'Maintenance Required', label: 'Maintenance Required' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setReturnCondition(opt.value as UnitCondition)}
                      className={`p-2.5 rounded-lg border-2 text-center font-medium cursor-pointer ${
                        returnCondition === opt.value
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {returnCondition === 'Maintenance Required' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg space-y-1">
                  <label className="font-bold text-amber-900 block">Damage or Maintenance Details</label>
                  <textarea
                    value={returnDamageNotes}
                    onChange={(e) => setReturnDamageNotes(e.target.value)}
                    rows={2}
                    placeholder="Specify brake wear, chain loose, tire puncture, or motor noise..."
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Return Remarks</label>
                <input
                  type="text"
                  value={returnRemarks}
                  onChange={(e) => setReturnRemarks(e.target.value)}
                  placeholder="e.g. Unit returned safely, washed and parked in Bay 2."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Confirm Unit Return
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
