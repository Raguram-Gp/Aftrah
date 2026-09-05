import { useState, useEffect, useCallback, useMemo } from 'react';
import type { BrickStockItem, BrickStockItemEntry } from '../types';
import { INITIAL_BRICK_STOCK_ITEMS } from '../data/initialBrickStock';

const LOCAL_STORAGE_ITEMS_KEY = 'aftrah_brick_stock_items_v10';

// Helper to recalculate item totals from its entries and opening stock
const recalculateItemTotals = (item: BrickStockItem): BrickStockItem => {
  const baseOpening = Number(item.stockOpening) || 0;
  const entries = item.entries || [];
  const isBricks = item.item.toLowerCase() === 'bricks';

  let totalProd = 0;
  let totalSalesOrUsage = 0;
  let runningOpening = baseOpening;

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const updatedEntries: BrickStockItemEntry[] = sortedEntries.map((e, idx) => {
    let prod = 0;
    let salesOrUsage = 0;
    let pending = 0;

    const opening = runningOpening; // Carried forward from previous entry

    if (isBricks) {
      prod = Number(e.currentProduction || (e.type === 'production' ? e.quantity : 0)) || 0;
      salesOrUsage = Number(e.sales || (e.type === 'sales' ? e.quantity : 0)) || 0;
      pending = opening + prod - salesOrUsage;
    } else {
      // Raw materials (Soil, Msand, Wood, Diesel): Pending Stock = Stock Opening - Material Usage
      prod = 0;
      salesOrUsage = Number(e.materialUsage !== undefined ? e.materialUsage : e.sales) || 0;
      pending = opening - salesOrUsage;
    }

    totalProd += prod;
    totalSalesOrUsage += salesOrUsage;
    runningOpening = pending; // Carried forward to next entry

    return {
      ...e,
      sNo: idx + 1,
      item: e.item || item.item,
      stockOpening: opening,
      currentProduction: prod,
      sales: salesOrUsage,
      materialUsage: salesOrUsage,
      materialInflow: 0,
      pendingStock: pending,
      balanceAfter: pending,
      type: isBricks
        ? prod >= salesOrUsage
          ? 'production'
          : 'sales'
        : 'usage',
      quantity: isBricks && prod > 0 ? prod : salesOrUsage
    };
  });

  const finalPendingStock = isBricks
    ? baseOpening + totalProd - totalSalesOrUsage
    : baseOpening - totalSalesOrUsage;

  return {
    ...item,
    currentProduction: totalProd,
    sales: totalSalesOrUsage,
    materialUsage: totalSalesOrUsage,
    pendingStock: finalPendingStock,
    entries: updatedEntries,
    updatedAt: new Date().toISOString()
  };
};

