import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { LabourContract, LabourContractEntry } from '../types';
import { INITIAL_CONSTRUCTION_LABOUR_CONTRACTS } from '../data/initialConstructionLabourContracts';

const LOCAL_STORAGE_KEY = 'afrah_construction_labour_contracts_cache_v2';

const cleanWorkType = (wt: string) => {
  if (!wt) return wt;
  return wt.replace(/\s*\([^)]*[\u0B80-\u0BFF][^)]*\)/g, '').trim();
};

export const useConstructionLabourContracts = () => {
  const [contracts, setContracts] = useState<LabourContract[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem('afrah_construction_labour_contracts_cache_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((c: any) => {
              const defaultContract = INITIAL_CONSTRUCTION_LABOUR_CONTRACTS.find((ic) => ic.id === c.id);
              const entries = Array.isArray(c.entries) && c.entries.length > 0
                ? c.entries
                : defaultContract?.entries || [];
              return {
                ...c,
                labourCharge: Number(c.labourCharge || defaultContract?.labourCharge || 50000),
                entries: entries.map((e: any) => ({
                  ...e,
                  workType: cleanWorkType(e.workType)
                }))
              };
            });
          }
        }
      } catch (e) {
        console.warn('Unable to read construction labour contracts cache from localStorage', e);
      }
    }
    return INITIAL_CONSTRUCTION_LABOUR_CONTRACTS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Persist locally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contracts));
      } catch (e) {
        console.warn('Unable to persist construction labour contracts cache', e);
      }
    }
  }, [contracts]);

  // Optional Supabase fetch with fallback
  const fetchContracts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('construction_labour_contracts')
        .select(`
          id,
          s_no,
          date,
          labour_name,
          site_name,
          phone,
          labour_charge,
          notes,
          created_at,
          updated_at,
          construction_labour_entries (
            id,
            contract_id,
            s_no,
            date,
            work_type,
            days,
            salary_per_day,
            total_amount,
            note,
            created_at
          )
        `)
        .order('s_no', { ascending: true });

      if (fetchError) {
        // Table not in Supabase yet, fallback gracefully to cached data
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const mapped: LabourContract[] = data.map((c: any) => {
          const defaultContract = INITIAL_CONSTRUCTION_LABOUR_CONTRACTS.find((ic) => ic.id === c.id);
          const rawEntries = (c.construction_labour_entries || []).map((e: any) => ({
            id: e.id,
            contractId: e.contract_id,
            sNo: e.s_no,
            date: e.date,
            workType: cleanWorkType(e.work_type),
            days: Number(e.days || 1),
            salaryPerDay: Number(e.salary_per_day || 0),
            totalAmount: Number(e.total_amount || 0),
            note: e.note,
            createdAt: e.created_at
          })).sort((a: any, b: any) => a.sNo - b.sNo);

          return {
            id: c.id,
            sNo: c.s_no,
            date: c.date,
            labourName: c.labour_name,
            siteName: c.site_name,
            phone: c.phone,
            labourCharge: Number(c.labour_charge || defaultContract?.labourCharge || 50000),
            notes: c.notes,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            entries: rawEntries.length > 0 ? rawEntries : defaultContract?.entries || []
          };
        });

        setContracts(mapped);
      }
    } catch (err: any) {
      console.warn('Notice while loading construction labour contracts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // CONTRACT CRUD
  const addContract = async (contractData: Omit<LabourContract, 'id' | 'sNo'>) => {
    const sNo = contracts.length + 1;
    const tempId = `c-contract-${Date.now()}`;
    const newContract: LabourContract = {
      ...contractData,
      id: tempId,
      sNo,
      labourCharge: contractData.labourCharge || 50000,
      entries: contractData.entries || []
    };

    setContracts((prev) => [...prev, newContract]);

    if (!isSupabaseConfigured) return newContract;

    try {
      const { data, error: insertError } = await supabase
        .from('construction_labour_contracts')
        .insert({
          s_no: sNo,
          date: contractData.date,
          labour_name: contractData.labourName,
          site_name: contractData.siteName,
          phone: contractData.phone,
          labour_charge: contractData.labourCharge || 50000,
          notes: contractData.notes
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setContracts((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, id: data.id } : c))
        );
        return { ...newContract, id: data.id };
      }
    } catch (err: any) {
      console.warn('Fallback to local state for addContract:', err);
    }
    return newContract;
  };

  const updateContract = async (updated: LabourContract) => {
    setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

    if (!isSupabaseConfigured) return;

    try {
      await supabase
        .from('construction_labour_contracts')
        .update({
          date: updated.date,
          labour_name: updated.labourName,
          site_name: updated.siteName,
          phone: updated.phone,
          labour_charge: updated.labourCharge,
          notes: updated.notes
        })
        .eq('id', updated.id);
    } catch (err: any) {
      console.warn('Fallback to local updateContract:', err);
    }
  };

  const updateLabourCharge = async (contractId: string, charge: number) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, labourCharge: charge } : c))
    );

    if (!isSupabaseConfigured) return;

    try {
      await supabase
        .from('construction_labour_contracts')
        .update({ labour_charge: charge })
        .eq('id', contractId);
    } catch (err) {
      console.warn('Fallback to local updateLabourCharge:', err);
    }
  };

  const deleteContract = async (id: string) => {
    setContracts((prev) =>
      prev
        .filter((c) => c.id !== id)
        .map((c, idx) => ({ ...c, sNo: idx + 1 }))
    );

    if (!isSupabaseConfigured) return;

    try {
      await supabase.from('construction_labour_contracts').delete().eq('id', id);
    } catch (err: any) {
      console.warn('Fallback to local deleteContract:', err);
    }
  };

  const deleteMultipleContracts = async (ids: string[]) => {
    const idSet = new Set(ids);
    setContracts((prev) =>
      prev
        .filter((c) => !idSet.has(c.id))
        .map((c, idx) => ({ ...c, sNo: idx + 1 }))
    );

    if (!isSupabaseConfigured) return;

    try {
      await supabase.from('construction_labour_contracts').delete().in('id', ids);
    } catch (err) {
      console.warn('Fallback to local bulk delete construction labour contracts:', err);
    }
  };

  // ENTRIES CRUD
  const addEntry = async (contractId: string, entryData: Omit<LabourContractEntry, 'id' | 'sNo'>) => {
    const target = contracts.find((c) => c.id === contractId);
    if (!target) return;

    const sNo = (target.entries?.length || 0) + 1;
    const tempId = `c-entry-${Date.now()}`;
    const newEntry: LabourContractEntry = {
      ...entryData,
      id: tempId,
      contractId,
      sNo
    };

    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? { ...c, entries: [...(c.entries || []), newEntry] }
          : c
      )
    );

    if (!isSupabaseConfigured) return newEntry;

    try {
      const { data, error: insertError } = await supabase
        .from('construction_labour_entries')
        .insert({
          contract_id: contractId,
          s_no: sNo,
          date: entryData.date,
          work_type: entryData.workType,
          days: entryData.days,
          salary_per_day: entryData.salaryPerDay,
          total_amount: entryData.totalAmount,
          note: entryData.note
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (data) {
        setContracts((prev) =>
          prev.map((c) =>
            c.id === contractId
              ? {
                  ...c,
                  entries: (c.entries || []).map((e) =>
                    e.id === tempId ? { ...e, id: data.id } : e
                  )
                }
              : c
          )
        );
      }
    } catch (err) {
      console.warn('Fallback to local addEntry:', err);
    }
  };

  const updateEntry = async (contractId: string, updatedEntry: LabourContractEntry) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              entries: (c.entries || []).map((e) =>
                e.id === updatedEntry.id ? updatedEntry : e
              )
            }
          : c
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      await supabase
        .from('construction_labour_entries')
        .update({
          date: updatedEntry.date,
          work_type: updatedEntry.workType,
          days: updatedEntry.days,
          salary_per_day: updatedEntry.salaryPerDay,
          total_amount: updatedEntry.totalAmount,
          note: updatedEntry.note
        })
        .eq('id', updatedEntry.id);
    } catch (err) {
      console.warn('Fallback to local updateEntry:', err);
    }
  };

  const deleteEntry = async (contractId: string, entryId: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              entries: (c.entries || [])
                .filter((e) => e.id !== entryId)
                .map((e, idx) => ({ ...e, sNo: idx + 1 }))
            }
          : c
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      await supabase.from('construction_labour_entries').delete().eq('id', entryId);
    } catch (err) {
      console.warn('Fallback to local deleteEntry:', err);
    }
  };

  return {
    contracts,
    isLoading,
    error,
    isLiveDb: isSupabaseConfigured,
    fetchContracts,
    addContract,
    updateContract,
    updateLabourCharge,
    deleteContract,
    deleteMultipleContracts,
    addEntry,
    updateEntry,
    deleteEntry
  };
};
