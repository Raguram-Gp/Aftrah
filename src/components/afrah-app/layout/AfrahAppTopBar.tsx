import React from 'react';
import {
  Menu,
  Users,
  Paintbrush,
  Truck,
  Landmark,
  BrickWall,
  Flame,
  Boxes,
  ChevronRight,
  HardHat
} from 'lucide-react';
import type {
  Client,
  InteriorClient,
  Vendor,
  VendorShop,
  BrickCustomer,
  BricksSubTab,
  InteriorSubTab,
  LabourContract
} from '../types';
import type { TabType } from './AfrahAppSidebar';

interface AfrahAppTopBarProps {
  activeTab: TabType;
  activeInteriorSubTab?: InteriorSubTab;
  activeBricksSubTab?: BricksSubTab;
  clientsCount: number;
  constructionLabourContractsCount?: number;
  interiorClientsCount?: number;
  interiorVendorsCount?: number;
  interiorLabourContractsCount?: number;
  vendorsCount: number;
  banksCount: number;
  brickCustomersCount?: number;
  brickExpensesCount?: number;
  brickStockUnits?: number;
  selectedClient: Client | null;
  selectedConstructionLabourContract?: LabourContract | null;
  selectedInteriorClient?: InteriorClient | null;
  selectedInteriorVendor?: Vendor | null;
  selectedInteriorShop?: VendorShop | null;
  selectedInteriorLabourContract?: LabourContract | null;
  selectedVendor: Vendor | null;
  selectedShop: VendorShop | null;
  selectedBrickCustomer?: BrickCustomer | null;
  selectedStockItemName?: string | null;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onNavigateHome: () => void;
  onNavigateConstructionLabourRoot?: () => void;
  onNavigateInteriorRoot?: (subTab?: InteriorSubTab) => void;
  onNavigateInteriorVendorRoot?: () => void;
  onNavigateInteriorLabourContractRoot?: () => void;
  onNavigateVendorRoot: () => void;
  onNavigateBricksRoot?: (subTab?: BricksSubTab) => void;
  isLiveDb: boolean;
}

