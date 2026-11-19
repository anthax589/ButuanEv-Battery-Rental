import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  BatteryItem, 
  UnitItem, 
  Driver, 
  RentalTransaction, 
  PaymentRecord, 
  ActivityLog, 
  SystemSettings, 
  UserRole, 
  BranchName, 
  RentalType,
  PaymentMethod,
  BatteryCondition,
  UnitCondition,
  BatteryStatus,
  UnitStatus
} from '../types';
import { 
  defaultSettings, 
  generateInitialBatteries, 
  initialUnits, 
  initialDrivers, 
  initialRentals, 
  initialPayments, 
  initialActivities 
} from '../data/mockData';

interface RentalContextType {
  // Data
  batteries: BatteryItem[];
  units: UnitItem[];
  drivers: Driver[];
  rentals: RentalTransaction[];
  payments: PaymentRecord[];
  activities: ActivityLog[];
  settings: SystemSettings;
  
  // Navigation & User State
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: UserRole;
  isAuthenticated: boolean;
  signIn: (role: UserRole, branch: 'All' | BranchName) => void;
  signOut: () => void;
  currentBranch: 'All' | BranchName;
  setCurrentBranch: (branch: 'All' | BranchName) => void;
  currentUser: string;
  
  // Modals
  activeVoucherModal: RentalTransaction | null;
  setActiveVoucherModal: (rental: RentalTransaction | null) => void;
  activeReceiptModal: PaymentRecord | null;
  setActiveReceiptModal: (payment: PaymentRecord | null) => void;
  activeRentalDetailModal: RentalTransaction | null;
  setActiveRentalDetailModal: (rental: RentalTransaction | null) => void;
  activeDriverProfileModal: Driver | null;
  setActiveDriverProfileModal: (driver: Driver | null) => void;
  
  // Workflows
  createRental: (data: {
    driverId: string;
    rentalType: RentalType;
    batteryId?: string;
    unitId?: string;
    rentalDays: number;
    expectedReturnDate: string;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    remarks?: string;
  }) => { success: boolean; rental?: RentalTransaction; error?: string };

  releaseBattery: (data: {
    voucherNumber: string;
    startingSoc: number;
    notes?: string;
  }) => { success: boolean; error?: string; rental?: RentalTransaction };

  returnBattery: (data: {
    batteryCode: string;
    endingSoc: number;
    condition: BatteryCondition;
    damageReport?: string;
    remarks?: string;
  }) => { success: boolean; error?: string; rental?: RentalTransaction; loyaltyGained?: number };

  releaseUnit: (data: {
    voucherNumber: string;
    conditionNotes?: string;
  }) => { success: boolean; error?: string; rental?: RentalTransaction };

  returnUnit: (data: {
    unitCode: string;
    condition: UnitCondition;
    damageReport?: string;
    remarks?: string;
  }) => { success: boolean; error?: string; rental?: RentalTransaction };

  recordPayment: (data: {
    transactionId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    notes?: string;
  }) => { success: boolean; error?: string; payment?: PaymentRecord };

  registerDriver: (driverData: {
    name: string;
    contactNumber: string;
    email?: string;
    licenseNumber: string;
    branch: BranchName;
    emergencyContact: string;
    emergencyPhone: string;
    notes?: string;
  }) => Driver;

