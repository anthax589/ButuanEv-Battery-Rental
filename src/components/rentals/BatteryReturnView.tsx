import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Scan, 
  ArrowDownLeft, 
  CheckCircle2, 
  AlertCircle, 
  Battery, 
  Award, 
  AlertTriangle, 
  Clock, 
  User, 
  Sparkles,
  CreditCard
} from 'lucide-react';
import { BatteryCondition, RentalTransaction } from '../../types';

export const BatteryReturnView: React.FC = () => {
  const { rentals, batteries, returnBattery, currentUser, setCurrentTab, setActiveRentalDetailModal } = useRental();

  const [batteryInput, setBatteryInput] = useState('');
  const [endingSoc, setEndingSoc] = useState<number>(35);
  const [condition, setCondition] = useState<BatteryCondition>('Good');
  const [damageReport, setDamageReport] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedResult, setCompletedResult] = useState<{
    rental: RentalTransaction;
    loyaltyGained?: number;
  } | null>(null);

  // List of batteries currently in field
  const rentedBatteries = batteries.filter(b => b.status === 'Rented');

  // Currently matched battery and active rental
  const matchedBattery = batteries.find(b => {
    const val = batteryInput.trim().toUpperCase();
    return val && (b.code.toUpperCase() === val || b.id.toUpperCase() === val);
  });

  const activeRental = matchedBattery ? rentals.find(r => r.batteryId === matchedBattery.id && r.status === 'Active') : undefined;

  const handleSelectRented = (code: string) => {
    setBatteryInput(code);
    setErrorMessage(null);
    setCompletedResult(null);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batteryInput.trim()) {
      setErrorMessage('Please enter or scan a battery code.');
      return;
    }
    if (endingSoc < 0 || endingSoc > 100) {
      setErrorMessage('Ending SOC must be between 0% and 100%.');
      return;
    }
    if (condition === 'Damaged' && !damageReport.trim()) {
      setErrorMessage('Please document damage details before confirming return of a damaged battery.');
      return;
    }

    const res = returnBattery({
      batteryCode: batteryInput.trim(),
      endingSoc,
      condition,
      damageReport: damageReport.trim() || undefined,
      remarks: remarks.trim() || undefined
    });

    if (res.success && res.rental) {
      setCompletedResult({
        rental: res.rental,
        loyaltyGained: res.loyaltyGained
      });
      setErrorMessage(null);
      setBatteryInput('');
      setDamageReport('');
      setRemarks('');
    } else {
      setErrorMessage(res.error || 'Failed to complete battery return.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <ArrowDownLeft className="w-4 h-4" />
          <span>Battery Return Desk</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
          Receive & Inspect Returned Battery
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Scan battery code, check ending SOC level, inspect physical condition, and calculate driver loyalty points.
        </p>

        {/* Scan Input */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Scan or Enter Battery Code
          </label>
          <div className="relative">
            <Scan className="w-5 h-5 text-blue-600 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={batteryInput}
              onChange={(e) => {
                setBatteryInput(e.target.value);
                setErrorMessage(null);
                setCompletedResult(null);
              }}
              placeholder="e.g. BX-BAT-001 or scan battery QR/barcode..."
              className="w-full pl-12 pr-4 py-3 text-sm font-mono font-bold tracking-wider bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal"
              autoFocus
            />
          </div>
        </div>

        {/* Active Rented Batteries Quick Buttons */}
        {rentedBatteries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Currently Rented in Field ({rentedBatteries.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {rentedBatteries.map(b => (
                <button
                  key={b.id}
                  onClick={() => handleSelectRented(b.code)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                    batteryInput.toUpperCase() === b.code.toUpperCase()
                      ? 'bg-blue-600 text-white border-blue-600 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Battery className="w-3.5 h-3.5 text-blue-500" />
                  <span>{b.code} ({b.currentDriverName?.split(' ')[0] || 'Driver'})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Completion Banner */}
      {completedResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-slate-900 text-sm font-display">Battery Return Processed Successfully!</h4>
            <p className="text-emerald-800 mt-1">
              Battery has been returned by <strong>{completedResult.rental.driverName}</strong>. 
              Ending SOC: <strong className="font-mono">{completedResult.rental.endingSoc}%</strong>.
            </p>
            {completedResult.loyaltyGained !== undefined && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Loyalty Reward: +{completedResult.loyaltyGained}% applied to driver account</span>
              </div>
            )}
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => setActiveRentalDetailModal(completedResult.rental)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold cursor-pointer"
              >
                View Completed Transaction
              </button>
              <button
                onClick={() => setCurrentTab('active-rentals')}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-medium cursor-pointer"
              >
                Return to Active Monitoring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-xs text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Matched Active Rental Card */}
      {activeRental && !completedResult && (
        <form onSubmit={handleConfirmReturn} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-cyan-200 font-mono font-semibold block uppercase">
                Active Rental Found · {activeRental.id}
              </span>
              <h3 className="text-lg font-bold font-display mt-0.5">Return Inspection Form</h3>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-600 text-white">
              Voucher: {activeRental.voucherNumber}
            </span>
          </div>

          <div className="p-6 space-y-6 text-xs">
            {/* Automatic Details Retrieved */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">Driver</span>
                <span className="font-bold text-slate-900 text-sm block">{activeRental.driverName}</span>
                <span className="text-slate-600 font-mono">{activeRental.driverPhone}</span>
                <span className="text-slate-500 block text-[11px]">ID: {activeRental.driverId}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">Battery Unit</span>
                <div className="flex items-center gap-2">
                  <Battery className="w-5 h-5 text-blue-600" />
                  <span className="font-mono font-bold text-slate-900 text-base">{activeRental.batteryCode}</span>
                </div>
                <span className="text-slate-500 block">{activeRental.batteryType}</span>
                <span className="text-slate-700 font-mono text-[11px]">
                  Starting SOC: <strong>{activeRental.startingSoc}%</strong>
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">Rental Timeline</span>
                <span className="text-slate-700 font-mono block">Out: {activeRental.releaseDateTime || activeRental.rentalDate}</span>
                <span className="text-slate-500 block text-[11px]">Released by: {activeRental.releaseOfficer || 'Officer'}</span>
                <span className={`font-semibold block mt-1 ${activeRental.remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  Balance: ₱{activeRental.remainingBalance.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Step 1: Ending SOC */}
            <div className="bg-blue-50/60 border border-blue-200 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-display">1. Ending State of Charge (%)</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Record battery charge level upon receipt. Batteries returned &ge; 25% receive driver bonus loyalty credit.
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold font-mono ${endingSoc < 5 ? 'text-red-600' : endingSoc >= 25 ? 'text-emerald-800' : 'text-amber-700'}`}>
                    {endingSoc}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={endingSoc}
                  onChange={(e) => setEndingSoc(Number(e.target.value))}
                  className="flex-1 accent-blue-600 cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={endingSoc}
                  onChange={(e) => setEndingSoc(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 text-center font-mono font-bold border border-blue-300 rounded-lg bg-white text-xs"
                />
              </div>

              <div className="flex gap-2 pt-1">
                {[50, 35, 25, 15, 4].map(socVal => (
                  <button
                    key={socVal}
                    type="button"
                    onClick={() => setEndingSoc(socVal)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border cursor-pointer ${
                      endingSoc === socVal 
                        ? 'bg-blue-700 text-white border-blue-700' 
                        : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {socVal}% {socVal < 5 ? '(Critical)' : socVal >= 25 ? '(Bonus)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Battery Condition */}
            <div className="space-y-3">
              <label className="block text-slate-900 font-semibold text-xs">2. Physical Battery Condition</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'Good', label: 'Good (Nominal)', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                  { value: 'Fair', label: 'Fair (Minor Wear)', color: 'border-blue-500 bg-blue-50 text-blue-900' },
                  { value: 'Needs Inspection', label: 'Needs Inspection', color: 'border-amber-500 bg-amber-50 text-amber-900' },
                  { value: 'Damaged', label: 'Damaged (Quarantine)', color: 'border-red-500 bg-red-50 text-red-900' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCondition(opt.value as BatteryCondition)}
                    className={`p-3 rounded-lg border-2 text-xs font-semibold text-center transition-all cursor-pointer ${
                      condition === opt.value
                        ? `${opt.color} ring-1 ring-current`
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Damage info if damaged */}
            {condition === 'Damaged' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
                <label className="font-bold text-red-900 text-xs block">
                  3. Damage Information (Required for Damaged Classification)
                </label>
                <textarea
                  value={damageReport}
                  onChange={(e) => setDamageReport(e.target.value)}
                  rows={2}
                  placeholder="Detail casing crack, terminal scorch, water intrusion, or latch failure..."
                  required
                  className="w-full px-3 py-2 border border-red-300 rounded-lg text-xs bg-white"
                />
                <span className="text-[11px] text-red-600">
                  Note: Damaged batteries will be automatically marked as "Damaged" and quarantined from the available rental pool.
                </span>
              </div>
            )}

            {/* Step 4: General Remarks */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">4. Officer Return Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Normal return; terminal clean; sent to Charging Dock 4."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Receiving officer: <strong>{currentUser}</strong>
              </span>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setBatteryInput('')}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Clear
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Battery Return & Award Loyalty</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
