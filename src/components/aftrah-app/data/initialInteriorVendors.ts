import type { Vendor } from '../types';

export const INITIAL_INTERIOR_VENDORS: Vendor[] = [
  {
    id: 'int-vendor-1',
    sNo: 1,
    type: 'Hardware',
    createdAt: '2026-01-05',
    shops: [
      {
        id: 'int-shop-1',
        categoryId: 'int-vendor-1',
        sNo: 1,
        name: 'Hettich & Ebco Hardware Hub',
        phone: '+91 98401 22334',
        address: 'Mount Road, Interior Fitting Market, Chennai',
        createdAt: '2026-01-08',
        transactions: [
          {
            id: 'int-tx-1',
            vendorId: 'int-shop-1',
            sNo: 1,
            date: '2026-01-15',
            itemType: 'Tandem Box (8")',
            clientName: 'A.R. Rahman Villa - Kitchen',
            quantity: 6,
            rate: 3300,
            totalAmount: 19800,
            receivedAmount: 15000,
            balanceAmount: 4800,
            createdAt: '2026-01-15'
          },
          {
            id: 'int-tx-2',
            vendorId: 'int-shop-1',
            sNo: 2,
            date: '2026-01-22',
            itemType: 'Soft-close Hinges (Clip-on)',
            clientName: 'Dr. Vikramaditya Reddy',
            quantity: 40,
            rate: 280,
            totalAmount: 11200,
            receivedAmount: 11200,
            balanceAmount: 0,
            createdAt: '2026-01-22'
          }
        ]
      }
    ]
  },
  {
    id: 'int-vendor-2',
    sNo: 2,
    type: 'Carpenter',
    createdAt: '2026-01-06',
    shops: [
      {
        id: 'int-shop-2',
        categoryId: 'int-vendor-2',
        sNo: 1,
        name: 'Master Carpenter Team (Ibrahim & Co)',
        phone: '+91 98402 33445',
        address: 'Modular Woodwork Site & Carpentry Workshop, Chennai',
        createdAt: '2026-01-09',
        transactions: [
          {
            id: 'int-tx-3',
            vendorId: 'int-shop-2',
            sNo: 1,
            date: '2026-01-18',
            itemType: 'Wardrobe Box & Shutter Assembly Wages',
            clientName: 'A.R. Rahman Villa - Kitchen',
            quantity: 120,
            rate: 95,
            totalAmount: 11400,
            receivedAmount: 8000,
            balanceAmount: 3400,
            createdAt: '2026-01-18'
          }
        ]
      }
    ]
  },
  {
    id: 'int-vendor-3',
    sNo: 3,
    type: 'Plywoods',
    createdAt: '2026-01-07',
    shops: [
      {
        id: 'int-shop-3',
        categoryId: 'int-vendor-3',
        sNo: 1,
        name: 'Century & Green Plywoods Depot',
        phone: '+91 98403 44556',
        address: 'Timber & Plywood Yard, Sydenhams Road, Chennai',
        createdAt: '2026-01-10',
        transactions: [
          {
            id: 'int-tx-4',
            vendorId: 'int-shop-3',
            sNo: 1,
            date: '2026-01-20',
            itemType: 'BWP Marine Ply (710 Grade 18mm)',
            clientName: 'A.R. Rahman Villa - Kitchen',
            quantity: 15,
            rate: 2850,
            totalAmount: 42750,
            receivedAmount: 30000,
            balanceAmount: 12750,
            createdAt: '2026-01-20'
          },
          {
            id: 'int-tx-5',
            vendorId: 'int-shop-3',
            sNo: 2,
            date: '2026-02-02',
            itemType: 'HDHMR Action TESA Board 12mm',
            clientName: 'Dr. Vikramaditya Reddy',
            quantity: 10,
            rate: 1950,
            totalAmount: 19500,
            receivedAmount: 19500,
            balanceAmount: 0,
            createdAt: '2026-02-02'
          }
        ]
      }
    ]
  }
];
