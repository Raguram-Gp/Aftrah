import type { Vendor } from '../types';

export const INITIAL_INTERIOR_VENDORS: Vendor[] = [
  {
    id: '9e4bd853-f63c-42f7-8489-343f41d61a50',
    sNo: 1,
    type: 'Hardware',
    createdAt: '2026-01-05',
    shops: [
      {
        id: '63499bab-2100-4210-82bd-906efb734b6c',
        categoryId: '9e4bd853-f63c-42f7-8489-343f41d61a50',
        sNo: 1,
        name: 'Hettich & Ebco Hardware Hub',
        phone: '+91 98401 22334',
        address: 'Mount Road, Interior Fitting Market, Chennai',
        createdAt: '2026-01-08',
        transactions: [
          {
            id: 'f7e72ef5-3531-4587-a02a-c1a4bacd4e5c',
            vendorId: '63499bab-2100-4210-82bd-906efb734b6c',
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
            id: '5364e1db-64c0-411e-a305-e93ff9586ea0',
            vendorId: '63499bab-2100-4210-82bd-906efb734b6c',
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
    id: '7391596d-fcfd-45dd-b080-e6b22b596879',
    sNo: 2,
    type: 'Carpenter',
    createdAt: '2026-01-06',
    shops: [
      {
        id: 'fba5d945-8144-4e46-b535-e98899b589a8',
        categoryId: '7391596d-fcfd-45dd-b080-e6b22b596879',
        sNo: 1,
        name: 'Master Carpenter Team (Ibrahim & Co)',
        phone: '+91 98402 33445',
        address: 'Modular Woodwork Site & Carpentry Workshop, Chennai',
        createdAt: '2026-01-09',
        transactions: [
          {
            id: 'c7baf645-cdbf-4645-b3d0-a445993e71c9',
            vendorId: 'fba5d945-8144-4e46-b535-e98899b589a8',
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
    id: '3c695f47-33f4-4c5b-bea3-0b841d34f4e3',
    sNo: 3,
    type: 'Plywoods',
    createdAt: '2026-01-07',
    shops: [
      {
        id: '45de2aab-fb7c-4b64-b47a-353ff9cf1fd2',
        categoryId: '3c695f47-33f4-4c5b-bea3-0b841d34f4e3',
        sNo: 1,
        name: 'Century & Green Plywoods Depot',
        phone: '+91 98403 44556',
        address: 'Timber & Plywood Yard, Sydenhams Road, Chennai',
        createdAt: '2026-01-10',
        transactions: [
          {
            id: '8a608c9b-e3d2-4af3-a7c0-2f3650b048a1',
            vendorId: '45de2aab-fb7c-4b64-b47a-353ff9cf1fd2',
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
            id: 'a7682dca-274b-4016-aaa7-55d7a25b6a10',
            vendorId: '45de2aab-fb7c-4b64-b47a-353ff9cf1fd2',
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
