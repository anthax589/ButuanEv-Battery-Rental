import React, { useState, useMemo } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Search, 
  UserPlus, 
  Check, 
  Battery, 
  Car, 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  User, 
  Bike,
  Percent,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Driver, RentalType, PaymentMethod, BranchName } from '../../types';

export const NewRentalWizard: React.FC = () => {
  const { 
    drivers, 
    batteries, 
    units, 
    settings, 
    currentBranch, 
    createRental, 
    registerDriver, 
    setCurrentTab 
  } = useRental();

  // Wizard Step (1 to 6)
  const [step, setStep] = useState<number>(1);

  // Step 1: Driver Search & Selection
  const [driverSearch, setDriverSearch] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newDriverData, setNewDriverData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    licenseNumber: '',
    branch: (currentBranch === 'All' ? 'Branch 1 - Main Hub' : currentBranch) as BranchName,
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  });

  // Step 2: Rental Type
  const [rentalType, setRentalType] = useState<RentalType>('Combined');

  // Step 3: Inventory Selection
  const [selectedBatteryId, setSelectedBatteryId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  // Step 4: Duration & Rates
  const [rentalDays, setRentalDays] = useState<number>(1);
  const [remarks, setRemarks] = useState('');

  // Step 5: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [referenceNumber, setReferenceNumber] = useState('');

  // Error message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search matching drivers
  const matchingDrivers = useMemo(() => {
    if (!driverSearch.trim()) return drivers.slice(0, 5);
    const q = driverSearch.toLowerCase();
    return drivers.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.id.toLowerCase().includes(q) || 
      d.contactNumber.includes(q) ||
      d.licenseNumber.toLowerCase().includes(q)
    );
  }, [driverSearch, drivers]);

  // Available Batteries for selection
  const eligibleBatteries = useMemo(() => {
    return batteries.filter(b => {
      const branchMatch = currentBranch === 'All' || b.branch === currentBranch;
      return branchMatch && b.status === 'Available' && b.soc >= 20; // Only healthy batteries >= 20%
    });
  }, [batteries, currentBranch]);

  // Available Units for selection
  const eligibleUnits = useMemo(() => {
    return units.filter(u => {
      const branchMatch = currentBranch === 'All' || u.branch === currentBranch;
      return branchMatch && u.status === 'Available';
    });
  }, [units, currentBranch]);

  // Pricing calculations
  const selectedBattery = batteries.find(b => b.id === selectedBatteryId);
  const selectedUnit = units.find(u => u.id === selectedUnitId);

  const pricing = useMemo(() => {
    let base = 0;
    if (rentalType === 'Battery') {
      base = settings.batteryDailyRate * rentalDays;
    } else if (rentalType === 'Unit' && selectedUnit) {
      const daily = selectedUnit.unitType === 'E-bike' ? settings.ebikeDailyRate :
                    selectedUnit.unitType === 'E-bus' ? settings.ebusDailyRate : settings.ecargoDailyRate;
      base = daily * rentalDays;
    } else if (rentalType === 'Combined') {
      const batCost = settings.batteryDailyRate * rentalDays;
      const unitRate = selectedUnit ? (
        selectedUnit.unitType === 'E-bike' ? settings.ebikeDailyRate :
        selectedUnit.unitType === 'E-bus' ? settings.ebusDailyRate : settings.ecargoDailyRate
      ) : settings.ebikeDailyRate;
      const unitCost = unitRate * rentalDays;
      const subtotal = batCost + unitCost;
      const bundleDisc = subtotal * (settings.bundleDiscountPercent / 100);
      base = subtotal - bundleDisc;
    }

    const loyaltyRate = selectedDriver ? selectedDriver.currentLoyaltyPercent : 0;
    const discount = Number(((base * loyaltyRate) / 100).toFixed(2));
    const total = Number((base - discount).toFixed(2));

    return {
      base,
      loyaltyRate,
      discount,
      total
    };
  }, [rentalType, rentalDays, selectedUnit, selectedDriver, settings]);

  // Auto-fill payment amount when total changes and user hasn't customized
  React.useEffect(() => {
    if (paymentAmount === 0 || paymentAmount > pricing.total) {
      setPaymentAmount(pricing.total);
    }
  }, [pricing.total]);

  // Calculated expected return date string
  const expectedReturnDateString = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + rentalDays);
    return d.toISOString().replace('T', ' ').substring(0, 16);
  }, [rentalDays]);

  // Handle register driver inline
  const handleRegisterDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverData.name.trim() || !newDriverData.contactNumber.trim() || !newDriverData.licenseNumber.trim()) {
      setErrorMessage('Please fill in driver name, contact number, and license number.');
      return;
    }
    const created = registerDriver(newDriverData);
    setSelectedDriver(created);
    setShowRegisterForm(false);
    setErrorMessage(null);
  };

  // Step 1 Validation
  const handleStep1Next = () => {
    if (!selectedDriver) {
      setErrorMessage('Please select an existing driver or register a new one.');
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  // Step 2 Validation
  const handleStep2Next = () => {
    setErrorMessage(null);
    setStep(3);
  };

  // Step 3 Validation
  const handleStep3Next = () => {
    if (rentalType === 'Battery' && !selectedBatteryId) {
      setErrorMessage('Please select an available battery to continue.');
      return;
    }
    if (rentalType === 'Unit' && !selectedUnitId) {
      setErrorMessage('Please select an available EV unit to continue.');
      return;
    }
    if (rentalType === 'Combined' && (!selectedBatteryId || !selectedUnitId)) {
      setErrorMessage('Please select both a battery and an EV unit for combined rental.');
      return;
    }
    setErrorMessage(null);
    setStep(4);
  };

  // Step 4 Validation
  const handleStep4Next = () => {
    setErrorMessage(null);
    setPaymentAmount(pricing.total);
    setStep(5);
  };

  // Step 5 Validation
  const handleStep5Next = () => {
    if (paymentAmount < 0) {
      setErrorMessage('Payment amount cannot be negative.');
      return;
    }
    setErrorMessage(null);
    setStep(6);
  };

  // Step 6 Confirmation Submission
  const handleConfirmRental = () => {
    if (!selectedDriver) return;

    const res = createRental({
      driverId: selectedDriver.id,
      rentalType,
      batteryId: selectedBatteryId || undefined,
      unitId: selectedUnitId || undefined,
      rentalDays,
      expectedReturnDate: expectedReturnDateString,
      amountPaid: paymentAmount,
      paymentMethod,
      referenceNumber: referenceNumber || (paymentMethod === 'Cash' ? `CSH-${Math.floor(10000 + Math.random() * 90000)}` : `REF-${Math.floor(100000 + Math.random() * 900000)}`),
      remarks
    });

    if (res.success) {
      // Rental created! The context has already set activeVoucherModal so the modal appears.
      setCurrentTab('active-rentals');
    } else {
      setErrorMessage(res.error || 'Failed to create rental.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
          <span className="font-bold text-slate-900 font-display">Step {step} of 6</span>
          <span className="text-slate-500">
            {step === 1 && '1. Find or Register Driver'}
            {step === 2 && '2. Select Rental Type'}
            {step === 3 && '3. Select Available Inventory'}
            {step === 4 && '4. Rental Details & Duration'}
            {step === 5 && '5. Payment & Method'}
            {step === 6 && '6. Final Review & Issue Voucher'}
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className={`flex-1 border-r border-white last:border-r-0 transition-all duration-300 ${
                i <= step ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-3.5 rounded-lg flex items-center gap-2.5 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: FIND OR REGISTER DRIVER */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 font-display">Step 1: Find or Register Driver</h3>
            <p className="text-xs text-slate-500 mt-1">
              Search by driver name, driver ID, or contact number. If driver is new, register them instantly.
            </p>
          </div>

          {!showRegisterForm ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    placeholder="Search Driver Name, DRV ID, or Mobile Phone..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setShowRegisterForm(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register New Driver</span>
                </button>
              </div>

              {/* Driver Results List */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Matching Profiles ({matchingDrivers.length})
                </div>

                {matchingDrivers.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-500">No driver profile found matching "{driverSearch}".</p>
                    <button
                      onClick={() => {
                        setNewDriverData(prev => ({ ...prev, name: driverSearch }));
                        setShowRegisterForm(true);
                      }}
                      className="mt-2 text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                    >
                      Register "{driverSearch}" as a new driver
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matchingDrivers.map(d => {
                      const isSelected = selectedDriver?.id === d.id;
                      const hasActiveRental = Boolean(d.activeRentalId);

                      return (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDriver(d)}
                          className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {d.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 text-sm block">{d.name}</span>
                                <span className="font-mono text-slate-500 text-[11px]">{d.id} · {d.contactNumber}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                              <Percent className="w-3.5 h-3.5" />
                              <span>{d.currentLoyaltyPercent}% Loyalty Discount</span>
                            </div>
                            <span className="text-slate-400">
                              {d.totalRentalsCount} past rentals
                            </span>
                          </div>

                          {hasActiveRental && (
                            <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                              Notice: Driver already has active rental ({d.activeRentalId}).
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Inline Quick Driver Registration Form */
            <form onSubmit={handleRegisterDriver} className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-sm">Driver Registration Form</span>
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newDriverData.name}
                    onChange={(e) => setNewDriverData({ ...newDriverData, name: e.target.value })}
                    placeholder="e.g. Juan dela Cruz"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={newDriverData.contactNumber}
                    onChange={(e) => setNewDriverData({ ...newDriverData, contactNumber: e.target.value })}
                    placeholder="e.g. 0917-123-4567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Driver License Number *</label>
                  <input
                    type="text"
                    required
                    value={newDriverData.licenseNumber}
                    onChange={(e) => setNewDriverData({ ...newDriverData, licenseNumber: e.target.value })}
                    placeholder="e.g. N01-19-123456"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Home Branch</label>
                  <select
                    value={newDriverData.branch}
                    onChange={(e) => setNewDriverData({ ...newDriverData, branch: e.target.value as BranchName })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Branch 1 - Main Hub">Branch 1 - Main Hub</option>
                    <option value="Branch 2 - Metro Station">Branch 2 - Metro Station</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    value={newDriverData.emergencyContact}
                    onChange={(e) => setNewDriverData({ ...newDriverData, emergencyContact: e.target.value })}
                    placeholder="e.g. Maria dela Cruz (Spouse)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={newDriverData.emergencyPhone}
                    onChange={(e) => setNewDriverData({ ...newDriverData, emergencyPhone: e.target.value })}
                    placeholder="e.g. 0917-000-0000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Back to Search
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save & Select Driver
                </button>
              </div>
            </form>
          )}

          {/* Bottom Action */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleStep1Next}
              disabled={!selectedDriver}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedDriver
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Continue with {selectedDriver ? selectedDriver.name.split(' ')[0] : 'Driver'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT RENTAL TYPE */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 font-display">Step 2: Select Rental Type</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select whether the driver is renting a battery pack, an EV vehicle, or a combined package.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Battery Rental Card */}
            <div
              onClick={() => setRentalType('Battery')}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                rentalType === 'Battery'
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-1 ring-emerald-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Battery className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-display">Battery Rental</h4>
              <p className="text-xs text-slate-500 mt-1">
                For drivers with their own EV who need swapped or fresh high-capacity battery packs.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between text-xs">
                <span className="text-slate-500">Standard Rate</span>
                <span className="font-bold font-mono text-slate-900">₱{settings.batteryDailyRate}/day</span>
              </div>
            </div>

            {/* Unit Rental Card */}
            <div
              onClick={() => setRentalType('Unit')}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                rentalType === 'Unit'
                  ? 'border-blue-600 bg-blue-50/60 shadow-md ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Car className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm font-display">Unit Rental Only</h4>
              <p className="text-xs text-slate-500 mt-1">
                Rent E-bikes, E-cargo haulers, or community mini-buses (without standalone battery swap).
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between text-xs">
                <span className="text-slate-500">Starts At</span>
                <span className="font-bold font-mono text-slate-900">₱{settings.ebikeDailyRate}/day</span>
              </div>
            </div>

            {/* Combined Bundle Card */}
            <div
              onClick={() => setRentalType('Combined')}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                rentalType === 'Combined'
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-1 ring-emerald-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm font-display">Combined Rental</h4>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  SAVE {settings.bundleDiscountPercent}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Full package: EV vehicle plus dedicated swapped battery pack with bundle savings.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between text-xs">
                <span className="text-slate-500">Package Discount</span>
                <span className="font-bold font-mono text-emerald-700">{settings.bundleDiscountPercent}% OFF</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleStep2Next}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <span>Continue to Inventory Selection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SELECT AVAILABLE INVENTORY */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 font-display">Step 3: Select Available Equipment</h3>
            <p className="text-xs text-slate-500 mt-1">
              Only eligible inventory with nominal health is displayed as selectable.
            </p>
          </div>

          {/* Battery Selection (if Battery or Combined) */}
          {(rentalType === 'Battery' || rentalType === 'Combined') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                  <Battery className="w-4 h-4 text-emerald-600" />
                  Select Available Battery ({eligibleBatteries.length} Ready)
                </span>
                <span className="text-[11px] text-slate-400">SOC &ge; 20% Verified</span>
              </div>

              {eligibleBatteries.length === 0 ? (
                <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-xs">
                  No batteries currently available at this branch. Please check other branches or charging bays.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {eligibleBatteries.map(b => {
                    const isSelected = selectedBatteryId === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBatteryId(b.id)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-slate-900 block">{b.code}</span>
                            <span className="text-[11px] text-slate-500">{b.batteryType}</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[10px]">
                            {b.soc}% SOC
                          </span>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-400 truncate">
                          {b.branch.replace(' - Main Hub', '').replace(' - Metro Station', '')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Unit Selection (if Unit or Combined) */}
          {(rentalType === 'Unit' || rentalType === 'Combined') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                  <Car className="w-4 h-4 text-blue-600" />
                  Select Available EV Unit ({eligibleUnits.length} Ready)
                </span>
                <span className="text-[11px] text-slate-400">Roadworthy Inspected</span>
              </div>

              {eligibleUnits.length === 0 ? (
                <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-xs">
                  No EV units available at this branch right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {eligibleUnits.map(u => {
                    const isSelected = selectedUnitId === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUnitId(u.id)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-slate-900 block">{u.code}</span>
                            <span className="text-[11px] font-semibold text-slate-700">{u.unitType}</span>
                          </div>
                          <span className="font-mono text-[10px] text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded font-medium">
                            {u.condition}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500 truncate">{u.modelName}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleStep3Next}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <span>Continue to Rental Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RENTAL DETAILS & DURATION */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 font-display">Step 4: Rental Details & Duration</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select rental duration. Rental fee is auto-calculated with active driver loyalty discounts applied.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: Summary of Selections */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contract Summary</span>
              
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Driver:</span>
                <span className="font-bold text-slate-900">{selectedDriver?.name} ({selectedDriver?.id})</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Rental Type:</span>
                <span className="font-semibold text-slate-800">{rentalType} Rental</span>
              </div>

              {selectedBattery && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Selected Battery:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedBattery.code} ({selectedBattery.soc}% SOC)</span>
                </div>
              )}

              {selectedUnit && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Selected EV Unit:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedUnit.code} ({selectedUnit.unitType})</span>
                </div>
              )}

              <div className="flex justify-between py-1">
                <span className="text-slate-500">Driver Loyalty Discount:</span>
                <span className="font-semibold text-emerald-700">{pricing.loyaltyRate}% applied</span>
              </div>
            </div>

            {/* Right: Duration & Remarks */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Rental Duration (Days)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[1, 2, 3, 7].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setRentalDays(d)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        rentalDays === d
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {d} {d === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expected Return: <strong className="font-mono text-slate-800">{expectedReturnDateString}</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Operational Remarks / Route</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Courier daily route cubao-makati; helmet provided."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Price Calculation Card */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-1.5">
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Gross Rental Fee ({rentalDays} {rentalDays === 1 ? 'day' : 'days'}):</span>
                  <span className="font-mono">₱{pricing.base.toFixed(2)}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 text-xs font-medium">
                    <span>Driver Loyalty Discount ({pricing.loyaltyRate}%):</span>
                    <span className="font-mono">-₱{pricing.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-emerald-200 text-slate-950 font-bold text-sm">
                  <span>Total Calculated Fee:</span>
                  <span className="font-mono text-lg text-emerald-900">₱{pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleStep4Next}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: PAYMENT */}
      {step === 5 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 font-display">Step 5: Record Payment</h3>
            <p className="text-xs text-slate-500 mt-1">
              Record full payment or deposit downpayment. The system records official transaction accounting automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Payment Summary */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Financial Summary</span>
              
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Total Rental Fee:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">₱{pricing.total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Amount Being Paid:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">₱{paymentAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 font-bold">
                <span className="text-slate-800">Remaining Balance:</span>
                <span className={`font-mono text-sm ${pricing.total - paymentAmount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  ₱{Math.max(0, pricing.total - paymentAmount).toFixed(2)}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">Quick Amount Presets:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(pricing.total)}
                    className="flex-1 py-1.5 bg-emerald-100 text-emerald-800 font-semibold rounded-md hover:bg-emerald-200 cursor-pointer text-center text-xs"
                  >
                    Full Pay (₱{pricing.total.toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(Number((pricing.total * 0.5).toFixed(2)))}
                    className="flex-1 py-1.5 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300 cursor-pointer text-center text-xs"
                  >
                    50% Deposit (₱{(pricing.total * 0.5).toFixed(2)})
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount Paid Today (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={pricing.total}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Cash', 'GCash', 'Maya', 'Bank Transfer', 'Card'] as PaymentMethod[]).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reference Number / Receipt ID</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder={paymentMethod === 'Cash' ? 'e.g. CSH-00124 (Auto-generated if blank)' : 'e.g. GCash Ref 88492019'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleStep5Next}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <span>Review & Confirm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: CONFIRMATION & ISSUE */}
      {step === 6 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Final Authorization</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display mt-0.5">Step 6: Review & Confirm Rental</h3>
            <p className="text-xs text-slate-500 mt-1">
              Confirming will create the reservation, reserve the equipment, and generate an official printable rental voucher.
            </p>
          </div>

          {/* Complete Review Sheet */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-800">Rental Specification</span>
              <span className="text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                Ready to Reserve
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Driver</span>
                  <span className="font-bold text-slate-900 text-sm block">{selectedDriver?.name}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{selectedDriver?.contactNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Rental Type</span>
                  <span className="font-semibold text-slate-800 text-sm block">{rentalType}</span>
                  <span className="text-slate-500 text-[11px]">{rentalDays} Day(s)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Assigned Battery</span>
                  <span className="font-mono font-bold text-slate-900 text-sm block">
                    {selectedBattery?.code || 'None'}
                  </span>
                  <span className="text-slate-500 text-[11px]">{selectedBattery?.batteryType || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Assigned EV Unit</span>
                  <span className="font-mono font-bold text-slate-900 text-sm block">
                    {selectedUnit?.code || 'None'}
                  </span>
                  <span className="text-slate-500 text-[11px]">{selectedUnit?.modelName || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-lg">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Total Rental Fee</span>
                  <span className="font-mono font-bold text-slate-900 text-base">₱{pricing.total.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Amount Paid</span>
                  <span className="font-mono font-bold text-emerald-700 text-base">
                    ₱{paymentAmount.toFixed(2)} ({paymentMethod})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Remaining Balance</span>
                  <span className={`font-mono font-bold text-base ${pricing.total - paymentAmount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    ₱{Math.max(0, pricing.total - paymentAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                <strong>Operational Note:</strong> The equipment will be placed in <span className="font-semibold text-amber-900">"Reserved"</span> status. It will officially transition to <span className="font-semibold text-blue-900">"Active"</span> only after the Releasing Officer scans this voucher and verifies the starting SOC.
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              onClick={() => setStep(5)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRental}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Rental & Generate Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
