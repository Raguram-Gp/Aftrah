import type { InteriorClient } from '../types';

export const INITIAL_INTERIOR_CLIENTS: InteriorClient[] = [
  {
    id: 'interior-client-1',
    sNo: 1,
    name: 'Mr. Afrah Construction',
    phone: '98401 23456',
    address: 'Uthamapalayam',
    siteLocation: 'Quote No: Q/04.04.2026 · First Floor',
    projectScope: 'Materials of 16mm MDF with Mica lamination and 6mm Back-panel ply with PVC edgeband along with Handles and Hardwares',
    createdAt: '2026-04-04',
    updatedAt: '2026-04-20',
    advancePayments: [
      {
        id: 'adv-int-1',
        clientId: 'interior-client-1',
        sNo: 1,
        date: '2026-04-04',
        amount: 163845,
        mode: 'HDFC Bank',
        note: '50% Advance on confirmation & PO'
      },
      {
        id: 'adv-int-2',
        clientId: 'interior-client-1',
        sNo: 2,
        date: '2026-04-18',
        amount: 98307,
        mode: 'UPI',
        note: '30% On delivery of Carcass Material'
      }
    ],
    expenses: [
      // 1. KITCHEN
      {
        id: 'exp-int-1',
        clientId: 'interior-client-1',
        sNo: 1,
        category: 'KITCHEN',
        date: '2026-04-04',
        expenseName: 'Base Unit (Box)',
        quantity: 55.5,
        unit: 'Sq.ft',
        rate: 1350,
        totalAmount: 74925
      },
      {
        id: 'exp-int-2',
        clientId: 'interior-client-1',
        sNo: 2,
        category: 'KITCHEN',
        date: '2026-04-04',
        expenseName: 'Wall Unit (Box)-Full Length',
        quantity: 31,
        unit: 'Sq.ft',
        rate: 750,
        totalAmount: 23250
      },
      {
        id: 'exp-int-3',
        clientId: 'interior-client-1',
        sNo: 3,
        category: 'KITCHEN',
        date: '2026-04-04',
        expenseName: 'Tall Unit (Shutter)',
        quantity: 28,
        unit: 'Sq.ft',
        rate: 450,
        totalAmount: 12600
      },
      {
        id: 'exp-int-4',
        clientId: 'interior-client-1',
        sNo: 4,
        category: 'KITCHEN',
        date: '2026-04-04',
        expenseName: 'Civil Loft (Shutter)',
        quantity: 71.75,
        unit: 'Sq.ft',
        rate: 400,
        totalAmount: 28700
      },
      {
        id: 'exp-int-5',
        clientId: 'interior-client-1',
        sNo: 5,
        category: 'KITCHEN',
        date: '2026-04-04',
        expenseName: 'Dining Vanity Unit',
        quantity: 4,
        unit: 'Sq.ft',
        rate: 1075,
        totalAmount: 4300
      },

      // ACESSORIES FOR KITCHEN
      {
        id: 'exp-int-6',
        clientId: 'interior-client-1',
        sNo: 6,
        category: 'ACESSORIES FOR KITCHEN',
        date: '2026-04-04',
        expenseName: 'Tandem Box-8"',
        quantity: 1,
        unit: 'No',
        rate: 3300,
        totalAmount: 3300
      },
      {
        id: 'exp-int-7',
        clientId: 'interior-client-1',
        sNo: 7,
        category: 'ACESSORIES FOR KITCHEN',
        date: '2026-04-04',
        expenseName: 'Tandem Box-6"',
        quantity: 1,
        unit: 'No',
        rate: 2900,
        totalAmount: 2900
      },
      {
        id: 'exp-int-8',
        clientId: 'interior-client-1',
        sNo: 8,
        category: 'ACESSORIES FOR KITCHEN',
        date: '2026-04-04',
        expenseName: 'Tandem Box-4"',
        quantity: 1,
        unit: 'No',
        rate: 2700,
        totalAmount: 2700
      },
      {
        id: 'exp-int-9',
        clientId: 'interior-client-1',
        sNo: 9,
        category: 'ACESSORIES FOR KITCHEN',
        date: '2026-04-04',
        expenseName: 'Cutlery Tray',
        quantity: 1,
        unit: 'No',
        rate: 1130,
        totalAmount: 1130
      },
      {
        id: 'exp-int-10',
        clientId: 'interior-client-1',
        sNo: 10,
        category: 'ACESSORIES FOR KITCHEN',
        date: '2026-04-04',
        expenseName: 'Plate Tray',
        quantity: 1,
        unit: 'No',
        rate: 3500,
        totalAmount: 3500
      },

      // 2. HALL TV UNIT
      {
        id: 'exp-int-11',
        clientId: 'interior-client-1',
        sNo: 11,
        category: 'HALL TV UNIT',
        date: '2026-04-04',
        expenseName: 'Base Unit',
        quantity: 22,
        unit: 'Sq.ft',
        rate: 750,
        totalAmount: 16500
      },
      {
        id: 'exp-int-12',
        clientId: 'interior-client-1',
        sNo: 12,
        category: 'HALL TV UNIT',
        date: '2026-04-04',
        expenseName: 'Storage Unit-Profile Door',
        quantity: 10,
        unit: 'Sq.ft',
        rate: 600,
        totalAmount: 6000
      },
      {
        id: 'exp-int-13',
        clientId: 'interior-client-1',
        sNo: 13,
        category: 'HALL TV UNIT',
        date: '2026-04-04',
        expenseName: 'TV Panelling',
        quantity: 36,
        unit: 'Sq.ft',
        rate: 410,
        totalAmount: 14760
      },
      {
        id: 'exp-int-14',
        clientId: 'interior-client-1',
        sNo: 14,
        category: 'HALL TV UNIT',
        date: '2026-04-04',
        expenseName: 'Fluted Panel Panelling-15 nos',
        quantity: 1,
        unit: 'LSM',
        rate: 8000,
        totalAmount: 8000
      },

      // 3. WARDROBES IN ROOMS - MASTER BEDROOM
      {
        id: 'exp-int-15',
        clientId: 'interior-client-1',
        sNo: 15,
        category: 'WARDROBES - MASTER BEDROOM',
        date: '2026-04-04',
        expenseName: 'Wardrobe (Shutter)',
        quantity: 56,
        unit: 'Sq.ft',
        rate: 450,
        totalAmount: 25200
      },
      {
        id: 'exp-int-16',
        clientId: 'interior-client-1',
        sNo: 16,
        category: 'WARDROBES - MASTER BEDROOM',
        date: '2026-04-04',
        expenseName: 'Loft-1',
        quantity: 42,
        unit: 'Sq.ft',
        rate: 400,
        totalAmount: 16800
      },
      {
        id: 'exp-int-17',
        clientId: 'interior-client-1',
        sNo: 17,
        category: 'WARDROBES - MASTER BEDROOM',
        date: '2026-04-04',
        expenseName: 'Loft-2',
        quantity: 13.5,
        unit: 'Sq.ft',
        rate: 400,
        totalAmount: 5400
      },

      // BEDROOM-1
      {
        id: 'exp-int-18',
        clientId: 'interior-client-1',
        sNo: 18,
        category: 'WARDROBES - BEDROOM-1',
        date: '2026-04-04',
        expenseName: 'Wardrobe (Shutter)',
        quantity: 42,
        unit: 'Sq.ft',
        rate: 450,
        totalAmount: 18900
      },
      {
        id: 'exp-int-19',
        clientId: 'interior-client-1',
        sNo: 19,
        category: 'WARDROBES - BEDROOM-1',
        date: '2026-04-04',
        expenseName: 'Loft',
        quantity: 42,
        unit: 'Sq.ft',
        rate: 400,
        totalAmount: 16800
      },

      // BEDROOM-2
      {
        id: 'exp-int-20',
        clientId: 'interior-client-1',
        sNo: 20,
        category: 'WARDROBES - BEDROOM-2',
        date: '2026-04-04',
        expenseName: 'Wardrobe (Shutter)',
        quantity: 52.5,
        unit: 'Sq.ft',
        rate: 450,
        totalAmount: 23625
      },
      {
        id: 'exp-int-21',
        clientId: 'interior-client-1',
        sNo: 21,
        category: 'WARDROBES - BEDROOM-2',
        date: '2026-04-04',
        expenseName: 'Loft',
        quantity: 38.5,
        unit: 'Sq.ft',
        rate: 400,
        totalAmount: 15400
      },

      // TRANSPORTATION
      {
        id: 'exp-int-22',
        clientId: 'interior-client-1',
        sNo: 22,
        category: 'TRANSPORTATION',
        date: '2026-04-04',
        expenseName: 'Transportation',
        quantity: 1,
        unit: 'Trip',
        rate: 3000,
        totalAmount: 3000
      }
    ]
  },
  {
    id: 'interior-client-2',
    sNo: 2,
    name: 'Mrs. Jayalakshmi Sundaram',
    phone: '94432 87654',
    address: 'Plot #45, Anna Nagar 2nd Street, Madurai',
    siteLocation: 'Duplex Penthouse',
    projectScope: 'Wardrobes, TV Unit, Wallpaper & Designer Glass Partitions',
    createdAt: '2026-08-15',
    updatedAt: '2026-08-28',
    advancePayments: [
      {
        id: 'adv-int-3',
        clientId: 'interior-client-2',
        sNo: 1,
        date: '2026-08-15',
        amount: 200000,
        mode: 'Canara Bank',
        note: 'Project Token Advance'
      }
    ],
    expenses: [
      {
        id: 'exp-int-23',
        clientId: 'interior-client-2',
        sNo: 1,
        category: 'WARDROBES - MASTER BEDROOM',
        date: '2026-08-18',
        expenseName: 'Wardrobe (Shutter)',
        quantity: 58,
        unit: 'Sq.ft',
        rate: 450,
        totalAmount: 26100
      }
    ]
  }
];
