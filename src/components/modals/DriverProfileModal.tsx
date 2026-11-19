import React from 'react';
import { useRental } from '../../context/RentalContext';
import { X, User, Phone, Mail, Award, Calendar, Shield, Battery, Car, History, Sparkles } from 'lucide-react';

export const DriverProfileModal: React.FC = () => {
  const { 
    activeDriverProfileModal, 
    setActiveDriverProfileModal, 
    rentals, 
    setActiveRentalDetailModal,
    setCurrentTab
  } = useRental();

  if (!activeDriverProfileModal) return null;

  const driver = activeDriverProfileModal;
  const driverRentals = rentals.filter(r => r.driverId === driver.id);

  const handleStartRentalForDriver = () => {
    setActiveDriverProfileModal(null);
    setCurrentTab('new-rental');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              {driver.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base font-display">{driver.name}</span>
                <span className="text-xs font-mono text-emerald-400 bg-slate-800 px-2 py-0.5 rounded font-medium">
                  {driver.id}
                </span>
              </div>
              <p className="text-xs text-cyan-200">Registered on {driver.registrationDate} · {driver.branch}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveDriverProfileModal(null)}
            className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs / Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Driver Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-center">
              <span className="text-slate-400 text-[11px] block uppercase font-medium">Total Rentals</span>
              <span className="text-2xl font-bold font-mono text-slate-900">{driver.totalRentalsCount}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg text-center">
              <span className="text-emerald-700 text-[11px] block uppercase font-semibold">Loyalty Discount</span>
              <span className="text-2xl font-bold font-mono text-emerald-800">{driver.currentLoyaltyPercent}%</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-lg text-center">
              <span className="text-blue-700 text-[11px] block uppercase font-medium">Active Contract</span>
              <span className="text-sm font-bold font-mono text-blue-900 block mt-1">
                {driver.activeRentalId ? driver.activeRentalId : 'None (Available)'}
              </span>
            </div>
          </div>

          {/* Personal & Contact Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-200 rounded-lg p-4 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                <User className="w-4 h-4 text-slate-500" />
                Driver Credentials
              </h4>
              <div className="space-y-1.5 pt-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">License Number:</span>
                  <span className="font-mono font-medium text-slate-900">{driver.licenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Home Branch:</span>
                  <span className="text-slate-900">{driver.branch}</span>
                </div>
                {driver.notes && (
                  <div className="pt-2 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded">
                    Remarks: {driver.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                <Phone className="w-4 h-4 text-slate-500" />
                Contact & Emergency
              </h4>
              <div className="space-y-1.5 pt-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile Phone:</span>
                  <span className="font-mono font-medium text-slate-900">{driver.contactNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email Address:</span>
                  <span className="text-slate-900">{driver.email}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Emergency Contact:</span>
                  <span className="font-medium text-slate-900">{driver.emergencyContact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Emergency Phone:</span>
                  <span className="font-mono text-slate-900">{driver.emergencyPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty Track Record */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <div className="bg-emerald-50 px-4 py-2.5 flex items-center justify-between border-b border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Loyalty Accrual Record ({driver.currentLoyaltyPercent}% Discount Rate)</span>
              </div>
              <span className="text-[11px] text-emerald-700">Auto-applied at checkout</span>
            </div>
            <div className="p-4 space-y-2">
              {driver.loyaltyHistory.length === 0 ? (
                <p className="text-slate-400 italic text-center py-2">No loyalty events recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {driver.loyaltyHistory.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded bg-slate-50 text-[11px]">
                      <div>
                        <span className="font-semibold text-slate-800">{item.reason}</span>
                        <div className="text-slate-400 text-[10px] flex items-center gap-2 mt-0.5">
                          <span>{item.date}</span>
                          {item.rentalId && <span>· Rental: {item.rentalId}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold ${item.percentChange >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {item.percentChange >= 0 ? `+${item.percentChange}%` : `${item.percentChange}%`}
                        </span>
                        <span className="text-slate-400 text-[10px] block font-mono">Total: {item.resultingPercent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rental History Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <div className="bg-slate-100 px-4 py-2.5 font-semibold text-slate-700 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" />
              <span>Rental History ({driverRentals.length} Records)</span>
            </div>
            <div className="overflow-x-auto">
              {driverRentals.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No rental transactions yet for this driver.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                      <th className="px-3 py-2 font-medium">TRX ID</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Item Code(s)</th>
                      <th className="px-3 py-2 font-medium">Rental Date</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium text-right">Fee</th>
                      <th className="px-3 py-2 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {driverRentals.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2 font-mono font-semibold text-slate-800">{r.id}</td>
                        <td className="px-3 py-2 text-slate-700">{r.rentalType}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-600">
                          {r.batteryCode || ''} {r.unitCode ? `· ${r.unitCode}` : ''}
                        </td>
                        <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">{r.rentalDate.split(' ')[0]}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            r.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                            r.status === 'Reserved' ? 'bg-amber-100 text-amber-800' :
                            r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-right font-medium">₱{r.totalAmountDue.toFixed(2)}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => {
                              setActiveDriverProfileModal(null);
                              setActiveRentalDetailModal(r);
                            }}
                            className="px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-200 rounded font-medium cursor-pointer"
                          >
                            View
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

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setActiveDriverProfileModal(null)}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleStartRentalForDriver}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Rental For {driver.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