  updateDriver: (id: string, updates: Partial<Driver>) => void;
  updateBatteryStatus: (id: string, status: BatteryStatus, condition?: BatteryCondition, damageNotes?: string) => void;
  sendBatteryToCharging: (id: string) => void;
  updateUnitStatus: (id: string, status: UnitStatus, condition?: UnitCondition, remarks?: string) => void;
  flagRentalIssue: (rentalId: string, reason: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetToDefaultData: () => void;
  exportReportToCSV: (filename: string, rows: Record<string, any>[]) => void;
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'bxuev_rental_system_v1_';

export const RentalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or defaults
  const [batteries, setBatteries] = useState<BatteryItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'batteries');
    return saved ? JSON.parse(saved) : generateInitialBatteries();
  });

  const [units, setUnits] = useState<UnitItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'units');
    return saved ? JSON.parse(saved) : initialUnits;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'drivers');
    return saved ? JSON.parse(saved) : initialDrivers;
  });

  const [rentals, setRentals] = useState<RentalTransaction[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'rentals');
    return saved ? JSON.parse(saved) : initialRentals;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // User and navigation state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('Cashier');
  const [currentBranch, setCurrentBranch] = useState<'All' | BranchName>('All');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signIn = (role: UserRole, branch: 'All' | BranchName) => {
    setCurrentRole(role);
    setCurrentBranch(branch);
    setCurrentTab(role === 'Battery Releasing Officer' ? 'active-rentals' : 'dashboard');
    setIsAuthenticated(true);
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setCurrentTab('dashboard');
    setCurrentBranch('All');
  };

  // Compute realistic user name based on role
  const currentUser = currentRole === 'Administrator' ? 'Alex Rivera (Admin)' :
                      currentRole === 'Cashier' ? 'Maria Santos (Cashier)' :
                      currentRole === 'Battery Releasing Officer' ? 'Danilo Cruz (Releasing Officer)' :
                      'Leah Garcia (Branch Personnel)';

  // Modals
  const [activeVoucherModal, setActiveVoucherModal] = useState<RentalTransaction | null>(null);
  const [activeReceiptModal, setActiveReceiptModal] = useState<PaymentRecord | null>(null);
  const [activeRentalDetailModal, setActiveRentalDetailModal] = useState<RentalTransaction | null>(null);
  const [activeDriverProfileModal, setActiveDriverProfileModal] = useState<Driver | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'batteries', JSON.stringify(batteries));
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'units', JSON.stringify(units));
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'drivers', JSON.stringify(drivers));
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'rentals', JSON.stringify(rentals));
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'payments', JSON.stringify(payments));
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'activities', JSON.stringify(activities));
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [batteries, units, drivers, rentals, payments, activities, settings]);

  const addActivity = (type: ActivityLog['type'], description: string, relatedId?: string, branch?: BranchName) => {
    const newAct: ActivityLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      description,
      actor: currentUser.split(' ')[0] + ' ' + (currentUser.split(' ')[1] || ''),
      role: currentRole,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      branch: branch || (currentBranch === 'All' ? 'Branch 1 - Main Hub' : currentBranch),
      relatedId
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // 1. Create Rental Workflow
  const createRental = (data: {
    driverId: string;
    rentalType: RentalType;
    batteryId?: string;
    unitId?: string;
    rentalDays: number;
    expectedReturnDate: string;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    remarks?: string;
  }) => {
    const driver = drivers.find(d => d.id === data.driverId);
    if (!driver) return { success: false, error: 'Driver profile not found.' };

    const selectedBattery = data.batteryId ? batteries.find(b => b.id === data.batteryId) : undefined;
    const selectedUnit = data.unitId ? units.find(u => u.id === data.unitId) : undefined;

    if (data.rentalType === 'Battery' || data.rentalType === 'Combined') {
      if (!selectedBattery) return { success: false, error: 'Please select an available battery.' };
      if (selectedBattery.status !== 'Available') return { success: false, error: `Battery ${selectedBattery.code} is currently ${selectedBattery.status}.` };
    }

    if (data.rentalType === 'Unit' || data.rentalType === 'Combined') {
      if (!selectedUnit) return { success: false, error: 'Please select an available EV unit.' };
      if (selectedUnit.status !== 'Available') return { success: false, error: `Unit ${selectedUnit.code} is currently ${selectedUnit.status}.` };
    }

    // Rate calculations
    let baseRate = 0;
    if (data.rentalType === 'Battery' && selectedBattery) {
      baseRate = settings.batteryDailyRate * data.rentalDays;
    } else if (data.rentalType === 'Unit' && selectedUnit) {
      const daily = selectedUnit.unitType === 'E-bike' ? settings.ebikeDailyRate :
                    selectedUnit.unitType === 'E-bus' ? settings.ebusDailyRate : settings.ecargoDailyRate;
      baseRate = daily * data.rentalDays;
    } else if (data.rentalType === 'Combined' && selectedBattery && selectedUnit) {
      const batDaily = settings.batteryDailyRate;
      const unitDaily = selectedUnit.unitType === 'E-bike' ? settings.ebikeDailyRate :
                        selectedUnit.unitType === 'E-bus' ? settings.ebusDailyRate : settings.ecargoDailyRate;
      const subtotal = (batDaily + unitDaily) * data.rentalDays;
      const bundleDiscount = subtotal * (settings.bundleDiscountPercent / 100);
      baseRate = subtotal - bundleDiscount;
    }

    // Driver loyalty discount
    const loyaltyDiscountAmount = Number(((baseRate * driver.currentLoyaltyPercent) / 100).toFixed(2));
    const totalAmountDue = Number((baseRate - loyaltyDiscountAmount).toFixed(2));
    const amountPaid = Math.min(totalAmountDue, Math.max(0, data.amountPaid));
    const remainingBalance = Number((totalAmountDue - amountPaid).toFixed(2));
    const paymentStatus = remainingBalance <= 0 ? 'Paid' : amountPaid > 0 ? 'Partially Paid' : 'Unpaid';

    const branch = selectedBattery?.branch || selectedUnit?.branch || driver.branch;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const rentalId = `TRX-${new Date().getFullYear()}-0${randomSuffix}`;
    const voucherNumber = `VCH-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRental: RentalTransaction = {
      id: rentalId,
      voucherNumber,
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.contactNumber,
      rentalType: data.rentalType,
      batteryId: selectedBattery?.id,
      batteryCode: selectedBattery?.code,
      batteryType: selectedBattery?.batteryType,
      unitId: selectedUnit?.id,
      unitCode: selectedUnit?.code,
      unitType: selectedUnit?.unitType,
      unitModel: selectedUnit?.modelName,
      branch,
      rentalDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      expectedReturnDate: data.expectedReturnDate,
      status: 'Reserved', // Crucial rule: Not Active until physical release by releasing officer!
      baseRentalFee: baseRate,
      loyaltyDiscountAmount,
      totalAmountDue,
      amountPaid,
      remainingBalance,
      paymentStatus,
      paymentMethod: data.paymentMethod,
      paymentReference: data.referenceNumber,
      cashierName: currentUser,
      remarks: data.remarks || 'Standard rental contract issued.'
    };

    // Update Battery Status to Reserved
    if (selectedBattery) {
      setBatteries(prev => prev.map(b => b.id === selectedBattery.id ? {
        ...b,
        status: 'Reserved',
        currentDriverId: driver.id,
        currentDriverName: driver.name,
        currentRentalId: rentalId,
        lastUpdated: 'Just now'
      } : b));
    }

    // Update Unit Status to Reserved
    if (selectedUnit) {
      setUnits(prev => prev.map(u => u.id === selectedUnit.id ? {
        ...u,
        status: 'Reserved',
        currentDriverId: driver.id,
        currentDriverName: driver.name,
        currentRentalId: rentalId
      } : u));
    }

    // Update Driver Active Rental
    setDrivers(prev => prev.map(d => d.id === driver.id ? {
      ...d,
      activeRentalId: rentalId
    } : d));

    // Record initial payment record if paid
    if (amountPaid > 0) {
      const payRecord: PaymentRecord = {
        id: `PAY-${Date.now().toString().slice(-6)}`,
        transactionId: rentalId,
        voucherNumber,
        driverId: driver.id,
        driverName: driver.name,
        rentalType: data.rentalType,
        amountDue: totalAmountDue,
        amountPaid,
        balance: remainingBalance,
        paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        collector: currentUser,
        paymentStatus,
        branch,
        notes: remainingBalance === 0 ? 'Full payment received at reservation checkout' : `Downpayment recorded. Remaining balance: ₱${remainingBalance}`
      };
      setPayments(prev => [payRecord, ...prev]);
    }

    setRentals(prev => [newRental, ...prev]);
    addActivity('Rental Created', `Created rental reservation ${voucherNumber} for ${driver.name} (${data.rentalType})`, rentalId, branch);

    // Open voucher modal immediately so employee can print or present to driver
    setActiveVoucherModal(newRental);

    return { success: true, rental: newRental };
  };

  // 2. Battery Release Workflow
  const releaseBattery = (data: {
    voucherNumber: string;
    startingSoc: number;
    notes?: string;
  }) => {
    const trimmed = data.voucherNumber.trim().toUpperCase();
    const rental = rentals.find(r => r.voucherNumber.toUpperCase() === trimmed || r.id.toUpperCase() === trimmed);
    if (!rental) return { success: false, error: `No rental transaction found for voucher "${data.voucherNumber}".` };
    
    if (rental.status === 'Active') {
      return { success: false, error: `This rental (${rental.voucherNumber}) has already been released on ${rental.releaseDateTime}.` };
    }
    if (rental.status === 'Completed' || rental.status === 'Cancelled') {
      return { success: false, error: `This rental is already ${rental.status.toLowerCase()}. Cannot release.` };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Update Rental
    const updatedRental: RentalTransaction = {
      ...rental,
      status: 'Active',
      startingSoc: data.startingSoc,
      releaseOfficer: currentUser,
      releaseDateTime: now,
      remarks: data.notes ? `${rental.remarks || ''} | Release note: ${data.notes}` : rental.remarks
    };

    setRentals(prev => prev.map(r => r.id === rental.id ? updatedRental : r));

    // Update Battery
    if (rental.batteryId) {
      setBatteries(prev => prev.map(b => {
        if (b.id === rental.batteryId) {
          const newHistory = [
            {
              id: `log-${Date.now()}`,
              date: now,
              type: 'rental_start' as const,
              soc: data.startingSoc,
              driverName: rental.driverName,
              transactionId: rental.id,
              notes: `Released at ${data.startingSoc}% SOC by ${currentUser}`,
              recordedBy: currentUser
            },
            ...b.socHistory
          ];
          return {
            ...b,
            status: 'Rented',
            soc: data.startingSoc,
            releaseDateTime: now,
            currentDriverId: rental.driverId,
            currentDriverName: rental.driverName,
            currentRentalId: rental.id,
            lastUpdated: 'Just now',
            socHistory: newHistory
          };
        }
        return b;
      }));
    }

    // Update Unit if combined
    if (rental.unitId) {
      setUnits(prev => prev.map(u => u.id === rental.unitId ? {
        ...u,
        status: 'Rented',
        currentDriverId: rental.driverId,
        currentDriverName: rental.driverName,
        currentRentalId: rental.id
      } : u));
    }

    addActivity('Battery Released', `Released ${rental.batteryCode || 'Battery'} for voucher ${rental.voucherNumber} to ${rental.driverName}. Starting SOC: ${data.startingSoc}%`, rental.id, rental.branch);

    return { success: true, rental: updatedRental };
  };

  // 3. Battery Return Workflow
  const returnBattery = (data: {
    batteryCode: string;
    endingSoc: number;
    condition: BatteryCondition;
    damageReport?: string;
    remarks?: string;
  }) => {
    const trimmed = data.batteryCode.trim().toUpperCase();
    const battery = batteries.find(b => b.code.toUpperCase() === trimmed || b.id.toUpperCase() === trimmed);
    if (!battery) return { success: false, error: `Battery code "${data.batteryCode}" not found in inventory.` };

    const rental = rentals.find(r => r.batteryId === battery.id && r.status === 'Active');
    if (!rental) {
      return { success: false, error: `Battery ${battery.code} is currently ${battery.status} with no active rental on record.` };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Calculate loyalty points/percentage
    let loyaltyChange = settings.loyaltyRatePerRental; // default 1.0%
    let loyaltyReason = 'Standard rental completed on-time';

    if (data.endingSoc >= settings.bonusSocThreshold && data.condition === 'Good') {
      loyaltyChange += settings.bonusLoyaltyPercent;
      loyaltyReason = `Returned in good condition with SOC >= ${settings.bonusSocThreshold}% (+${loyaltyChange}%)`;
    } else if (data.endingSoc < settings.criticalLowSocThreshold) {
      loyaltyChange = Math.max(0, loyaltyChange - 0.5);
      loyaltyReason = `Returned below critical 5% SOC (+${loyaltyChange}%)`;
    }

    if (data.condition === 'Damaged') {
      loyaltyChange = 0;
      loyaltyReason = 'Damaged item return - loyalty bonus suspended';
    }

    // Determine post-return battery status
    let nextBatteryStatus: BatteryStatus = 'Available';
    if (data.condition === 'Damaged') {
      nextBatteryStatus = 'Damaged';
    } else if (data.condition === 'Needs Inspection') {
      nextBatteryStatus = 'Maintenance';
    } else if (data.endingSoc < 85) {
      nextBatteryStatus = 'Charging';
    }

    // Update Battery
    setBatteries(prev => prev.map(b => {
      if (b.id === battery.id) {
        const newHistory = [
          {
            id: `log-${Date.now()}`,
            date: now,
            type: 'rental_end' as const,
            soc: data.endingSoc,
            driverName: rental.driverName,
            transactionId: rental.id,
            notes: `Returned with ${data.endingSoc}% SOC. Condition: ${data.condition}. ${data.damageReport || ''}`,
            recordedBy: currentUser
          },
          ...b.socHistory
        ];
        return {
          ...b,
          status: nextBatteryStatus,
          condition: data.condition,
          soc: data.endingSoc,
          returnDateTime: now,
          currentDriverId: undefined,
          currentDriverName: undefined,
          currentRentalId: undefined,
          damageNotes: data.damageReport || b.damageNotes,
          lastUpdated: 'Just now',
          socHistory: newHistory
        };
      }
      return b;
    }));

    // Update Driver (add completed count + loyalty update)
    const driver = drivers.find(d => d.id === rental.driverId);
    if (driver) {
      const newLoyaltyPercent = Number(Math.min(20, driver.currentLoyaltyPercent + loyaltyChange).toFixed(1));
      const loyaltyEntry = {
        id: `lh-${Date.now()}`,
        date: now.split(' ')[0],
        rentalId: rental.id,
        percentChange: loyaltyChange,
        reason: loyaltyReason,
        resultingPercent: newLoyaltyPercent
      };

      setDrivers(prev => prev.map(d => d.id === driver.id ? {
        ...d,
        totalRentalsCount: d.totalRentalsCount + 1,
        activeRentalId: undefined,
        currentLoyaltyPercent: newLoyaltyPercent,
        loyaltyHistory: [loyaltyEntry, ...d.loyaltyHistory]
      } : d));
    }

    // Update Rental
    const updatedRental: RentalTransaction = {
      ...rental,
      status: 'Completed',
      actualReturnDate: now,
      endingSoc: data.endingSoc,
      returnOfficer: currentUser,
      returnDateTime: now,
      returnCondition: data.condition,
      damageReport: data.damageReport,
      remarks: data.remarks ? `${rental.remarks || ''} | Return: ${data.remarks}` : rental.remarks
    };

    setRentals(prev => prev.map(r => r.id === rental.id ? updatedRental : r));

    // If unit was rented together and not returned separately, also free the unit
    if (rental.unitId) {
      setUnits(prev => prev.map(u => u.id === rental.unitId ? {
        ...u,
        status: data.condition === 'Damaged' ? 'Maintenance' : 'Available',
        currentDriverId: undefined,
        currentDriverName: undefined,
        currentRentalId: undefined
      } : u));
    }

    addActivity('Battery Returned', `Received ${battery.code} from ${rental.driverName}. Ending SOC: ${data.endingSoc}%. Status set to ${nextBatteryStatus}.`, rental.id, rental.branch);

    return { success: true, rental: updatedRental, loyaltyGained: loyaltyChange };
  };

  // 4. Unit Release Workflow
  const releaseUnit = (data: { voucherNumber: string; conditionNotes?: string }) => {
    const trimmed = data.voucherNumber.trim().toUpperCase();
    const rental = rentals.find(r => r.voucherNumber.toUpperCase() === trimmed || r.id.toUpperCase() === trimmed);
    if (!rental) return { success: false, error: `Voucher "${data.voucherNumber}" not found.` };
    if (!rental.unitId) return { success: false, error: 'This rental does not include an EV unit.' };

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updatedRental: RentalTransaction = {
      ...rental,
      status: 'Active',
      releaseOfficer: currentUser,
      releaseDateTime: now,
      remarks: data.conditionNotes ? `${rental.remarks || ''} | Unit release: ${data.conditionNotes}` : rental.remarks
    };

    setRentals(prev => prev.map(r => r.id === rental.id ? updatedRental : r));

    setUnits(prev => prev.map(u => u.id === rental.unitId ? {
      ...u,
      status: 'Rented',
      currentDriverId: rental.driverId,
      currentDriverName: rental.driverName,
      currentRentalId: rental.id
    } : u));

    addActivity('Unit Released', `Released EV Unit ${rental.unitCode} for voucher ${rental.voucherNumber} to ${rental.driverName}.`, rental.id, rental.branch);

    return { success: true, rental: updatedRental };
  };

  // 5. Unit Return Workflow
  const returnUnit = (data: { unitCode: string; condition: UnitCondition; damageReport?: string; remarks?: string }) => {
    const trimmed = data.unitCode.trim().toUpperCase();
    const unit = units.find(u => u.code.toUpperCase() === trimmed || u.id.toUpperCase() === trimmed);
    if (!unit) return { success: false, error: `Unit "${data.unitCode}" not found.` };

    const rental = rentals.find(r => r.unitId === unit.id && r.status === 'Active');
    if (!rental) return { success: false, error: `Unit ${unit.code} does not have an active rental.` };

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const nextStatus: UnitStatus = (data.condition === 'Maintenance Required' || data.condition === 'Fair') ? 'Maintenance' : 'Available';

    setUnits(prev => prev.map(u => u.id === unit.id ? {
      ...u,
      status: nextStatus,
      condition: data.condition,
      currentDriverId: undefined,
      currentDriverName: undefined,
      currentRentalId: undefined,
      remarks: data.damageReport || data.remarks || u.remarks
    } : u));

    const updatedRental: RentalTransaction = {
      ...rental,
      status: 'Completed',
      actualReturnDate: now,
      returnOfficer: currentUser,
      returnDateTime: now,
      returnCondition: data.condition,
      damageReport: data.damageReport,
      remarks: data.remarks ? `${rental.remarks || ''} | Unit return: ${data.remarks}` : rental.remarks
    };

    setRentals(prev => prev.map(r => r.id === rental.id ? updatedRental : r));

    // Also close driver active rental
    setDrivers(prev => prev.map(d => d.id === rental.driverId ? {
      ...d,
      activeRentalId: undefined,
      totalRentalsCount: d.totalRentalsCount + 1
    } : d));

    addActivity('Unit Returned', `Received unit ${unit.code} from ${rental.driverName}. Status: ${nextStatus}.`, rental.id, rental.branch);

    return { success: true, rental: updatedRental };
  };

  // 6. Record Payment
  const recordPayment = (data: {
    transactionId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    notes?: string;
  }) => {
    const rental = rentals.find(r => r.id === data.transactionId || r.voucherNumber === data.transactionId);
    if (!rental) return { success: false, error: 'Rental transaction not found.' };

    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) return { success: false, error: 'Please enter a valid payment amount.' };

    const newAmountPaid = Number((rental.amountPaid + amount).toFixed(2));
    const newRemainingBalance = Number(Math.max(0, rental.totalAmountDue - newAmountPaid).toFixed(2));
    const newPaymentStatus: RentalTransaction['paymentStatus'] = newRemainingBalance <= 0 ? 'Paid' : 'Partially Paid';

    const updatedRental: RentalTransaction = {
      ...rental,
      amountPaid: newAmountPaid,
      remainingBalance: newRemainingBalance,
      paymentStatus: newPaymentStatus
    };

    setRentals(prev => prev.map(r => r.id === rental.id ? updatedRental : r));

    const paymentRecord: PaymentRecord = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      transactionId: rental.id,
      voucherNumber: rental.voucherNumber,
      driverId: rental.driverId,
      driverName: rental.driverName,
      rentalType: rental.rentalType,
      amountDue: rental.totalAmountDue,
      amountPaid: amount,
      balance: newRemainingBalance,
      paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      collector: currentUser,
      paymentStatus: newPaymentStatus,
      branch: rental.branch,
      notes: data.notes || (newRemainingBalance === 0 ? 'Account settled in full.' : `Remaining balance: ₱${newRemainingBalance}`)
    };

    setPayments(prev => [paymentRecord, ...prev]);
    addActivity('Payment Recorded', `Received ₱${amount.toFixed(2)} via ${data.paymentMethod} for ${rental.voucherNumber} (${newPaymentStatus})`, rental.id, rental.branch);

    // Open receipt modal automatically
    setActiveReceiptModal(paymentRecord);

    return { success: true, payment: paymentRecord };
  };

  // 7. Register Driver
  const registerDriver = (driverData: {
    name: string;
    contactNumber: string;
    email?: string;
    licenseNumber: string;
    branch: BranchName;
    emergencyContact: string;
    emergencyPhone: string;
    notes?: string;
  }) => {
    const newId = `DRV-${1000 + drivers.length + 1}`;
    const newDriver: Driver = {
      id: newId,
      name: driverData.name.trim(),
      contactNumber: driverData.contactNumber.trim(),
      email: driverData.email?.trim() || `${driverData.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      licenseNumber: driverData.licenseNumber.trim(),
      registrationDate: new Date().toISOString().split('T')[0],
      branch: driverData.branch,
      emergencyContact: driverData.emergencyContact,
      emergencyPhone: driverData.emergencyPhone,
      totalRentalsCount: 0,
      currentLoyaltyPercent: 0,
      loyaltyHistory: [],
      notes: driverData.notes
    };

    setDrivers(prev => [newDriver, ...prev]);
    addActivity('Driver Registered', `Enrolled new driver ${newDriver.name} (${newDriver.id})`, newDriver.id, driverData.branch);

    return newDriver;
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const updateBatteryStatus = (id: string, status: BatteryStatus, condition?: BatteryCondition, damageNotes?: string) => {
    setBatteries(prev => prev.map(b => b.id === id ? {
      ...b,
      status,
      condition: condition || b.condition,
      damageNotes: damageNotes !== undefined ? damageNotes : b.damageNotes,
      lastUpdated: 'Just now'
    } : b));
    addActivity('Inventory Update', `Updated battery status to ${status}`, id);
  };

  const sendBatteryToCharging = (id: string) => {
    setBatteries(prev => prev.map(b => b.id === id ? {
      ...b,
      status: 'Charging',
      lastUpdated: 'Just now',
      socHistory: [
        {
          id: `log-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'charge_cycle',
          soc: b.soc,
          notes: 'Dispatched to Smart Charging Bay',
          recordedBy: currentUser
        },
        ...b.socHistory
      ]
    } : b));
    addActivity('Inventory Update', `Dispatched battery to charging dock`, id);
  };

  const updateUnitStatus = (id: string, status: UnitStatus, condition?: UnitCondition, remarks?: string) => {
    setUnits(prev => prev.map(u => u.id === id ? {
      ...u,
      status,
      condition: condition || u.condition,
      remarks: remarks !== undefined ? remarks : u.remarks
    } : u));
    addActivity('Inventory Update', `Updated EV unit status to ${status}`, id);
  };

  const flagRentalIssue = (rentalId: string, reason: string) => {
    setRentals(prev => prev.map(r => r.id === rentalId ? {
      ...r,
      flaggedIssue: {
        isFlagged: true,
        reason,
        flaggedBy: currentUser,
        flaggedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      }
    } : r));
    addActivity('Maintenance Flagged', `Flagged issue on rental ${rentalId}: ${reason}`, rentalId);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaultData = () => {
    setBatteries(generateInitialBatteries());
    setUnits(initialUnits);
    setDrivers(initialDrivers);
    setRentals(initialRentals);
    setPayments(initialPayments);
    setActivities(initialActivities);
    setSettings(defaultSettings);
    localStorage.clear();
  };

  const exportReportToCSV = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(fieldName => {
          let val = row[fieldName];
          if (val === undefined || val === null) val = '';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(',')
      )
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <RentalContext.Provider value={{
      batteries,
      units,
      drivers,
      rentals,
      payments,
      activities,
      settings,
      currentTab,
      setCurrentTab,
      currentRole,
      isAuthenticated,
      signIn,
      signOut,
      currentBranch,
      setCurrentBranch,
      currentUser,
      activeVoucherModal,
      setActiveVoucherModal,
      activeReceiptModal,
      setActiveReceiptModal,
      activeRentalDetailModal,
      setActiveRentalDetailModal,
      activeDriverProfileModal,
      setActiveDriverProfileModal,
      createRental,
      releaseBattery,
      returnBattery,
      releaseUnit,
      returnUnit,
      recordPayment,
      registerDriver,
      updateDriver,
      updateBatteryStatus,
      sendBatteryToCharging,
      updateUnitStatus,
      flagRentalIssue,
      updateSettings,
      resetToDefaultData,
      exportReportToCSV
    }}>
      {children}
    </RentalContext.Provider>
  );
};

export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) throw new Error('useRental must be used within a RentalProvider');
  return context;
};
