import React, { useState, useMemo } from 'react';
import type { BrickStockItem } from '../types';
import {
  Boxes,
  Search,
  ChevronLeft,
  ChevronRight,
  Printer
} from 'lucide-react';

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

  // Print Handler
  const handlePrint = () => {
    window.print();
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
            <span>Total Sales:</span> <strong style={{ color: '#f87171' }}>{Number(totalSales).toLocaleString('en-IN')} Units</strong>
          </div>
          <div className="print-total-item">
            <span>Total Pending Stock:</span> <strong style={{ color: '#16a34a' }}>{Number(totalPendingStock).toLocaleString('en-IN')} Units</strong>
          </div>
          <div className="print-total-item">
            <span>Statement Date:</span> <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
          </div>
        </div>
      </div>

      {/* MAIN OVERVIEW TABLE SECTION (Full Width, Add Details Panel Removed) */}
      <section className="aftrah-app-table-section" style={{ width: '100%' }}>
        <div className="aftrah-app-section-header no-print">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <h1 className="aftrah-app-section-title" style={{ letterSpacing: '0.04em' }}>
                STOCK REGISTER
              </h1>
            </div>
            <span className="aftrah-app-section-subtitle">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} · Total Outflow / Sales:{' '}
              <strong style={{ color: '#f87171' }}>{Number(totalSales).toLocaleString('en-IN')}</strong> · Total Pending Stock:{' '}
              <strong style={{ color: 'var(--primary)' }}>{Number(totalPendingStock).toLocaleString('en-IN')} Units</strong> · Click any row to open its detailed ledger
            </span>
          </div>

          {/* Search & Print Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="aftrah-app-search-wrapper">
              <Search size={14} className="aftrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search item, sales, stock..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="aftrah-app-search-input"
              />
            </div>

            <button
              onClick={handlePrint}
              className="aftrah-app-back-btn"
              title="Print Stock Register"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Table: S NO | ITEM | TOTAL SALES / USAGE | PENDING STOCK */}
        <div className="aftrah-app-table-container">
          <table className="aftrah-app-table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '70px', textAlign: 'center' }}>S NO</th>
                <th style={{ width: '30%', paddingLeft: '16px' }}>ITEM</th>
                <th style={{ width: '35%', textAlign: 'right', paddingRight: '24px' }}>TOTAL SALES / USAGE</th>
                <th style={{ width: '35%', textAlign: 'right', paddingRight: '24px' }}>PENDING STOCK</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="aftrah-app-empty-cell">
                    <div className="empty-state-wrap">
                      <Boxes size={28} className="empty-icon" color="var(--text-secondary)" style={{ opacity: 0.5 }} />
                      <span className="empty-text">No stock items found</span>
                      <span className="empty-subtext">
                        {searchQuery ? 'No items match your search query.' : 'No stock items available.'}
                      </span>
                    </div>
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
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {displaySNo}
                      </td>

                      {/* ITEM */}
                      <td style={{ paddingLeft: '16px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              padding: '3px 12px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: 700,
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
                          textAlign: 'right',
                          fontWeight: 700,
                          color: '#f87171',
                          fontSize: '13.5px',
                          paddingRight: '24px'
                        }}
                      >
                        {Number(item.sales || 0).toLocaleString('en-IN')} Units
                      </td>

                      {/* PENDING STOCK */}
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 800,
                          color: item.pendingStock >= 0 ? 'var(--primary)' : '#f87171',
                          fontSize: '13.5px',
                          paddingRight: '24px'
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
          <div className="aftrah-app-pagination-bar">
            <div className="aftrah-app-pagination-left">
              <span className="aftrah-app-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of{' '}
                <strong>{filteredItems.length}</strong> | Sales: <strong style={{ color: '#f87171' }}>{Number(totalSales).toLocaleString('en-IN')}</strong> · Pending Stock: <strong style={{ color: 'var(--primary)' }}>{Number(totalPendingStock).toLocaleString('en-IN')}</strong>
              </span>

              <div className="aftrah-app-rows-selector">
                <label className="aftrah-app-rows-label">Rows per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="aftrah-app-select-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="aftrah-app-pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="aftrah-app-page-nav-btn"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="aftrah-app-page-numbers-wrap">
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`aftrah-app-page-num-btn ${currentPage === p ? 'active' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="aftrah-app-page-nav-btn"
                title="Next Page"
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
