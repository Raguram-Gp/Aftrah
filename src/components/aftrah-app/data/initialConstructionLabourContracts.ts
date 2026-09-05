import type { LabourContract } from '../types';

export const INITIAL_CONSTRUCTION_LABOUR_CONTRACTS: LabourContract[] = [
  {
    id: 'c-contract-1',
    sNo: 1,
    date: '2026-02-10',
    labourName: 'Arumugam & Co. (Centring & Shuttering)',
    siteName: 'Dr. K. Rajendran Villa - Site #4',
    phone: '+91 94432 18920',
    labourCharge: 95000,
    notes: 'Ground floor slab shuttering, column box fixing, and staging work',
    createdAt: '2026-02-10',
    entries: [
      {
        id: 'c-entry-1',
        contractId: 'c-contract-1',
        sNo: 1,
        date: '2026-02-12',
        workType: 'Centring & Shuttering',
        days: 3,
        salaryPerDay: 4500,
        totalAmount: 13500,
        note: 'Column formwork & prop staging stage-1',
        createdAt: '2026-02-12'
      },
      {
        id: 'c-entry-2',
        contractId: 'c-contract-1',
        sNo: 2,
        date: '2026-02-16',
        workType: 'Centring & Shuttering',
        days: 4,
        salaryPerDay: 4500,
        totalAmount: 18000,
        note: 'Beam bottom and main slab centring sheet fixing',
        createdAt: '2026-02-16'
      }
    ]
  },
  {
    id: 'c-contract-2',
    sNo: 2,
    date: '2026-02-14',
    labourName: 'Murugesan Mason Team (Brickwork & Masonry)',
    siteName: 'Commercial Complex - Anna Nagar',
    phone: '+91 98421 77654',
    labourCharge: 140000,
    notes: 'Full outer wall 9-inch chamber brick masonry and internal 4.5-inch partition walls',
    createdAt: '2026-02-14',
    entries: [
      {
        id: 'c-entry-3',
        contractId: 'c-contract-2',
        sNo: 1,
        date: '2026-02-17',
        workType: 'Masonry Work',
        days: 4,
        salaryPerDay: 6000,
        totalAmount: 24000,
        note: 'South & East outer wall 9-inch brick laying',
        createdAt: '2026-02-17'
      },
      {
        id: 'c-entry-4',
        contractId: 'c-contract-2',
        sNo: 2,
        date: '2026-02-21',
        workType: 'Masonry Work',
        days: 3,
        salaryPerDay: 6000,
        totalAmount: 18000,
        note: 'Room partitions and lintel level bed block finishing',
        createdAt: '2026-02-21'
      }
    ]
  },
  {
    id: 'c-contract-3',
    sNo: 3,
    date: '2026-02-18',
    labourName: 'Selvam Steel Benders (Bar Bending & Reinforcement)',
    siteName: 'Green Valley Plot 14 Residence',
    phone: '+91 99520 33412',
    labourCharge: 65000,
    notes: 'Footing mesh, column vertical reinforcement rings, and roof slab beam tying',
    createdAt: '2026-02-18',
    entries: [
      {
        id: 'c-entry-5',
        contractId: 'c-contract-3',
        sNo: 1,
        date: '2026-02-19',
        workType: 'Bar Bending / Steel Work',
        days: 2,
        salaryPerDay: 5000,
        totalAmount: 10000,
        note: 'Roof beam rebars cutting, cranking, and stirrups tying',
        createdAt: '2026-02-19'
      }
    ]
  }
];
