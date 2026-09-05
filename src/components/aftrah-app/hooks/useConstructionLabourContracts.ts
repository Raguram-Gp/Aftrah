import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { LabourContract, LabourContractEntry } from '../types';

const cleanWorkType = (wt: string) => {
  if (!wt) return wt;
  return wt.replace(/\s*\([^)]*[\u0B80-\u0BFF][^)]*\)/g, '').trim();
};

export const useConstructionLabourContracts = () => {
  const [contracts, setContracts] = useState<LabourContract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch from Supabase
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

      if (fetchError) throw fetchError;

      if (data) {
        const mapped: LabourContract[] = data.map((c: any, idx: number) => {
          const rawEntries = (c.construction_labour_entries || []).map((e: any) => ({
            id: e.id,
            contractId: e.contract_id,
            sNo: e.s_no,
            date: e.date,
            workType: cleanWorkType(e.work_type),
            days: Number(e.days || 1),
            salaryPerDay: Number(e.salary_per_day || 0),
            totalAmount: Number(e.total_amount || 0),
            note: e.note || '',
            createdAt: e.created_at
          })).sort((a: any, b: any) => a.sNo - b.sNo);

          return {
            id: c.id,
            sNo: c.s_no || idx + 1,
            date: c.date,
            labourName: c.labour_name,
            siteName: c.site_name,
            phone: c.phone || '',
            labourCharge: Number(c.labour_charge || 0),
            notes: c.notes || '',
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            entries: rawEntries
          };
        });

        setContracts(mapped);
      }
    } catch (err: any) {
      console.error('Error loading construction labour contracts from Supabase:', err);
      setError(err?.message || 'Failed to load construction labour contracts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // CONTRACT CRUD
  const addContract = async (contractData: Omit<LabourContract, 'id' | 'sNo'>) => {
    try {
      setError(null);
      const sNo = contracts.length + 1;

      const { data, error: insertError } = await supabase
        .from('construction_labour_contracts')
        .insert({
          s_no: sNo,
          date: contractData.date,
          labour_name: contractData.labourName,
          site_name: contractData.siteName,
          phone: contractData.phone || null,
          labour_charge: contractData.labourCharge || 0,
          notes: contractData.notes || null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newContract: LabourContract = {
        ...contractData,
        id: data.id,
        sNo: data.s_no,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        entries: []
      };

      setContracts((prev) => [...prev, newContract]);
      return newContract;
    } catch (err: any) {
      console.error('Error adding construction labour contract:', err);
      setError(err?.message || 'Failed to add contract');
      throw err;
    }
  };

  const updateContract = async (updated: LabourContract) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('construction_labour_contracts')
        .update({
          date: updated.date,
          labour_name: updated.labourName,
          site_name: updated.siteName,
          phone: updated.phone || null,
          labour_charge: updated.labourCharge,
          notes: updated.notes || null
        })
        .eq('id', updated.id);

      if (updateError) throw updateError;

      setContracts((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : c))
      );
    } catch (err: any) {
      console.error('Error updating construction labour contract:', err);
      setError(err?.message || 'Failed to update contract');
      throw err;
    }
  };

  const updateLabourCharge = async (contractId: string, charge: number) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('construction_labour_contracts')
        .update({ labour_charge: charge })
        .eq('id', contractId);

      if (updateError) throw updateError;

      setContracts((prev) =>
        prev.map((c) => (c.id === contractId ? { ...c, labourCharge: charge } : c))
      );
    } catch (err: any) {
      console.error('Error updating construction labour charge:', err);
      setError(err?.message || 'Failed to update labour charge');
      throw err;
    }
  };

  const deleteContract = async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('construction_labour_contracts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setContracts((prev) =>
        prev
          .filter((c) => c.id !== id)
          .map((c, idx) => ({ ...c, sNo: idx + 1 }))
      );
    } catch (err: any) {
      console.error('Error deleting construction labour contract:', err);
      setError(err?.message || 'Failed to delete contract');
      throw err;
    }
  };

  const deleteMultipleContracts = async (ids: string[]) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('construction_labour_contracts')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;

      const idSet = new Set(ids);
      setContracts((prev) =>
        prev
          .filter((c) => !idSet.has(c.id))
          .map((c, idx) => ({ ...c, sNo: idx + 1 }))
      );
    } catch (err: any) {
      console.error('Error bulk deleting construction labour contracts:', err);
      setError(err?.message || 'Failed to delete contracts');
      throw err;
    }
  };

  // ENTRIES CRUD
  const addEntry = async (contractId: string, entryData: Omit<LabourContractEntry, 'id' | 'sNo'>) => {
    try {
      setError(null);
      const target = contracts.find((c) => c.id === contractId);
      const sNo = (target?.entries?.length || 0) + 1;

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
          note: entryData.note || null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newEntry: LabourContractEntry = {
        ...entryData,
        id: data.id,
        contractId,
        sNo: data.s_no,
        createdAt: data.created_at
      };

      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId
            ? { ...c, entries: [...(c.entries || []), newEntry] }
            : c
        )
      );
      return newEntry;
    } catch (err: any) {
      console.error('Error adding construction labour entry:', err);
      setError(err?.message || 'Failed to add entry');
      throw err;
    }
  };

  const updateEntry = async (contractId: string, updatedEntry: LabourContractEntry) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('construction_labour_entries')
        .update({
          date: updatedEntry.date,
          work_type: updatedEntry.workType,
          days: updatedEntry.days,
          salary_per_day: updatedEntry.salaryPerDay,
          total_amount: updatedEntry.totalAmount,
          note: updatedEntry.note || null
        })
        .eq('id', updatedEntry.id);

      if (updateError) throw updateError;

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
    } catch (err: any) {
      console.error('Error updating construction labour entry:', err);
      setError(err?.message || 'Failed to update entry');
      throw err;
    }
  };

  const deleteEntry = async (contractId: string, entryId: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('construction_labour_entries')
        .delete()
        .eq('id', entryId);

      if (deleteError) throw deleteError;

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
    } catch (err: any) {
      console.error('Error deleting construction labour entry:', err);
      setError(err?.message || 'Failed to delete entry');
      throw err;
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
