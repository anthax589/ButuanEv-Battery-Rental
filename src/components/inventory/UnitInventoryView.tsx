import React, { useState, useMemo } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Car, 
  Bike, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertTriangle, 
  Eye, 
  Plus, 
  X, 
  Download 
} from 'lucide-react';
import { UnitItem, UnitStatus, UnitCondition, UnitType } from '../../types';

export const UnitInventoryView: React.FC = () => {
  const { 
    units, 
    currentBranch, 
    updateUnitStatus, 
    setCurrentTab, 
    exportReportToCSV 
  } = useRental();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | UnitType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | UnitStatus>('All');
  const [selectedUnit, setSelectedUnit] = useState<UnitItem | null>(null);

  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      if (currentBranch !== 'All' && u.branch !== currentBranch) return false;
      if (statusFilter !== 'All' && u.status !== statusFilter) return false;
      if (typeFilter !== 'All' && u.unitType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          u.code.toLowerCase().includes(q) ||
          u.modelName.toLowerCase().includes(q) ||
          (u.currentDriverName && u.currentDriverName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [units, currentBranch, statusFilter, typeFilter, searchQuery]);

  const handleExport = () => {
    exportReportToCSV('unit_inventory', filteredUnits.map(u => ({
      UnitCode: u.code,
      Type: u.unitType,
      ModelName: u.modelName,
      Branch: u.branch,
      Status: u.status,
      Condition: u.condition,
      MileageKm: u.mileageKm,
      CurrentDriver: u.currentDriverName || 'None',
      LastMaintenance: u.lastMaintenanceDate || 'N/A',
      Remarks: u.remarks || 'None'
    })));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Car className="w-4 h-4" />
            <span>EV Fleet Assets</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
            EV Unit Fleet Management ({units.length} Units)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Multi-modal fleet including E-bikes, E-cargo haulers, and community transit mini-buses.
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
            onClick={() => setCurrentTab('new-rental')}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer shadow-xs"
          >
            + Rent Unit
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Unit Code (e.g. BX-EB-101), Model, or Driver..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer font-medium"
          >
            <option value="All">All Vehicle Types</option>
            <option value="E-bike">E-bike</option>
            <option value="E-cargo">E-cargo</option>
            <option value="E-bus">E-bus</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white cursor-pointer font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Rented">Rented</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {filteredUnits.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No EV units found matching the selected filters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="px-4 py-3">Unit Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Model Description</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Current Driver</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnits.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {u.code}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {u.unitType}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.modelName}
                      <span className="block text-[10px] text-slate-400 font-mono">{u.mileageKm} km odometer</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[130px]">
                      {u.branch.replace(' - Main Hub', '').replace(' - Metro Station', '')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                        u.status === 'Rented' ? 'bg-blue-100 text-blue-800' :
                        u.status === 'Reserved' ? 'bg-amber-100 text-amber-800' :
                        u.status === 'Maintenance' ? 'bg-amber-100 text-amber-900' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {u.condition}
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {u.currentDriverName || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedUnit(u)}
                          title="View Unit Details"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {u.status === 'Available' && (
                          <button
                            onClick={() => setCurrentTab('new-rental')}
                            title="Rent this unit"
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Rent
                          </button>
                        )}

                        {u.status === 'Rented' && (
                          <button
                            onClick={() => setCurrentTab('unit-release-return')}
                            title="Return this unit"
                            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Return
                          </button>
                        )}

                        {u.status === 'Available' && (
                          <button
                            onClick={() => {
                              const reason = prompt(`Enter maintenance reason for ${u.code}:`);
                              if (reason) updateUnitStatus(u.id, 'Maintenance', 'Maintenance Required', reason);
                            }}
                            title="Send to Maintenance"
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded cursor-pointer"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {u.status === 'Maintenance' && (
                          <button
                            onClick={() => updateUnitStatus(u.id, 'Available', 'Excellent', 'Service inspection complete.')}
                            title="Clear Maintenance & Mark Available"
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-medium cursor-pointer"
                          >
                            Service Done
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Unit Details Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-cyan-200" />
                <span className="font-bold font-mono text-base">{selectedUnit.code} Specification</span>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="p-1 text-slate-300 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase block">Vehicle Type</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedUnit.unitType}</span>
                  <span className="text-slate-500 block">{selectedUnit.modelName}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase block">Home Base Branch</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedUnit.branch}</span>
                  <span className="text-slate-500 block">Odometer: {selectedUnit.mileageKm} km</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase block font-medium">Operating Condition</span>
                <div className="font-bold text-slate-900 text-sm">{selectedUnit.condition}</div>
                {selectedUnit.lastMaintenanceDate && (
                  <div className="text-slate-500 text-[11px]">Last Maintenance: {selectedUnit.lastMaintenanceDate}</div>
                )}
                {selectedUnit.remarks && (
                  <div className="text-slate-600 mt-2 bg-white p-2 rounded border border-slate-100">
                    {selectedUnit.remarks}
                  </div>
                )}
              </div>

              {selectedUnit.currentDriverName && (
                <div className="bg-blue-50 p-3.5 rounded-lg border border-blue-200 text-blue-950">
                  <span className="font-semibold block">Currently Deployed:</span>
                  <div className="font-bold mt-0.5">{selectedUnit.currentDriverName} (Driver ID: {selectedUnit.currentDriverId})</div>
                  <div className="font-mono text-[11px] text-blue-800">Rental ID: {selectedUnit.currentRentalId}</div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedUnit(null)}
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
