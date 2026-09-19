import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { AfrahAppAuthGate } from './AfrahAppAuthGate';
import { AfrahAppSidebar, type TabType } from './layout/AfrahAppSidebar';
import { AfrahAppTopBar } from './layout/AfrahAppTopBar';
import { ToastContainer, showToast } from './layout/ToastContainer';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { TableFormPopover } from './components/TableFormPopover';
import { EntityNotFound } from './components/EntityNotFound';
import { useClients } from './hooks/useClients';
import { useInteriorClients } from './hooks/useInteriorClients';
import { useInteriorLedgerClients } from './hooks/useInteriorLedgerClients';
import { useVendors } from './hooks/useVendors';
import { useInteriorVendors } from './hooks/useInteriorVendors';
import { useLabourContracts } from './hooks/useLabourContracts';
import { useConstructionLabourContracts } from './hooks/useConstructionLabourContracts';
import { useBanks } from './hooks/useBanks';
import { useBrickCustomers } from './hooks/useBrickCustomers';
import { useBrickProductionExpenses } from './hooks/useBrickProductionExpenses';
import { useBrickStock } from './hooks/useBrickStock';
import {
  buildNavPath,
  parseNavState,
  writeNavPath,
  CLEARED_ENTITY_IDS,
  type NavState,
} from './navUrl';

