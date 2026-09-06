import type { LabourContract } from '../types';

export const INITIAL_LABOUR_CONTRACTS: LabourContract[] = [
  {
    id: 'contract-1',
    sNo: 1,
    date: '2026-02-15',
    labourName: 'Rajesh',
    siteName: 'Palayam',
    phone: '+91 97892 91845',
    labourCharge: 45000,
    notes: 'Modular kitchen carcass assembly & wardrobe carcass setup',
    createdAt: '2026-02-15',
    entries: [
      {
        id: 'lc-entry-1',
        contractId: 'contract-1',
        sNo: 1,
        date: '2026-08-02',
        workType: 'Carpenter',
        days: 1,
        salaryPerDay: 5000,
        totalAmount: 5000,
        note: 'Kitchen bottom cabinet assembly',
        createdAt: '2026-08-02'
      }
    ]
  },
  {
    id: 'contract-2',
    sNo: 2,
    date: '2026-02-18',
    labourName: 'Murugan Team (Civil & Masonry)',
    siteName: 'A.R. Rahman Villa',
    phone: '+91 98402 11223',
    labourCharge: 28000,
    notes: 'Kitchen granite counter civil platform & wall groove cutting',
    createdAt: '2026-02-18',
    entries: [
      {
        id: 'lc-entry-2',
        contractId: 'contract-2',
        sNo: 1,
        date: '2026-02-19',
        workType: 'Masonry Work',
        days: 2,
        salaryPerDay: 3500,
        totalAmount: 7000,
        note: 'Granite frame civil work',
        createdAt: '2026-02-19'
      }
    ]
  },
  {
    id: 'contract-3',
    sNo: 3,
    date: '2026-02-22',
    labourName: 'Karthik (POP & False Ceiling)',
    siteName: 'Green Meadows Apt',
    phone: '+91 98405 66778',
    labourCharge: 35000,
    notes: 'Living room perimeter cove false ceiling & LED profile channels',
    createdAt: '2026-02-22',
    entries: [
      {
        id: 'lc-entry-3',
        contractId: 'contract-3',
        sNo: 1,
        date: '2026-02-23',
        workType: 'Ceiling Framing',
        days: 3,
        salaryPerDay: 4000,
        totalAmount: 12000,
        note: 'Gypsum grid install',
        createdAt: '2026-02-23'
      }
    ]
  }
];
