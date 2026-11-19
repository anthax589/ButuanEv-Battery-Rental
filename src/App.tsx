/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RentalProvider, useRental } from './context/RentalContext';
import { canAccessTab, defaultTabForRole } from './auth/rolePermissions';
import { LoginView } from './components/auth/LoginView';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { ActivitiesView } from './components/dashboard/ActivitiesView';
import { NewRentalWizard } from './components/rentals/NewRentalWizard';
import { ActiveRentalsView } from './components/rentals/ActiveRentalsView';
import { RentalHistoryView } from './components/rentals/RentalHistoryView';
import { BatteryReleaseView } from './components/rentals/BatteryReleaseView';
import { BatteryReturnView } from './components/rentals/BatteryReturnView';
import { UnitReleaseReturnView } from './components/rentals/UnitReleaseReturnView';
import { BatteryInventoryView } from './components/inventory/BatteryInventoryView';
import { UnitInventoryView } from './components/inventory/UnitInventoryView';
import { SocMonitoringView } from './components/inventory/SocMonitoringView';
import { MaintenanceView } from './components/inventory/MaintenanceView';
import { DriverListView } from './components/drivers/DriverListView';
import { PaymentsView } from './components/payments/PaymentsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { VoucherModal } from './components/modals/VoucherModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { RentalDetailModal } from './components/modals/RentalDetailModal';
import { DriverProfileModal } from './components/modals/DriverProfileModal';

const AppContent: React.FC = () => {
  const { currentTab, currentRole, isAuthenticated, signIn, setCurrentTab } = useRental();
  const [mobileOpen, setMobileOpen] = useState(false);
  const allowedTab = canAccessTab(currentRole, currentTab);

  useEffect(() => {
    if (isAuthenticated && !allowedTab) {
      setCurrentTab(defaultTabForRole(currentRole));
    }
  }, [allowedTab, currentRole, isAuthenticated, setCurrentTab]);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'dashboard-activities':
        return <ActivitiesView />;
      case 'new-rental':
        return <NewRentalWizard />;
      case 'active-rentals':
        return <ActiveRentalsView />;
      case 'rental-history':
        return <RentalHistoryView />;
      case 'battery-release':
        return <BatteryReleaseView />;
      case 'battery-return':
        return <BatteryReturnView />;
      case 'unit-release-return':
        return <UnitReleaseReturnView />;
      case 'batteries':
      case 'inventory-summary':
        return <BatteryInventoryView />;
      case 'units':
        return <UnitInventoryView />;
      case 'soc-monitoring':
        return <SocMonitoringView />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'drivers':
      case 'register-driver':
        return <DriverListView />;
      case 'payments':
      case 'payment-reports':
        return currentTab === 'payments' ? <PaymentsView /> : <ReportsView />;
      case 'rental-reports':
      case 'inventory-reports':
      case 'loyalty-reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  if (!isAuthenticated) {
    return <LoginView onSignIn={signIn} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header setMobileOpen={setMobileOpen} />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {allowedTab ? renderActiveView() : <DashboardView />}
        </main>
      </div>

      {/* Global Modals */}
      <VoucherModal />
      <ReceiptModal />
      <RentalDetailModal />
      <DriverProfileModal />
    </div>
  );
};

export default function App() {
  return (
    <RentalProvider>
      <AppContent />
    </RentalProvider>
  );
}
