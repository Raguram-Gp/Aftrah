import type { Vendor } from '../types';

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vendor-1',
    sNo: 1,
    type: 'Bricks',
    createdAt: '2026-01-02',
    shops: [
      {
        id: 'shop-1',
        sNo: 1,
        name: 'Ramesh Bricks',
        phone: '+91 98451 22334',
        address: 'Hosur Road, Brick Kiln Industrial Zone, Bengaluru',
        createdAt: '2026-01-05',
        transactions: [
          {
            id: 'tx-1',
            sNo: 1,
            date: '2026-01-10',
            itemType: 'Wirecut Red Bricks',
            clientName: 'Rajeshwar Singhania',
            quantity: 10000,
            rate: 12,
            totalAmount: 120000,
            receivedAmount: 80000,
            balanceAmount: 40000
          },
          {
            id: 'tx-2',
            sNo: 2,
            date: '2026-01-22',
            itemType: 'Solid Concrete Blocks (6")',
            clientName: 'Nandini Kothari',
            quantity: 2500,
            rate: 42,
            totalAmount: 105000,
            receivedAmount: 60000,
            balanceAmount: 45000
          },
          {
            id: 'tx-3',
            sNo: 3,
            date: '2026-02-05',
            itemType: 'Fly Ash Bricks',
            clientName: 'Dr. Jayaprakash Raman',
            quantity: 8000,
            rate: 8.5,
            totalAmount: 68000,
            receivedAmount: 50000,
            balanceAmount: 18000
          },
          {
            id: 'tx-4',
            sNo: 4,
            date: '2026-02-18',
            itemType: 'Country Clay Bricks',
            clientName: 'Dr. Vikramaditya Reddy',
            quantity: 6000,
            rate: 11,
            totalAmount: 66000,
            receivedAmount: 30000,
            balanceAmount: 36000
          }
        ]
      },
      {
        id: 'shop-2',
        sNo: 2,
        name: 'Sri Balaji Clay Works',
        phone: '+91 97420 55678',
        address: 'Nelamangala Highway, Bengaluru',
        createdAt: '2026-01-12',
        transactions: [
          {
            id: 'tx-201',
            sNo: 1,
            date: '2026-01-15',
            itemType: 'First Quality Chamber Bricks',
            clientName: 'Manish Chawla',
            quantity: 12000,
            rate: 12.5,
            totalAmount: 150000,
            receivedAmount: 100000,
            balanceAmount: 50000
          },
          {
            id: 'tx-202',
            sNo: 2,
            date: '2026-02-02',
            itemType: 'Hollow Blocks (8")',
            clientName: 'Ananya Deshmukh',
            quantity: 1500,
            rate: 55,
            totalAmount: 82500,
            receivedAmount: 47500,
            balanceAmount: 35000
          }
        ]
      },
      {
        id: 'shop-3',
        sNo: 3,
        name: 'Supreme Pavers & Blocks',
        phone: '+91 99800 11445',
        address: 'Whitefield Main Road, Bengaluru',
        createdAt: '2026-01-20',
        transactions: [
          {
            id: 'tx-301',
            sNo: 1,
            date: '2026-02-08',
            itemType: 'Interlocking Paver Blocks',
            clientName: 'Karthik Sundaram',
            quantity: 2000,
            rate: 36,
            totalAmount: 72000,
            receivedAmount: 20000,
            balanceAmount: 52000
          }
        ]
      }
    ]
  },
  {
    id: 'vendor-2',
    sNo: 2,
    type: 'Hardware',
    createdAt: '2026-01-05',
    shops: [
      {
        id: 'shop-201',
        sNo: 1,
        name: 'Classic Hardware & Tools',
        phone: '+91 98440 66778',
        address: 'SP Road, Hardware Market, Bengaluru',
        createdAt: '2026-01-08',
        transactions: [
          {
            id: 'tx-401',
            sNo: 1,
            date: '2026-01-14',
            itemType: 'Fasteners & Binding Wire',
            clientName: 'Rajeshwar Singhania',
            quantity: 50,
            rate: 950,
            totalAmount: 47500,
            receivedAmount: 30000,
            balanceAmount: 17500
          }
        ]
      }
    ]
  },
  {
    id: 'vendor-3',
    sNo: 3,
    type: 'M.Sand',
    createdAt: '2026-01-08',
    shops: [
      {
        id: 'shop-301',
        sNo: 1,
        name: 'Kaveri Aggregates & M-Sand',
        phone: '+91 98860 33445',
        address: 'Kengeri Quarry Road, Bengaluru',
        createdAt: '2026-01-10',
        transactions: [
          {
            id: 'tx-501',
            sNo: 1,
            date: '2026-01-18',
            itemType: 'Manufactured Plastering Sand',
            clientName: 'Rohan Mehra',
            quantity: 6,
            rate: 18500,
            totalAmount: 111000,
            receivedAmount: 70000,
            balanceAmount: 41000
          }
        ]
      }
    ]
  },
  { id: 'vendor-4', sNo: 4, type: 'Jelly', createdAt: '2026-01-10', shops: [] },
  { id: 'vendor-5', sNo: 5, type: 'Cement', createdAt: '2026-01-12', shops: [] },
  { id: 'vendor-6', sNo: 6, type: 'Steel', createdAt: '2026-01-15', shops: [] },
  { id: 'vendor-7', sNo: 7, type: 'Paint', createdAt: '2026-01-18', shops: [] },
  { id: 'vendor-8', sNo: 8, type: 'Centring', createdAt: '2026-01-20', shops: [] },
  { id: 'vendor-9', sNo: 9, type: 'Gravel', createdAt: '2026-01-22', shops: [] },
  { id: 'vendor-10', sNo: 10, type: 'Electricals', createdAt: '2026-01-25', shops: [] },
  { id: 'vendor-11', sNo: 11, type: 'Tiles', createdAt: '2026-01-28', shops: [] },
  { id: 'vendor-12', sNo: 12, type: 'Carpentry / Timber', createdAt: '2026-02-01', shops: [] },
  { id: 'vendor-13', sNo: 13, type: 'Plumbing & Sanitaryware', createdAt: '2026-02-05', shops: [] },
  { id: 'vendor-14', sNo: 14, type: 'Glass & Aluminium', createdAt: '2026-02-08', shops: [] },
  { id: 'vendor-15', sNo: 15, type: 'Safety Equipments', createdAt: '2026-02-12', shops: [] }
];
