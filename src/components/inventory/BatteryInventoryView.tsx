import React, { useState, useMemo } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Battery, 
  Search, 
  Filter, 
  BatteryCharging, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  ArrowUpRight, 
  ArrowDownLeft, 
  X, 
  History,
  Download,
  Building2,
  Wrench
} from 'lucide-react';
import { BatteryItem, BatteryStatus, BatteryCondition } from '../../types';

export const BatteryInventoryView: React.FC = () => {
  const { 
    batteries, 
    currentBranch, 
    updateBatteryStatus, 
    sendBatteryToCharging, 
    setCurrentTab, 
    setActiveRentalDetailModal,
    exportReportToCSV
  } = useRental();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BatteryStatus>('All');
  const [selectedBattery, setSelectedBattery] = useState<BatteryItem | null>(null);

  // Filtered batteries
  const filteredBatteries = useMemo(() => {
    return batteries.filter(b => {
      if (currentBranch !== 'All' && b.branch !== currentBranch) return false;
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          b.code.toLowerCase().includes(q) ||
          b.batteryType.toLowerCase().includes(q) ||
          (b.currentDriverName && b.currentDriverName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [batteries, currentBranch, statusFilter, searchQuery]);

  const branch1Count = batteries.filter(b => b.branch === 'Branch 1 - Main Hub').length;
  const branch2Count = batteries.filter(b => b.branch === 'Branch 2 - Metro Station').length;

  const handleExport = () => {
    exportReportToCSV('battery_inventory', filteredBatteries.map(b => ({
      BatteryCode: b.code,
      Type: b.batteryType,
      Branch: b.branch,
      SOC: `${b.soc}%`,
      Status: b.status,
      Condition: b.condition,
      CurrentDriver: b.currentDriverName || 'None',
      DamageNotes: b.damageNotes || 'None',
      LastUpdated: b.lastUpdated
    })));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Battery className="w-4 h-4" />
            <span>Battery Asset Directory</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
            Battery Fleet Management ({batteries.length} Total Units)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configured initial distribution: Branch 1 (Main Hub): {branch1Count} batteries · Branch 2 (Metro Station): {branch2Count} batteries.
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
          <button
            onClick={() => setCurrentTab('soc-monitoring')}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer shadow-xs"
          >
            SOC Real-Time Health
          </button>
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
            placeholder="Search Battery Code (e.g. BX-BAT-014), Type, or Current Driver..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 text-xs">
          {(['All', 'Available', 'Reserved', 'Rented', 'Charging', 'Damaged', 'Maintenance'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {filteredBatteries.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No battery records found matching the criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="px-4 py-3">Battery Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">SOC (%)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Current Driver</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatteries.map(b => {
                  const isCritical = b.soc < 5;
                  return (
                    <tr key={b.id} className={`hover:bg-slate-50/80 transition-colors ${isCritical ? 'bg-red-50/50' : ''}`}>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {b.code}
                        {isCritical && (
                          <span className="ml-2 text-[10px] text-red-600 font-sans font-bold bg-red-100 px-1.5 py-0.2 rounded">
                            LOW &lt;5%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{b.batteryType}</td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-[140px]">
                        {b.branch.replace(' - Main Hub', '').replace(' - Metro Station', '')}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                b.soc < 5 ? 'bg-red-600' :
                                b.soc < 20 ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${b.soc}%` }}
                            />
                          </div>
                          <span className={`font-bold ${b.soc < 5 ? 'text-red-600' : 'text-slate-800'}`}>
                            {b.soc}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          b.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'Rented' ? 'bg-blue-100 text-blue-800' :
                          b.status === 'Charging' ? 'bg-amber-100 text-amber-800' :
                          b.status === 'Reserved' ? 'bg-amber-100 text-amber-900' :
                          b.status === 'Damaged' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {b.condition}
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {b.currentDriverName || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedBattery(b)}
                            title="View Battery Details"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {b.status === 'Available' && (
                            <button
                              onClick={() => sendBatteryToCharging(b.id)}
                              title="Send to Charging Bay"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded cursor-pointer"
                            >
                              <BatteryCharging className="w-4 h-4" />
                            </button>
                          )}

                          {b.status === 'Charging' && (
                            <button
                              onClick={() => updateBatteryStatus(b.id, 'Available')}
                              title="Mark Fully Charged & Ready"
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-medium cursor-pointer"
                            >
                              Ready
                            </button>
                          )}

                          {b.status === 'Rented' && (
                            <button
                              onClick={() => setCurrentTab('battery-return')}
                              title="Go to Return Desk"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                            >
                              <ArrowDownLeft className="w-4 h-4" />
                            </button>
                          )}

                          {b.status !== 'Damaged' && (
                            <button
                              onClick={() => {
                                const note = prompt(`Enter damage notes for ${b.code}:`);
                                if (note) updateBatteryStatus(b.id, 'Damaged', 'Damaged', note);
                              }}
                              title="Mark Damaged"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Battery Details Side Panel / Modal */}
      {selectedBattery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-emerald-300" />
                <span className="font-bold font-mono text-base">{selectedBattery.code} Details</span>
              </div>
              <button
                onClick={() => setSelectedBattery(null)}
                className="p-1 text-slate-300 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase block">Battery Chemistry</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedBattery.batteryType}</span>
                  <span className="text-slate-500 block">ID: {selectedBattery.id}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase block">Assigned Branch</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedBattery.branch}</span>
                  <span className="text-slate-500 block">Status: {selectedBattery.status}</span>
                </div>
              </div>

              {/* Charge State Bar */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-semibold">Current State of Charge:</span>
                  <span className="text-lg font-bold font-mono text-slate-900">{selectedBattery.soc}%</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      selectedBattery.soc < 5 ? 'bg-red-600' :
                      selectedBattery.soc < 20 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedBattery.soc}%` }}
                  />
                </div>
              </div>

              {/* Current Driver / Rental status */}
              {selectedBattery.currentDriverName && (
                <div className="bg-blue-50 p-3.5 rounded-lg border border-blue-200 space-y-1">
                  <span className="text-blue-900 font-semibold block">Currently Rented to Driver:</span>
                  <div className="text-slate-800 font-bold">{selectedBattery.currentDriverName} (ID: {selectedBattery.currentDriverId})</div>
                  <div className="text-slate-600 font-mono text-[11px]">Rental ID: {selectedBattery.currentRentalId}</div>
                  <div className="text-slate-500 text-[11px]">Released: {selectedBattery.releaseDateTime || 'In progress'}</div>
                </div>
              )}

              {selectedBattery.damageNotes && (
                <div className="bg-red-50 p-3.5 rounded-lg border border-red-200 text-red-800">
                  <strong className="block text-[11px] text-red-900 uppercase">Damage Report:</strong>
                  <p className="mt-1">{selectedBattery.damageNotes}</p>
                </div>
              )}

              {/* SOC History */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 font-semibold text-slate-700 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>Battery Operational History</span>
                </div>
                <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                  {selectedBattery.socHistory.length === 0 ? (
                    <div className="text-slate-400 italic text-center py-2">No historical logs yet.</div>
                  ) : (
                    selectedBattery.socHistory.map(log => (
                      <div key={log.id} className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800">{log.type.replace('_', ' ').toUpperCase()}</span>
                          <span className="font-mono font-bold text-slate-900">{log.soc}% SOC</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{log.notes || 'Normal cycle log'}</p>
                        <div className="text-slate-400 text-[10px] mt-1 flex justify-between">
                          <span>{log.date}</span>
                          <span>Logged by: {log.recordedBy}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    sendBatteryToCharging(selectedBattery.id);
                    setSelectedBattery(null);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded font-medium cursor-pointer"
                >
                  Send to Charging Bay
                </button>
                <button
                  onClick={() => {
                    updateBatteryStatus(selectedBattery.id, 'Available', 'Good');
                    setSelectedBattery(null);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium cursor-pointer"
                >
                  Mark Available & Healthy
                </button>
                <button
                  onClick={() => {
                    const note = prompt('Describe maintenance issue:');
                    if (note) updateBatteryStatus(selectedBattery.id, 'Maintenance', 'Needs Inspection', note);
                    setSelectedBattery(null);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium cursor-pointer"
                >
                  Flag for Maintenance
                </button>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedBattery(null)}
                className="px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
