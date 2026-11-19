import { BatteryItem, UnitItem, Driver, RentalTransaction, PaymentRecord, ActivityLog, SystemSettings } from '../types';

export const defaultSettings: SystemSettings = {
  batteryDailyRate: 150,
  ebikeDailyRate: 350,
  ebusDailyRate: 1800,
  ecargoDailyRate: 600,
  bundleDiscountPercent: 10,
  loyaltyRatePerRental: 1.0,
  bonusSocThreshold: 25,
  bonusLoyaltyPercent: 0.5,
  criticalLowSocThreshold: 5,
};

// Generate 48 initial batteries: 34 in Branch 1, 14 in Branch 2
export const generateInitialBatteries = (): BatteryItem[] => {
  const batteries: BatteryItem[] = [];
  
  // 34 for Branch 1
  for (let i = 1; i <= 34; i++) {
    const code = `BX-BAT-${String(i).padStart(3, '0')}`;
    let type = '48V 30Ah LFP';
    if (i % 3 === 0) type = '60V 45Ah NMC';
    if (i % 5 === 0) type = '72V 50Ah LFP';

    // Tailored conditions for specific demo batteries
    if (i === 14) {
      // Critical low SOC < 5% alert test case
      batteries.push({
        id: `bat-${i}`,
        code,
        batteryType: type,
        branch: 'Branch 1 - Main Hub',
        soc: 4,
        status: 'Available',
        condition: 'Good',
        lastUpdated: '15 mins ago',
        damageNotes: 'Depleted to 4% SOC after return. Needs immediate charging.',
        socHistory: [
          { id: `log-${i}-1`, date: '2026-11-06 17:30', type: 'rental_end', soc: 4, driverName: 'Manuel Santos', transactionId: 'TRX-2026-0819', notes: 'Returned near depletion', recordedBy: 'Officer Danilo Cruz' }
        ]
      });
      continue;
    }

    if (i === 29) {
      // Damaged battery test case
      batteries.push({
        id: `bat-${i}`,
        code,
        batteryType: type,
        branch: 'Branch 1 - Main Hub',
        soc: 18,
        status: 'Damaged',
        condition: 'Damaged',
        lastUpdated: '2 hours ago',
        damageNotes: 'Cracked outer bracket lock mechanism reported during return inspection. Quarantined.',
        socHistory: [
          { id: `log-${i}-1`, date: '2026-11-06 14:15', type: 'inspection', soc: 18, notes: 'Physical casing damage identified', recordedBy: 'Officer Danilo Cruz' }
        ]
      });
      continue;
    }

    if (i === 32) {
      // Under maintenance
      batteries.push({
        id: `bat-${i}`,
        code,
        batteryType: type,
        branch: 'Branch 1 - Main Hub',
        soc: 62,
        status: 'Maintenance',
        condition: 'Needs Inspection',
        lastUpdated: 'Yesterday',
        damageNotes: 'BMS thermistor reading erratic. Diagnostic calibration queued.',
        socHistory: [
          { id: `log-${i}-1`, date: '2026-11-05 09:20', type: 'inspection', soc: 62, notes: 'Sensor calibration required', recordedBy: 'Engr. J. Mercado' }
        ]
      });
      continue;
    }

    if (i >= 5 && i <= 8) {
      // Charging bay
      const socLevels = [32, 54, 78, 88];
      batteries.push({
        id: `bat-${i}`,
        code,
        batteryType: type,
        branch: 'Branch 1 - Main Hub',
        soc: socLevels[i - 5],
        status: 'Charging',
        condition: 'Good',
        lastUpdated: 'Just now',
        socHistory: [
          { id: `log-${i}-1`, date: '2026-11-07 00:30', type: 'charge_cycle', soc: socLevels[i - 5], notes: 'Charging Bay #0' + (i-4), recordedBy: 'Branch Auto-Charger' }
        ]
      });
      continue;
    }

    if (i === 1) {
      // Active rented by Carlos Mendoza
      batteries.push({
        id: `bat-${i}`,
        code,
        batteryType: type,
        branch: 'Branch 1 - Main Hub',
        soc: 72,
        status: 'Rented',
        condition: 'Good',
        currentDriverId: 'DRV-1001',
        currentDriverName: 'Carlos Mendoza',
        currentRentalId: 'TRX-2026-0831',
        releaseDateTime: '2026-11-06 08:30',
        lastUpdated: '1 hour ago',
        socHistory: [
          { id: `log-${i}-1`, date: '2026-11-06 08:30', type: 'rental_start', soc: 100, driverName: 'Carlos Mendoza', transactionId: 'TRX-2026-0831', notes: 'Released 100% full', recordedBy: 'Officer Danilo Cruz' }
        ]
      });
      continue;
    }

    if (i === 2) {
      // Active rented by Ronald Reyes
      batteries.push({
        id: `bat-${i}`,
        code,
        batteryType: type,
        branch: 'Branch 1 - Main Hub',
        soc: 58,
        status: 'Rented',
        condition: 'Good',
        currentDriverId: 'DRV-1002',
        currentDriverName: 'Ronald Reyes',
        currentRentalId: 'TRX-2026-0834',
        releaseDateTime: '2026-11-06 10:15',
        lastUpdated: '2 hours ago',
        socHistory: [
          { id: `log-${i}-1`, date: '2026-11-06 10:15', type: 'rental_start', soc: 98, driverName: 'Ronald Reyes', transactionId: 'TRX-2026-0834', notes: 'Released nominal', recordedBy: 'Officer Danilo Cruz' }
        ]
      });
      continue;
    }

    if (i === 3) {
      // Reserved awaiting release
      batteries.push({
        id: `bat-${i}`,
        code,
        batteryType: type,
        branch: 'Branch 1 - Main Hub',
        soc: 96,
        status: 'Reserved',
        condition: 'Good',
        currentDriverId: 'DRV-1004',
        currentDriverName: 'Elena Ramos',
        currentRentalId: 'TRX-2026-0840',
        lastUpdated: '30 mins ago',
        socHistory: []
      });
      continue;
    }

    // Default available healthy battery
    const soc = 85 + (i % 16);
    batteries.push({
      id: `bat-${i}`,
      code,
      batteryType: type,
      branch: 'Branch 1 - Main Hub',
      soc: Math.min(100, soc),
      status: 'Available',
      condition: 'Good',
      lastUpdated: 'Today',
      socHistory: [
        { id: `log-${i}-1`, date: '2026-11-05 18:00', type: 'charge_cycle', soc: Math.min(100, soc), notes: 'Completed charging cycle', recordedBy: 'Branch Auto-Charger' }
      ]
    });
  }

  // 14 for Branch 2
  for (let i = 35; i <= 48; i++) {
    const code = `BX-BAT-${String(i).padStart(3, '0')}`;
    let type = '48V 30Ah LFP';
    if (i % 2 === 0) type = '60V 45Ah NMC';
    if (i % 4 === 0) type = '72V 50Ah LFP';

    if (i === 35) {
      // Active rented in Branch 2
      batteries.push({
        id: `bat-${i}`,
        code,
        batteryType: type,
        branch: 'Branch 2 - Metro Station',
        soc: 64,
        status: 'Rented',
        condition: 'Good',
        currentDriverId: 'DRV-1003',
        currentDriverName: 'Jericho Bautista',
        currentRentalId: 'TRX-2026-0838',
        releaseDateTime: '2026-11-06 14:00',
        lastUpdated: '3 hours ago',
        socHistory: [
          { id: `log-${i}-1`, date: '2026-11-06 14:00', type: 'rental_start', soc: 99, driverName: 'Jericho Bautista', transactionId: 'TRX-2026-0838', notes: 'Released fully charged', recordedBy: 'Officer Leah Garcia' }
        ]
      });
      continue;
    }

    if (i === 38 || i === 39) {
      batteries.push({
        id: `bat-${i}`,
        code,
        batteryType: type,
        branch: 'Branch 2 - Metro Station',
        soc: i === 38 ? 45 : 70,
        status: 'Charging',
        condition: 'Good',
        lastUpdated: '10 mins ago',
        socHistory: [
          { id: `log-${i}-1`, date: '2026-11-07 00:15', type: 'charge_cycle', soc: i === 38 ? 45 : 70, notes: 'Charging station #2', recordedBy: 'Branch Auto-Charger' }
        ]
      });
      continue;
    }

    const soc = 88 + ((i * 3) % 13);
    batteries.push({
      id: `bat-${i}`,
      code,
      batteryType: type,
      branch: 'Branch 2 - Metro Station',
      soc: Math.min(100, soc),
      status: 'Available',
      condition: 'Good',
      lastUpdated: 'Today',
      socHistory: [
        { id: `log-${i}-1`, date: '2026-11-05 21:00', type: 'charge_cycle', soc: Math.min(100, soc), notes: 'Ready for deployment', recordedBy: 'Officer Leah Garcia' }
      ]
    });
  }

  return batteries;
};

