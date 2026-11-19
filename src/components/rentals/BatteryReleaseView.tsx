import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Scan, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Battery, 
  User, 
  Calendar, 
  ShieldCheck, 
  Search, 
  Clock,
  Sparkles
} from 'lucide-react';
import { RentalTransaction } from '../../types';

export const BatteryReleaseView: React.FC = () => {
  const { rentals, batteries, releaseBattery, currentUser, setCurrentTab, setActiveRentalDetailModal } = useRental();

  const [voucherInput, setVoucherInput] = useState('');
  const [startingSoc, setStartingSoc] = useState<number>(100);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successRental, setSuccessRental] = useState<RentalTransaction | null>(null);

  // Pending reservations awaiting release
  const pendingReservations = rentals.filter(r => r.status === 'Reserved' && (r.rentalType === 'Battery' || r.rentalType === 'Combined'));

  // Currently matched rental
  const matchedRental = rentals.find(r => {
    const val = voucherInput.trim().toUpperCase();
    return val && (r.voucherNumber.toUpperCase() === val || r.id.toUpperCase() === val);
  });

  const matchedBattery = matchedRental?.batteryId ? batteries.find(b => b.id === matchedRental.batteryId) : undefined;

  // Auto-sync starting SOC from the selected battery's current recorded SOC
  React.useEffect(() => {
    if (matchedBattery && matchedBattery.soc) {
      setStartingSoc(matchedBattery.soc);
    }
  }, [matchedBattery]);

  const handleSelectPending = (voucher: string) => {
    setVoucherInput(voucher);
    setErrorMessage(null);
    setSuccessRental(null);
  };

  const handleConfirmRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) {
      setErrorMessage('Please enter or scan a voucher number.');
      return;
    }
    if (startingSoc < 0 || startingSoc > 100) {
      setErrorMessage('Starting SOC must be between 0% and 100%.');
      return;
    }

    const res = releaseBattery({
      voucherNumber: voucherInput.trim(),
      startingSoc,
      notes: releaseNotes
    });

    if (res.success && res.rental) {
      setSuccessRental(res.rental);
      setErrorMessage(null);
      setVoucherInput('');
      setReleaseNotes('');
    } else {
      setErrorMessage(res.error || 'Failed to release battery.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          <ArrowUpRight className="w-4 h-4" />
          <span>Battery Release Desk</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
          Scan & Authorize Physical Battery Release
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Verify driver identity, physically inspect battery pack, record the starting SOC percentage, and confirm handover.
        </p>

        {/* Large Scan / Search Input */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Enter or Scan Voucher Number
          </label>
          <div className="relative">
            <Scan className="w-5 h-5 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={voucherInput}
              onChange={(e) => {
                setVoucherInput(e.target.value);
                setErrorMessage(null);
                setSuccessRental(null);
              }}
              placeholder="e.g. VCH-90412 or scan barcode with USB scanner..."
              className="w-full pl-12 pr-4 py-3 text-sm font-mono font-bold tracking-wider bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal"
              autoFocus
            />
          </div>
        </div>

        {/* Pending Queue Shortcut */}
        {pendingReservations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Pending Pickups Queue ({pendingReservations.length} Awaiting Release):
            </span>
            <div className="flex flex-wrap gap-2">
              {pendingReservations.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleSelectPending(r.voucherNumber)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                    voucherInput.toUpperCase() === r.voucherNumber.toUpperCase()
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{r.voucherNumber} ({r.driverName.split(' ')[0]})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {successRental && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-slate-900 text-sm font-display">Battery Release Confirmed!</h4>
            <p className="text-emerald-800 mt-1">
              Battery <strong className="font-mono">{successRental.batteryCode}</strong> has been released to <strong>{successRental.driverName}</strong> with verified starting SOC of <strong>{successRental.startingSoc}%</strong>.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => setActiveRentalDetailModal(successRental)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold cursor-pointer"
              >
                View Updated Rental Record
              </button>
              <button
                onClick={() => setCurrentTab('active-rentals')}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-medium cursor-pointer"
              >
                Go to Active Rentals Monitor
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

      {/* Verification Card when Voucher is Matched */}
      {matchedRental && !successRental && (
        <form onSubmit={handleConfirmRelease} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-300 font-mono font-semibold block uppercase">
                Voucher Verified · {matchedRental.voucherNumber}
              </span>
              <h3 className="text-lg font-bold font-display mt-0.5">Release Authorization Summary</h3>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
              matchedRental.status === 'Reserved' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-white'
            }`}>
              Status: {matchedRental.status}
            </span>
          </div>

          <div className="p-6 space-y-6 text-xs">
            {/* Driver & Assignment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">Authorized Driver</span>
                <span className="font-bold text-slate-900 text-sm block">{matchedRental.driverName}</span>
                <span className="text-slate-600 font-mono">{matchedRental.driverPhone}</span>
                <span className="text-slate-500 block text-[11px]">ID: {matchedRental.driverId}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">Assigned Battery Pack</span>
                <div className="flex items-center gap-2">
                  <Battery className="w-5 h-5 text-emerald-600" />
                  <span className="font-mono font-bold text-slate-900 text-base">{matchedRental.batteryCode || 'N/A'}</span>
                </div>
                <span className="text-slate-500 block">{matchedRental.batteryType}</span>
                <span className="text-[11px] text-emerald-700 font-medium">Located: {matchedRental.branch}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">Financial Clearance</span>
                <span className={`font-semibold block ${matchedRental.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {matchedRental.paymentStatus.toUpperCase()}
                </span>
                <span className="text-slate-600 font-mono">Paid: ₱{matchedRental.amountPaid.toFixed(2)}</span>
                <span className="text-slate-500 block text-[11px]">Due: ₱{matchedRental.remainingBalance.toFixed(2)}</span>
              </div>
            </div>

            {/* Starting SOC Input */}
            <div className="bg-emerald-50/60 border border-emerald-200 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-display">Record Verified Starting SOC (%)</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Physical multimeter or BMS reading before handing battery to driver.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-emerald-800">{startingSoc}%</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={startingSoc}
                  onChange={(e) => setStartingSoc(Number(e.target.value))}
                  className="flex-1 accent-emerald-600 cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={startingSoc}
                  onChange={(e) => setStartingSoc(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 text-center font-mono font-bold border border-emerald-300 rounded-lg bg-white text-xs"
                />
              </div>

              {/* Quick SOC buttons */}
              <div className="flex gap-2 pt-1">
                {[100, 98, 95, 90, 85].map(socVal => (
                  <button
                    key={socVal}
                    type="button"
                    onClick={() => setStartingSoc(socVal)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border cursor-pointer ${
                      startingSoc === socVal 
                        ? 'bg-emerald-700 text-white border-emerald-700' 
                        : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {socVal}%
                  </button>
                ))}
              </div>
            </div>

            {/* Officer Notes */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Releasing Notes / Inspection Remarks</label>
              <input
                type="text"
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                placeholder="e.g. Battery casing intact, latch securely locked, driver verified receipt."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Logged under officer: <strong>{currentUser}</strong>
              </span>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setVoucherInput('')}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Clear
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Battery Release</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