export const AfrahAppTopBar: React.FC<AfrahAppTopBarProps> = ({
  activeTab,
  activeInteriorSubTab = 'directory',
  activeBricksSubTab = 'directory',
  clientsCount,
  constructionLabourContractsCount = 0,
  interiorClientsCount = 0,
  interiorVendorsCount = 0,
  interiorLabourContractsCount = 0,
  vendorsCount,
  banksCount,
  brickCustomersCount = 0,
  brickExpensesCount = 0,
  brickStockUnits = 0,
  selectedClient,
  selectedConstructionLabourContract = null,
  selectedInteriorClient = null,
  selectedInteriorVendor = null,
  selectedInteriorShop = null,
  selectedInteriorLabourContract = null,
  selectedVendor,
  selectedShop,
  selectedBrickCustomer = null,
  selectedStockItemName = null,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onNavigateHome,
  onNavigateConstructionLabourRoot,
  onNavigateInteriorRoot,
  onNavigateInteriorVendorRoot,
  onNavigateInteriorLabourContractRoot,
  onNavigateVendorRoot,
  onNavigateBricksRoot,
  isLiveDb
}) => {
  return (
    <header className="afrah-app-topbar">
      <div className="afrah-app-topbar-left">
        <button
          onClick={onToggleMobileMenu}
          className="afrah-app-topbar-menu-btn"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>

        <div className="afrah-app-breadcrumbs">
          {activeTab === 'clients' ? (
            <>
              <button
                onClick={onNavigateHome}
                className="afrah-app-breadcrumb-link"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Users size={16} color="var(--primary)" />
                <span>Clients</span>
              </button>

              {selectedClient && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <span className="afrah-app-breadcrumb-active">
                    {selectedClient.name}
                  </span>
                </>
              )}
            </>
          ) : activeTab === 'construction_labour' ? (
            <>
              <button
                onClick={() => onNavigateConstructionLabourRoot && onNavigateConstructionLabourRoot()}
                className="afrah-app-breadcrumb-link"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <HardHat size={16} color="#f59e0b" />
                <span>Construction Labour Contract</span>
              </button>

              {selectedConstructionLabourContract && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <span className="afrah-app-breadcrumb-active">
                    {selectedConstructionLabourContract.labourName}
                  </span>
                </>
              )}
            </>
          ) : activeTab === 'kaab_interior' ? (
            <>
              <button
                onClick={() => onNavigateInteriorRoot && onNavigateInteriorRoot(activeInteriorSubTab)}
                className="afrah-app-breadcrumb-link"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Paintbrush size={16} color="var(--primary)" />
                <span>KAAB INTERIOR</span>
              </button>

              <ChevronRight size={14} color="var(--text-secondary)" />
              <span
                className={selectedInteriorClient || selectedInteriorVendor || selectedInteriorLabourContract ? 'afrah-app-breadcrumb-link' : 'afrah-app-breadcrumb-active'}
                onClick={() => {
                  if (activeInteriorSubTab === 'vendor' && onNavigateInteriorVendorRoot) {
                    onNavigateInteriorVendorRoot();
                  } else if (activeInteriorSubTab === 'labour_contract' && onNavigateInteriorLabourContractRoot) {
                    onNavigateInteriorLabourContractRoot();
                  } else if (onNavigateInteriorRoot) {
                    onNavigateInteriorRoot(activeInteriorSubTab);
                  }
                }}
                style={{
                  cursor: selectedInteriorClient || selectedInteriorVendor || selectedInteriorLabourContract ? 'pointer' : 'default',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {activeInteriorSubTab === 'vendor' ? (
                  <>
                    <Truck size={14} color="#38bdf8" />
                    <span>Vendor</span>
                  </>
                ) : activeInteriorSubTab === 'labour_contract' ? (
                  <>
                    <HardHat size={14} color="#38bdf8" />
                    <span>Interior Labour Contract</span>
                  </>
                ) : (
                  <>
                    <Users size={14} color="var(--primary)" />
                    <span>Client Directory</span>
                  </>
                )}
              </span>

              {activeInteriorSubTab === 'directory' && selectedInteriorClient && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <span className="afrah-app-breadcrumb-active">
                    {selectedInteriorClient.name}
                  </span>
                </>
              )}

              {activeInteriorSubTab === 'vendor' && selectedInteriorVendor && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <button
                    onClick={onNavigateInteriorVendorRoot}
                    className={selectedInteriorShop ? 'afrah-app-breadcrumb-link' : 'afrah-app-breadcrumb-active'}
                  >
                    {selectedInteriorVendor.type}
                  </button>
                </>
              )}

              {activeInteriorSubTab === 'vendor' && selectedInteriorShop && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <span className="afrah-app-breadcrumb-active">
                    {selectedInteriorShop.name}
                  </span>
                </>
              )}

              {activeInteriorSubTab === 'labour_contract' && selectedInteriorLabourContract && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <span className="afrah-app-breadcrumb-active">
                    {selectedInteriorLabourContract.labourName}
                  </span>
                </>
              )}
            </>
          ) : activeTab === 'vendor' ? (
            <>
              <button
                onClick={onNavigateVendorRoot}
                className="afrah-app-breadcrumb-link"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Truck size={16} color="var(--primary)" />
                <span>Vendor</span>
              </button>

              {selectedVendor && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <button
                    onClick={onNavigateVendorRoot}
                    className={selectedShop ? 'afrah-app-breadcrumb-link' : 'afrah-app-breadcrumb-active'}
                  >
                    {selectedVendor.type}
                  </button>
                </>
              )}

              {selectedShop && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <span className="afrah-app-breadcrumb-active">
                    {selectedShop.name}
                  </span>
                </>
              )}
            </>
          ) : activeTab === 'banks' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={16} color="var(--primary)" />
              <span className="afrah-app-breadcrumb-active">Bank Details</span>
            </div>
          ) : (
            <>
              <button
                onClick={() => onNavigateBricksRoot && onNavigateBricksRoot(activeBricksSubTab)}
                className="afrah-app-breadcrumb-link"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <BrickWall size={16} color="var(--primary)" />
                <span>Kabibullah bricks</span>
              </button>

              <ChevronRight size={14} color="var(--text-secondary)" />
              <span
                className={selectedBrickCustomer || selectedStockItemName ? 'afrah-app-breadcrumb-link' : 'afrah-app-breadcrumb-active'}
                onClick={() => onNavigateBricksRoot && onNavigateBricksRoot(activeBricksSubTab)}
                style={{
                  cursor: selectedBrickCustomer || selectedStockItemName ? 'pointer' : 'default',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {activeBricksSubTab === 'directory' ? (
                  <>
                    <Users size={14} color="var(--primary)" />
                    <span>Customer Directory</span>
                  </>
                ) : activeBricksSubTab === 'expenses' ? (
                  <>
                    <Flame size={14} color="#f87171" />
                    <span>Production Expenses</span>
                  </>
                ) : (
                  <>
                    <Boxes size={14} color="#60a5fa" />
                    <span>Stock Register</span>
                  </>
                )}
              </span>

              {selectedBrickCustomer && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <span className="afrah-app-breadcrumb-active">
                    {selectedBrickCustomer.name}
                  </span>
                </>
              )}

              {selectedStockItemName && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <span className="afrah-app-breadcrumb-active">
                    {selectedStockItemName}
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="afrah-app-topbar-right">
        {/* Database Status Indicator */}
        <div className={`db-status-badge ${isLiveDb ? 'live' : 'local'}`}>
          <span className={`db-dot ${isLiveDb ? 'live' : 'local'}`} />
          <span>{isLiveDb ? 'Supabase Connected' : 'Local / Cache Mode'}</span>
        </div>

        {activeTab === 'clients' ? (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Total Clients: <strong style={{ color: 'var(--primary)' }}>{clientsCount}</strong>
          </span>
        ) : activeTab === 'construction_labour' ? (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Total Construction Labour: <strong style={{ color: '#f59e0b' }}>{constructionLabourContractsCount}</strong>
          </span>
        ) : activeTab === 'kaab_interior' ? (
          activeInteriorSubTab === 'vendor' ? (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              KAAB INTERIOR · <strong style={{ color: 'var(--primary)' }}>Vendor Directory</strong>
            </span>
          ) : activeInteriorSubTab === 'labour_contract' ? (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Total Interior Labour: <strong style={{ color: '#38bdf8' }}>{interiorLabourContractsCount}</strong>
            </span>
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Total Interior Projects: <strong style={{ color: 'var(--primary)' }}>{interiorClientsCount}</strong>
            </span>
          )
        ) : activeTab === 'vendor' ? (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Total Categories: <strong style={{ color: 'var(--primary)' }}>{vendorsCount}</strong>
          </span>
        ) : activeTab === 'banks' ? (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Total Banks: <strong style={{ color: 'var(--primary)' }}>{banksCount}</strong>
          </span>
        ) : selectedBrickCustomer ? (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Outstanding Balance:{' '}
            <strong
              style={{
                color: (selectedBrickCustomer.balance || 0) > 0 ? '#f87171' : '#4ade80'
              }}
            >
              ₹{Number(selectedBrickCustomer.balance || 0).toLocaleString('en-IN')}
            </strong>
          </span>
        ) : activeBricksSubTab === 'expenses' ? (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Total Expenses Recorded: <strong style={{ color: '#f87171' }}>{brickExpensesCount}</strong>
          </span>
        ) : activeBricksSubTab === 'stock' ? (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Total Yard Stock: <strong style={{ color: '#60a5fa' }}>{Number(brickStockUnits).toLocaleString('en-IN')} Units</strong>
          </span>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Total Bricks Customers:{' '}
            <strong style={{ color: 'var(--primary)' }}>{brickCustomersCount}</strong>
          </span>
        )}
      </div>
    </header>
  );
};