export const initialUnits: UnitItem[] = [
  {
    id: 'unit-1',
    code: 'BX-EB-101',
    unitType: 'E-bike',
    modelName: 'BX-Sprint 500W Commuter',
    branch: 'Branch 1 - Main Hub',
    status: 'Rented',
    condition: 'Good',
    mileageKm: 1420,
    currentDriverId: 'DRV-1001',
    currentDriverName: 'Carlos Mendoza',
    currentRentalId: 'TRX-2026-0831',
    lastMaintenanceDate: '2026-10-20',
    remarks: 'Equipped with front basket and phone mount.'
  },
  {
    id: 'unit-2',
    code: 'BX-EB-102',
    unitType: 'E-bike',
    modelName: 'BX-Sprint 500W Commuter',
    branch: 'Branch 1 - Main Hub',
    status: 'Available',
    condition: 'Excellent',
    mileageKm: 890,
    lastMaintenanceDate: '2026-10-28',
    remarks: 'Brakes and tires recently inspected.'
  },
  {
    id: 'unit-3',
    code: 'BX-EB-103',
    unitType: 'E-bike',
    modelName: 'BX-Sprint 500W Commuter',
    branch: 'Branch 1 - Main Hub',
    status: 'Reserved',
    condition: 'Good',
    mileageKm: 1150,
    currentDriverId: 'DRV-1004',
    currentDriverName: 'Elena Ramos',
    currentRentalId: 'TRX-2026-0840',
    lastMaintenanceDate: '2026-10-15',
    remarks: 'Reserved under Voucher VCH-90412.'
  },
  {
    id: 'unit-4',
    code: 'BX-EB-104',
    unitType: 'E-bike',
    modelName: 'BX-Sprint Pro 750W',
    branch: 'Branch 2 - Metro Station',
    status: 'Available',
    condition: 'Good',
    mileageKm: 640,
    lastMaintenanceDate: '2026-11-01',
    remarks: 'High torque model with rear pannier bags.'
  },
  {
    id: 'unit-5',
    code: 'BX-CARGO-301',
    unitType: 'E-cargo',
    modelName: 'BX-Hauler 3-Wheeler 350kg',
    branch: 'Branch 1 - Main Hub',
    status: 'Rented',
    condition: 'Good',
    mileageKm: 3200,
    currentDriverId: 'DRV-1002',
    currentDriverName: 'Ronald Reyes',
    currentRentalId: 'TRX-2026-0834',
    lastMaintenanceDate: '2026-10-10',
    remarks: 'Heavy duty cargo bed with waterproof tarp.'
  },
  {
    id: 'unit-6',
    code: 'BX-CARGO-302',
    unitType: 'E-cargo',
    modelName: 'BX-Hauler 3-Wheeler 350kg',
    branch: 'Branch 1 - Main Hub',
    status: 'Maintenance',
    condition: 'Maintenance Required',
    mileageKm: 4120,
    lastMaintenanceDate: '2026-09-18',
    remarks: 'Hydraulic disc brake pads worn down; waiting for replacement parts.'
  },
  {
    id: 'unit-7',
    code: 'BX-CARGO-303',
    unitType: 'E-cargo',
    modelName: 'BX-Hauler 3-Wheeler 350kg',
    branch: 'Branch 2 - Metro Station',
    status: 'Available',
    condition: 'Excellent',
    mileageKm: 1840,
    lastMaintenanceDate: '2026-10-25',
    remarks: 'Clean and fully ready for delivery contracts.'
  },
  {
    id: 'unit-8',
    code: 'BX-EBUS-201',
    unitType: 'E-bus',
    modelName: 'BX-Shuttle 14-Seater Mini-Bus',
    branch: 'Branch 1 - Main Hub',
    status: 'Available',
    condition: 'Excellent',
    mileageKm: 7850,
    lastMaintenanceDate: '2026-10-30',
    remarks: 'Commercial passenger license verified. Air-conditioning inspected.'
  },
  {
    id: 'unit-9',
    code: 'BX-EBUS-202',
    unitType: 'E-bus',
    modelName: 'BX-Shuttle 14-Seater Mini-Bus',
    branch: 'Branch 2 - Metro Station',
    status: 'Rented',
    condition: 'Good',
    mileageKm: 9240,
    currentDriverId: 'DRV-1003',
    currentDriverName: 'Jericho Bautista',
    currentRentalId: 'TRX-2026-0838',
    lastMaintenanceDate: '2026-10-18',
    remarks: 'Route 4 Metro Shuttle deployment.'
  }
];

