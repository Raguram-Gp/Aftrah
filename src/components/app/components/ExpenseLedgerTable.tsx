import React, { useState, useMemo } from 'react';
import type { Site, ExpenseItem } from '../types';
import { useSiteManager, formatINR } from '../context/SiteManagerContext';
import { DataTable, type DataTableFilterOption } from './ui/DataTable';
import { EditExpenseModal } from './modals/EditExpenseModal';
import { createColumnHelper, type FilterFn } from '@tanstack/react-table';
import { 
  ReceiptText, 
  Plus, 
  Trash2, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil
} from 'lucide-react';

interface ExpenseLedgerTableProps {
  site: Site;
  onOpenAddExpense: () => void;
}

const columnHelper = createColumnHelper<ExpenseItem>();

export const ExpenseLedgerTable: React.FC<ExpenseLedgerTableProps> = ({ site, onOpenAddExpense }) => {
  const { deleteExpense } = useSiteManager();
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  const expenses = site.expenses || [];

  // Unique categories for filter dropdown
  const categoryFilterOptions: DataTableFilterOption[] = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => set.add(e.category));
    return [
      {
        columnId: 'category',
        label: 'Category',
        options: [
          { label: 'All Categories', value: 'All' },
          ...Array.from(set).map((cat) => ({ label: cat, value: cat }))
        ]
      }
    ];
  }, [expenses]);

  // Total filtered calculations can also be calculated
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.totalAmount) || 0), 0);
  }, [expenses]);

  // Define Table Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: ({ column }) => (
          <button
            type="button"
            className="table-sort-header-btn"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Date</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={12} />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={12} />
            ) : (
              <ArrowUpDown size={12} style={{ opacity: 0.4 }} />
            )}
          </button>
        ),
        cell: (info) => (
          <span className="font-mono-currency" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {info.getValue()}
          </span>
        )
      }),

      columnHelper.accessor('category', {
        header: 'Category',
        cell: (info) => (
          <span className="category-chip">
            {info.getValue()}
          </span>
        ),
        filterFn: 'equals'
      }),

      columnHelper.accessor((row) => `${row.quantity} ${row.unit}`, {
        id: 'quantity',
        header: () => <div style={{ textAlign: 'right' }}>Quantity</div>,
        cell: ({ row }) => (
          <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            <span className="font-mono-currency">
              {row.original.quantity.toLocaleString('en-IN')} {row.original.unit}
            </span>
          </div>
        )
      }),

      columnHelper.accessor('unitRate', {
        header: () => <div style={{ textAlign: 'right' }}>Unit Rate</div>,
        cell: (info) => (
          <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            <span className="font-mono-currency" style={{ color: 'var(--text-secondary)' }}>
              ₹{info.getValue().toLocaleString('en-IN')}
            </span>
          </div>
        )
      }),

      columnHelper.accessor('totalAmount', {
        header: ({ column }) => (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="table-sort-header-btn"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <span>Total Amount</span>
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp size={12} />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown size={12} />
              ) : (
                <ArrowUpDown size={12} style={{ opacity: 0.4 }} />
              )}
            </button>
          </div>
        ),
        cell: (info) => (
          <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            <span 
              className="font-mono-currency" 
              style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}
            >
              {formatINR(info.getValue())}
            </span>
          </div>
        )
      }),

      columnHelper.accessor('notes', {
        header: 'Notes / Scope',
        cell: (info) => {
          const notes = info.getValue();
          return (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '320px' }} className="truncate" title={notes || ''}>
              {notes || '—'}
            </div>
          );
        }
      }),

      columnHelper.display({
        id: 'actions',
        header: () => <div style={{ textAlign: 'center', width: '80px' }}>Action</div>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <button
                onClick={() => setEditingExpense(item)}
                className="btn-ghost-icon"
                title="Edit Expense Entry"
                style={{ width: '28px', height: '28px' }}
              >
                <Pencil size={13} color="var(--primary)" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete expense "${item.category} - ₹${item.totalAmount.toLocaleString('en-IN')}"?`)) {
                    deleteExpense(site.id, item.id);
                  }
                }}
                className="btn-ghost-icon"
                title="Delete Entry"
                style={{ width: '28px', height: '28px' }}
              >
                <Trash2 size={13} color="#f87171" />
              </button>
            </div>
          );
        }
      })
    ],
    [deleteExpense, site.id]
  );

  // Global search across notes, category, and date
  const globalFilterFn: FilterFn<ExpenseItem> = (row, _columnId, value) => {
    const q = String(value).toLowerCase().trim();
    if (!q) return true;
    const item = row.original;
    const cat = item.category.toLowerCase();
    const notes = (item.notes || '').toLowerCase();
    const date = item.date.toLowerCase();
    return cat.includes(q) || notes.includes(q) || date.includes(q);
  };

  return (
    <>
      <DataTable
        data={expenses}
        columns={columns}
        icon={<ReceiptText size={20} color="var(--primary)" />}
        title="Site Expense Ledger"
        subtitle={
          <span>
            {expenses.length} itemized transaction{expenses.length === 1 ? '' : 's'} · Total:{' '}
            <strong style={{ color: 'var(--primary)', fontWeight: 600 }}>{formatINR(totalAmount)}</strong>
          </span>
        }
        searchPlaceholder="Search category or notes..."
        filterOptions={categoryFilterOptions}
        globalFilterFn={globalFilterFn}
        initialSorting={[{ id: 'date', desc: true }]}
        initialPageSize={10}
        actions={
          <button 
            onClick={onOpenAddExpense}
            className="btn-gold"
            style={{ height: '36px', padding: '0 16px' }}
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Log Expense</span>
          </button>
        }
        emptyState={{
          icon: <ReceiptText size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />,
          title: 'No Expense Entries Found',
          description: 'Start tracking site materials, labor, machinery, and permits by logging the first expense.',
          action: (
            <button onClick={onOpenAddExpense} className="btn-gold" style={{ fontSize: '11px' }}>
              <Plus size={14} />
              <span>Log First Expense</span>
            </button>
          )
        }}
      />

      {/* Edit Expense Modal */}
      {editingExpense && (
        <EditExpenseModal
          siteId={site.id}
          siteName={site.siteName}
          expense={editingExpense}
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </>
  );
};
