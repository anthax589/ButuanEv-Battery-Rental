import React, { useState, useMemo } from 'react';
import { useRental } from '../../context/RentalContext';
import { 
  Users, 
  Search, 
  UserPlus, 
  Award, 
  Calendar, 
  Phone, 
  Eye, 
  Edit3, 
  Plus, 
  X,
  Download,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Driver, BranchName } from '../../types';

export const DriverListView: React.FC = () => {
  const { 
    drivers, 
    currentBranch, 
    setActiveDriverProfileModal, 
    setCurrentTab, 
    registerDriver, 
    updateDriver, 
    exportReportToCSV 
  } = useRental();

  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // New Driver Form state
  const [newDriver, setNewDriver] = useState({
    name: '',
    contactNumber: '',
    email: '',
    licenseNumber: '',
    branch: (currentBranch === 'All' ? 'Branch 1 - Main Hub' : currentBranch) as BranchName,
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  });

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      if (currentBranch !== 'All' && d.branch !== currentBranch) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.contactNumber.includes(q) ||
          d.licenseNumber.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [drivers, currentBranch, searchQuery]);

  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.contactNumber || !newDriver.licenseNumber) return;

    registerDriver(newDriver);
    setShowRegisterModal(false);
    setNewDriver({
      name: '',
      contactNumber: '',
      email: '',
      licenseNumber: '',
      branch: (currentBranch === 'All' ? 'Branch 1 - Main Hub' : currentBranch) as BranchName,
      emergencyContact: '',
      emergencyPhone: '',
      notes: ''
    });
  };

  const handleUpdateDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;
    updateDriver(editingDriver.id, editingDriver);
    setEditingDriver(null);
  };

  const handleExport = () => {
    exportReportToCSV('drivers_directory', filteredDrivers.map(d => ({
      DriverID: d.id,
      FullName: d.name,
      Phone: d.contactNumber,
      Email: d.email,
      License: d.licenseNumber,
      Branch: d.branch,
      TotalRentals: d.totalRentalsCount,
      LoyaltyPercent: `${d.currentLoyaltyPercent}%`,
      ActiveRental: d.activeRentalId || 'None',
      RegisteredOn: d.registrationDate,
      EmergencyContact: `${d.emergencyContact} (${d.emergencyPhone})`
    })));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Driver Directory & Profiles</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
            Registered Drivers ({drivers.length} Members)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fast driver identification, contact records, rental history, and automatic customer loyalty discount tracking.
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
            onClick={() => setShowRegisterModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Driver</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Driver Name, DRV ID, Mobile Phone, or License Number..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {filteredDrivers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No registered drivers matching your query.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <th className="px-4 py-3">Driver ID</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Contact Number</th>
                  <th className="px-4 py-3">License No.</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Active Rental</th>
                  <th className="px-4 py-3 text-center">Total Rentals</th>
                  <th className="px-4 py-3 text-center">Loyalty Discount</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrivers.map(d => {
                  const hasActive = Boolean(d.activeRentalId);

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        {d.id}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {d.name}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Reg: {d.registrationDate}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {d.contactNumber}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {d.licenseNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-[130px]">
                        {d.branch.replace(' - Main Hub', '').replace(' - Metro Station', '')}
                      </td>
                      <td className="px-4 py-3">
                        {hasActive ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 font-mono">
                            {d.activeRentalId}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None (Available)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                        {d.totalRentalsCount}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                          {d.currentLoyaltyPercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActiveDriverProfileModal(d)}
                            title="View Profile & Rental History"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingDriver(d)}
                            title="Edit Information"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
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

      {/* Register Driver Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-300" />
                <span className="font-bold text-base font-display">New Driver Registration</span>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 text-slate-300 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Driver Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    placeholder="e.g. Roberto Gomez"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile Contact *</label>
                  <input
                    type="tel"
                    required
                    value={newDriver.contactNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, contactNumber: e.target.value })}
                    placeholder="e.g. 0917-882-9901"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Driver License Number *</label>
                  <input
                    type="text"
                    required
                    value={newDriver.licenseNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                    placeholder="e.g. N01-18-994821"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned Home Branch</label>
                  <select
                    value={newDriver.branch}
                    onChange={(e) => setNewDriver({ ...newDriver, branch: e.target.value as BranchName })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Branch 1 - Main Hub">Branch 1 - Main Hub</option>
                    <option value="Branch 2 - Metro Station">Branch 2 - Metro Station</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    value={newDriver.emergencyContact}
                    onChange={(e) => setNewDriver({ ...newDriver, emergencyContact: e.target.value })}
                    placeholder="e.g. Gina Gomez (Spouse)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={newDriver.emergencyPhone}
                    onChange={(e) => setNewDriver({ ...newDriver, emergencyPhone: e.target.value })}
                    placeholder="e.g. 0917-882-9900"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Operating Remarks</label>
                <input
                  type="text"
                  value={newDriver.notes}
                  onChange={(e) => setNewDriver({ ...newDriver, notes: e.target.value })}
                  placeholder="e.g. Delivery rider for local grocery store."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg cursor-pointer shadow-xs"
                >
                  Save Driver Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {editingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <span className="font-bold text-base font-display">Edit Driver: {editingDriver.name}</span>
              <button
                onClick={() => setEditingDriver(null)}
                className="p-1 text-slate-300 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDriverSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Driver Name</label>
                <input
                  type="text"
                  value={editingDriver.name}
                  onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={editingDriver.contactNumber}
                    onChange={(e) => setEditingDriver({ ...editingDriver, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">License Number</label>
                  <input
                    type="text"
                    value={editingDriver.licenseNumber}
                    onChange={(e) => setEditingDriver({ ...editingDriver, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={editingDriver.emergencyContact}
                    onChange={(e) => setEditingDriver({ ...editingDriver, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={editingDriver.emergencyPhone}
                    onChange={(e) => setEditingDriver({ ...editingDriver, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Internal Notes</label>
                <input
                  type="text"
                  value={editingDriver.notes || ''}
                  onChange={(e) => setEditingDriver({ ...editingDriver, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDriver(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
