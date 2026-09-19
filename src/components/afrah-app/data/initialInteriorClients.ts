import type { InteriorClient } from '../types';

export const INITIAL_INTERIOR_CLIENTS: InteriorClient[] = [
  {
    id: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
    sNo: 1,
    name: 'Mr. Afrah Construction',
    phone: '98401 23456',
    address: 'Uthamapalayam',
    siteLocation: 'Quote No: Q/04.04.2026 · First Floor',
    projectScope: 'Materials of 16mm MDF with Mica lamination and 6mm Back-panel ply with PVC edgeband along with Handles and Hardwares',
    quoteDate: '2026-04-04',
    quoteNo: 'Q/2026/001',
    createdAt: '2026-04-04',
    updatedAt: '2026-04-20',
    advancePayments: [
      {
        id: '6306931a-bde2-4df9-b6c8-030dd7459a13',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
        sNo: 1,
        date: '2026-04-04',
        amount: 163845,
        mode: 'HDFC Bank',
        note: '50% Advance on confirmation & PO'
      },
      {
        id: 'b78f3811-e7a2-4f88-a4a6-bd3bc1d677f7',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '08a6c13c-959c-4760-aa49-d20a82e313c1',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '1d11116c-b484-4b0b-baee-884cf8835721',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: 'cd6f3708-6e37-4fb0-b5d2-fd65b8300cd1',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: 'e17d4707-ae36-4831-a688-faeeb03a8688',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '5d844b6b-2d0e-471f-9a2d-a92545bce91e',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: 'fef3170f-1afa-4c80-b328-531656cdf189',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '59c7b35b-0e95-4b8b-8766-9a9113edd3c5',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '161ba643-ad77-42ad-b5aa-5aa7574aff6d',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: 'c97e6126-9c6b-43cd-8f88-8d28089c7f74',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '7719d583-38e7-4745-9725-9da5beb974c7',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: 'e5c976b8-f128-42e2-b915-c80e46c574d5',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '71d5640d-4ee2-4fbc-89b6-69040d4f551f',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '696e7a7d-cea2-4e74-9f96-c8bd804f7b8e',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '9bcf8348-be2a-4d84-b972-d6e97a0f9bac',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '22aeebe7-a3bd-4328-8a86-f0de280cb533',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '26e0e48b-f599-46a9-857e-0e98a0671499',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '1a051859-8368-4857-a052-9da30bd96c46',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '10ff3a45-1a65-496f-87d9-c67a91173595',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '6e85b2a5-24ad-4bc0-a455-5ad090ef9170',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '20d81efa-1232-4854-9f03-cdc53c0622fb',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '33ba41bb-c833-47ac-bbf4-22d5f8ce5f52',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
        id: '056d2aee-c998-4b90-9e23-2fb869791f2a',
        clientId: '0896d394-5b7f-4879-86ee-77ee8f50a31d',
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
    id: '308e92fb-69fa-4fe4-b206-1259d1ad6510',
    sNo: 2,
    name: 'Mrs. Jayalakshmi Sundaram',
    phone: '94432 87654',
    address: 'Plot #45, Anna Nagar 2nd Street, Madurai',
    siteLocation: 'Duplex Penthouse',
    projectScope: 'Wardrobes, TV Unit, Wallpaper & Designer Glass Partitions',
    quoteDate: '2026-08-15',
    quoteNo: 'Q/2026/002',
    createdAt: '2026-08-15',
    updatedAt: '2026-08-28',
    advancePayments: [
      {
        id: '06cc6d09-c7b5-47e1-b2fa-e2f4ae30fd38',
        clientId: '308e92fb-69fa-4fe4-b206-1259d1ad6510',
        sNo: 1,
        date: '2026-08-15',
        amount: 200000,
        mode: 'Canara Bank',
        note: 'Project Token Advance'
      }
    ],
    expenses: [
      {
        id: 'b0ad0f1e-a5cc-4c00-8f13-4ac7fbdba514',
        clientId: '308e92fb-69fa-4fe4-b206-1259d1ad6510',
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
