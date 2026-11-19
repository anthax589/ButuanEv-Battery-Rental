import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Gauge, 
  Battery, 
  BatteryCharging, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Clock, 
  History, 
  X,
  Building2,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { BatteryItem } from '../../types';

export const SocMonitoringView: React.FC = () => {
  const { batteries, currentBranch, sendBatteryToCharging, settings } = useRental();

  const [searchQuery, setSearchQuery] = useState('');
  const [socFilter, setSocFilter] = useState<'All' | 'Critical' | 'Low' | 'Nominal' | 'Charging'>('All');
  const [selectedBatteryForHistory, setSelectedBatteryForHistory] = useState<BatteryItem | null>(null);

  const filteredBatteries = batteries.filter(b => {
    if (currentBranch !== 'All' && b.branch !== currentBranch) return false;

    if (socFilter === 'Critical') {
      if (b.soc >= settings.criticalLowSocThreshold) return false;
    } else if (socFilter === 'Low') {
      if (b.soc < settings.criticalLowSocThreshold || b.soc >= 25) return false;
    } else if (socFilter === 'Nominal') {
      if (b.soc < 25) return false;
    } else if (socFilter === 'Charging') {
      if (b.status !== 'Charging') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!b.code.toLowerCase().includes(q) && !b.batteryType.toLowerCase().includes(q)) {
        return false;
      }
    }

    return true;
  });

  const criticalCount = batteries.filter(b => b.soc < settings.criticalLowSocThreshold).length;
  const chargingCount = batteries.filter(b => b.status === 'Charging').length;
  const nominalCount = batteries.filter(b => b.soc >= 80).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Gauge className="w-4 h-4" />
            <span>Telemetry & Battery Health</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
            Battery State of Charge (SOC) Live Health
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visual charge monitoring with automatic critical alerts when charge drops below {settings.criticalLowSocThreshold}%.
          </p>
        </div>

        {/* Quick Health KPI Badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <div>
              <span className="text-[10px] text-red-600 font-semibold block uppercase">Below 5% Critical</span>
              <span className="font-mono font-bold text-red-900 text-sm">{criticalCount} Pack(s)</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-amber-600" />
            <div>
              <span className="text-[10px] text-amber-600 font-semibold block uppercase">In Charging Bays</span>
              <span className="font-mono font-bold text-amber-900 text-sm">{chargingCount} Pack(s)</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] text-emerald-600 font-semibold block uppercase">&ge; 80% Full</span>
              <span className="font-mono font-bold text-emerald-900 text-sm">{nominalCount} Pack(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Battery Code (e.g. BX-BAT-014)..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'All', label: 'All Batteries' },
            { id: 'Critical', label: `Below ${settings.criticalLowSocThreshold}% (Critical)` },
            { id: 'Low', label: 'Low (5% - 24%)' },
            { id: 'Charging', label: 'Charging Bays' },
            { id: 'Nominal', label: 'Nominal (&ge; 25%)' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSocFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                socFilter === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Battery SOC Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBatteries.map(b => {
          const isCritical = b.soc < settings.criticalLowSocThreshold;
          const isLow = b.soc >= settings.criticalLowSocThreshold && b.soc < 25;
          const isCharging = b.status === 'Charging';

          return (
            <div
              key={b.id}
              className={`p-4 rounded-xl border transition-all ${
                isCritical 
                  ? 'bg-red-50/80 border-red-300 ring-2 ring-red-400 shadow-xs' 
                  : isCharging
                  ? 'bg-amber-50/40 border-amber-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-sm block">{b.code}</span>
                  <span className="text-[11px] text-slate-500">{b.batteryType}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  isCritical ? 'bg-red-600 text-white animate-pulse' :
                  isCharging ? 'bg-amber-100 text-amber-800' :
                  b.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                  b.status === 'Rented' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {isCritical ? 'CRITICAL LOW' : b.status}
                </span>
              </div>

              {/* Progress Gauge */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500 font-medium">Charge Level</span>
                  <span className={`font-mono font-bold text-base ${
                    isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                  }`}>
                    {b.soc}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCritical ? 'bg-red-600' :
                      isLow ? 'bg-amber-500' :
                      b.soc < 60 ? 'bg-blue-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${b.soc}%` }}
                  />
                </div>
              </div>

              {/* Branch and Driver details */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Branch:</span>
                  <span className="text-slate-700 font-medium truncate max-w-[140px]">
                    {b.branch.replace(' - Main Hub', '').replace(' - Metro Station', '')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Driver / Bay:</span>
                  <span className="text-slate-700 font-medium">
                    {b.currentDriverName || (isCharging ? 'Charge Bay Active' : 'Dock Ready')}
                  </span>
                </div>
              </div>

              {/* Bottom Quick Actions */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedBatteryForHistory(b)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>SOC History</span>
                </button>

                {isCritical && b.status !== 'Charging' && (
                  <button
                    onClick={() => sendBatteryToCharging(b.id)}
                    className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    Dock to Charge
                  </button>
                )}

                {!isCritical && b.status === 'Available' && (
                  <button
                    onClick={() => sendBatteryToCharging(b.id)}
                    className="text-[10px] text-amber-700 hover:underline cursor-pointer"
                  >
                    Send to Charge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SOC History Modal */}
      {selectedBatteryForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-300" />
                <span className="font-bold font-mono text-base">
                  SOC History Log: {selectedBatteryForHistory.code}
                </span>
              </div>
              <button
                onClick={() => setSelectedBatteryForHistory(null)}
                className="p-1 text-slate-300 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-slate-500">Current Charge Level:</span>
                  <span className="font-bold font-mono text-slate-900 text-sm ml-2">
                    {selectedBatteryForHistory.soc}% SOC
                  </span>
                </div>
                <span className="text-slate-600">{selectedBatteryForHistory.branch}</span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Recorded Handover & Inspection Cycles
                </span>

                {selectedBatteryForHistory.socHistory.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
                    No cycle telemetry logs recorded yet for this battery pack.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedBatteryForHistory.socHistory.map(log => (
                      <div key={log.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {log.type === 'rental_start' ? 'Handover (Release)' :
                             log.type === 'rental_end' ? 'Check-in (Return)' :
                             log.type === 'charge_cycle' ? 'Smart Charger Bay' :
                             'Inspection Cycle'}
                          </span>
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {log.soc}% SOC
                          </span>
                        </div>
                        {log.driverName && (
                          <div className="text-slate-600">
                            Driver: <strong className="text-slate-800">{log.driverName}</strong>
                            {log.transactionId && <span className="font-mono text-slate-400 ml-2">({log.transactionId})</span>}
                          </div>
                        )}
                        {log.notes && (
                          <p className="text-slate-500 text-[11px] italic">{log.notes}</p>
                        )}
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                          <span>{log.date}</span>
                          <span>Logged by: {log.recordedBy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedBatteryForHistory(null)}
                className="px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
