import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  AlertOctagon, 
  Battery, 
  Car, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus,
  ShieldAlert
} from 'lucide-react';

export const MaintenanceView: React.FC = () => {
  const { 
    batteries, 
    units, 
    currentBranch, 
    updateBatteryStatus, 
    updateUnitStatus,
    sendBatteryToCharging
  } = useRental();

  const damagedBatteries = batteries.filter(b => {
    if (currentBranch !== 'All' && b.branch !== currentBranch) return false;
    return b.status === 'Damaged' || b.status === 'Maintenance' || b.condition === 'Damaged' || b.condition === 'Needs Inspection';
  });

  const maintUnits = units.filter(u => {
    if (currentBranch !== 'All' && u.branch !== currentBranch) return false;
    return u.status === 'Maintenance' || u.status === 'Damaged' || u.condition === 'Maintenance Required';
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
          <AlertOctagon className="w-4 h-4" />
          <span>Quarantine & Workshop</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
          Maintenance & Damaged Equipment ({damagedBatteries.length + maintUnits.length} Items)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Items in this quarantine pool cannot be selected for rental until cleared by technical inspection.
        </p>
      </div>

      {/* Damaged Batteries Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-red-50/70 border-b border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
            <Battery className="w-4 h-4 text-red-600" />
            <span>Quarantined & Damaged Batteries ({damagedBatteries.length})</span>
          </div>
          <span className="text-[11px] text-red-700">Excluded from active rental pool</span>
        </div>

        <div className="overflow-x-auto text-xs">
          {damagedBatteries.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No batteries currently marked as damaged or undergoing maintenance.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="px-4 py-2.5">Battery Code</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Branch</th>
                  <th className="px-4 py-2.5">SOC</th>
                  <th className="px-4 py-2.5">Damage / Diagnostic Notes</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {damagedBatteries.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{b.code}</td>
                    <td className="px-4 py-3 text-slate-600">{b.batteryType}</td>
                    <td className="px-4 py-3 text-slate-600">{b.branch}</td>
                    <td className="px-4 py-3 font-mono font-bold">{b.soc}%</td>
                    <td className="px-4 py-3 text-red-700 font-medium max-w-xs">{b.damageNotes || 'Physical inspection required'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => updateBatteryStatus(b.id, 'Available', 'Good', 'Repaired and recalibrated.')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[11px] cursor-pointer"
                      >
                        Clear & Return to Pool
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Maintenance Units Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <Car className="w-4 h-4 text-amber-600" />
            <span>EV Fleet Under Workshop Maintenance ({maintUnits.length})</span>
          </div>
          <span className="text-[11px] text-amber-700">Workshop queue</span>
        </div>

        <div className="overflow-x-auto text-xs">
          {maintUnits.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No vehicles currently under maintenance.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="px-4 py-2.5">Unit Code</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Model</th>
                  <th className="px-4 py-2.5">Branch</th>
                  <th className="px-4 py-2.5">Issue Description</th>
                  <th className="px-4 py-2.5">Condition</th>
                  <th className="px-4 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maintUnits.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{u.code}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{u.unitType}</td>
                    <td className="px-4 py-3 text-slate-600">{u.modelName}</td>
                    <td className="px-4 py-3 text-slate-600">{u.branch}</td>
                    <td className="px-4 py-3 text-amber-800 font-medium max-w-xs">{u.remarks || 'Service required'}</td>
                    <td className="px-4 py-3 text-slate-700">{u.condition}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => updateUnitStatus(u.id, 'Available', 'Good', 'Service and road inspection completed.')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[11px] cursor-pointer"
                      >
                        Complete Service
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
