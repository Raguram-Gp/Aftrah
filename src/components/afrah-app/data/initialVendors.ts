import type { Vendor } from '../types';

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: '3acca178-53d5-4f66-9b94-af4cf9c48d32',
    sNo: 1,
    type: 'Bricks',
    createdAt: '2026-01-02',
    shops: [
      {
        id: '6f8ef6fd-1672-45df-941f-3925b921da13',
        sNo: 1,
        name: 'Ramesh Bricks',
        phone: '+91 98451 22334',
        address: 'Hosur Road, Brick Kiln Industrial Zone, Bengaluru',
        createdAt: '2026-01-05',
        transactions: [
          {
            id: 'ece59b9a-3ff5-4c2f-b04f-6df95d889356',
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
            id: '1a1929f2-197d-4d43-bd1a-60af3961b800',
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
            id: '7cf60815-7b13-4397-a0ef-fcd67c67cf98',
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
            id: '95619237-af72-44d5-879a-831211eceea4',
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
        id: '765849b5-09ce-4f8c-b942-e428a2dd7c9c',
        sNo: 2,
        name: 'Sri Balaji Clay Works',
        phone: '+91 97420 55678',
        address: 'Nelamangala Highway, Bengaluru',
        createdAt: '2026-01-12',
        transactions: [
          {
            id: 'a19e2409-530a-47b4-a69f-32d341d2d5c7',
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
            id: '2dd6d727-8e06-4c84-9292-5cdd853649cf',
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
        id: '14d91f78-2092-4ab1-8428-76bb7b8031da',
        sNo: 3,
        name: 'Supreme Pavers & Blocks',
        phone: '+91 99800 11445',
        address: 'Whitefield Main Road, Bengaluru',
        createdAt: '2026-01-20',
        transactions: [
          {
            id: 'e874c5cb-8463-4fc4-b143-2b3179eb1f5f',
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
    id: 'e733dd8d-17d0-4e1b-9e90-d4f89719315d',
    sNo: 2,
    type: 'Hardware',
    createdAt: '2026-01-05',
    shops: [
      {
        id: 'f01b69e6-b061-4431-a963-4e401cea6f61',
        sNo: 1,
        name: 'Classic Hardware & Tools',
        phone: '+91 98440 66778',
        address: 'SP Road, Hardware Market, Bengaluru',
        createdAt: '2026-01-08',
        transactions: [
          {
            id: 'bd130548-df98-444b-8b5e-ee701abf6949',
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
    id: 'af917430-1c94-4aa9-8f5c-ae363b7bb62f',
    sNo: 3,
    type: 'M.Sand',
    createdAt: '2026-01-08',
    shops: [
      {
        id: 'fd6d5c6c-8127-494a-8c00-4f88b7bc2f07',
        sNo: 1,
        name: 'Kaveri Aggregates & M-Sand',
        phone: '+91 98860 33445',
        address: 'Kengeri Quarry Road, Bengaluru',
        createdAt: '2026-01-10',
        transactions: [
          {
            id: 'deca4756-2897-4ddc-adf2-48d226c32d30',
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
  { id: '7b6d7299-a714-4059-973f-a3055a86d452', sNo: 4, type: 'Jelly', createdAt: '2026-01-10', shops: [] },
  { id: '59af85b2-1969-4b32-97af-af58235d66b3', sNo: 5, type: 'Cement', createdAt: '2026-01-12', shops: [] },
  { id: '589bdf32-bd98-405e-82a5-458c1bbf0ea4', sNo: 6, type: 'Steel', createdAt: '2026-01-15', shops: [] },
  { id: 'aefea9b5-a5d6-4311-9978-5e8bc51ad56f', sNo: 7, type: 'Paint', createdAt: '2026-01-18', shops: [] },
  { id: 'fcfc3a51-a0e6-45ec-943e-c594be7cc327', sNo: 8, type: 'Centring', createdAt: '2026-01-20', shops: [] },
  { id: '61c9074e-b5a2-4c16-93b9-6d4f01da147c', sNo: 9, type: 'Gravel', createdAt: '2026-01-22', shops: [] },
  { id: 'd6dedcb0-3b45-465c-8a4d-d615010ceeab', sNo: 10, type: 'Electricals', createdAt: '2026-01-25', shops: [] },
  { id: 'd2e09485-086b-489a-a5ab-ca942042d56f', sNo: 11, type: 'Tiles', createdAt: '2026-01-28', shops: [] },
  { id: '84fefbb4-3705-4c48-a3b9-661772586022', sNo: 12, type: 'Carpentry / Timber', createdAt: '2026-02-01', shops: [] },
  { id: '869fbc66-bcb4-49be-9ce7-e3d60f4d2f9d', sNo: 13, type: 'Plumbing & Sanitaryware', createdAt: '2026-02-05', shops: [] },
  { id: '4764eae1-f0de-4003-8bcb-e360595c5412', sNo: 14, type: 'Glass & Aluminium', createdAt: '2026-02-08', shops: [] },
  { id: 'b52e7b8d-a1cc-40e5-86f2-98310e80dd1c', sNo: 15, type: 'Safety Equipments', createdAt: '2026-02-12', shops: [] }
];
