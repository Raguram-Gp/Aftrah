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
  HardHat,
  FileText,
  LogOut
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
  interiorLedgerClientsCount?: number;
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
  selectedInteriorLedgerClient?: Client | null;
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
  onNavigateInteriorClientsRoot?: () => void;
  onNavigateInteriorVendorRoot?: () => void;
  onNavigateInteriorVendorCategory?: () => void;
  onNavigateInteriorLabourContractRoot?: () => void;
  onNavigateVendorRoot: () => void;
  onNavigateVendorCategory?: () => void;
  onNavigateBricksRoot?: (subTab?: BricksSubTab) => void;
  isLiveDb: boolean;
  onSignOut?: () => void;
}

export const AfrahAppTopBar: React.FC<AfrahAppTopBarProps> = ({
  activeTab,
  activeInteriorSubTab = 'clients',
  activeBricksSubTab = 'directory',
  clientsCount,
  constructionLabourContractsCount = 0,
  interiorLedgerClientsCount = 0,
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
  selectedInteriorLedgerClient = null,
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
  onNavigateInteriorClientsRoot,
  onNavigateInteriorVendorRoot,
  onNavigateInteriorVendorCategory,
  onNavigateInteriorLabourContractRoot,
  onNavigateVendorRoot,
  onNavigateVendorCategory,
  onNavigateBricksRoot,
  isLiveDb,
  onSignOut
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
                className="afrah-app-breadcrumb-link flex-center"
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
                className="afrah-app-breadcrumb-link flex-center"
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
                className="afrah-app-breadcrumb-link flex-center"
              >
                <Paintbrush size={16} color="var(--primary)" />
                <span>KAAB INTERIOR</span>
              </button>

              <ChevronRight size={14} color="var(--text-secondary)" />
              <span
                className={selectedInteriorLedgerClient || selectedInteriorClient || selectedInteriorVendor || selectedInteriorLabourContract ? 'afrah-app-breadcrumb-link' : 'afrah-app-breadcrumb-active'}
                onClick={() => {
                  if (activeInteriorSubTab === 'clients' && onNavigateInteriorClientsRoot) {
                    onNavigateInteriorClientsRoot();
                  } else if (activeInteriorSubTab === 'vendor' && onNavigateInteriorVendorRoot) {
                    onNavigateInteriorVendorRoot();
                  } else if (activeInteriorSubTab === 'labour_contract' && onNavigateInteriorLabourContractRoot) {
                    onNavigateInteriorLabourContractRoot();
                  } else if (onNavigateInteriorRoot) {
                    onNavigateInteriorRoot(activeInteriorSubTab);
                  }
                }}
                style={{
                  cursor: selectedInteriorLedgerClient || selectedInteriorClient || selectedInteriorVendor || selectedInteriorLabourContract ? 'pointer' : 'default',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {activeInteriorSubTab === 'clients' ? (
                  <>
                    <Users size={14} color="var(--primary)" />
                    <span>Clients</span>
                  </>
                ) : activeInteriorSubTab === 'vendor' ? (
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
                    <FileText size={14} color="var(--primary)" />
                    <span>Quotations</span>
                  </>
                )}
              </span>

              {activeInteriorSubTab === 'clients' && selectedInteriorLedgerClient && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <span className="afrah-app-breadcrumb-active">
                    {selectedInteriorLedgerClient.name}
                  </span>
                </>
              )}

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
                    onClick={() => {
                      if (selectedInteriorShop) onNavigateInteriorVendorCategory?.();
                    }}
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
                className="afrah-app-breadcrumb-link flex-center"
              >
                <Truck size={16} color="var(--primary)" />
                <span>Vendor</span>
              </button>

              {selectedVendor && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <button
                    onClick={() => {
                      if (selectedShop) onNavigateVendorCategory?.();
                    }}
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
            <div className="flex-center">
              <Landmark size={16} color="var(--primary)" />
              <span className="afrah-app-breadcrumb-active">Bank Details</span>
            </div>
          ) : (
            <>
              <button
                onClick={() => onNavigateBricksRoot && onNavigateBricksRoot(activeBricksSubTab)}
                className="afrah-app-breadcrumb-link flex-center"
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

        {onSignOut ? (
          <button type="button" className="afrah-app-signout-btn" onClick={onSignOut}>
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        ) : null}

        {activeTab === 'clients' ? (
          <span className="stat-label">
            Total Clients: <strong className="text-primary-gold">{clientsCount}</strong>
          </span>
        ) : activeTab === 'construction_labour' ? (
          <span className="stat-label">
            Total Construction Labour: <strong style={{ color: '#f59e0b' }}>{constructionLabourContractsCount}</strong>
          </span>
        ) : activeTab === 'kaab_interior' ? (
          activeInteriorSubTab === 'vendor' ? (
            <span className="stat-label">
              KAAB INTERIOR · <strong className="text-primary-gold">Vendor Directory</strong>
            </span>
          ) : activeInteriorSubTab === 'labour_contract' ? (
            <span className="stat-label">
              Total Interior Labour: <strong style={{ color: '#38bdf8' }}>{interiorLabourContractsCount}</strong>
            </span>
          ) : activeInteriorSubTab === 'clients' ? (
            <span className="stat-label">
              Total Clients: <strong className="text-primary-gold">{interiorLedgerClientsCount}</strong>
            </span>
          ) : (
            <span className="stat-label">
              Total Quotations: <strong className="text-primary-gold">{interiorClientsCount}</strong>
            </span>
          )
        ) : activeTab === 'vendor' ? (
          <span className="stat-label">
            Total Categories: <strong className="text-primary-gold">{vendorsCount}</strong>
          </span>
        ) : activeTab === 'banks' ? (
          <span className="stat-label">
            Total Banks: <strong className="text-primary-gold">{banksCount}</strong>
          </span>
        ) : selectedBrickCustomer ? (
          <span className="stat-label">
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
          <span className="stat-label">
            Total Expenses Recorded: <strong className="text-negative">{brickExpensesCount}</strong>
          </span>
        ) : activeBricksSubTab === 'stock' ? (
          <span className="stat-label">
            Total Yard Stock: <strong style={{ color: '#60a5fa' }}>{Number(brickStockUnits).toLocaleString('en-IN')} Units</strong>
          </span>
        ) : (
          <span className="stat-label">
            Total Bricks Customers:{' '}
            <strong className="text-primary-gold">{brickCustomersCount}</strong>
          </span>
        )}
      </div>
    </header>
  );
};
