import React, { useState, useMemo } from 'react';
import type { BrickStockItem } from '../types';
import {
  Boxes,
  Search,
  ChevronLeft,
  ChevronRight,
  Printer
} from 'lucide-react';
import { TablePrintPreviewModal } from '../components/TablePrintPreviewModal';

interface BricksStockRegisterViewProps {
  stockItems: BrickStockItem[];
  onSelectItem?: (item: BrickStockItem) => void;
}

export const BricksStockRegisterView: React.FC<BricksStockRegisterViewProps> = ({
  stockItems,
  onSelectItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtered Stock Items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return stockItems;
    return stockItems.filter(
      (item) =>
        item.item.toLowerCase().includes(q) ||
        String(item.stockOpening).includes(q) ||
        String(item.currentProduction).includes(q) ||
        String(item.sales).includes(q) ||
        String(item.pendingStock).includes(q) ||
        String(item.sNo).includes(q)
    );
  }, [stockItems, searchQuery]);

  // Overall Totals
  const totalSales = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + (Number(item.sales) || 0), 0);
  }, [filteredItems]);

  const totalPendingStock = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + (Number(item.pendingStock) || 0), 0);
  }, [filteredItems]);

  // Pagination computations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  // Print Statement Preview State
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // Print Handler - opens preview modal first
  const handlePrint = () => {
    setIsPrintPreviewOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* PRINT-ONLY HEADER */}
      <div className="print-only-statement-header">
        <div className="print-brand-row">
          <div>
            <h1 className="print-company-name">KABIBULLAH BRICKS</h1>
            <p className="print-company-sub">Brick Stock Register, Manufacturing & Inventory Management</p>
          </div>
          <div className="print-badge-statement">
            <span>STOCK REGISTER</span>
          </div>
        </div>

        <div className="print-totals-summary-bar">
          <div className="print-total-item">
            <span>Total Items:</span> <strong>{filteredItems.length} Records</strong>
          </div>
          <div className="print-total-item">
            <span>Total Sales:</span> <strong className="text-negative">{Number(totalSales).toLocaleString('en-IN')} Units</strong>
          </div>
          <div className="print-total-item">
            <span>Total Pending Stock:</span> <strong style={{ color: '#16a34a' }}>{Number(totalPendingStock).toLocaleString('en-IN')} Units</strong>
          </div>
          <div className="print-total-item">
            <span>Statement Date:</span> <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
          </div>
        </div>
      </div>

      <div className="client-details-top-actions no-print">
        <button
          onClick={handlePrint}
          className="afrah-app-back-btn"
          title="Preview and Print Statement"
        >
          <Printer size={15} />
          <span>Print Preview / Statement</span>
        </button>
      </div>

      {/* MAIN OVERVIEW TABLE SECTION (Full Width, Add Details Panel Removed) */}
      <section className="afrah-app-table-section" style={{ width: '100%' }}>
        <div className="afrah-app-section-header no-print">
          <div>
            <div className="flex-center-10">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(226, 195, 153, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(226, 195, 153, 0.3)'
                }}
              >
                <Boxes size={18} color="var(--primary)" />
              </div>
              <h1 className="afrah-app-section-title" style={{ letterSpacing: '0.04em' }}>
                STOCK REGISTER
              </h1>
            </div>
            <span className="afrah-app-section-subtitle">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} · Total Outflow / Sales:{' '}
              <strong className="text-negative">{Number(totalSales).toLocaleString('en-IN')}</strong> · Total Pending Stock:{' '}
              <strong className="text-primary-gold">{Number(totalPendingStock).toLocaleString('en-IN')} Units</strong> · Click any row to open its detailed ledger
            </span>
          </div>

          {/* Search & Print Actions */}
          <div className="flex-center-wrap-10">
            <div className="afrah-app-search-wrapper">
              <Search size={14} className="afrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search item, sales, stock..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="afrah-app-search-input"
              />
            </div>

          </div>
        </div>

        {/* Table: S NO | ITEM | TOTAL SALES / USAGE | PENDING STOCK */}
        <div className="afrah-app-table-container">
          <table className="afrah-app-table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th className="text-center" style={{ width: '70px' }}>S NO</th>
                <th style={{ width: '30%', paddingLeft: '16px' }}>ITEM</th>
                <th style={{ width: '35%', textAlign: 'left', paddingLeft: '16px' }}>TOTAL SALES / USAGE</th>
                <th style={{ width: '35%', textAlign: 'right', paddingRight: '16px' }}>PENDING STOCK</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state-cell">
                    {searchQuery
                      ? 'No matching stock items found.'
                      : 'No stock items found. Use the "Add details" form on the right to add one.'}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => {
                  const displaySNo = startIndex + index + 1;

                  return (
                    <tr
                      key={item.id}
                      className="clickable-client-row"
                      onClick={() => onSelectItem && onSelectItem(item)}
                      title={`Click to manage ${item.item} ledger`}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* S NO */}
                      <td className="cell-sno">
                        {displaySNo}
                      </td>

                      {/* ITEM */}
                      <td style={{ paddingLeft: '16px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              padding: '3px 12px',
                              borderRadius: '6px',
                              fontSize: 'var(--fs-xs)',
                              fontWeight: 'var(--fw-bold)',
                              background: 'rgba(226, 195, 153, 0.15)',
                              color: 'var(--primary)',
                              border: '1px solid rgba(226, 195, 153, 0.25)'
                            }}
                          >
                            {item.item}
                          </span>
                        </div>
                      </td>

                      {/* TOTAL SALES / USAGE */}
                      <td
                        style={{
                          textAlign: 'left',
                          fontWeight: 'var(--fw-bold)',
                          color: '#f87171',
                          fontSize: 'var(--fs-sm)',
                          paddingLeft: '16px'
                        }}
                      >
                        {Number(item.sales || 0).toLocaleString('en-IN')} Units
                      </td>

                      {/* PENDING STOCK */}
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 'var(--fw-black)',
                          color: 'var(--text-primary)',
                          fontSize: 'var(--fs-sm)',
                          paddingRight: '16px'
                        }}
                      >
                        {Number(item.pendingStock || 0).toLocaleString('en-IN')} Units
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredItems.length > 0 && (
          <div className="afrah-app-pagination-bar">
            <div className="afrah-app-pagination-left">
              <span className="afrah-app-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of{' '}
                <strong>{filteredItems.length}</strong> | Sales: <strong style={{ color: '#f87171' }}>{Number(totalSales).toLocaleString('en-IN')}</strong> · Pending Stock: <strong className="text-primary-gold">{Number(totalPendingStock).toLocaleString('en-IN')}</strong>
              </span>

              <div className="afrah-app-rows-selector">
                <label className="afrah-app-rows-label">Rows per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="afrah-app-select-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="afrah-app-pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="afrah-app-page-nav-btn"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="afrah-app-page-numbers-wrap">
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`afrah-app-page-num-btn ${currentPage === p ? 'active' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="afrah-app-page-nav-btn"
                title="Next Page"
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* STOCK REGISTER PRINT PREVIEW MODAL */}
      <TablePrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        shareKind="brick_stock_register"
        shareTitle="Stock Register & Inventory Statement"
        title="Stock Register & Inventory Statement"
        badgeLabel="Brick Stock Register"
        badgeIcon={<Boxes size={16} color="var(--primary, #e2c399)" />}
        companyName="KABIBULLAH BRICKS"
        companySub="BRICK STOCK REGISTER, MANUFACTURING & INVENTORY MANAGEMENT"
        metaTitle="REGISTER"
        metaValue="FACTORY INVENTORY & FINISHED GOODS"
        highlightBanner={{
          label: 'TOTAL AVAILABLE FINISHED STOCK',
          value: `${Number(totalPendingStock).toLocaleString('en-IN')} Units`,
          isNegative: false,
          color: '#16a34a'
        }}
        headers={['S.NO', 'ITEM', 'OPENING STOCK', 'PRODUCTION / INFLOW', 'SALES / USAGE', 'PENDING STOCK']}
        colAlignments={['center', 'left', 'center', 'center', 'center', 'center']}
        rows={filteredItems.map((item, idx) => {
          const unit = item.unitName || 'Units';
          const pending = Number(item.pendingStock || 0);
          return [
            idx + 1,
            <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{item.item}</span>,
            Number(item.stockOpening || 0).toLocaleString('en-IN'),
            Number(item.currentProduction || 0).toLocaleString('en-IN'),
            Number(item.sales || 0).toLocaleString('en-IN'),
            <strong style={{ color: pending > 0 ? '#16a34a' : '#ef4444' }}>
              {pending.toLocaleString('en-IN')} {unit}
            </strong>
          ];
        })}
        totalRow={{
          labelIndex: 1,
          values: [
            '',
            'TOTAL',
            filteredItems.reduce((sum, item) => sum + (Number(item.stockOpening) || 0), 0).toLocaleString('en-IN'),
            filteredItems.reduce((sum, item) => sum + (Number(item.currentProduction) || 0), 0).toLocaleString('en-IN'),
            `${Number(totalSales).toLocaleString('en-IN')} Units`,
            `${Number(totalPendingStock).toLocaleString('en-IN')} Units`
          ]
        }}
        summaryItems={[
          { label: 'Total Stock Items', value: `${filteredItems.length} Records` },
          { label: 'Total Dispatched / Sales', value: `${Number(totalSales).toLocaleString('en-IN')} Units` },
          { label: 'Current Available Stock', value: `${Number(totalPendingStock).toLocaleString('en-IN')} Units`, highlightColor: '#16a34a' }
        ]}
      />
    </div>
  );
};
