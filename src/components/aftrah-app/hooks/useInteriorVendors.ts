import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { Vendor, VendorShop, ShopTransaction } from '../types';
import { INITIAL_INTERIOR_VENDORS } from '../data/initialInteriorVendors';

export const useInteriorVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        .from('interior_vendor_categories')
        .select(`
          id,
          s_no,
          type,
          phone,
          contact_person,
          created_at,
          updated_at,
          interior_vendors (
            id,
            category_id,
            s_no,
            name,
            phone,
            address,
            created_at,
            updated_at,
            interior_vendor_ledgers (
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

      if (fetchError) {
        // Table may not exist yet in Supabase, gracefully keep local state
        console.info('Interior vendor table not present in Supabase, using cached local data.');
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const mappedVendors: Vendor[] = data.map((vc: any) => ({
          id: vc.id,
          sNo: vc.s_no,
          type: vc.type,
          phone: vc.phone || undefined,
          contactPerson: vc.contact_person || undefined,
          createdAt: vc.created_at,
          updatedAt: vc.updated_at,
          shops: (vc.interior_vendors || [])
            .map((s: any) => ({
              id: s.id,
              categoryId: vc.id,
              sNo: s.s_no,
              name: s.name,
              phone: s.phone,
              address: s.address,
              createdAt: s.created_at,
              updatedAt: s.updated_at,
              transactions: (s.interior_vendor_ledgers || [])
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
      console.warn('Notice while loading interior vendors:', err);
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
    const tempId = `int-vendor-${Date.now()}`;
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
        .from('interior_vendor_categories')
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
      console.warn('Fallback to local state for add interior category:', err);
    }
    return newCategory;
  };

  const updateCategory = async (updated: Vendor) => {
    const previousVendors = [...vendors];
    setVendors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));

    if (!isSupabaseConfigured) return;

    try {
      const { error: updateError } = await supabase
        .from('interior_vendor_categories')
        .update({
          type: updated.type,
          phone: updated.phone,
          contact_person: updated.contactPerson,
        })
        .eq('id', updated.id);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.warn('Fallback to local update interior category:', err);
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
        .from('interior_vendor_categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.warn('Fallback to local delete interior category:', err);
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
    const tempId = `int-shop-${Date.now()}`;
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
        .from('interior_vendors')
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
      console.warn('Fallback to local add interior shop:', err);
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
        .from('interior_vendors')
        .update({
          name: updatedShop.name,
          phone: updatedShop.phone,
          address: updatedShop.address,
        })
        .eq('id', updatedShop.id);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.warn('Fallback to local update interior shop:', err);
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
        .from('interior_vendors')
        .delete()
        .eq('id', shopId);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.warn('Fallback to local delete interior shop:', err);
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
    const tempId = `int-tx-${Date.now()}`;
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
        .from('interior_vendor_ledgers')
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
      console.warn('Fallback to local add interior transaction:', err);
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
        .from('interior_vendor_ledgers')
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
      console.warn('Fallback to local update interior transaction:', err);
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
        .from('interior_vendor_ledgers')
        .delete()
        .eq('id', txId);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.warn('Fallback to local delete interior transaction:', err);
    }
  };

  const deleteMultipleShopTransactions = async (
    categoryId: string,
    shopId: string,
    txIds: string[]
  ) => {
    const previousVendors = [...vendors];
    const idSet = new Set(txIds);
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
                        .filter((t) => !idSet.has(t.id))
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
        .from('interior_vendor_ledgers')
        .delete()
        .in('id', txIds);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.warn('Fallback to local bulk delete interior transactions:', err);
    }
  };

  const deleteMultipleShops = async (categoryId: string, shopIds: string[]) => {
    const previousVendors = [...vendors];
    const idSet = new Set(shopIds);
    setVendors((prev) =>
      prev.map((v) =>
        v.id === categoryId
          ? {
              ...v,
              shops: (v.shops || [])
                .filter((s) => !idSet.has(s.id))
                .map((s, idx) => ({ ...s, sNo: idx + 1 })),
            }
          : v
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('interior_vendors')
        .delete()
        .in('id', shopIds);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.warn('Fallback to local bulk delete interior shops:', err);
    }
  };

  const deleteMultipleVendors = async (categoryIds: string[]) => {
    const previousVendors = [...vendors];
    const idSet = new Set(categoryIds);
    setVendors((prev) =>
      prev
        .filter((v) => !idSet.has(v.id))
        .map((v, idx) => ({ ...v, sNo: idx + 1 }))
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('interior_vendor_categories')
        .delete()
        .in('id', categoryIds);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.warn('Fallback to local bulk delete interior categories:', err);
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
    deleteMultipleVendors,
    addVendorShop,
    updateVendorShop,
    deleteVendorShop,
    deleteMultipleShops,
    addShopTransaction,
    updateShopTransaction,
    deleteShopTransaction,
    deleteMultipleShopTransactions,
  };
};