export const initialDrivers: Driver[] = [
  {
    id: 'DRV-1001',
    name: 'Carlos Mendoza',
    contactNumber: '0917-555-8912',
    email: 'carlos.mendoza@email.com',
    licenseNumber: 'N01-19-094821',
    registrationDate: '2026-01-15',
    branch: 'Branch 1 - Main Hub',
    emergencyContact: 'Maria Mendoza (Spouse)',
    emergencyPhone: '0917-555-8913',
    activeRentalId: 'TRX-2026-0831',
    totalRentalsCount: 14,
    currentLoyaltyPercent: 6.5,
    loyaltyHistory: [
      { id: 'lh-1', date: '2026-10-15', rentalId: 'TRX-2026-0720', percentChange: 1.5, reason: 'On-time return with SOC > 30%', resultingPercent: 5.0 },
      { id: 'lh-2', date: '2026-10-29', rentalId: 'TRX-2026-0788', percentChange: 1.5, reason: 'Completed rental in clean condition', resultingPercent: 6.5 }
    ],
    notes: 'Trusted delivery rider. Always returns batteries above 20% SOC.'
  },
  {
    id: 'DRV-1002',
    name: 'Ronald Reyes',
    contactNumber: '0922-811-4432',
    email: 'ronald.reyes@email.com',
    licenseNumber: 'N02-20-112349',
    registrationDate: '2026-03-10',
    branch: 'Branch 1 - Main Hub',
    emergencyContact: 'Teresa Reyes (Mother)',
    emergencyPhone: '0922-811-4430',
    activeRentalId: 'TRX-2026-0834',
    totalRentalsCount: 9,
    currentLoyaltyPercent: 4.0,
    loyaltyHistory: [
      { id: 'lh-3', date: '2026-10-12', rentalId: 'TRX-2026-0715', percentChange: 1.0, reason: 'Completed rental', resultingPercent: 3.0 },
      { id: 'lh-4', date: '2026-10-26', rentalId: 'TRX-2026-0775', percentChange: 1.0, reason: 'Completed rental', resultingPercent: 4.0 }
    ],
    notes: 'E-cargo delivery driver for local produce markets.'
  },
  {
    id: 'DRV-1003',
    name: 'Jericho Bautista',
    contactNumber: '0918-943-7721',
    email: 'jericho.b@email.com',
    licenseNumber: 'N03-18-044391',
    registrationDate: '2026-02-01',
    branch: 'Branch 2 - Metro Station',
    emergencyContact: 'Grace Bautista (Sister)',
    emergencyPhone: '0918-943-7725',
    activeRentalId: 'TRX-2026-0838',
    totalRentalsCount: 22,
    currentLoyaltyPercent: 10.0,
    loyaltyHistory: [
      { id: 'lh-5', date: '2026-10-20', rentalId: 'TRX-2026-0750', percentChange: 1.5, reason: 'Consistent timely return bonus', resultingPercent: 9.0 },
      { id: 'lh-6', date: '2026-11-01', rentalId: 'TRX-2026-0810', percentChange: 1.0, reason: 'Tier VIP loyalty award', resultingPercent: 10.0 }
    ],
    notes: 'Community shuttle pilot. Highest rental track record.'
  },
  {
    id: 'DRV-1004',
    name: 'Elena Ramos',
    contactNumber: '0927-410-9988',
    email: 'elena.ramos@email.com',
    licenseNumber: 'N04-22-384729',
    registrationDate: '2026-05-20',
    branch: 'Branch 1 - Main Hub',
    emergencyContact: 'Arman Ramos (Husband)',
    emergencyPhone: '0927-410-9980',
    activeRentalId: 'TRX-2026-0840',
    totalRentalsCount: 5,
    currentLoyaltyPercent: 2.0,
    loyaltyHistory: [
      { id: 'lh-7', date: '2026-10-05', rentalId: 'TRX-2026-0680', percentChange: 1.0, reason: 'First month completion', resultingPercent: 2.0 }
    ],
    notes: 'Freelance courier rider.'
  },
  {
    id: 'DRV-1005',
    name: 'Manuel Santos',
    contactNumber: '0908-333-1204',
    email: 'manuel.santos@email.com',
    licenseNumber: 'N01-21-482019',
    registrationDate: '2026-06-14',
    branch: 'Branch 1 - Main Hub',
    emergencyContact: 'Cynthia Santos (Spouse)',
    emergencyPhone: '0908-333-1205',
    totalRentalsCount: 7,
    currentLoyaltyPercent: 3.0,
    loyaltyHistory: [
      { id: 'lh-8', date: '2026-11-06', rentalId: 'TRX-2026-0819', percentChange: -0.5, reason: 'Returned with depleted battery (4% SOC)', resultingPercent: 3.0 }
    ],
    notes: 'Reminded about returning battery before 10% SOC to preserve cell longevity.'
  },
  {
    id: 'DRV-1006',
    name: 'Patricia Joy Flores',
    contactNumber: '0919-874-5512',
    email: 'pj.flores@email.com',
    licenseNumber: 'N02-23-994102',
    registrationDate: '2026-09-02',
    branch: 'Branch 2 - Metro Station',
    emergencyContact: 'Rolando Flores (Father)',
    emergencyPhone: '0919-874-5510',
    totalRentalsCount: 3,
    currentLoyaltyPercent: 1.5,
    loyaltyHistory: [
      { id: 'lh-9', date: '2026-10-18', rentalId: 'TRX-2026-0744', percentChange: 1.0, reason: 'Rental completed', resultingPercent: 1.5 }
    ],
    notes: 'Delivery driver. New profile.'
  }
];

