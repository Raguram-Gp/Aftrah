import type { BrickStockItem } from '../types';

export const INITIAL_BRICK_STOCK_ITEMS: BrickStockItem[] = [
  {
    id: '83d02ddf-c50c-4035-98fa-ae0aa82d1d64',
    sNo: 1,
    item: 'Soil',
    stockOpening: 10000,
    currentProduction: 0,
    sales: 5000,
    materialUsage: 5000,
    pendingStock: 5000,
    unitName: 'Units / Loads',
    entries: [
      {
        id: 'bd7c41b6-ccd7-41cf-913a-616545766fb1',
        sNo: 1,
        date: '2026-09-01',
        item: 'Soil',
        stockOpening: 10000,
        currentProduction: 0,
        sales: 5000,
        materialUsage: 5000,
        materialInflow: 0,
        pendingStock: 5000,
        type: 'usage',
        quantity: 5000,
        balanceAfter: 5000,
        createdAt: '2026-09-01T09:00:00.000Z'
      }
    ],
    createdAt: '2026-09-01T09:00:00.000Z',
    updatedAt: '2026-09-01T09:00:00.000Z'
  },
  {
    id: 'be2481e2-71ab-49b5-96c2-7a8501040a32',
    sNo: 2,
    item: 'Bricks',
    stockOpening: 10000,
    currentProduction: 50000,
    sales: 35000,
    materialUsage: 0,
    pendingStock: 25000,
    unitName: 'Units',
    entries: [
      {
        id: '988255ed-8b04-4d2b-9b21-db3edda42a88',
        sNo: 1,
        date: '2026-09-01',
        item: 'Bricks',
        stockOpening: 10000,
        currentProduction: 50000,
        sales: 35000,
        materialUsage: 0,
        materialInflow: 50000,
        pendingStock: 25000,
        type: 'production',
        quantity: 50000,
        batchNo: 'Kiln Chamber #3 & #4',
        vehicleNumber: 'TN 58 B 7712',
        customerName: 'Kabibullah Bricks Production Run',
        balanceAfter: 25000,
        createdAt: '2026-09-01T10:00:00.000Z'
      }
    ],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z'
  },
  {
    id: '5c23fdbe-0d88-4c74-a0b0-aa0a4adc5baf',
    sNo: 3,
    item: 'Diesel',
    stockOpening: 5000,
    currentProduction: 0,
    sales: 1500,
    materialUsage: 1500,
    pendingStock: 3500,
    unitName: 'Liters',
    entries: [
      {
        id: '30d0a371-380b-4c47-9e46-6afe4f558a2b',
        sNo: 1,
        date: '2026-09-01',
        item: 'Diesel',
        stockOpening: 5000,
        currentProduction: 0,
        sales: 1500,
        materialUsage: 1500,
        materialInflow: 0,
        pendingStock: 3500,
        type: 'usage',
        quantity: 1500,
        balanceAfter: 3500,
        createdAt: '2026-09-01T08:00:00.000Z'
      }
    ],
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'a3b8aa3e-63e7-4e7c-a6e0-a6bb1e1219a1',
    sNo: 4,
    item: 'Msand',
    stockOpening: 10,
    currentProduction: 0,
    sales: 5,
    materialUsage: 5,
    pendingStock: 5,
    unitName: 'Units / kg',
    entries: [
      {
        id: '270c3bbf-aa3e-4342-b870-91f5165db675',
        sNo: 1,
        date: '2026-09-01',
        item: 'Msand',
        stockOpening: 10,
        currentProduction: 0,
        sales: 5,
        materialUsage: 5,
        materialInflow: 0,
        pendingStock: 5,
        type: 'usage',
        quantity: 5,
        balanceAfter: 5,
        createdAt: '2026-09-01T11:00:00.000Z'
      }
    ],
    createdAt: '2026-09-01T11:00:00.000Z',
    updatedAt: '2026-09-01T11:00:00.000Z'
  },
  {
    id: '17e005d0-c608-47b9-a160-0d73b0a35a26',
    sNo: 5,
    item: 'Wood',
    stockOpening: 12,
    currentProduction: 0,
    sales: 4,
    materialUsage: 4,
    pendingStock: 8,
    unitName: 'Units / Tons',
    entries: [
      {
        id: '74c2f8d1-afc1-473e-afdb-5254b28e04cd',
        sNo: 1,
        date: '2026-09-01',
        item: 'Wood',
        stockOpening: 12,
        currentProduction: 0,
        sales: 4,
        materialUsage: 4,
        materialInflow: 0,
        pendingStock: 8,
        type: 'usage',
        quantity: 4,
        balanceAfter: 8,
        createdAt: '2026-09-01T14:00:00.000Z'
      }
    ],
    createdAt: '2026-09-01T14:00:00.000Z',
    updatedAt: '2026-09-01T14:00:00.000Z'
  }
];
