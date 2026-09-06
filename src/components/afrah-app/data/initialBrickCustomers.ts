import type { BrickCustomer } from '../types';

export const INITIAL_BRICK_CUSTOMERS: BrickCustomer[] = [
  {
    id: 'bc_01',
    sNo: 1,
    name: 'Kabibullah Rahman',
    phone: '+91 98410 23456',
    address: 'No. 45, Anna Nagar Main Road, Madurai - 625020',
    balance: 48500,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-02-15T14:30:00.000Z',
    transactions: [
      {
        id: 'btx_01',
        customerId: 'bc_01',
        sNo: 1,
        date: '2026-01-15',
        brickType: 'Red Chamber Bricks (1st Quality)',
        quantity: 5000,
        rate: 11.5,
        totalAmount: 57500,
        paidAmount: 30000,
        balanceAmount: 27500,
        siteLocation: 'Site #12, Ellis Nagar',
        vehicleNumber: 'TN 58 AA 4521',
        notes: 'First delivery batch of 5k chamber bricks'
      },
      {
        id: 'btx_02',
        customerId: 'bc_01',
        sNo: 2,
        date: '2026-02-10',
        brickType: 'Fly Ash Bricks',
        quantity: 3500,
        rate: 6.0,
        totalAmount: 21000,
        paidAmount: 0,
        balanceAmount: 21000,
        siteLocation: 'Site #12, Ellis Nagar (Compound Wall)',
        vehicleNumber: 'TN 58 B 8899',
        notes: 'Fly ash bricks for boundary wall'
      }
    ]
  },
  {
    id: 'bc_02',
    sNo: 2,
    name: 'Murugan Builders & Promoters',
    phone: '+91 97890 11223',
    address: 'Plot 18, Bypass Road, Ponmeni, Madurai - 625016',
    balance: 82000,
    createdAt: '2026-01-18T10:15:00.000Z',
    updatedAt: '2026-02-20T11:00:00.000Z',
    transactions: [
      {
        id: 'btx_03',
        customerId: 'bc_02',
        sNo: 1,
        date: '2026-01-20',
        brickType: 'Red Chamber Bricks (1st Quality)',
        quantity: 10000,
        rate: 11.2,
        totalAmount: 112000,
        paidAmount: 50000,
        balanceAmount: 62000,
        siteLocation: 'Murugan Residency, Ponmeni',
        vehicleNumber: 'TN 59 C 1204',
        notes: '10,000 units delivered in two tippers'
      },
      {
        id: 'btx_04',
        customerId: 'bc_02',
        sNo: 2,
        date: '2026-02-05',
        brickType: 'Solid Concrete Blocks (6 inch)',
        quantity: 2000,
        rate: 35.0,
        totalAmount: 70000,
        paidAmount: 50000,
        balanceAmount: 20000,
        siteLocation: 'Murugan Residency, Ponmeni',
        vehicleNumber: 'TN 59 C 1204',
        notes: '6 inch solid concrete blocks'
      }
    ]
  },
  {
    id: 'bc_03',
    sNo: 3,
    name: 'Senthil Kumar (Alagar Villa)',
    phone: '+91 94433 78901',
    address: '7/2B, K.K. Nagar West Street, Madurai - 625020',
    balance: 15500,
    createdAt: '2026-02-01T12:00:00.000Z',
    updatedAt: '2026-02-22T16:45:00.000Z',
    transactions: [
      {
        id: 'btx_05',
        customerId: 'bc_03',
        sNo: 1,
        date: '2026-02-04',
        brickType: 'Wire Cut Bricks',
        quantity: 3000,
        rate: 18.5,
        totalAmount: 55500,
        paidAmount: 40000,
        balanceAmount: 15500,
        siteLocation: 'Alagar Villa Individual House, KK Nagar',
        vehicleNumber: 'TN 58 AX 7712',
        notes: 'Premium wire cut bricks for exterior elevation'
      }
    ]
  },
  {
    id: 'bc_04',
    sNo: 4,
    name: 'Vasanth Civil Infrastructure',
    phone: '+91 98940 55667',
    address: 'Industrial Estate, Kappalur, Madurai - 625008',
    balance: 120000,
    createdAt: '2026-02-12T14:20:00.000Z',
    updatedAt: '2026-02-28T09:10:00.000Z',
    transactions: [
      {
        id: 'btx_06',
        customerId: 'bc_04',
        sNo: 1,
        date: '2026-02-14',
        brickType: 'Solid Concrete Blocks (4 inch)',
        quantity: 4000,
        rate: 30.0,
        totalAmount: 120000,
        paidAmount: 0,
        balanceAmount: 120000,
        siteLocation: 'Warehouse Unit 4, Kappalur SIDCO',
        vehicleNumber: 'TN 64 K 3321',
        notes: 'Commercial warehouse partition blocks'
      }
    ]
  }
];