export const initialRentals: RentalTransaction[] = [
  {
    id: 'TRX-2026-0831',
    voucherNumber: 'VCH-88201',
    driverId: 'DRV-1001',
    driverName: 'Carlos Mendoza',
    driverPhone: '0917-555-8912',
    rentalType: 'Combined',
    batteryId: 'bat-1',
    batteryCode: 'BX-BAT-001',
    batteryType: '48V 30Ah LFP',
    unitId: 'unit-1',
    unitCode: 'BX-EB-101',
    unitType: 'E-bike',
    unitModel: 'BX-Sprint 500W Commuter',
    branch: 'Branch 1 - Main Hub',
    rentalDate: '2026-11-06 08:00',
    expectedReturnDate: '2026-11-08 08:00',
    status: 'Active',
    startingSoc: 100,
    releaseOfficer: 'Danilo Cruz (Releasing Officer)',
    releaseDateTime: '2026-11-06 08:30',
    baseRentalFee: 900, // 2 days combined (150*2 + 350*2 = 1000 - 10% bundle)
    loyaltyDiscountAmount: 58.5,
    totalAmountDue: 841.5,
    amountPaid: 841.5,
    remainingBalance: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'GCash',
    paymentReference: 'GC-99382104',
    cashierName: 'Maria Santos (Cashier)',
    remarks: 'Routine combined 2-day delivery route.'
  },
  {
    id: 'TRX-2026-0834',
    voucherNumber: 'VCH-88235',
    driverId: 'DRV-1002',
    driverName: 'Ronald Reyes',
    driverPhone: '0922-811-4432',
    rentalType: 'Combined',
    batteryId: 'bat-2',
    batteryCode: 'BX-BAT-002',
    batteryType: '48V 30Ah LFP',
    unitId: 'unit-5',
    unitCode: 'BX-CARGO-301',
    unitType: 'E-cargo',
    unitModel: 'BX-Hauler 3-Wheeler 350kg',
    branch: 'Branch 1 - Main Hub',
    rentalDate: '2026-11-06 09:45',
    expectedReturnDate: '2026-11-07 18:00',
    status: 'Active',
    startingSoc: 98,
    releaseOfficer: 'Danilo Cruz (Releasing Officer)',
    releaseDateTime: '2026-11-06 10:15',
    baseRentalFee: 750,
    loyaltyDiscountAmount: 30,
    totalAmountDue: 720,
    amountPaid: 500,
    remainingBalance: 220,
    paymentStatus: 'Partially Paid',
    paymentMethod: 'Cash',
    paymentReference: 'CSH-00214',
    cashierName: 'Maria Santos (Cashier)',
    remarks: 'Downpayment given. Balance of ₱220 to be paid upon cargo shift end.'
  },
  {
    id: 'TRX-2026-0838',
    voucherNumber: 'VCH-88310',
    driverId: 'DRV-1003',
    driverName: 'Jericho Bautista',
    driverPhone: '0918-943-7721',
    rentalType: 'Combined',
    batteryId: 'bat-35',
    batteryCode: 'BX-BAT-035',
    batteryType: '48V 30Ah LFP',
    unitId: 'unit-9',
    unitCode: 'BX-EBUS-202',
    unitType: 'E-bus',
    unitModel: 'BX-Shuttle 14-Seater Mini-Bus',
    branch: 'Branch 2 - Metro Station',
    rentalDate: '2026-11-06 13:30',
    expectedReturnDate: '2026-11-07 20:00',
    status: 'Active',
    startingSoc: 99,
    releaseOfficer: 'Leah Garcia (Branch Personnel)',
    releaseDateTime: '2026-11-06 14:00',
    baseRentalFee: 1950,
    loyaltyDiscountAmount: 195,
    totalAmountDue: 1755,
    amountPaid: 1755,
    remainingBalance: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    paymentReference: 'BDO-772091',
    cashierName: 'Kevin Tan (Cashier)',
    remarks: 'Metro Route Community transit service.'
  },
  {
    id: 'TRX-2026-0840',
    voucherNumber: 'VCH-90412',
    driverId: 'DRV-1004',
    driverName: 'Elena Ramos',
    driverPhone: '0927-410-9988',
    rentalType: 'Combined',
    batteryId: 'bat-3',
    batteryCode: 'BX-BAT-003',
    batteryType: '60V 45Ah NMC',
    unitId: 'unit-3',
    unitCode: 'BX-EB-103',
    unitType: 'E-bike',
    unitModel: 'BX-Sprint 500W Commuter',
    branch: 'Branch 1 - Main Hub',
    rentalDate: '2026-11-07 00:45',
    expectedReturnDate: '2026-11-08 12:00',
    status: 'Reserved',
    baseRentalFee: 500,
    loyaltyDiscountAmount: 10,
    totalAmountDue: 490,
    amountPaid: 490,
    remainingBalance: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'Maya',
    paymentReference: 'MY-48201944',
    cashierName: 'Maria Santos (Cashier)',
    remarks: 'Confirmed and paid. Awaiting physical voucher presentation to Releasing Officer.'
  },
  {
    id: 'TRX-2026-0819',
    voucherNumber: 'VCH-87994',
    driverId: 'DRV-1005',
    driverName: 'Manuel Santos',
    driverPhone: '0908-333-1204',
    rentalType: 'Battery',
    batteryId: 'bat-14',
    batteryCode: 'BX-BAT-014',
    batteryType: '60V 45Ah NMC',
    branch: 'Branch 1 - Main Hub',
    rentalDate: '2026-11-05 10:00',
    expectedReturnDate: '2026-11-06 17:00',
    actualReturnDate: '2026-11-06 17:30',
    status: 'Completed',
    startingSoc: 100,
    releaseOfficer: 'Danilo Cruz (Releasing Officer)',
    releaseDateTime: '2026-11-05 10:15',
    endingSoc: 4,
    returnOfficer: 'Danilo Cruz (Releasing Officer)',
    returnDateTime: '2026-11-06 17:30',
    returnCondition: 'Good',
    baseRentalFee: 300,
    loyaltyDiscountAmount: 9,
    totalAmountDue: 291,
    amountPaid: 291,
    remainingBalance: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    paymentReference: 'CSH-00192',
    cashierName: 'Maria Santos (Cashier)',
    remarks: 'Returned safe. Battery returned with 4% SOC (quarantined to charging bay).'
  }
];

