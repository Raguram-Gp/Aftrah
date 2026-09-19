import type { BrickCustomer } from '../types';

export const INITIAL_BRICK_CUSTOMERS: BrickCustomer[] = [
  {
    id: 'b7e1b5cc-53b8-4aff-a9e9-da009191bfac',
    sNo: 1,
    name: 'Kabibullah Rahman',
    phone: '+91 98410 23456',
    address: 'No. 45, Anna Nagar Main Road, Madurai - 625020',
    balance: 48500,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-02-15T14:30:00.000Z',
    transactions: [
      {
        id: '7e692795-6627-4797-9bb0-98a6359dac7b',
        customerId: 'b7e1b5cc-53b8-4aff-a9e9-da009191bfac',
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
        id: 'b83bb231-2dfc-4ef9-b9f5-35bbc0032a3f',
        customerId: 'b7e1b5cc-53b8-4aff-a9e9-da009191bfac',
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
    id: '7e278d82-58fa-4412-b32c-eef5d87c08e0',
    sNo: 2,
    name: 'Murugan Builders & Promoters',
    phone: '+91 97890 11223',
    address: 'Plot 18, Bypass Road, Ponmeni, Madurai - 625016',
    balance: 82000,
    createdAt: '2026-01-18T10:15:00.000Z',
    updatedAt: '2026-02-20T11:00:00.000Z',
    transactions: [
      {
        id: 'ad1d0b93-ba02-420f-8f05-390fee380180',
        customerId: '7e278d82-58fa-4412-b32c-eef5d87c08e0',
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
        id: 'ec40aa55-d196-45ff-9582-95bc9c032230',
        customerId: '7e278d82-58fa-4412-b32c-eef5d87c08e0',
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
    id: '8339512a-8c53-498a-90e9-b7150c712c63',
    sNo: 3,
    name: 'Senthil Kumar (Alagar Villa)',
    phone: '+91 94433 78901',
    address: '7/2B, K.K. Nagar West Street, Madurai - 625020',
    balance: 15500,
    createdAt: '2026-02-01T12:00:00.000Z',
    updatedAt: '2026-02-22T16:45:00.000Z',
    transactions: [
      {
        id: '66f9ad36-d062-4822-80a4-3313bf52949b',
        customerId: '8339512a-8c53-498a-90e9-b7150c712c63',
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
    id: 'ce09f637-0a30-4336-9ae8-3a32fc3d6c7c',
    sNo: 4,
    name: 'Vasanth Civil Infrastructure',
    phone: '+91 98940 55667',
    address: 'Industrial Estate, Kappalur, Madurai - 625008',
    balance: 120000,
    createdAt: '2026-02-12T14:20:00.000Z',
    updatedAt: '2026-02-28T09:10:00.000Z',
    transactions: [
      {
        id: '8cf9221f-18ae-43fa-8fe5-717d3db60995',
        customerId: 'ce09f637-0a30-4336-9ae8-3a32fc3d6c7c',
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
