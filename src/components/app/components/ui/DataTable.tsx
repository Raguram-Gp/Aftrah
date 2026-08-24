import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type FilterFn
} from '@tanstack/react-table';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Inbox
} from 'lucide-react';
import { SearchableCreatableSelect } from './SearchableCreatableSelect';

export interface DataTableFilterOption {
  columnId: string;
  label: string;
  options: { label: string; value: string }[];
}

export interface DataTableProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  icon?: React.ReactNode;
  searchPlaceholder?: string;
  filterOptions?: DataTableFilterOption[];
  actions?: React.ReactNode;
  initialPageSize?: number;
  initialSorting?: SortingState;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  };
  globalFilterFn?: FilterFn<TData>;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData extends object>({
  data,
  columns,
  title,
  subtitle,
  icon,
  searchPlaceholder = 'Search records...',
  filterOptions,
  actions,
  initialPageSize = 10,
  initialSorting = [],
  emptyState,
  globalFilterFn,
  onRowClick
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize
  });

  // Default global filter search if not provided
  const defaultGlobalFilterFn: FilterFn<TData> = (row, _columnId, value) => {
    const q = String(value).toLowerCase().trim();
    if (!q) return true;
    return Object.values(row.original as Record<string, any>).some((val) => {
      if (val === null || val === undefined) return false;
      return String(val).toLowerCase().includes(q);
    });
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    globalFilterFn: globalFilterFn || defaultGlobalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const filteredRows = table.getFilteredRowModel().rows;
  const totalRowCount = filteredRows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  const startEntry = totalRowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const endEntry = Math.min((pageIndex + 1) * pageSize, totalRowCount);

  return (
    <div className="ledger-card">
      {/* Table Toolbar Header */}
      {(title || searchPlaceholder || filterOptions || actions) && (
        <div className="ledger-table-header-bar">
          {/* Left Title & Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon && icon}
            <div>
              {typeof title === 'string' ? (
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {title}
                </h3>
              ) : (
                title
              )}
              {subtitle && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            {searchPlaceholder && (
              <div style={{ position: 'relative', width: '220px' }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)'
                  }}
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '32px', paddingRight: '10px', fontSize: '12px', height: '36px' }}
                />
              </div>
            )}

            {/* Column Filters Dropdowns */}
            {filterOptions?.map((filter) => {
              const currentFilterVal = (columnFilters.find((f) => f.id === filter.columnId)?.value as string) || 'All';
              return (
                <div key={filter.columnId} style={{ minWidth: '150px' }}>
                  <SearchableCreatableSelect
                    value={currentFilterVal}
                    onChange={(val) => {
                      if (val === 'All') {
                        setColumnFilters((prev) => prev.filter((f) => f.id !== filter.columnId));
                      } else {
                        setColumnFilters((prev) => [
                          ...prev.filter((f) => f.id !== filter.columnId),
                          { id: filter.columnId, value: val }
                        ]);
                      }
                    }}
                    options={filter.options}
                    prefixLabel={filter.label}
                    placeholder={`All ${filter.label}`}
                    searchPlaceholder={`Search ${filter.label}...`}
                    allowCreate={false}
                    triggerStyle={{ height: '36px', fontSize: '12px', padding: '0 10px' }}
                  />
                </div>
              );
            })}

            {/* Custom Action CTAs */}
            {actions && actions}
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="ledger-table-container">
        {totalRowCount === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {emptyState?.icon || <Inbox size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />}
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {emptyState?.title || 'No Records Found'}
            </div>
            <div style={{ fontSize: '12px', maxWidth: '360px', margin: '0 auto 16px' }}>
              {emptyState?.description || (globalFilter || columnFilters.length > 0
                ? 'Try adjusting your search terms or active filters.'
                : 'No entries have been recorded yet.')}
            </div>
            {emptyState?.action}
          </div>
        ) : (
          <table className="ledger-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} style={{ width: header.column.getSize() !== 150 ? header.column.getSize() : undefined }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={onRowClick ? 'clickable-row' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* TanStack Table Pagination Footer */}
      {totalRowCount > 0 && (
        <div className="table-pagination-bar">
          {/* Left: Row Count Info */}
          <div className="pagination-info">
            Showing <strong style={{ color: 'var(--text-primary)' }}>{startEntry}</strong> to <strong style={{ color: 'var(--text-primary)' }}>{endEntry}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalRowCount}</strong> entries
          </div>

          {/* Center / Right: Controls */}
          <div className="pagination-controls">
            {/* Page Size Selector */}
            <div className="pagination-size-select">
              <label htmlFor="pageSizeSelect" className="pagination-size-label">Rows per page:</label>
              <select
                id="pageSizeSelect"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="form-select pagination-select"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation Buttons */}
            <div className="pagination-nav-btns">
              {/* First Page */}
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="pagination-btn"
                title="First Page"
                aria-label="Go to first page"
              >
                <ChevronsLeft size={15} />
              </button>

              {/* Prev Page */}
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="pagination-btn"
                title="Previous Page"
                aria-label="Go to previous page"
              >
                <ChevronLeft size={15} />
              </button>

              {/* Page Number Pills */}
              <div className="pagination-pages">
                {Array.from({ length: pageCount }, (_, i) => i).map((p) => {
                  const isCurrent = p === pageIndex;
                  const isNear = Math.abs(p - pageIndex) <= 1 || p === 0 || p === pageCount - 1;
                  
                  if (!isNear && pageCount > 7) {
                    if (p === 1 || p === pageCount - 2) {
                      return <span key={p} className="pagination-ellipsis">…</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={p}
                      onClick={() => table.setPageIndex(p)}
                      className={`pagination-page-pill ${isCurrent ? 'active' : ''}`}
                    >
                      {p + 1}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="pagination-btn"
                title="Next Page"
                aria-label="Go to next page"
              >
                <ChevronRight size={15} />
              </button>

              {/* Last Page */}
              <button
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!table.getCanNextPage()}
                className="pagination-btn"
                title="Last Page"
                aria-label="Go to last page"
              >
                <ChevronsRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
