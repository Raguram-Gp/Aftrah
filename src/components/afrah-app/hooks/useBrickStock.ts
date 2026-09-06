import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { BrickStockItem, BrickStockItemEntry } from '../types';

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
      prod = 0;
      salesOrUsage = Number(e.materialUsage !== undefined ? e.materialUsage : e.sales) || 0;
      pending = opening - salesOrUsage;
    }

    totalProd += prod;
    totalSalesOrUsage += salesOrUsage;
    runningOpening = pending;

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
  const [stockItems, setStockItems] = useState<BrickStockItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch from Supabase
  const fetchStockItems = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('brick_stock_items')
        .select(`
          id,
          s_no,
          item,
          stock_opening,
          current_production,
          sales,
          material_usage,
          pending_stock,
          unit_rate,
          unit_name,
          notes,
          created_at,
          updated_at,
          brick_stock_entries (
            id,
            stock_item_id,
            s_no,
            date,
            item,
            stock_opening,
            current_production,
            sales,
            material_usage,
            material_inflow,
            pending_stock,
            type,
            quantity,
            batch_no,
            vehicle_number,
            customer_name,
            notes,
            balance_after,
            created_at
          )
        `)
        .order('s_no', { ascending: true });

      if (fetchError) throw fetchError;

      if (data) {
        const mapped: BrickStockItem[] = data.map((item: any, idx: number) => {
          const rawEntries: BrickStockItemEntry[] = (item.brick_stock_entries || []).map((e: any) => ({
            id: e.id,
            stockItemId: e.stock_item_id,
            sNo: e.s_no,
            date: e.date,
            item: e.item,
            stockOpening: Number(e.stock_opening) || 0,
            currentProduction: Number(e.current_production) || 0,
            sales: Number(e.sales) || 0,
            materialUsage: Number(e.material_usage) || 0,
            materialInflow: Number(e.material_inflow) || 0,
            pendingStock: Number(e.pending_stock) || 0,
            type: e.type,
            quantity: Number(e.quantity) || 0,
            batchNo: e.batch_no || '',
            vehicleNumber: e.vehicle_number || '',
            customerName: e.customer_name || '',
            notes: e.notes || '',
            balanceAfter: Number(e.balance_after) || 0,
            createdAt: e.created_at
          }));

          const rawItem: BrickStockItem = {
            id: item.id,
            sNo: item.s_no || idx + 1,
            item: item.item,
            stockOpening: Number(item.stock_opening) || 0,
            currentProduction: Number(item.current_production) || 0,
            sales: Number(item.sales) || 0,
            materialUsage: Number(item.material_usage) || 0,
            pendingStock: Number(item.pending_stock) || 0,
            unitRate: Number(item.unit_rate) || 0,
            unitName: item.unit_name || 'Units',
            notes: item.notes || '',
            entries: rawEntries,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          };

          return recalculateItemTotals(rawItem);
        });

        setStockItems(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching brick stock from Supabase:', err);
      setError(err?.message || 'Failed to load brick stock');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockItems();
  }, [fetchStockItems]);

  // Sync recalculated item totals to Supabase
  const syncItemTotalsToDb = async (item: BrickStockItem) => {
    try {
      await supabase
        .from('brick_stock_items')
        .update({
          stock_opening: item.stockOpening,
          current_production: item.currentProduction,
          sales: item.sales,
          material_usage: item.materialUsage,
          pending_stock: item.pendingStock,
        })
        .eq('id', item.id);
    } catch (e) {
      console.warn('Failed to sync item totals to database:', e);
    }
  };

  // Add Stock Item
  const addStockItem = useCallback(
    async (
      data: Omit<BrickStockItem, 'id' | 'sNo' | 'pendingStock' | 'createdAt' | 'updatedAt'>
    ) => {
      try {
        setError(null);
        const sNo = stockItems.length + 1;
        const opening = Number(data.stockOpening) || 0;

        const { data: inserted, error: insertError } = await supabase
          .from('brick_stock_items')
          .insert({
            s_no: sNo,
            item: data.item.trim(),
            stock_opening: opening,
            current_production: 0,
            sales: 0,
            material_usage: 0,
            pending_stock: opening,
            unit_name: data.unitName || 'Units',
            notes: data.notes || null,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const newItem: BrickStockItem = {
          id: inserted.id,
          sNo: inserted.s_no,
          item: inserted.item,
          stockOpening: Number(inserted.stock_opening),
          currentProduction: 0,
          sales: 0,
          materialUsage: 0,
          pendingStock: Number(inserted.stock_opening),
          unitName: inserted.unit_name,
          notes: inserted.notes || '',
          entries: [],
          createdAt: inserted.created_at,
          updatedAt: inserted.updated_at,
        };

        setStockItems((prev) => [...prev, newItem]);
        return newItem;
      } catch (err: any) {
        console.error('Error adding stock item:', err);
        setError(err.message || 'Failed to add stock item');
        throw err;
      }
    },
    [stockItems]
  );

  // Update Stock Item (opening stock or name)
  const updateStockItem = useCallback(
    async (updated: BrickStockItem) => {
      try {
        setError(null);
        const opening = Number(updated.stockOpening) || 0;

        const { error: updateError } = await supabase
          .from('brick_stock_items')
          .update({
            item: updated.item.trim(),
            stock_opening: opening,
            unit_name: updated.unitName || 'Units',
            notes: updated.notes || null,
          })
          .eq('id', updated.id);

        if (updateError) throw updateError;

        setStockItems((prev) =>
          prev.map((s) => {
            if (s.id !== updated.id) return s;
            const recalculated = recalculateItemTotals({
              ...s,
              item: updated.item.trim(),
              stockOpening: opening,
              unitName: updated.unitName,
              notes: updated.notes,
            });
            syncItemTotalsToDb(recalculated);
            return recalculated;
          })
        );
      } catch (err: any) {
        console.error('Error updating stock item:', err);
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
      const { error: deleteError } = await supabase
        .from('brick_stock_items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setStockItems((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        return filtered.map((c, idx) => ({ ...c, sNo: idx + 1 }));
      });
    } catch (err: any) {
      console.error('Error deleting stock item:', err);
      setError(err.message || 'Failed to delete stock item');
      throw err;
    }
  }, []);

  // Delete Multiple Stock Items
  const deleteMultipleStockItems = useCallback(async (ids: string[]) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('brick_stock_items')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;

      const idSet = new Set(ids);
      setStockItems((prev) => {
        const filtered = prev.filter((s) => !idSet.has(s.id));
        return filtered.map((c, idx) => ({ ...c, sNo: idx + 1 }));
      });
    } catch (err: any) {
      console.error('Error deleting multiple stock items:', err);
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
        const prod = isBricks ? Number(entryData.currentProduction || 0) : 0;
        const usageOrSales = Number(
          entryData.materialUsage !== undefined
            ? entryData.materialUsage
            : entryData.sales || 0
        ) || 0;
        const entryType = isBricks
          ? prod >= usageOrSales
            ? 'production'
            : 'sales'
          : 'usage';
        const sNo = (targetItem?.entries?.length || 0) + 1;

        const { data: inserted, error: insertError } = await supabase
          .from('brick_stock_entries')
          .insert({
            stock_item_id: itemId,
            s_no: sNo,
            date: entryData.date,
            item: targetItem?.item || '',
            stock_opening: targetItem?.pendingStock || 0,
            current_production: prod,
            sales: usageOrSales,
            material_usage: usageOrSales,
            material_inflow: 0,
            pending_stock: 0,
            type: entryType,
            quantity: isBricks && prod > 0 ? prod : usageOrSales,
            batch_no: entryData.batchNo || null,
            vehicle_number: entryData.vehicleNumber || null,
            customer_name: entryData.customerName || null,
            notes: entryData.notes || null,
            balance_after: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const newEntry: BrickStockItemEntry = {
          id: inserted.id,
          sNo: inserted.s_no,
          date: inserted.date,
          item: inserted.item,
          stockOpening: Number(inserted.stock_opening),
          currentProduction: Number(inserted.current_production),
          sales: Number(inserted.sales),
          materialUsage: Number(inserted.material_usage),
          materialInflow: 0,
          pendingStock: 0,
          type: inserted.type as any,
          quantity: Number(inserted.quantity),
          batchNo: inserted.batch_no || '',
          vehicleNumber: inserted.vehicle_number || '',
          customerName: inserted.customer_name || '',
          notes: inserted.notes || '',
          balanceAfter: 0,
          createdAt: inserted.created_at,
        };

        setStockItems((prev) =>
          prev.map((item) => {
            if (item.id !== itemId) return item;
            const updatedEntries = [...(item.entries || []), newEntry];
            const recalculated = recalculateItemTotals({ ...item, entries: updatedEntries });
            syncItemTotalsToDb(recalculated);
            return recalculated;
          })
        );

        return newEntry;
      } catch (err: any) {
        console.error('Error adding stock entry:', err);
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
        const { error: updateError } = await supabase
          .from('brick_stock_entries')
          .update({
            date: updatedEntry.date,
            current_production: updatedEntry.currentProduction,
            sales: updatedEntry.sales,
            material_usage: updatedEntry.materialUsage,
            quantity: updatedEntry.quantity,
            batch_no: updatedEntry.batchNo || null,
            vehicle_number: updatedEntry.vehicleNumber || null,
            customer_name: updatedEntry.customerName || null,
            notes: updatedEntry.notes || null,
          })
          .eq('id', updatedEntry.id);

        if (updateError) throw updateError;

        setStockItems((prev) =>
          prev.map((item) => {
            if (item.id !== itemId) return item;
            const updatedEntries = (item.entries || []).map((e) =>
              e.id === updatedEntry.id ? { ...updatedEntry } : e
            );
            const recalculated = recalculateItemTotals({ ...item, entries: updatedEntries });
            syncItemTotalsToDb(recalculated);
            return recalculated;
          })
        );
      } catch (err: any) {
        console.error('Error updating stock entry:', err);
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
      const { error: deleteError } = await supabase
        .from('brick_stock_entries')
        .delete()
        .eq('id', entryId);

      if (deleteError) throw deleteError;

      setStockItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          const updatedEntries = (item.entries || []).filter((e) => e.id !== entryId);
          const recalculated = recalculateItemTotals({ ...item, entries: updatedEntries });
          syncItemTotalsToDb(recalculated);
          return recalculated;
        })
      );
    } catch (err: any) {
      console.error('Error deleting stock entry:', err);
      setError(err.message || 'Failed to delete stock entry');
      throw err;
    }
  }, []);

  // Delete Multiple Detailed Entries
  const deleteMultipleStockItemEntries = useCallback(async (itemId: string, entryIds: string[]) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('brick_stock_entries')
        .delete()
        .in('id', entryIds);

      if (deleteError) throw deleteError;

      const idSet = new Set(entryIds);
      setStockItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          const updatedEntries = (item.entries || []).filter((e) => !idSet.has(e.id));
          const recalculated = recalculateItemTotals({ ...item, entries: updatedEntries });
          syncItemTotalsToDb(recalculated);
          return recalculated;
        })
      );
    } catch (err: any) {
      console.error('Error deleting multiple stock entries:', err);
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
    refreshStock: fetchStockItems,
  };
};
