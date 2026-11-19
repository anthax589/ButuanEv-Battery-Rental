import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { KeyRound, Search, Filter, Clock, Download, Building2 } from 'lucide-react';
import { ActivityLog } from '../../types';

export const ActivitiesView: React.FC = () => {
  const { activities, currentBranch, exportReportToCSV } = useRental();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredActivities = activities.filter(a => {
    if (currentBranch !== 'All' && a.branch !== currentBranch) return false;
    if (typeFilter !== 'All' && a.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.description.toLowerCase().includes(q) || a.actor.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExport = () => {
    exportReportToCSV('activity_logs', filteredActivities.map(a => ({
      Timestamp: a.timestamp,
      ActivityType: a.type,
      Description: a.description,
      Operator: a.actor,
      Role: a.role,
      Branch: a.branch
    })));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            <span>Audit & Operational History</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
            Today's Activities & Operator Logs
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident operational ledger recording every reservation, physical handover, return, and payment.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search operational logs by description, driver, or operator..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white cursor-pointer"
        >
          <option value="All">All Activity Types</option>
          <option value="Rental Created">Rental Created</option>
          <option value="Battery Released">Battery Released</option>
          <option value="Battery Returned">Battery Returned</option>
          <option value="Unit Released">Unit Released</option>
          <option value="Unit Returned">Unit Returned</option>
          <option value="Payment Recorded">Payment Recorded</option>
          <option value="Driver Registered">Driver Registered</option>
          <option value="Maintenance Flagged">Maintenance Flagged</option>
        </select>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No activity records match the selected criteria.
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100 text-xs">
            {filteredActivities.map(a => (
              <div key={a.id} className="pt-4 first:pt-0 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      a.type.includes('Released') ? 'bg-blue-100 text-blue-800' :
                      a.type.includes('Returned') ? 'bg-emerald-100 text-emerald-800' :
                      a.type.includes('Payment') ? 'bg-emerald-100 text-emerald-800' :
                      a.type.includes('Flagged') ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {a.type}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {a.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-800 text-sm font-medium">{a.description}</p>
                  <div className="text-[11px] text-slate-400">
                    Logged by <strong className="text-slate-600">{a.actor}</strong> ({a.role}) · {a.branch}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
