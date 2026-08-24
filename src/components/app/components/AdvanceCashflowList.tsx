import React, { useState, useMemo } from 'react';
import type { Site, PaymentMode, AdvancePayment } from '../types';
import { useSiteManager, formatINR } from '../context/SiteManagerContext';
import { DataTable, type DataTableFilterOption } from './ui/DataTable';
import { EditAdvanceModal } from './modals/EditAdvanceModal';
import { createColumnHelper, type FilterFn } from '@tanstack/react-table';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  FileText,
  Pencil,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';

interface AdvanceCashflowListProps {
  site: Site;
  onOpenAddAdvance: () => void;
}

const columnHelper = createColumnHelper<AdvancePayment>();

export const AdvanceCashflowList: React.FC<AdvanceCashflowListProps> = ({ site, onOpenAddAdvance }) => {
  const { deleteAdvance } = useSiteManager();
  const [editingAdvance, setEditingAdvance] = useState<AdvancePayment | null>(null);
  const advances = site.advances || [];

  const getModeIcon = (mode: PaymentMode) => {
    switch (mode) {
      case 'UPI':
        return <Smartphone size={14} color="var(--primary)" />;
      case 'Cash':
        return <Banknote size={14} color="#10b981" />;
      case 'Bank Transfer':
      case 'RTGS':
        return <CreditCard size={14} color="#60a5fa" />;
      case 'Cheque':
        return <FileText size={14} color="#f59e0b" />;
      default:
        return <Wallet size={14} color="var(--primary)" />;
    }
  };

  const totalAdvance = useMemo(() => {
    return advances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  }, [advances]);

  // Payment mode filter options
  const filterOptions: DataTableFilterOption[] = [
    {
      columnId: 'paymentMode',
      label: 'Payment Mode',
      options: [
        { label: 'All Modes', value: 'All' },
        { label: 'Bank Transfer', value: 'Bank Transfer' },
        { label: 'UPI', value: 'UPI' },
        { label: 'Cash', value: 'Cash' },
        { label: 'Cheque', value: 'Cheque' },
        { label: 'RTGS', value: 'RTGS' }
      ]
    }
  ];

  // TanStack Column Definitions
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

      columnHelper.accessor('paymentMode', {
        header: 'Payment Mode',
        cell: (info) => (
          <span className="payment-mode-badge">
            {getModeIcon(info.getValue())}
            <span>{info.getValue()}</span>
          </span>
        ),
        filterFn: 'equals'
      }),

      columnHelper.accessor('amount', {
        header: ({ column }) => (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="table-sort-header-btn"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <span>Amount Credited</span>
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
              style={{ fontWeight: 700, fontSize: '15px', color: '#34d399' }}
            >
              + {formatINR(info.getValue())}
            </span>
          </div>
        )
      }),

      columnHelper.accessor('referenceNotes', {
        header: 'Reference Notes / Txn ID',
        cell: (info) => (
          <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 500, maxWidth: '300px' }} className="truncate" title={info.getValue() || ''}>
            {info.getValue() || 'Direct Client Deposit'}
          </div>
        )
      }),

      columnHelper.accessor('receivedBy', {
        header: 'Received By',
        cell: (info) => (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {info.getValue() || 'Site Accounts'}
          </span>
        )
      }),

      columnHelper.display({
        id: 'actions',
        header: () => <div style={{ textAlign: 'center', width: '80px' }}>Action</div>,
        cell: ({ row }) => {
          const adv = row.original;
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <button
                onClick={() => setEditingAdvance(adv)}
                className="btn-ghost-icon"
                title="Edit Advance Entry"
                style={{ width: '28px', height: '28px' }}
              >
                <Pencil size={13} color="var(--primary)" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete advance record of ₹${adv.amount.toLocaleString('en-IN')} (${adv.paymentMode})?`)) {
                    deleteAdvance(site.id, adv.id);
                  }
                }}
                className="btn-ghost-icon"
                title="Delete Advance Entry"
                style={{ width: '28px', height: '28px' }}
              >
                <Trash2 size={13} color="#f87171" />
              </button>
            </div>
          );
        }
      })
    ],
    [deleteAdvance, site.id]
  );

  // Global search across notes, mode, date, and receivedBy
  const globalFilterFn: FilterFn<AdvancePayment> = (row, _columnId, value) => {
    const q = String(value).toLowerCase().trim();
    if (!q) return true;
    const item = row.original;
    const notes = (item.referenceNotes || '').toLowerCase();
    const mode = (item.paymentMode || '').toLowerCase();
    const receivedBy = (item.receivedBy || '').toLowerCase();
    const date = item.date.toLowerCase();
    return notes.includes(q) || mode.includes(q) || receivedBy.includes(q) || date.includes(q);
  };

  return (
    <>
      <DataTable
        data={advances}
        columns={columns}
        icon={<Wallet size={20} color="var(--primary)" />}
        title="Advance Cashflow Receipts"
        subtitle={
          <span>
            {advances.length} advance installment{advances.length === 1 ? '' : 's'} credited · Total:{' '}
            <strong style={{ color: '#34d399', fontWeight: 600 }}>{formatINR(totalAdvance)}</strong>
          </span>
        }
        searchPlaceholder="Search notes, mode, txn ID..."
        filterOptions={filterOptions}
        globalFilterFn={globalFilterFn}
        initialSorting={[{ id: 'date', desc: true }]}
        initialPageSize={10}
        actions={
          <button 
            onClick={onOpenAddAdvance}
            className="btn-gold"
            style={{ height: '36px', padding: '0 16px' }}
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Record Advance</span>
          </button>
        }
        emptyState={{
          icon: <Wallet size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />,
          title: 'No Advance Payments Logged Yet',
          description: 'Record client mobilization funds, milestone payments, or tranche deposits to track site cashflow.',
          action: (
            <button onClick={onOpenAddAdvance} className="btn-gold" style={{ fontSize: '11px' }}>
              <Plus size={14} />
              <span>Record First Advance</span>
            </button>
          )
        }}
      />

      {/* Edit Advance Modal */}
      {editingAdvance && (
        <EditAdvanceModal
          siteId={site.id}
          siteName={site.siteName}
          advance={editingAdvance}
          isOpen={!!editingAdvance}
          onClose={() => setEditingAdvance(null)}
        />
      )}
    </>
  );
};