import { ClientDetailsView } from './views/ClientDetailsView';
import { InteriorClientView } from './views/InteriorClientView';
import { InteriorClientDetailsView } from './views/InteriorClientDetailsView';
import { InteriorClientLedgerView } from './views/InteriorClientLedgerView';
import { InteriorClientLedgerDetailsView } from './views/InteriorClientLedgerDetailsView';
import { InteriorVendorView } from './views/InteriorVendorView';
import { InteriorLabourContractView } from './views/InteriorLabourContractView';
import { InteriorLabourContractDetailsView } from './views/InteriorLabourContractDetailsView';
import { ConstructionLabourContractView } from './views/ConstructionLabourContractView';
import { ConstructionLabourContractDetailsView } from './views/ConstructionLabourContractDetailsView';
import { VendorView } from './views/VendorView';
import { VendorShopsView } from './views/VendorShopsView';
import { ShopDetailsView } from './views/ShopDetailsView';
import { BankDetailsView } from './views/BankDetailsView';
import { BricksCustomerView } from './views/BricksCustomerView';
import { BricksCustomerDetailsView } from './views/BricksCustomerDetailsView';
import { BricksProductionExpensesView } from './views/BricksProductionExpensesView';
import { BricksStockRegisterView } from './views/BricksStockRegisterView';
import { BricksStockItemDetailView } from './views/BricksStockItemDetailView';
import type { Client, InteriorClient, Vendor, VendorShop, BrickCustomer, BrickStockItem, BricksSubTab, InteriorSubTab, LabourContract } from './types';
import {
  Users,
  Search,
  Trash2,
  Phone,
  MapPin,
  Pencil,
  Plus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  BrickWall,
  Flame,
  Boxes,
  Paintbrush,
  HardHat
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import './styles/afrah-app.css';

const AfrahAppShell: React.FC = () => {
  const initialNav = useMemo(() => parseNavState(), []);
  const [activeTab, setActiveTab] = useState<TabType>(initialNav.activeTab);
  const [activeInteriorSubTab, setActiveInteriorSubTab] = useState<InteriorSubTab>(initialNav.activeInteriorSubTab);
  const [activeBricksSubTab, setActiveBricksSubTab] = useState<BricksSubTab>(initialNav.activeBricksSubTab);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialNav.selectedClientId);
  const [selectedConstructionLabourContractId, setSelectedConstructionLabourContractId] = useState<string | null>(initialNav.selectedConstructionLabourContractId);
  const [selectedInteriorLedgerClientId, setSelectedInteriorLedgerClientId] = useState<string | null>(initialNav.selectedInteriorLedgerClientId);
  const [selectedInteriorClientId, setSelectedInteriorClientId] = useState<string | null>(initialNav.selectedInteriorClientId);
  const [selectedInteriorVendorId, setSelectedInteriorVendorId] = useState<string | null>(initialNav.selectedInteriorVendorId);
  const [selectedInteriorShopId, setSelectedInteriorShopId] = useState<string | null>(initialNav.selectedInteriorShopId);
  const [selectedLabourContractId, setSelectedLabourContractId] = useState<string | null>(initialNav.selectedLabourContractId);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(initialNav.selectedVendorId);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(initialNav.selectedShopId);
  const [selectedBrickCustomerId, setSelectedBrickCustomerId] = useState<string | null>(initialNav.selectedBrickCustomerId);
  const [selectedStockItemId, setSelectedStockItemId] = useState<string | null>(initialNav.selectedStockItemId);

  const navRef = useRef<NavState>(initialNav);

  const applyNavState = useCallback((nav: NavState) => {
    navRef.current = nav;
    setActiveTab(nav.activeTab);
    setActiveInteriorSubTab(nav.activeInteriorSubTab);
    setActiveBricksSubTab(nav.activeBricksSubTab);
    setSelectedClientId(nav.selectedClientId);
    setSelectedConstructionLabourContractId(nav.selectedConstructionLabourContractId);
    setSelectedInteriorLedgerClientId(nav.selectedInteriorLedgerClientId);
    setSelectedInteriorClientId(nav.selectedInteriorClientId);
    setSelectedInteriorVendorId(nav.selectedInteriorVendorId);
    setSelectedInteriorShopId(nav.selectedInteriorShopId);
    setSelectedLabourContractId(nav.selectedLabourContractId);
    setSelectedVendorId(nav.selectedVendorId);
    setSelectedShopId(nav.selectedShopId);
    setSelectedBrickCustomerId(nav.selectedBrickCustomerId);
    setSelectedStockItemId(nav.selectedStockItemId);
  }, []);

  const navigate = useCallback(
    (patch: Partial<NavState>, mode: 'push' | 'replace' = 'push') => {
      const next = { ...navRef.current, ...patch };
      applyNavState(next);
      writeNavPath(buildNavPath(next), mode);
    },
    [applyNavState]
  );

  useEffect(() => {
    writeNavPath(buildNavPath(navRef.current), 'replace');
  }, []);

  useEffect(() => {
    const onPopState = () => {
      applyNavState(parseNavState());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [applyNavState]);

  // Responsive Drawer & Sidebar State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global Search & Pagination (Clients View)
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Add Client Form State (Modal)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addAddress, setAddAddress] = useState('');

  // Edit Client Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Delete Client Confirmation State
  const [deleteClientTarget, setDeleteClientTarget] = useState<Client | null>(null);
  const [isDeletingClient, setIsDeletingClient] = useState(false);

  // Supabase Custom Data Hooks
  const {
    clients,
    isLoading: clientsLoading,
    error: clientsError,
    isLiveDb,
    addClient,
    updateClient,
    deleteClient,
    deleteMultipleClients,
    addAdvancePayment,
    updateAdvancePayment,
    deleteAdvancePayment,
    deleteMultipleAdvancePayments,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteMultipleExpenses
  } = useClients();

  const {
    interiorClients,
    isLoading: interiorClientsLoading,
    addClient: addInteriorClient,
    updateClient: updateInteriorClient,
    deleteClient: deleteInteriorClient,
    deleteMultipleClients: deleteMultipleInteriorClients,
    addExpense: addInteriorExpense,
    updateExpense: updateInteriorExpense,
    deleteExpense: deleteInteriorExpense,
    deleteMultipleExpenses: deleteMultipleInteriorExpenses
  } = useInteriorClients();

  const {
    clients: interiorLedgerClients,
    isLoading: interiorLedgerClientsLoading,
    addClient: addInteriorLedgerClient,
    updateClient: updateInteriorLedgerClient,
    deleteClient: deleteInteriorLedgerClient,
    deleteMultipleClients: deleteMultipleInteriorLedgerClients,
    addAdvancePayment: addInteriorLedgerAdvance,
    updateAdvancePayment: updateInteriorLedgerAdvance,
    deleteAdvancePayment: deleteInteriorLedgerAdvance,
    deleteMultipleAdvancePayments: deleteMultipleInteriorLedgerAdvances,
    addExpense: addInteriorLedgerExpense,
    updateExpense: updateInteriorLedgerExpense,
    deleteExpense: deleteInteriorLedgerExpense,
    deleteMultipleExpenses: deleteMultipleInteriorLedgerExpenses,
  } = useInteriorLedgerClients();

  const {
    vendors: interiorVendors,
    isLoading: interiorVendorsLoading,
    addCategory: addInteriorCategory,
    updateCategory: updateInteriorCategory,
    deleteCategory: deleteInteriorCategory,
    addVendorShop: addInteriorVendorShop,
    updateVendorShop: updateInteriorVendorShop,
    deleteVendorShop: deleteInteriorVendorShop,
    addShopTransaction: addInteriorShopTransaction,
    updateShopTransaction: updateInteriorShopTransaction,
    deleteShopTransaction: deleteInteriorShopTransaction,
    deleteMultipleShopTransactions: deleteMultipleInteriorShopTransactions
  } = useInteriorVendors();

  const {
    contracts: labourContracts,
    isLoading: labourContractsLoading,
    addContract: addLabourContract,
    updateContract: updateLabourContract,
    updateLabourCharge,
    deleteContract: deleteLabourContract,
    deleteMultipleContracts: deleteMultipleLabourContracts,
    addEntry: addLabourEntry,
    updateEntry: updateLabourEntry,
    deleteEntry: deleteLabourEntry
  } = useLabourContracts();

  const {
    contracts: constructionLabourContracts,
    isLoading: constructionLabourLoading,
    addContract: addConstructionLabourContract,
    updateContract: updateConstructionLabourContract,
    updateLabourCharge: updateConstructionLabourCharge,
    deleteContract: deleteConstructionLabourContract,
    addEntry: addConstructionLabourEntry,
    updateEntry: updateConstructionLabourEntry,
    deleteEntry: deleteConstructionLabourEntry
  } = useConstructionLabourContracts();

  const {
    vendors,
    isLoading: vendorsLoading,
    error: vendorsError,
    addCategory,
    updateCategory,
    deleteCategory,
    deleteMultipleVendors,
    addVendorShop,
    updateVendorShop,
    deleteVendorShop,
    deleteMultipleShops,
    addShopTransaction,
    updateShopTransaction,
    deleteShopTransaction,
    deleteMultipleShopTransactions
  } = useVendors();

  const {
    bankAccounts,
    isLoading: banksLoading,
    error: banksError,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addBankTransaction,
    deleteBankTransaction,
    deleteMultipleTransactions: deleteMultipleBankTransactions
  } = useBanks();

  const {
    brickCustomers,
    isLoading: bricksLoading,
    error: bricksError,
    addCustomer: addBrickCustomer,
    updateCustomer: updateBrickCustomer,
    deleteCustomer: deleteBrickCustomer,
    deleteMultipleCustomers: deleteMultipleBrickCustomers,
    addTransaction: addBrickTransaction,
    updateTransaction: updateBrickTransaction,
    deleteTransaction: deleteBrickTransaction,
    deleteMultipleTransactions: deleteMultipleBrickTransactions
  } = useBrickCustomers();

  const {
    expenses: brickExpenses,
    isLoading: brickExpensesLoading,
    stats: brickExpensesStats,
    addExpense: addBrickExpense,
    updateExpense: updateBrickExpense,
    deleteExpense: deleteBrickExpense,
    deleteMultipleExpenses: deleteMultipleBrickExpenses
  } = useBrickProductionExpenses();

  const {
    stockItems,
    isLoading: brickStockLoading,
    stats: stockStats,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    deleteMultipleStockItems,
    addStockItemEntry,
    updateStockItemEntry,
    deleteStockItemEntry,
    deleteMultipleStockItemEntries
  } = useBrickStock();

  // Selected Entities Memo
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  const selectedConstructionLabourContract = useMemo(() => {
    return constructionLabourContracts.find((c) => c.id === selectedConstructionLabourContractId) || null;
  }, [constructionLabourContracts, selectedConstructionLabourContractId]);

  const selectedInteriorLedgerClient = useMemo(() => {
    return interiorLedgerClients.find((c) => c.id === selectedInteriorLedgerClientId) || null;
  }, [interiorLedgerClients, selectedInteriorLedgerClientId]);

  const selectedInteriorClient = useMemo(() => {
    return interiorClients.find((c) => c.id === selectedInteriorClientId) || null;
  }, [interiorClients, selectedInteriorClientId]);

  const selectedInteriorVendor = useMemo(() => {
    return interiorVendors.find((v) => v.id === selectedInteriorVendorId) || null;
  }, [interiorVendors, selectedInteriorVendorId]);

  const selectedInteriorShop = useMemo(() => {
    if (!selectedInteriorVendor) return null;
    return (selectedInteriorVendor.shops || []).find((s) => s.id === selectedInteriorShopId) || null;
  }, [selectedInteriorVendor, selectedInteriorShopId]);

  const selectedLabourContract = useMemo(() => {
    return labourContracts.find((c) => c.id === selectedLabourContractId) || null;
  }, [labourContracts, selectedLabourContractId]);

  const selectedVendor = useMemo(() => {
    return vendors.find((v) => v.id === selectedVendorId) || null;
  }, [vendors, selectedVendorId]);

  const selectedShop = useMemo(() => {
    if (!selectedVendor) return null;
    return (selectedVendor.shops || []).find((s) => s.id === selectedShopId) || null;
  }, [selectedVendor, selectedShopId]);

  const selectedBrickCustomer = useMemo(() => {
    return brickCustomers.find((bc) => bc.id === selectedBrickCustomerId) || null;
  }, [brickCustomers, selectedBrickCustomerId]);

  const selectedStockItem = useMemo(() => {
    return stockItems.find((s) => s.id === selectedStockItemId) || null;
  }, [stockItems, selectedStockItemId]);

  const bootLoading =
    clientsLoading ||
    vendorsLoading ||
    banksLoading ||
    interiorLedgerClientsLoading ||
    interiorClientsLoading ||
    interiorVendorsLoading ||
    labourContractsLoading ||
    constructionLabourLoading ||
    bricksLoading ||
    brickExpensesLoading ||
    brickStockLoading;

  const [bootReady, setBootReady] = useState(false);
  useEffect(() => {
    if (!bootLoading) setBootReady(true);
  }, [bootLoading]);

  // Validation Flags
  const isAddClientValid =
    addName.trim().length > 0 &&
    addPhone.trim().length > 0 &&
    addAddress.trim().length > 0;

  const isEditClientValid =
    editName.trim().length > 0 &&
    editPhone.trim().length > 0 &&
    editAddress.trim().length > 0;

  // Handle Add Client Submit
  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddClientValid) return;

    await addClient({
      name: addName.trim(),
      phone: addPhone.trim(),
      address: addAddress.trim(),
    });

    setAddName('');
    setAddPhone('');
    setAddAddress('');
    setIsAddModalOpen(false);
    setCurrentPage(1);
    showToast('Client added successfully!', 'success');
  };

  // Open Edit Client Modal
  const handleOpenEditModal = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClientId(client.id);
    setEditName(client.name);
    setEditPhone(client.phone);
    setEditAddress(client.address);
    setIsEditModalOpen(true);
  };

  // Save Edit Client Modal
  const handleSaveEditModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditClientValid || !editingClientId) return;

    const target = clients.find((c) => c.id === editingClientId);
    if (target) {
      await updateClient({
        ...target,
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      });
      showToast('Client details updated!', 'success');
    }

    setIsEditModalOpen(false);
    setEditingClientId(null);
  };

  // Handle Confirm Delete Client
  const handleConfirmDeleteClient = async () => {
    if (!deleteClientTarget) return;
    setIsDeletingClient(true);
    try {
      await deleteClient(deleteClientTarget.id);
      if (selectedClientId === deleteClientTarget.id) {
        navigate({ selectedClientId: null }, 'replace');
      }
      showToast('Client deleted successfully!', 'success');
    } catch (err) {
      showToast('Failed to delete client', 'error');
    } finally {
      setIsDeletingClient(false);
      setDeleteClientTarget(null);
    }
  };

  // Filter clients
  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }, [clients, searchQuery]);

  // Pagination computations for clients
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredClients.length);
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  const activeError = clientsError || vendorsError || banksError;

  return (
    <div className="afrah-app-container">
      {/* Ambient background lighting */}
      <div className="afrah-app-ambient-glow" />
      <div className="afrah-app-ambient-glow-2" />

      {/* Sidebar with Brand 'Afrah Constructions' and items arranged according to sketch */}
      <AfrahAppSidebar
        clientsCount={clients.length}
        constructionLabourContractsCount={constructionLabourContracts.length}
        interiorLedgerClientsCount={interiorLedgerClients.length}
        interiorClientsCount={interiorClients.length}
        interiorVendorsCount={interiorVendors.length}
        interiorLabourContractsCount={labourContracts.length}
        vendorsCount={vendors.length}
        banksCount={bankAccounts.length}
        brickCustomersCount={brickCustomers.length}
        brickExpensesCount={brickExpenses.length}
        brickStockCount={stockItems.length}
        activeTab={activeTab}
        activeInteriorSubTab={activeInteriorSubTab}
        activeBricksSubTab={activeBricksSubTab}
        onSelectTab={(tab, subTab) => {
          navigate({
            activeTab: tab,
            ...(tab === 'kaab_interior' &&
            (subTab === 'clients' || subTab === 'directory' || subTab === 'vendor' || subTab === 'labour_contract')
              ? { activeInteriorSubTab: subTab as InteriorSubTab }
              : {}),
            ...(tab === 'kabibullah_bricks' &&
            (subTab === 'directory' || subTab === 'expenses' || subTab === 'stock')
              ? { activeBricksSubTab: subTab as BricksSubTab }
              : {}),
            ...CLEARED_ENTITY_IDS,
          });
        }}
        onSelectInteriorSubTab={(subTab) => {
          navigate({
            activeTab: 'kaab_interior',
            activeInteriorSubTab: subTab,
            selectedInteriorLedgerClientId: null,
            selectedInteriorClientId: null,
            selectedInteriorVendorId: null,
            selectedInteriorShopId: null,
            selectedLabourContractId: null,
          });
        }}
        onSelectBricksSubTab={(subTab) => {
          navigate({
            activeTab: 'kabibullah_bricks',
            activeBricksSubTab: subTab,
            selectedBrickCustomerId: null,
            selectedStockItemId: null,
          });
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Viewport */}
      <div className="afrah-app-main-viewport">
        {/* Top Header */}
        <AfrahAppTopBar
          activeTab={activeTab}
          activeInteriorSubTab={activeInteriorSubTab}
          activeBricksSubTab={activeBricksSubTab}
          clientsCount={clients.length}
          constructionLabourContractsCount={constructionLabourContracts.length}
          interiorLedgerClientsCount={interiorLedgerClients.length}
          interiorClientsCount={interiorClients.length}
          interiorVendorsCount={interiorVendors.length}
          interiorLabourContractsCount={labourContracts.length}
          vendorsCount={vendors.length}
          banksCount={bankAccounts.length}
          brickCustomersCount={brickCustomers.length}
          brickExpensesCount={brickExpenses.length}
          brickStockUnits={stockStats.totalStockUnits}
          selectedClient={selectedClient}
          selectedConstructionLabourContract={selectedConstructionLabourContract}
          selectedInteriorLedgerClient={selectedInteriorLedgerClient}
          selectedInteriorClient={selectedInteriorClient}
          selectedInteriorVendor={selectedInteriorVendor}
          selectedInteriorShop={selectedInteriorShop}
          selectedInteriorLabourContract={selectedLabourContract}
          selectedVendor={selectedVendor}
          selectedShop={selectedShop}
          selectedBrickCustomer={selectedBrickCustomer}
          selectedStockItemName={selectedStockItem?.item}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onNavigateHome={() => navigate({ selectedClientId: null })}
          onNavigateConstructionLabourRoot={() => {
            navigate({ selectedConstructionLabourContractId: null });
          }}
          onNavigateInteriorRoot={(subTab) => {
            navigate({
              selectedInteriorLedgerClientId: null,
              selectedInteriorClientId: null,
              selectedInteriorVendorId: null,
              selectedInteriorShopId: null,
              selectedLabourContractId: null,
              ...(subTab ? { activeInteriorSubTab: subTab } : {}),
            });
          }}
          onNavigateInteriorClientsRoot={() => {
            navigate({ selectedInteriorLedgerClientId: null });
          }}
          onNavigateInteriorVendorRoot={() => {
            navigate({ selectedInteriorVendorId: null, selectedInteriorShopId: null });
          }}
          onNavigateInteriorVendorCategory={() => {
            navigate({ selectedInteriorShopId: null });
          }}
          onNavigateInteriorLabourContractRoot={() => {
            navigate({ selectedLabourContractId: null });
          }}
          onNavigateVendorRoot={() => {
            navigate({ selectedVendorId: null, selectedShopId: null });
          }}
          onNavigateVendorCategory={() => {
            navigate({ selectedShopId: null });
          }}
          onNavigateBricksRoot={(subTab) => {
            navigate({
              selectedBrickCustomerId: null,
              selectedStockItemId: null,
              ...(subTab ? { activeBricksSubTab: subTab } : {}),
            });
          }}
          isLiveDb={isLiveDb}
          onSignOut={() => {
            void supabase.auth.signOut();
          }}
        />

        {/* Global Error Banner (if any) */}
        {activeError && (
          <div
            style={{
              padding: '10px 24px',
              background: '#7f1d1d',
              color: '#fee2e2',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={14} color="#fca5a5" />
            <span>Database Sync Notice: {activeError}</span>
          </div>
        )}

        {/* Main Content */}
        <main className="afrah-app-main-content">
          {!bootReady && (
            <div className="afrah-app-boot-overlay" role="status" aria-live="polite">
              <Loader2 size={28} className="animate-spin" />
              <span>Loading…</span>
            </div>
          )}
          {activeTab === 'construction_labour' ? (
            selectedConstructionLabourContract ? (
              /* CONSTRUCTION LABOUR CONTRACTOR DETAILS & WORK MUSTER LEDGER */
              <ConstructionLabourContractDetailsView
                contract={selectedConstructionLabourContract}
                onBack={() => navigate({ selectedConstructionLabourContractId: null })}
                onUpdateContract={updateConstructionLabourContract}
                onUpdateLabourCharge={updateConstructionLabourCharge}
                onAddEntry={addConstructionLabourEntry}
                onUpdateEntry={updateConstructionLabourEntry}
                onDeleteEntry={deleteConstructionLabourEntry}
              />
            ) : selectedConstructionLabourContractId && bootReady ? (
              <EntityNotFound
                entityLabel="contract"
                backLabel="Go to Construction Labour"
                onBack={() => navigate({ selectedConstructionLabourContractId: null })}
              />
            ) : (
              /* CONSTRUCTION LABOUR CONTRACTS DIRECTORY */
              <ConstructionLabourContractView
                contracts={constructionLabourContracts}
                onSelectContract={(c) => navigate({ selectedConstructionLabourContractId: c.id })}
                onAddContract={addConstructionLabourContract}
                onUpdateContract={updateConstructionLabourContract}
                onDeleteContract={deleteConstructionLabourContract}
                siteOptions={Array.from(new Set([
                  ...clients.map((c) => c.name),
                  'Dr. K. Rajendran Villa - Site #4',
                  'Commercial Complex - Anna Nagar',
                  'Green Valley Plot 14 Residence',
                  ...constructionLabourContracts.map((c) => c.siteName).filter(Boolean)
                ]))}
              />
            )
          ) : activeTab === 'kaab_interior' ? (
            activeInteriorSubTab === 'clients' ? (
              selectedInteriorLedgerClient ? (
                /* KAAB INTERIOR - CLIENT DETAILS (ADVANCE & SITE EXPENSES LEDGER) */
                <InteriorClientLedgerDetailsView
                  client={selectedInteriorLedgerClient}
                  onBack={() => navigate({ selectedInteriorLedgerClientId: null })}
                  onUpdateClient={updateInteriorLedgerClient}
                  onAddAdvance={addInteriorLedgerAdvance}
                  onUpdateAdvance={updateInteriorLedgerAdvance}
                  onDeleteAdvance={deleteInteriorLedgerAdvance}
                  onDeleteMultipleAdvancePayments={deleteMultipleInteriorLedgerAdvances}
                  onAddExpense={addInteriorLedgerExpense}
                  onUpdateExpense={updateInteriorLedgerExpense}
                  onDeleteExpense={deleteInteriorLedgerExpense}
                  onDeleteMultipleExpenses={deleteMultipleInteriorLedgerExpenses}
                />
              ) : selectedInteriorLedgerClientId && bootReady ? (
                <EntityNotFound
                  entityLabel="client"
                  backLabel="Go to Interior Clients"
                  onBack={() => navigate({ selectedInteriorLedgerClientId: null })}
                />
              ) : (
                /* KAAB INTERIOR - CLIENTS LIST VIEW */
                <InteriorClientLedgerView
                  clients={interiorLedgerClients}
                  onSelectClient={(c) => navigate({ selectedInteriorLedgerClientId: c.id })}
                  onAddClient={addInteriorLedgerClient}
                  onUpdateClient={updateInteriorLedgerClient}
                  onDeleteClient={deleteInteriorLedgerClient}
                />
              )
            ) : activeInteriorSubTab === 'vendor' ? (
              selectedInteriorVendor && selectedInteriorShop ? (
                /* INTERIOR SHOP DETAILS VIEW (Transaction Ledger) */
                <ShopDetailsView
                  vendor={selectedInteriorVendor}
                  shop={selectedInteriorShop}
                  clientOptions={interiorClients.map((c) => c.name)}
                  brand="kaab"
                  onBack={() => navigate({ selectedInteriorShopId: null })}
                  onUpdateShop={(updated) => updateInteriorVendorShop(selectedInteriorVendor.id, updated)}
                  onAddTransaction={addInteriorShopTransaction}
                  onUpdateTransaction={updateInteriorShopTransaction}
                  onDeleteTransaction={deleteInteriorShopTransaction}
                  onDeleteMultipleShopTransactions={deleteMultipleInteriorShopTransactions}
                />
              ) : selectedInteriorVendorId && selectedInteriorShopId && bootReady && !selectedInteriorShop ? (
                selectedInteriorVendor ? (
                  <EntityNotFound
                    entityLabel="shop"
                    backLabel="Go to Shops"
                    onBack={() => navigate({ selectedInteriorShopId: null })}
                  />
                ) : (
                  <EntityNotFound
                    entityLabel="vendor"
                    backLabel="Go to Vendors"
                    onBack={() => {
                      navigate({ selectedInteriorVendorId: null, selectedInteriorShopId: null });
                    }}
                  />
                )
              ) : selectedInteriorVendor ? (
                /* INTERIOR VENDOR SHOPS LIST */
                <VendorShopsView
                  vendor={selectedInteriorVendor}
                  onBack={() => navigate({ selectedInteriorVendorId: null })}
                  onSelectShop={(shop) => navigate({ selectedInteriorShopId: shop.id })}
                  onAddShop={(shopData) => addInteriorVendorShop(selectedInteriorVendor.id, shopData)}
                  onUpdateShop={(updatedShop) => updateInteriorVendorShop(selectedInteriorVendor.id, updatedShop)}
                  onDeleteShop={(shopId) => deleteInteriorVendorShop(selectedInteriorVendor.id, shopId)}
                />
              ) : selectedInteriorVendorId && bootReady ? (
                <EntityNotFound
                  entityLabel="vendor"
                  backLabel="Go to Vendors"
                  onBack={() => {
                    navigate({ selectedInteriorVendorId: null, selectedInteriorShopId: null });
                  }}
                />
              ) : (
                /* INTERIOR VENDOR CATEGORIES LIST (Hardware, Carpenter, Plywoods...) */
                <InteriorVendorView
                  vendors={interiorVendors}
                  onSelectVendor={(vendor) => {
                    navigate({ selectedInteriorVendorId: vendor.id, selectedInteriorShopId: null });
                  }}
                  onAddVendor={addInteriorCategory}
                  onUpdateVendor={updateInteriorCategory}
                  onDeleteVendor={deleteInteriorCategory}
                />
              )
            ) : activeInteriorSubTab === 'labour_contract' ? (
              selectedLabourContract ? (
                /* LABOUR CONTRACTOR DETAILS & WORK LEDGER */
                <InteriorLabourContractDetailsView
                  contract={selectedLabourContract}
                  onBack={() => navigate({ selectedLabourContractId: null })}
                  onUpdateContract={updateLabourContract}
                  onUpdateLabourCharge={updateLabourCharge}
                  onAddEntry={addLabourEntry}
                  onUpdateEntry={updateLabourEntry}
                  onDeleteEntry={deleteLabourEntry}
                />
              ) : selectedLabourContractId && bootReady ? (
                <EntityNotFound
                  entityLabel="contract"
                  backLabel="Go to Labour Contracts"
                  onBack={() => navigate({ selectedLabourContractId: null })}
                />
              ) : (
                /* LABOUR CONTRACTS DIRECTORY (Matching wireframe & sketch) */
                <InteriorLabourContractView
                  contracts={labourContracts}
                  onSelectContract={(c) => navigate({ selectedLabourContractId: c.id })}
                  onAddContract={addLabourContract}
                  onUpdateContract={updateLabourContract}
                  onDeleteContract={deleteLabourContract}
                  siteOptions={Array.from(new Set([
                    ...interiorClients.map((c) => c.name),
                    'Palayam',
                    'A.R. Rahman Villa',
                    'Dr. Vikramaditya Reddy Site',
                    'Green Meadows Apt',
                    ...labourContracts.map((c) => c.siteName).filter(Boolean)
                  ]))}
                />
              )
            ) : selectedInteriorClient ? (
              /* KAAB INTERIOR - CLIENT DETAILS & PROJECT LEDGER */
              <InteriorClientDetailsView
                client={selectedInteriorClient}
                onBack={() => navigate({ selectedInteriorClientId: null })}
                onUpdateClient={updateInteriorClient}
                onAddExpense={addInteriorExpense}
                onUpdateExpense={updateInteriorExpense}
                onDeleteExpense={deleteInteriorExpense}
                onDeleteMultipleExpenses={deleteMultipleInteriorExpenses}
              />
            ) : selectedInteriorClientId && bootReady ? (
              <EntityNotFound
                entityLabel="client"
                backLabel="Go to Interior Clients"
                onBack={() => navigate({ selectedInteriorClientId: null })}
              />
            ) : (
              /* KAAB INTERIOR - CLIENTS DIRECTORY */
              <InteriorClientView
                clients={interiorClients}
                onSelectClient={(c) => navigate({ selectedInteriorClientId: c.id })}
                onAddClient={addInteriorClient}
                onUpdateClient={updateInteriorClient}
                onDeleteClient={deleteInteriorClient}
                onDeleteMultipleClients={deleteMultipleInteriorClients}
              />
            )
          ) : activeTab === 'kabibullah_bricks' ? (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
              {/* Sub-view rendering */}
              {activeBricksSubTab === 'directory' ? (
                selectedBrickCustomer ? (
                  /* KABIBULLAH BRICKS - CUSTOMER DETAILS & TRANSACTIONS VIEW */
                  <BricksCustomerDetailsView
                    customer={selectedBrickCustomer}
                    onBack={() => navigate({ selectedBrickCustomerId: null })}
                    onUpdateCustomer={updateBrickCustomer}
                    onAddTransaction={addBrickTransaction}
                    onUpdateTransaction={updateBrickTransaction}
                    onDeleteTransaction={deleteBrickTransaction}
                    onDeleteMultipleTransactions={deleteMultipleBrickTransactions}
                  />
                ) : selectedBrickCustomerId && bootReady ? (
                  <EntityNotFound
                    entityLabel="customer"
                    backLabel="Go to Bricks Customers"
                    onBack={() => navigate({ selectedBrickCustomerId: null })}
                  />
                ) : (
                  /* KABIBULLAH BRICKS - CUSTOMER DIRECTORY */
                  <BricksCustomerView
                    customers={brickCustomers}
                    onSelectCustomer={(cust) => navigate({ selectedBrickCustomerId: cust.id })}
                    onAddCustomer={addBrickCustomer}
                    onUpdateCustomer={updateBrickCustomer}
                    onDeleteCustomer={deleteBrickCustomer}
                    onDeleteMultipleCustomers={deleteMultipleBrickCustomers}
                  />
                )
              ) : activeBricksSubTab === 'expenses' ? (
                /* KABIBULLAH BRICKS - PRODUCTION EXPENSES */
                <BricksProductionExpensesView
                  expenses={brickExpenses}
                  stats={brickExpensesStats}
                  onAddExpense={addBrickExpense}
                  onUpdateExpense={updateBrickExpense}
                  onDeleteExpense={deleteBrickExpense}
                  onDeleteMultipleExpenses={deleteMultipleBrickExpenses}
                />
              ) : (
                /* KABIBULLAH BRICKS - STOCK REGISTER & INVENTORY */
                selectedStockItem ? (
                  <BricksStockItemDetailView
                    item={selectedStockItem}
                    onBack={() => navigate({ selectedStockItemId: null })}
                    onUpdateStockItem={updateStockItem}
                    onAddEntry={addStockItemEntry}
                    onUpdateEntry={updateStockItemEntry}
                    onDeleteEntry={deleteStockItemEntry}
                    onDeleteMultipleEntries={deleteMultipleStockItemEntries}
                  />
                ) : selectedStockItemId && bootReady ? (
                  <EntityNotFound
                    entityLabel="stock item"
                    backLabel="Go to Stock Register"
                    onBack={() => navigate({ selectedStockItemId: null })}
                  />
                ) : (
                  <BricksStockRegisterView
                    stockItems={stockItems}
                    stats={stockStats}
                    onSelectItem={(item) => navigate({ selectedStockItemId: item.id })}
                    onAddStockItem={addStockItem}
                    onUpdateStockItem={updateStockItem}
                    onDeleteStockItem={deleteStockItem}
                    onDeleteMultipleStockItems={deleteMultipleStockItems}
                  />
                )
              )}
            </div>
          ) : activeTab === 'banks' ? (
            /* BANK DETAILS VIEW (Canara Bank, Bank of Baroda, etc.) */
            <BankDetailsView
              bankAccounts={bankAccounts}
              onAddAccount={addBankAccount}
              onUpdateAccount={updateBankAccount}
              onDeleteAccount={deleteBankAccount}
              onAddTransaction={addBankTransaction}
              onDeleteTransaction={deleteBankTransaction}
              onDeleteMultipleTransactions={deleteMultipleBankTransactions}
            />
          ) : activeTab === 'vendor' ? (
            selectedVendor && selectedShop ? (
              /* SHOP DETAILS VIEW (Transactions table matching handwritten sketch) */
              <ShopDetailsView
                vendor={selectedVendor}
                shop={selectedShop}
                clientOptions={clients.map((c) => c.name)}
                onBack={() => navigate({ selectedShopId: null })}
                onUpdateShop={(updated) => updateVendorShop(selectedVendor.id, updated)}
                onAddTransaction={addShopTransaction}
                onUpdateTransaction={updateShopTransaction}
                onDeleteTransaction={deleteShopTransaction}
                onDeleteMultipleShopTransactions={deleteMultipleShopTransactions}
              />
            ) : selectedVendorId && selectedShopId && bootReady && !selectedShop ? (
              selectedVendor ? (
                <EntityNotFound
                  entityLabel="shop"
                  backLabel="Go to Shops"
                  onBack={() => navigate({ selectedShopId: null })}
                />
              ) : (
                <EntityNotFound
                  entityLabel="vendor"
                  backLabel="Go to Vendors"
                    onBack={() => {
                      navigate({ selectedVendorId: null, selectedShopId: null });
                    }}
                />
              )
            ) : selectedVendor ? (
              /* VENDOR SHOPS LIST (List of shops for e.g. Bricks + Add Shop form) */
              <VendorShopsView
                vendor={selectedVendor}
                onBack={() => navigate({ selectedVendorId: null })}
                onSelectShop={(shop) => navigate({ selectedShopId: shop.id })}
                onAddShop={(shopData) => addVendorShop(selectedVendor.id, shopData)}
                onUpdateShop={(updatedShop) => updateVendorShop(selectedVendor.id, updatedShop)}
                onDeleteShop={(shopId) => deleteVendorShop(selectedVendor.id, shopId)}
              />
            ) : selectedVendorId && bootReady ? (
              <EntityNotFound
                entityLabel="vendor"
                backLabel="Go to Vendors"
                    onBack={() => {
                      navigate({ selectedVendorId: null, selectedShopId: null });
                    }}
              />
            ) : (
              /* VENDOR CATEGORIES LIST (Bricks, Hardware, M.Sand...) */
              <VendorView
                vendors={vendors}
                onSelectVendor={(vendor) => {
                  navigate({ selectedVendorId: vendor.id, selectedShopId: null });
                }}
                onAddVendor={addCategory}
                onUpdateVendor={updateCategory}
                onDeleteVendor={deleteCategory}
              />
            )
          ) : selectedClient ? (
            /* CLIENT DETAILS VIEW (Advance Payments + Expenses with Searchable Dropdown) */
            <ClientDetailsView
              client={selectedClient}
              onBack={() => navigate({ selectedClientId: null })}
              onUpdateClient={updateClient}
              onAddAdvance={addAdvancePayment}
              onUpdateAdvance={updateAdvancePayment}
              onDeleteAdvance={deleteAdvancePayment}
              onDeleteMultipleAdvancePayments={deleteMultipleAdvancePayments}
              onAddExpense={addExpense}
              onUpdateExpense={updateExpense}
              onDeleteExpense={deleteExpense}
              onDeleteMultipleExpenses={deleteMultipleExpenses}
            />
          ) : selectedClientId && bootReady ? (
            <EntityNotFound
              entityLabel="client"
              backLabel="Go to Clients"
              onBack={() => navigate({ selectedClientId: null })}
            />
          ) : (
            /* CLIENT LIST FULL-PAGE VIEW */
            <section className={`afrah-app-table-section${isAddModalOpen ? ' with-add-popover' : ''}`} style={{ width: '100%' }}>
              <div className="afrah-app-section-header">
                <div>
                  <h1 className="afrah-app-section-title">CLIENT NAME LIST</h1>
                  <span className="afrah-app-section-subtitle">
                    {filteredClients.length} {filteredClients.length === 1 ? 'record' : 'records'} · Click row to view details
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Quick Search */}
                  <div className="afrah-app-search-wrapper">
                    <Search size={14} className="afrah-app-search-icon" />
                    <input
                      type="text"
                      placeholder="Search name, phone, address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="afrah-app-search-input"
                    />
                  </div>

                  <TableFormPopover
                    open={isAddModalOpen}
                    onOpenChange={setIsAddModalOpen}
                    label="Add Details"
                    onOpen={() => {
                      setAddName('');
                      setAddPhone('');
                      setAddAddress('');
                    }}
                  >
                    <form onSubmit={handleAddClientSubmit} className="afrah-app-add-form">
                      <div className="afrah-app-form-group">
                        <label className="afrah-app-label">Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Patel"
                          value={addName}
                          onChange={(e) => setAddName(e.target.value)}
                          className="afrah-app-input"
                          autoFocus
                        />
                      </div>

                      <div className="afrah-app-form-group">
                        <label className="afrah-app-label">Phone *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={addPhone}
                          onChange={(e) => setAddPhone(e.target.value)}
                          className="afrah-app-input"
                        />
                      </div>

                      <div className="afrah-app-form-group">
                        <label className="afrah-app-label">Address *</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Street, City, Postal Code..."
                          value={addAddress}
                          onChange={(e) => setAddAddress(e.target.value)}
                          className="afrah-app-input afrah-app-textarea"
                        />
                      </div>

                      {!isAddClientValid && (
                        <div className="afrah-app-validation-notice">
                          * All 3 fields are required to enable submission.
                        </div>
                      )}

                      <div className="afrah-app-add-popover-actions">
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(false)}
                          className="afrah-app-back-btn"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!isAddClientValid}
                          className="btn-theme-primary"
                        >
                          <Plus size={16} />
                          <span>Save Details</span>
                        </button>
                      </div>
                    </form>
                  </TableFormPopover>
                </div>
              </div>

              {/* Table with NAME, PHONE, ADDRESS + Actions (Edit & Delete) */}
              <div className="afrah-app-table-container">
                <table className="afrah-app-table">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: '56px' }}>S.NO</th>
                      <th style={{ width: '260px' }}>NAME</th>
                      <th style={{ width: '180px' }}>PHONE</th>
                      <th>ADDRESS</th>
                      <th className="text-center" style={{ width: '80px' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-state-cell">
                          {searchQuery ? 'No matching clients found.' : 'No clients added yet. Click "Add Details" above to add one.'}
                        </td>
                      </tr>
                    ) : (
                      paginatedClients.map((client, index) => (
                        <tr
                          key={client.id}
                          onClick={() => navigate({ selectedClientId: client.id })}
                          className="clickable-client-row"
                        >
                          <td className="cell-sno">
                            {startIndex + index + 1}
                          </td>
                          <td>
                            <div className="cell-entity">
                              <div className="afrah-app-user-avatar">
                                {client.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="row-client-name">
                                {client.name}
                              </span>
                            </div>
                          </td>
                          <td className="nowrap">
                            <div className="cell-icon-text">
                              <Phone size={13} color="var(--primary)" />
                              <span className="cell-phone">{client.phone}</span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-icon-text is-muted">
                              <MapPin size={13} color="var(--primary)" />
                              <span className="cell-address">{client.address}</span>
                            </div>
                          </td>
                          <td className="text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="cell-actions">
                              <button
                                onClick={(e) => handleOpenEditModal(client, e)}
                                className="afrah-app-action-btn afrah-app-edit-btn"
                                title="Edit Client"
                                aria-label="Edit Client"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteClientTarget(client);
                                }}
                                className="afrah-app-action-btn afrah-app-delete-btn"
                                title="Delete Client"
                                aria-label="Delete Client"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredClients.length > 0 && (
                <div className="afrah-app-pagination-bar">
                  <div className="afrah-app-pagination-left">
                    <span className="afrah-app-pagination-info">
                      Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of <strong>{filteredClients.length}</strong>
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
          )}
        </main>
      </div>


      {/* Edit Client Modal */}
      {isEditModalOpen && (
        <div className="afrah-app-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div
              className="afrah-app-modal-container modal-w-md"
              onClick={(e) => e.stopPropagation()}
          >
            <div className="afrah-app-modal-header">
              <div className="flex-center">
                <Pencil size={17} color="var(--primary)" />
                <h3 className="afrah-app-modal-title">Edit Client Information</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="afrah-app-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditModal}>
              <div className="afrah-app-modal-body">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Address *</label>
                  <textarea
                    rows={3}
                    required
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="afrah-app-input afrah-app-textarea"
                  />
                </div>

                {!isEditClientValid && (
                  <div className="afrah-app-validation-notice">
                    * All fields must be filled to save changes.
                  </div>
                )}
              </div>

              <div className="afrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="afrah-app-back-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isEditClientValid}
                  className="btn-theme-primary btn-secondary-lg"
                >
                  <Check size={16} strokeWidth={2.5} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE CLIENT MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteClientTarget)}
        title="Delete Client Record"
        message="Are you sure you want to delete this client? All associated advance payments and site expenses will also be permanently deleted."
        itemName={deleteClientTarget ? `${deleteClientTarget.name} (${deleteClientTarget.phone})` : undefined}
        confirmText="Delete Client"
        isDeleting={isDeletingClient}
        onConfirm={handleConfirmDeleteClient}
        onClose={() => setDeleteClientTarget(null)}
      />

      {/* Global Toast Notification System */}
      <ToastContainer />
    </div>
  );
};

export const AfrahAppPortal: React.FC = () => (
  <AfrahAppAuthGate>
    <AfrahAppShell />
  </AfrahAppAuthGate>
);

export default AfrahAppPortal;