export const initialPayments: PaymentRecord[] = [
  {
    id: 'PAY-2026-0311',
    transactionId: 'TRX-2026-0831',
    voucherNumber: 'VCH-88201',
    driverId: 'DRV-1001',
    driverName: 'Carlos Mendoza',
    rentalType: 'Combined',
    amountDue: 841.5,
    amountPaid: 841.5,
    balance: 0,
    paymentDate: '2026-11-06 08:05',
    paymentMethod: 'GCash',
    referenceNumber: 'GC-99382104',
    collector: 'Maria Santos (Cashier)',
    paymentStatus: 'Paid',
    branch: 'Branch 1 - Main Hub',
    notes: 'Full payment via GCash QR.'
  },
  {
    id: 'PAY-2026-0312',
    transactionId: 'TRX-2026-0834',
    voucherNumber: 'VCH-88235',
    driverId: 'DRV-1002',
    driverName: 'Ronald Reyes',
    rentalType: 'Combined',
    amountDue: 720,
    amountPaid: 500,
    balance: 220,
    paymentDate: '2026-11-06 09:50',
    paymentMethod: 'Cash',
    referenceNumber: 'CSH-00214',
    collector: 'Maria Santos (Cashier)',
    paymentStatus: 'Partially Paid',
    branch: 'Branch 1 - Main Hub',
    notes: 'Initial deposit. Remaining balance ₱220 on return.'
  },
  {
    id: 'PAY-2026-0313',
    transactionId: 'TRX-2026-0838',
    voucherNumber: 'VCH-88310',
    driverId: 'DRV-1003',
    driverName: 'Jericho Bautista',
    rentalType: 'Combined',
    amountDue: 1755,
    amountPaid: 1755,
    balance: 0,
    paymentDate: '2026-11-06 13:35',
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'BDO-772091',
    collector: 'Kevin Tan (Cashier)',
    paymentStatus: 'Paid',
    branch: 'Branch 2 - Metro Station',
    notes: 'Corporate bank transfer confirmed.'
  },
  {
    id: 'PAY-2026-0314',
    transactionId: 'TRX-2026-0840',
    voucherNumber: 'VCH-90412',
    driverId: 'DRV-1004',
    driverName: 'Elena Ramos',
    rentalType: 'Combined',
    amountDue: 490,
    amountPaid: 490,
    balance: 0,
    paymentDate: '2026-11-07 00:50',
    paymentMethod: 'Maya',
    referenceNumber: 'MY-48201944',
    collector: 'Maria Santos (Cashier)',
    paymentStatus: 'Paid',
    branch: 'Branch 1 - Main Hub',
    notes: 'Advance checkout payment.'
  },
  {
    id: 'PAY-2026-0309',
    transactionId: 'TRX-2026-0819',
    voucherNumber: 'VCH-87994',
    driverId: 'DRV-1005',
    driverName: 'Manuel Santos',
    rentalType: 'Battery',
    amountDue: 291,
    amountPaid: 291,
    balance: 0,
    paymentDate: '2026-11-05 10:05',
    paymentMethod: 'Cash',
    referenceNumber: 'CSH-00192',
    collector: 'Maria Santos (Cashier)',
    paymentStatus: 'Paid',
    branch: 'Branch 1 - Main Hub'
  }
];

