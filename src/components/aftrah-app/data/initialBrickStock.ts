import type { BrickStockItem } from '../types';

export const INITIAL_BRICK_STOCK_ITEMS: BrickStockItem[] = [
  {
    id: 'bsi_soil',
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
        id: 'bse_s1',
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
    id: 'bsi_bricks',
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
        id: 'bse_b1',
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
    id: 'bsi_diesel',
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
        id: 'bse_d1',
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
    id: 'bsi_msand',
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
        id: 'bse_m1',
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
    id: 'bsi_wood',
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
        id: 'bse_w1',
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
