import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Settings, 
  DollarSign, 
  Percent, 
  Battery, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData, batteries } = useRental();

  const [form, setForm] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const branch1Batteries = batteries.filter(b => b.branch === 'Branch 1 - Main Hub').length;
  const branch2Batteries = batteries.filter(b => b.branch === 'Branch 2 - Metro Station').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data back to the clean initial demo state (48 batteries across Branch 1 & 2)?')) {
      resetToDefaultData();
      alert('System data reset to initial distribution.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Administrator Control</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
            Rental Rates & Operational Rules
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure company pricing schedules, bundle discount algorithms, driver loyalty percentages, and safety thresholds.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved and actively applied across all rental workflows.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branch Inventory Distribution Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm font-display">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Fleet Distribution Policy</span>
          </div>
          <p className="text-xs text-slate-500">
            Initial expected deployment as specified by company logistics:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Branch 1 - Main Hub (Cubao Central)</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-slate-900">{branch1Batteries}</span>
                <span className="text-slate-400">Policy: 34 Units</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Branch 2 - Metro Station (Ortigas Station)</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-slate-900">{branch2Batteries}</span>
                <span className="text-slate-400">Policy: 14 Units</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Schedule */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm font-display">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Rental Pricing Schedules (Daily Rates in PHP ₱)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Battery Daily Rate (₱)</label>
              <input
                type="number"
                min="0"
                value={form.batteryDailyRate}
                onChange={(e) => setForm({ ...form, batteryDailyRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">E-Bike Daily Rate (₱)</label>
              <input
                type="number"
                min="0"
                value={form.ebikeDailyRate}
                onChange={(e) => setForm({ ...form, ebikeDailyRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">E-Cargo Daily Rate (₱)</label>
              <input
                type="number"
                min="0"
                value={form.ecargoDailyRate}
                onChange={(e) => setForm({ ...form, ecargoDailyRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">E-Bus Daily Rate (₱)</label>
              <input
                type="number"
                min="0"
                value={form.ebusDailyRate}
                onChange={(e) => setForm({ ...form, ebusDailyRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-slate-700 font-medium mb-1 text-xs">
              Combined Rental Bundle Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={form.bundleDiscountPercent}
              onChange={(e) => setForm({ ...form, bundleDiscountPercent: Number(e.target.value) })}
              className="w-32 px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-xs"
              required
            />
            <span className="text-[11px] text-slate-500 ml-2">Automatically applied when renting battery + vehicle together.</span>
          </div>
        </div>

        {/* Loyalty & Safety Formulas */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm font-display">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Driver Loyalty & Battery Health Rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Base Loyalty Per Rental (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.loyaltyRatePerRental}
                onChange={(e) => setForm({ ...form, loyaltyRatePerRental: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Bonus Return SOC Threshold (%)</label>
              <input
                type="number"
                min="10"
                max="50"
                value={form.bonusSocThreshold}
                onChange={(e) => setForm({ ...form, bonusSocThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Bonus Loyalty Reward (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.bonusLoyaltyPercent}
                onChange={(e) => setForm({ ...form, bonusLoyaltyPercent: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-slate-700 font-medium mb-1 text-xs">
              Critical Low SOC Alert Level (%)
            </label>
            <input
              type="number"
              min="1"
              max="15"
              value={form.criticalLowSocThreshold}
              onChange={(e) => setForm({ ...form, criticalLowSocThreshold: Number(e.target.value) })}
              className="w-32 px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-xs"
              required
            />
            <span className="text-[11px] text-slate-500 ml-2">Batteries below this level trigger instant warning banners.</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
