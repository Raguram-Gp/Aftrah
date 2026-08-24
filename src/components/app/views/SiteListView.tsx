import React, { useState, useMemo } from 'react';
import type { Site, SiteStatus, ProjectType } from '../types';
import { useSiteManager, formatINR } from '../context/SiteManagerContext';
import { SiteCard } from '../components/SiteCard';
import { DataTable, type DataTableFilterOption } from '../components/ui/DataTable';
import { EditSiteModal } from '../components/modals/EditSiteModal';
import { createColumnHelper, type FilterFn } from '@tanstack/react-table';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Pencil,
  Trash2
} from 'lucide-react';

interface SiteListViewProps {
  onOpenAddSite: () => void;
}

const columnHelper = createColumnHelper<Site>();

export const SiteListView: React.FC<SiteListViewProps> = ({ onOpenAddSite }) => {
  const { 
    sites,
    setActiveSiteId, 
    calculateFinancials,
    deleteSite
  } = useSiteManager();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  const getStatusClass = (status: SiteStatus) => {
    switch (status) {
      case 'Active Construction':
        return 'status-active';
      case 'Planning':
        return 'status-planning';
      case 'Finishing & Interior':
        return 'status-finishing';
      case 'Handover / Completed':
        return 'status-completed';
      default:
        return 'status-planning';
    }
  };

  // Status & Project Type Filter Options for DataTable
  const filterOptions: DataTableFilterOption[] = useMemo(() => {
    const projectTypeSet = new Set<string>();
    sites.forEach((s) => {
      if (s.projectType) projectTypeSet.add(s.projectType);
    });

    return [
      {
        columnId: 'status',
        label: 'Status',
        options: [
          { label: 'All Statuses', value: 'All' },
          { label: 'Active Construction', value: 'Active Construction' },
          { label: 'Planning', value: 'Planning' },
          { label: 'Finishing & Interior', value: 'Finishing & Interior' },
          { label: 'Handover / Completed', value: 'Handover / Completed' }
        ]
      },
      {
        columnId: 'projectType',
        label: 'Type',
        options: [
          { label: 'All Types', value: 'All' },
          ...Array.from(projectTypeSet).map((type) => ({ label: type, value: type }))
        ]
      }
    ];
  }, [sites]);

  // Columns definition for TanStack Site List Table
  const columns = useMemo(
    () => [
      columnHelper.accessor('siteName', {
        header: 'Site & Client Entity',
        size: 320,
        cell: ({ row }) => {
          const site = row.original;
          const fullAddress = site.siteAddress || (site as any).address || '';
          const addressParts = fullAddress.split(',').map((p) => p.trim()).filter(Boolean);
          const locationText = addressParts.length > 2 
            ? addressParts.slice(-2).join(', ') 
            : (addressParts.length > 0 ? addressParts.join(', ') : '');

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '220px', maxWidth: '380px' }}>
              {/* Line 1: Site Landmark Title */}
              <span 
                style={{ 
                  fontWeight: 700, 
                  fontSize: '13.5px', 
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={site.siteName}
              >
                {site.siteName}
              </span>

              {/* Line 2: Client Name (Single Line Ellipsis) */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px', 
                  fontSize: '11.5px', 
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  minWidth: 0
                }}
              >
                <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>Client:</span>
                <span 
                  style={{ 
                    color: 'var(--primary)', 
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0
                  }}
                  title={site.clientName}
                >
                  {site.clientName}
                </span>
              </div>

              {/* Line 3: Location */}
              {locationText && (
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontSize: '11px', 
                    color: 'var(--text-secondary)',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    minWidth: 0
                  }} 
                  title={fullAddress}
                >
                  <MapPin size={11} style={{ flexShrink: 0, opacity: 0.75 }} />
                  <span 
                    style={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      minWidth: 0
                    }}
                  >
                    {locationText}
                  </span>
                </div>
              )}
            </div>
          );
        }
      }),

      columnHelper.accessor('status', {
        header: 'Execution Status',
        size: 190,
        cell: (info) => (
          <div style={{ whiteSpace: 'nowrap' }}>
            <span className={`status-pill ${getStatusClass(info.getValue())}`}>
              <span className="status-dot" />
              <span>{info.getValue()}</span>
            </span>
          </div>
        ),
        filterFn: 'equals'
      }),

      columnHelper.accessor('projectType', {
        header: 'Project Type',
        cell: ({ row }) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {row.original.projectType}
            </span>
            {row.original.startDate && (
              <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                Start: {row.original.startDate}
              </span>
            )}
          </div>
        ),
        filterFn: 'equals'
      }),

      columnHelper.accessor((row) => calculateFinancials(row).totalAdvance, {
        id: 'totalAdvance',
        header: ({ column }) => (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="table-sort-header-btn"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <span>Total Advance</span>
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
        cell: ({ row }) => {
          const fin = calculateFinancials(row.original);
          return (
            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
              <span className="font-mono-currency" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                {formatINR(fin.totalAdvance)}
              </span>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                {fin.advanceCount} advance{fin.advanceCount === 1 ? '' : 's'}
              </div>
            </div>
          );
        }
      }),

      columnHelper.accessor((row) => calculateFinancials(row).totalExpenses, {
        id: 'totalExpenses',
        header: ({ column }) => (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="table-sort-header-btn"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <span>Total Expenses</span>
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
        cell: ({ row }) => {
          const fin = calculateFinancials(row.original);
          return (
            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
              <span className="font-mono-currency" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)' }}>
                {formatINR(fin.totalExpenses)}
              </span>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                {fin.expenseCount} expense{fin.expenseCount === 1 ? '' : 's'}
              </div>
            </div>
          );
        }
      }),

      columnHelper.accessor((row) => calculateFinancials(row).netBalance, {
        id: 'netBalance',
        header: ({ column }) => (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="table-sort-header-btn"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <span>Net Balance</span>
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
        cell: ({ row }) => {
          const fin = calculateFinancials(row.original);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', whiteSpace: 'nowrap' }}>
              <span 
                className={`balance-badge ${fin.isDeficit ? 'deficit' : 'surplus'}`}
              >
                <span className="balance-dot" />
                <span>{fin.isDeficit ? 'Deficit: ' : 'Surplus: '}</span>
                <span className="font-mono-currency">{formatINR(fin.netBalance)}</span>
              </span>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                {fin.consumedPercentage}% Consumed
              </div>
            </div>
          );
        }
      }),

      columnHelper.display({
        id: 'actions',
        header: () => <div style={{ textAlign: 'center', width: '80px' }}>Action</div>,
        cell: ({ row }) => {
          const site = row.original;
          return (
            <div 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSite(site);
                }}
                className="btn-ghost-icon"
                title={`Edit ${site.siteName} Details`}
                style={{ width: '28px', height: '28px' }}
              >
                <Pencil size={13} color="var(--primary)" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete site "${site.siteName}" and all associated financial ledgers?`)) {
                    deleteSite(site.id);
                  }
                }}
                className="btn-ghost-icon"
                title="Delete Site"
                style={{ width: '28px', height: '28px' }}
              >
                <Trash2 size={13} color="#f87171" />
              </button>
            </div>
          );
        }
      })
    ],
    [calculateFinancials, deleteSite]
  );

  // Global search across site name, client, address, phone
  const globalFilterFn: FilterFn<Site> = (row, _columnId, value) => {
    const q = String(value).toLowerCase().trim();
    if (!q) return true;
    const s = row.original;
    return (
      s.siteName.toLowerCase().includes(q) ||
      s.clientName.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.contactNumber.toLowerCase().includes(q) ||
      s.projectType.toLowerCase().includes(q)
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* View Switcher Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building2 size={20} color="var(--primary)" />
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Client & Site Portfolio Directory
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Managing {sites.length} construction site entity{sites.length === 1 ? '' : 's'} · Click any row to open ledger
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface-container, #1e2023)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-stroke)' }}>
          <button
            onClick={() => setViewMode('table')}
            className={`btn-ghost-icon ${viewMode === 'table' ? 'active' : ''}`}
            style={{
              height: '30px',
              padding: '0 10px',
              borderRadius: '6px',
              fontSize: '11.5px',
              gap: '6px',
              background: viewMode === 'table' ? 'var(--primary, #e2c399)' : 'transparent',
              color: viewMode === 'table' ? '#111317' : 'var(--text-secondary)',
              fontWeight: viewMode === 'table' ? 700 : 500
            }}
            title="Table View"
          >
            <TableIcon size={14} />
            <span>Table</span>
          </button>

          <button
            onClick={() => setViewMode('grid')}
            className={`btn-ghost-icon ${viewMode === 'grid' ? 'active' : ''}`}
            style={{
              height: '30px',
              padding: '0 10px',
              borderRadius: '6px',
              fontSize: '11.5px',
              gap: '6px',
              background: viewMode === 'grid' ? 'var(--primary, #e2c399)' : 'transparent',
              color: viewMode === 'grid' ? '#111317' : 'var(--text-secondary)',
              fontWeight: viewMode === 'grid' ? 700 : 500
            }}
            title="Card Grid View"
          >
            <LayoutGrid size={14} />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* Render Mode: Table View (Default) vs Card Grid */}
      {viewMode === 'table' ? (
        <DataTable
          data={sites}
          columns={columns}
          searchPlaceholder="Search client, landmark, address..."
          filterOptions={filterOptions}
          globalFilterFn={globalFilterFn}
          initialPageSize={10}
          onRowClick={(site) => setActiveSiteId(site.id)}
          emptyState={{
            icon: <Building2 size={44} style={{ margin: '0 auto 16px', opacity: 0.3 }} />,
            title: 'No Matching Construction Sites',
            description: 'No sites match your active search filters or no site accounts have been created yet.',
            action: (
              <button onClick={onOpenAddSite} className="btn-gold" style={{ fontSize: '11px' }}>
                <Plus size={14} />
                <span>Add Client / Site</span>
              </button>
            )
          }}
        />
      ) : (
        <div className="sites-grid">
          {sites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              onClick={() => setActiveSiteId(site.id)}
            />
          ))}
        </div>
      )}

      {/* Edit Site Modal */}
      {editingSite && (
        <EditSiteModal
          site={editingSite}
          isOpen={!!editingSite}
          onClose={() => setEditingSite(null)}
        />
      )}
    </div>
  );
};