export const initialActivities: ActivityLog[] = [
  {
    id: 'act-1',
    type: 'Rental Created',
    description: 'Created rental reservation VCH-90412 for Elena Ramos (Combined)',
    actor: 'Maria Santos',
    role: 'Cashier',
    timestamp: '2026-11-07 00:50',
    branch: 'Branch 1 - Main Hub',
    relatedId: 'TRX-2026-0840'
  },
  {
    id: 'act-2',
    type: 'Payment Recorded',
    description: 'Recorded ₱490.00 via Maya for Voucher VCH-90412',
    actor: 'Maria Santos',
    role: 'Cashier',
    timestamp: '2026-11-07 00:50',
    branch: 'Branch 1 - Main Hub',
    relatedId: 'PAY-2026-0314'
  },
  {
    id: 'act-3',
    type: 'Battery Returned',
    description: 'Received Battery BX-BAT-014 from Manuel Santos. Ending SOC: 4%. Quarantined to charge bay.',
    actor: 'Danilo Cruz',
    role: 'Battery Releasing Officer',
    timestamp: '2026-11-06 17:30',
    branch: 'Branch 1 - Main Hub',
    relatedId: 'TRX-2026-0819'
  },
  {
    id: 'act-4',
    type: 'Maintenance Flagged',
    description: 'Flagged Battery BX-BAT-029 as Damaged due to cracked outer lock bracket.',
    actor: 'Danilo Cruz',
    role: 'Battery Releasing Officer',
    timestamp: '2026-11-06 14:15',
    branch: 'Branch 1 - Main Hub',
    relatedId: 'bat-29'
  },
  {
    id: 'act-5',
    type: 'Battery Released',
    description: 'Released Battery BX-BAT-035 and Unit BX-EBUS-202 to Jericho Bautista. Starting SOC: 99%.',
    actor: 'Leah Garcia',
    role: 'Branch Personnel',
    timestamp: '2026-11-06 14:00',
    branch: 'Branch 2 - Metro Station',
    relatedId: 'TRX-2026-0838'
  },
  {
    id: 'act-6',
    type: 'Battery Released',
    description: 'Released Battery BX-BAT-002 and Unit BX-CARGO-301 to Ronald Reyes. Starting SOC: 98%.',
    actor: 'Danilo Cruz',
    role: 'Battery Releasing Officer',
    timestamp: '2026-11-06 10:15',
    branch: 'Branch 1 - Main Hub',
    relatedId: 'TRX-2026-0834'
  }
];