export const useBrickStock = () => {
  const [stockItems, setStockItems] = useState<BrickStockItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const hasCore = parsed.some(
              (x: any) => x.item === 'Soil' || x.item === 'Bricks' || x.item === 'Msand'
            );
            if (hasCore) return parsed;
          }
        }
      } catch (e) {
        console.warn('Unable to read brick stock items from localStorage', e);
      }
    }
    return INITIAL_BRICK_STOCK_ITEMS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync items to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(stockItems));
      } catch (e) {
        console.warn('Unable to persist brick stock items', e);
      }
    }
  }, [stockItems]);

  // Reset to initial stock items
  const resetToDefaultStock = useCallback(() => {
    setStockItems(INITIAL_BRICK_STOCK_ITEMS);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(INITIAL_BRICK_STOCK_ITEMS));
      } catch (e) {
        console.warn('Unable to reset stock items', e);
      }
    }
  }, []);

  // Add Stock Item
  const addStockItem = useCallback(
    async (
      data: Omit<BrickStockItem, 'id' | 'sNo' | 'pendingStock' | 'createdAt' | 'updatedAt'>
    ) => {
      try {
        setError(null);
        const isBricks = data.item.trim().toLowerCase() === 'bricks';
        const opening = Number(data.stockOpening) || 0;
        const production = isBricks ? Number(data.currentProduction) || 0 : 0;
        const sales = Number(data.sales) || Number(data.materialUsage) || 0;
        const pending = isBricks ? opening + production - sales : opening - sales;

        const newItem: BrickStockItem = {
          id: `bsi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          sNo: 1,
          item: data.item.trim(),
          stockOpening: opening,
          currentProduction: production,
          sales: sales,
          materialUsage: sales,
          pendingStock: pending,
          unitName: data.unitName || 'Units',
          notes: data.notes || '',
          entries: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setStockItems((prev) => {
          const next = [newItem, ...prev];
          return next.map((s, idx) => ({ ...s, sNo: idx + 1 }));
        });

        return newItem;
      } catch (err: any) {
        setError(err.message || 'Failed to add stock item');
        throw err;
      }
    },
    []
  );

  // Update Stock Item
  const updateStockItem = useCallback(
    async (updated: BrickStockItem) => {
      try {
        setError(null);
        setStockItems((prev) =>
          prev.map((s) => {
            if (s.id !== updated.id) return s;
            const merged = {
              ...s,
              ...updated,
              item: updated.item.trim(),
              stockOpening: Number(updated.stockOpening) || 0,
              entries: updated.entries !== undefined ? updated.entries : s.entries || []
            };
            return recalculateItemTotals(merged);
          })
        );
      } catch (err: any) {
        setError(err.message || 'Failed to update stock item');
        throw err;
      }
    },
    []
  );

  // Delete Stock Item
  const deleteStockItem = useCallback(async (id: string) => {
    try {
      setError(null);
      setStockItems((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        return filtered.map((s, idx) => ({ ...s, sNo: idx + 1 }));
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete stock item');
      throw err;
    }
  }, []);

  // Delete Multiple Stock Items
  const deleteMultipleStockItems = useCallback(async (ids: string[]) => {
    try {
      setError(null);
      const idSet = new Set(ids);
      setStockItems((prev) => {
        const filtered = prev.filter((s) => !idSet.has(s.id));
        return filtered.map((s, idx) => ({ ...s, sNo: idx + 1 }));
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete selected stock items');
      throw err;
    }
  }, []);

  // Add Detailed Entry to a specific Stock Item
  const addStockItemEntry = useCallback(
    async (
      itemId: string,
      entryData: {
        date: string;
        currentProduction?: number;
        sales?: number;
        materialUsage?: number;
        materialInflow?: number;
        vehicleNumber?: string;
        batchNo?: string;
        customerName?: string;
        notes?: string;
      }
    ) => {
      try {
        setError(null);
        const targetItem = stockItems.find((x) => x.id === itemId);
        const isBricks = targetItem?.item.toLowerCase() === 'bricks';

        const prod = isBricks
          ? Number(entryData.currentProduction || 0)
          : 0;

        const usageOrSales = Number(
          entryData.materialUsage !== undefined
            ? entryData.materialUsage
            : entryData.sales || 0
        ) || 0;

        const newEntry: BrickStockItemEntry = {
          id: `bse_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          sNo: 1,
          date: entryData.date,
          item: targetItem?.item || '',
          stockOpening: 0, // will be recalculated automatically
          currentProduction: prod,
          sales: usageOrSales,
          materialUsage: usageOrSales,
          materialInflow: 0,
          pendingStock: 0, // will be recalculated automatically
          type: isBricks
            ? prod >= usageOrSales
              ? 'production'
              : 'sales'
            : 'usage',
          quantity: isBricks && prod > 0 ? prod : usageOrSales,
          batchNo: entryData.batchNo || '',
          vehicleNumber: entryData.vehicleNumber || '',
          customerName: entryData.customerName || '',
          notes: entryData.notes || '',
          balanceAfter: 0,
          createdAt: new Date().toISOString()
        };

        setStockItems((prev) =>
          prev.map((item) => {
            if (item.id !== itemId) return item;
            const updatedEntries = [...(item.entries || []), newEntry];
            return recalculateItemTotals({ ...item, entries: updatedEntries });
          })
        );

        return newEntry;
      } catch (err: any) {
        setError(err.message || 'Failed to add stock entry');
        throw err;
      }
    },
    [stockItems]
  );

  // Update Detailed Entry in a specific Stock Item
  const updateStockItemEntry = useCallback(
    async (itemId: string, updatedEntry: BrickStockItemEntry) => {
      try {
        setError(null);
        setStockItems((prev) =>
          prev.map((item) => {
            if (item.id !== itemId) return item;
            const updatedEntries = (item.entries || []).map((e) =>
              e.id === updatedEntry.id ? { ...updatedEntry } : e
            );
            return recalculateItemTotals({ ...item, entries: updatedEntries });
          })
        );
      } catch (err: any) {
        setError(err.message || 'Failed to update stock entry');
        throw err;
      }
    },
    []
  );

  // Delete Detailed Entry from a specific Stock Item
  const deleteStockItemEntry = useCallback(async (itemId: string, entryId: string) => {
    try {
      setError(null);
      setStockItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          const updatedEntries = (item.entries || []).filter((e) => e.id !== entryId);
          return recalculateItemTotals({ ...item, entries: updatedEntries });
        })
      );
    } catch (err: any) {
      setError(err.message || 'Failed to delete stock entry');
      throw err;
    }
  }, []);

  // Delete Multiple Detailed Entries from a specific Stock Item
  const deleteMultipleStockItemEntries = useCallback(async (itemId: string, entryIds: string[]) => {
    try {
      setError(null);
      const idSet = new Set(entryIds);
      setStockItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          const updatedEntries = (item.entries || []).filter((e) => !idSet.has(e.id));
          return recalculateItemTotals({ ...item, entries: updatedEntries });
        })
      );
    } catch (err: any) {
      setError(err.message || 'Failed to delete selected stock entries');
      throw err;
    }
  }, []);

  // Summary Aggregations
  const stats = useMemo(() => {
    const totalOpening = stockItems.reduce((sum, item) => sum + (Number(item.stockOpening) || 0), 0);
    const totalProduction = stockItems.reduce((sum, item) => sum + (Number(item.currentProduction) || 0), 0);
    const totalSales = stockItems.reduce((sum, item) => sum + (Number(item.sales) || 0), 0);
    const totalPendingStock = stockItems.reduce((sum, item) => sum + (Number(item.pendingStock) || 0), 0);

    return {
      totalOpening,
      totalProduction,
      totalSales,
      totalPendingStock,
      totalStockUnits: totalPendingStock
    };
  }, [stockItems]);

  return {
    stockItems,
    isLoading,
    error,
    stats,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    deleteMultipleStockItems,
    addStockItemEntry,
    updateStockItemEntry,
    deleteStockItemEntry,
    deleteMultipleStockItemEntries,
    resetToDefaultStock
  };
};
