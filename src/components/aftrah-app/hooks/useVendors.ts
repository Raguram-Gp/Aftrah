import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { Vendor, VendorShop, ShopTransaction } from '../types';
import { INITIAL_VENDORS } from '../data/initialVendors';

const LOCAL_STORAGE_KEY = 'aftrah_vendors_cache_v1';

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Unable to read vendor cache from localStorage', e);
      }
    }
    return INITIAL_VENDORS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync to local fallback storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vendors));
      } catch (e) {
        console.warn('Unable to persist vendor cache', e);
      }
    }
  }, [vendors]);

  // Fetch vendors hierarchy from Supabase
  const fetchVendors = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('vendor_categories')
        .select(`
          id,
          s_no,
          type,
          phone,
          contact_person,
          created_at,
          updated_at,
          vendors (
            id,
            category_id,
            s_no,
            name,
            phone,
            address,
            created_at,
            updated_at,
            vendor_ledgers (
              id,
              vendor_id,
              s_no,
              date,
              item_type,
              client_name,
              client_id,
              quantity,
              rate,
              total_amount,
              received_amount,
              balance_amount,
              created_at
            )
          )
        `)
        .order('s_no', { ascending: true });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        const mappedVendors: Vendor[] = data.map((vc: any) => ({
          id: vc.id,
          sNo: vc.s_no,
          type: vc.type,
          phone: vc.phone || undefined,
          contactPerson: vc.contact_person || undefined,
          createdAt: vc.created_at,
          updatedAt: vc.updated_at,
          shops: (vc.vendors || [])
            .map((s: any) => ({
              id: s.id,
              categoryId: vc.id,
              sNo: s.s_no,
              name: s.name,
              phone: s.phone,
              address: s.address,
              createdAt: s.created_at,
              updatedAt: s.updated_at,
              transactions: (s.vendor_ledgers || [])
                .map((t: any) => ({
                  id: t.id,
                  vendorId: s.id,
                  sNo: t.s_no,
                  date: t.date,
                  itemType: t.item_type,
                  clientName: t.client_name || undefined,
                  clientId: t.client_id || undefined,
                  quantity: Number(t.quantity),
                  rate: Number(t.rate),
                  totalAmount: Number(t.total_amount),
                  receivedAmount: Number(t.received_amount),
                  balanceAmount: Number(t.balance_amount),
                  createdAt: t.created_at,
                }))
                .sort((a: ShopTransaction, b: ShopTransaction) => a.sNo - b.sNo),
            }))
            .sort((a: VendorShop, b: VendorShop) => a.sNo - b.sNo),
        }));

        setVendors(mappedVendors);
      }
    } catch (err: any) {
      console.error('Error fetching vendors from Supabase:', err);
      setError(err.message || 'Failed to fetch vendor categories from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // TIER 1: VENDOR CATEGORY CRUD
  const addCategory = async (catData: Omit<Vendor, 'id' | 'sNo'>) => {
    const sNo = vendors.length + 1;
    const tempId = `vendor-${Date.now()}`;
    const newCategory: Vendor = {
      ...catData,
      id: tempId,
      sNo,
      shops: [],
    };

    const previousVendors = [...vendors];
    setVendors([...vendors, newCategory]);

    if (!isSupabaseConfigured) return newCategory;

    try {
      const { data, error: insertError } = await supabase
        .from('vendor_categories')
        .insert({
          s_no: sNo,
          type: catData.type,
          phone: catData.phone,
          contact_person: catData.contactPerson,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setVendors((prev) =>
          prev.map((v) => (v.id === tempId ? { ...v, id: data.id } : v))
        );
        return { ...newCategory, id: data.id };
      }
    } catch (err: any) {
      console.error('Failed to insert vendor category:', err);
      setVendors(previousVendors);
      setError(err.message || 'Failed to add vendor category.');
      throw err;
    }
    return newCategory;
  };

  const updateCategory = async (updated: Vendor) => {
    const previousVendors = [...vendors];
    setVendors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));

    if (!isSupabaseConfigured) return;

    try {
      const { error: updateError } = await supabase
        .from('vendor_categories')
        .update({
          type: updated.type,
          phone: updated.phone,
          contact_person: updated.contactPerson,
        })
        .eq('id', updated.id);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Failed to update vendor category:', err);
      setVendors(previousVendors);
      setError(err.message || 'Failed to update vendor category.');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    const previousVendors = [...vendors];
    setVendors((prev) =>
      prev
        .filter((v) => v.id !== id)
        .map((v, idx) => ({ ...v, sNo: idx + 1 }))
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('vendor_categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.error('Failed to delete vendor category:', err);
      setVendors(previousVendors);
      setError(err.message || 'Failed to delete vendor category.');
      throw err;
    }
  };

  // TIER 2: VENDOR SHOPS CRUD
  const addVendorShop = async (
    categoryId: string,
    shopData: Omit<VendorShop, 'id' | 'sNo'>
  ) => {
    const targetVendor = vendors.find((v) => v.id === categoryId);
    if (!targetVendor) return;

    const sNo = (targetVendor.shops?.length || 0) + 1;
    const tempId = `shop-${Date.now()}`;
    const newShop: VendorShop = {
      ...shopData,
      id: tempId,
      categoryId,
      sNo,
      transactions: [],
    };

    const previousVendors = [...vendors];
    setVendors((prev) =>
      prev.map((v) =>
        v.id === categoryId
          ? { ...v, shops: [...(v.shops || []), newShop] }
          : v
      )
    );

    if (!isSupabaseConfigured) return newShop;

    try {
      const { data, error: insertError } = await supabase
        .from('vendors')
        .insert({
          category_id: categoryId,
          s_no: sNo,
          name: shopData.name,
          phone: shopData.phone,
          address: shopData.address,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setVendors((prev) =>
          prev.map((v) =>
            v.id === categoryId
              ? {
                  ...v,
                  shops: (v.shops || []).map((s) =>
                    s.id === tempId ? { ...s, id: data.id } : s
                  ),
                }
              : v
          )
        );
      }
    } catch (err: any) {
      console.error('Failed to insert vendor shop:', err);
      setVendors(previousVendors);
      setError(err.message || 'Failed to add vendor shop.');
      throw err;
    }
  };

  const updateVendorShop = async (categoryId: string, updatedShop: VendorShop) => {
    const previousVendors = [...vendors];
    setVendors((prev) =>
      prev.map((v) =>
        v.id === categoryId
          ? {
              ...v,
              shops: (v.shops || []).map((s) =>
                s.id === updatedShop.id ? updatedShop : s
              ),
            }
          : v
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: updateError } = await supabase
        .from('vendors')
        .update({
          name: updatedShop.name,
          phone: updatedShop.phone,
          address: updatedShop.address,
        })
        .eq('id', updatedShop.id);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Failed to update vendor shop:', err);
      setVendors(previousVendors);
      setError(err.message || 'Failed to update vendor shop.');
      throw err;
    }
  };

  const deleteVendorShop = async (categoryId: string, shopId: string) => {
    const previousVendors = [...vendors];
    setVendors((prev) =>
      prev.map((v) =>
        v.id === categoryId
          ? {
              ...v,
              shops: (v.shops || [])
                .filter((s) => s.id !== shopId)
                .map((s, idx) => ({ ...s, sNo: idx + 1 })),
            }
          : v
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('vendors')
        .delete()
        .eq('id', shopId);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.error('Failed to delete vendor shop:', err);
      setVendors(previousVendors);
      setError(err.message || 'Failed to delete vendor shop.');
      throw err;
    }
  };

  // TIER 3: SHOP TRANSACTION LEDGER CRUD
  const addShopTransaction = async (
    categoryId: string,
    shopId: string,
    txData: Omit<ShopTransaction, 'id' | 'sNo'>
  ) => {
    const targetVendor = vendors.find((v) => v.id === categoryId);
    const targetShop = targetVendor?.shops?.find((s) => s.id === shopId);
    if (!targetShop) return;

    const sNo = (targetShop.transactions?.length || 0) + 1;
    const tempId = `tx-${Date.now()}`;
    const newTx: ShopTransaction = {
      ...txData,
      id: tempId,
      vendorId: shopId,
      sNo,
    };

    const previousVendors = [...vendors];
    setVendors((prev) =>
      prev.map((v) =>
        v.id === categoryId
          ? {
              ...v,
              shops: (v.shops || []).map((s) =>
                s.id === shopId
                  ? { ...s, transactions: [...(s.transactions || []), newTx] }
                  : s
              ),
            }
          : v
      )
    );

    if (!isSupabaseConfigured) return newTx;

    try {
      const { data, error: insertError } = await supabase
        .from('vendor_ledgers')
        .insert({
          vendor_id: shopId,
          s_no: sNo,
          date: txData.date,
          item_type: txData.itemType,
          client_name: txData.clientName,
          quantity: txData.quantity,
          rate: txData.rate,
          total_amount: txData.totalAmount,
          received_amount: txData.receivedAmount,
          balance_amount: txData.balanceAmount,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setVendors((prev) =>
          prev.map((v) =>
            v.id === categoryId
              ? {
                  ...v,
                  shops: (v.shops || []).map((s) =>
                    s.id === shopId
                      ? {
                          ...s,
                          transactions: (s.transactions || []).map((t) =>
                            t.id === tempId ? { ...t, id: data.id } : t
                          ),
                        }
                      : s
                  ),
                }
              : v
          )
        );
      }
    } catch (err: any) {
      console.error('Failed to insert shop transaction:', err);
      setVendors(previousVendors);
      setError(err.message || 'Failed to record transaction.');
      throw err;
    }
  };

  const updateShopTransaction = async (
    categoryId: string,
    shopId: string,
    updatedTx: ShopTransaction
  ) => {
    const previousVendors = [...vendors];
    setVendors((prev) =>
      prev.map((v) =>
        v.id === categoryId
          ? {
              ...v,
              shops: (v.shops || []).map((s) =>
                s.id === shopId
                  ? {
                      ...s,
                      transactions: (s.transactions || []).map((t) =>
                        t.id === updatedTx.id ? updatedTx : t
                      ),
                    }
                  : s
              ),
            }
          : v
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: updateError } = await supabase
        .from('vendor_ledgers')
        .update({
          date: updatedTx.date,
          item_type: updatedTx.itemType,
          client_name: updatedTx.clientName,
          quantity: updatedTx.quantity,
          rate: updatedTx.rate,
          total_amount: updatedTx.totalAmount,
          received_amount: updatedTx.receivedAmount,
          balance_amount: updatedTx.balanceAmount,
        })
        .eq('id', updatedTx.id);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Failed to update transaction:', err);
      setVendors(previousVendors);
      setError(err.message || 'Failed to update transaction.');
      throw err;
    }
  };

  const deleteShopTransaction = async (
    categoryId: string,
    shopId: string,
    txId: string
  ) => {
    const previousVendors = [...vendors];
    setVendors((prev) =>
      prev.map((v) =>
        v.id === categoryId
          ? {
              ...v,
              shops: (v.shops || []).map((s) =>
                s.id === shopId
                  ? {
                      ...s,
                      transactions: (s.transactions || [])
                        .filter((t) => t.id !== txId)
                        .map((t, idx) => ({ ...t, sNo: idx + 1 })),
                    }
                  : s
              ),
            }
          : v
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('vendor_ledgers')
        .delete()
        .eq('id', txId);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.error('Failed to delete transaction:', err);
      setVendors(previousVendors);
      setError(err.message || 'Failed to delete transaction.');
      throw err;
    }
  };

  return {
    vendors,
    isLoading,
    error,
    isLiveDb: isSupabaseConfigured,
    fetchVendors,
    addCategory,
    updateCategory,
    deleteCategory,
    addVendorShop,
    updateVendorShop,
    deleteVendorShop,
    addShopTransaction,
    updateShopTransaction,
    deleteShopTransaction,
  };
};
