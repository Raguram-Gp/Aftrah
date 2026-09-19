import type { LabourContract } from '../types';

export const INITIAL_LABOUR_CONTRACTS: LabourContract[] = [
  {
    id: '8fc83c59-9049-44e0-a78b-17ad823a53fc',
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
        id: '5e73c116-406b-45a8-8b4b-eb2665e884c4',
        contractId: '8fc83c59-9049-44e0-a78b-17ad823a53fc',
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
    id: '8083e684-e291-4ab1-976e-6cea16ff67fe',
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
        id: 'f2d4f4b8-d0b5-46a8-9dd9-d3fa694179b7',
        contractId: '8083e684-e291-4ab1-976e-6cea16ff67fe',
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
    id: '191a9175-3d0e-48ab-8283-e4f42e6914d8',
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
        id: '11ea5cae-1c01-456f-8e7e-29ddb5d4a355',
        contractId: '191a9175-3d0e-48ab-8283-e4f42e6914d8',
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
