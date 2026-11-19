export type UserRole = 'Administrator' | 'Cashier' | 'Battery Releasing Officer' | 'Branch Personnel';

export type BranchName = 'Branch 1 - Main Hub' | 'Branch 2 - Metro Station';

export type BatteryStatus = 
  | 'Available'
  | 'Reserved'
  | 'Rented'
  | 'Charging'
  | 'Damaged'
  | 'Maintenance'
  | 'Lost/Missing'
  | 'Retired';

export type BatteryCondition = 'Good' | 'Fair' | 'Damaged' | 'Needs Inspection';

export interface BatterySocLog {
  id: string;
  date: string;
  type: 'rental_start' | 'rental_end' | 'charge_cycle' | 'inspection';
  soc: number;
  driverName?: string;
  transactionId?: string;
  notes?: string;
  recordedBy: string;
}

export interface BatteryItem {
  id: string;
  code: string;
  batteryType: string; // e.g., '48V 30Ah LFP', '60V 45Ah NMC', '72V 50Ah LFP'
  branch: BranchName;
  soc: number; // 0 - 100
  status: BatteryStatus;
  condition: BatteryCondition;
  currentDriverId?: string;
  currentDriverName?: string;
  currentRentalId?: string;
  releaseDateTime?: string;
  returnDateTime?: string;
  lastUpdated: string;
  socHistory: BatterySocLog[];
  damageNotes?: string;
}

export type UnitType = 'E-bike' | 'E-bus' | 'E-cargo';

export type UnitStatus = 
  | 'Available'
  | 'Reserved'
  | 'Rented'
  | 'Maintenance'
  | 'Damaged'
  | 'Retired';

export type UnitCondition = 'Excellent' | 'Good' | 'Fair' | 'Maintenance Required';

export interface UnitItem {
  id: string;
  code: string;
  unitType: UnitType;
  modelName: string;
  branch: BranchName;
  status: UnitStatus;
  condition: UnitCondition;
  mileageKm: number;
  currentDriverId?: string;
  currentDriverName?: string;
  currentRentalId?: string;
  lastMaintenanceDate?: string;
  remarks?: string;
}

export interface LoyaltyRecord {
  id: string;
  date: string;
  rentalId?: string;
  percentChange: number;
  reason: string;
  resultingPercent: number;
}

export interface Driver {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  licenseNumber: string;
  registrationDate: string;
  branch: BranchName;
  emergencyContact: string;
  emergencyPhone: string;
  activeRentalId?: string;
  totalRentalsCount: number;
  currentLoyaltyPercent: number; // e.g. 5.5% discount
  loyaltyHistory: LoyaltyRecord[];
  notes?: string;
}

export type RentalType = 'Battery' | 'Unit' | 'Combined';

export type RentalStatus = 'Reserved' | 'Active' | 'Completed' | 'Cancelled' | 'Overdue';

export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Unpaid';

export type PaymentMethod = 'Cash' | 'GCash' | 'Maya' | 'Bank Transfer' | 'Card';

export interface RentalTransaction {
  id: string; // e.g., 'TRX-2026-0842'
  voucherNumber: string; // e.g., 'VCH-77412'
  driverId: string;
  driverName: string;
  driverPhone: string;
  rentalType: RentalType;
  batteryId?: string;
  batteryCode?: string;
  batteryType?: string;
  unitId?: string;
  unitCode?: string;
  unitType?: UnitType;
  unitModel?: string;
  branch: BranchName;
  rentalDate: string; // creation/reservation time
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: RentalStatus;
  
  // Release details
  startingSoc?: number;
  releaseOfficer?: string;
  releaseDateTime?: string;
  
  // Return details
  endingSoc?: number;
  returnOfficer?: string;
  returnDateTime?: string;
  returnCondition?: string;
  damageReport?: string;
  
  // Financials
  baseRentalFee: number;
  loyaltyDiscountAmount: number;
  totalAmountDue: number;
  amountPaid: number;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  cashierName: string;
  remarks?: string;
  
  // Operational flag
  flaggedIssue?: {
    isFlagged: boolean;
    reason: string;
    flaggedBy: string;
    flaggedAt: string;
  };
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  voucherNumber: string;
  driverId: string;
  driverName: string;
  rentalType: RentalType;
  amountDue: number;
  amountPaid: number;
  balance: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  collector: string;
  paymentStatus: PaymentStatus;
  branch: BranchName;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  type: 'Rental Created' | 'Battery Released' | 'Battery Returned' | 'Unit Released' | 'Unit Returned' | 'Payment Recorded' | 'Driver Registered' | 'Maintenance Flagged' | 'Inventory Update';
  description: string;
  actor: string;
  role: UserRole;
  timestamp: string;
  branch: BranchName;
  relatedId?: string;
}

export interface SystemSettings {
  batteryDailyRate: number; // e.g. 150
  ebikeDailyRate: number;   // e.g. 350
  ebusDailyRate: number;    // e.g. 1800
  ecargoDailyRate: number;  // e.g. 600
  bundleDiscountPercent: number; // e.g. 10
  loyaltyRatePerRental: number; // e.g. 1.0 (%)
  bonusSocThreshold: number; // e.g. 25 (%)
  bonusLoyaltyPercent: number; // e.g. 0.5 (%)
  criticalLowSocThreshold: number; // e.g. 5 (%)
}
