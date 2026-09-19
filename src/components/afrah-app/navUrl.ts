import type { TabType } from './layout/AfrahAppSidebar';
import type { BricksSubTab, InteriorSubTab } from './types';

export const APP_BASE = '/afrah-app';

const VALID_TABS: TabType[] = [
  'clients',
  'vendor',
  'banks',
  'construction_labour',
  'kabibullah_bricks',
  'kaab_interior',
];

const VALID_INTERIOR_SUBS: InteriorSubTab[] = ['directory', 'vendor', 'labour_contract'];
const VALID_BRICKS_SUBS: BricksSubTab[] = ['directory', 'expenses', 'stock'];

const TAB_TO_SEGMENT: Record<TabType, string> = {
  clients: 'clients',
  vendor: 'vendor',
  banks: 'banks',
  construction_labour: 'construction-labour',
  kabibullah_bricks: 'bricks',
  kaab_interior: 'interior',
};

const SEGMENT_TO_TAB: Record<string, TabType> = {
  clients: 'clients',
  vendor: 'vendor',
  banks: 'banks',
  'construction-labour': 'construction_labour',
  bricks: 'kabibullah_bricks',
  interior: 'kaab_interior',
};

const INTERIOR_SUB_TO_SEGMENT: Record<InteriorSubTab, string> = {
  directory: 'directory',
  vendor: 'vendor',
  labour_contract: 'labour-contract',
};

const INTERIOR_SEGMENT_TO_SUB: Record<string, InteriorSubTab> = {
  directory: 'directory',
  vendor: 'vendor',
  'labour-contract': 'labour_contract',
};

export interface NavState {
  activeTab: TabType;
  activeInteriorSubTab: InteriorSubTab;
  activeBricksSubTab: BricksSubTab;
  selectedClientId: string | null;
  selectedConstructionLabourContractId: string | null;
  selectedInteriorClientId: string | null;
  selectedInteriorVendorId: string | null;
  selectedInteriorShopId: string | null;
  selectedLabourContractId: string | null;
  selectedVendorId: string | null;
  selectedShopId: string | null;
  selectedBrickCustomerId: string | null;
  selectedStockItemId: string | null;
}

const emptyNav = (): NavState => ({
  activeTab: 'clients',
  activeInteriorSubTab: 'directory',
  activeBricksSubTab: 'directory',
  selectedClientId: null,
  selectedConstructionLabourContractId: null,
  selectedInteriorClientId: null,
  selectedInteriorVendorId: null,
  selectedInteriorShopId: null,
  selectedLabourContractId: null,
  selectedVendorId: null,
  selectedShopId: null,
  selectedBrickCustomerId: null,
  selectedStockItemId: null,
});

const parseLegacyHash = (hash: string): NavState | null => {
  const raw = hash.replace(/^#\/?/, '');
  if (!raw.includes('tab=')) return null;
  const params = new URLSearchParams(raw);
  const tabParam = params.get('tab') as TabType | null;
  const activeTab: TabType =
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'clients';
  const subParam = params.get('sub');
  return {
    activeTab,
    activeInteriorSubTab:
      subParam && VALID_INTERIOR_SUBS.includes(subParam as InteriorSubTab)
        ? (subParam as InteriorSubTab)
        : 'directory',
    activeBricksSubTab:
      subParam && VALID_BRICKS_SUBS.includes(subParam as BricksSubTab)
        ? (subParam as BricksSubTab)
        : 'directory',
    selectedClientId: params.get('clientId'),
    selectedConstructionLabourContractId: params.get('contractId'),
    selectedInteriorClientId: params.get('interiorClientId'),
    selectedInteriorVendorId: params.get('interiorVendorId'),
    selectedInteriorShopId: params.get('interiorShopId'),
    selectedLabourContractId: params.get('labourContractId'),
    selectedVendorId: params.get('vendorId'),
    selectedShopId: params.get('shopId'),
    selectedBrickCustomerId: params.get('brickCustomerId'),
    selectedStockItemId: params.get('stockItemId'),
  };
};

export const parseNavState = (): NavState => {
  if (typeof window === 'undefined') return emptyNav();

  const legacy = parseLegacyHash(window.location.hash);
  if (legacy) return legacy;

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  if (pathname !== APP_BASE && !pathname.startsWith(`${APP_BASE}/`)) {
    return emptyNav();
  }

  const rest = pathname.slice(APP_BASE.length).replace(/^\/+/, '');
  const parts = rest ? rest.split('/').filter(Boolean) : [];
  const nav = emptyNav();

  if (parts.length === 0) return nav;

  const tab = SEGMENT_TO_TAB[parts[0]];
  if (!tab) return nav;
  nav.activeTab = tab;

  if (tab === 'clients') {
    nav.selectedClientId = parts[1] || null;
    return nav;
  }

  if (tab === 'vendor') {
    nav.selectedVendorId = parts[1] || null;
    nav.selectedShopId = parts[2] || null;
    return nav;
  }

  if (tab === 'construction_labour') {
    nav.selectedConstructionLabourContractId = parts[1] || null;
    return nav;
  }

  if (tab === 'kaab_interior') {
    const sub = INTERIOR_SEGMENT_TO_SUB[parts[1]] ?? 'directory';
    nav.activeInteriorSubTab = sub;
    if (sub === 'directory') {
      nav.selectedInteriorClientId = parts[1] === 'directory' ? parts[2] || null : null;
    } else if (sub === 'vendor') {
      nav.selectedInteriorVendorId = parts[2] || null;
      nav.selectedInteriorShopId = parts[3] || null;
    } else if (sub === 'labour_contract') {
      nav.selectedLabourContractId = parts[2] || null;
    }
    return nav;
  }

  if (tab === 'kabibullah_bricks') {
    const sub = VALID_BRICKS_SUBS.includes(parts[1] as BricksSubTab)
      ? (parts[1] as BricksSubTab)
      : 'directory';
    nav.activeBricksSubTab = sub;
    if (sub === 'directory') {
      nav.selectedBrickCustomerId = parts[2] || null;
    } else if (sub === 'stock') {
      nav.selectedStockItemId = parts[2] || null;
    }
    return nav;
  }

  return nav;
};

export const buildNavPath = (state: NavState): string => {
  const segments: string[] = [APP_BASE, TAB_TO_SEGMENT[state.activeTab]];

  if (state.activeTab === 'clients' && state.selectedClientId) {
    segments.push(state.selectedClientId);
  } else if (state.activeTab === 'vendor') {
    if (state.selectedVendorId) segments.push(state.selectedVendorId);
    if (state.selectedVendorId && state.selectedShopId) segments.push(state.selectedShopId);
  } else if (state.activeTab === 'construction_labour' && state.selectedConstructionLabourContractId) {
    segments.push(state.selectedConstructionLabourContractId);
  } else if (state.activeTab === 'kaab_interior') {
    segments.push(INTERIOR_SUB_TO_SEGMENT[state.activeInteriorSubTab]);
    if (state.activeInteriorSubTab === 'directory' && state.selectedInteriorClientId) {
      segments.push(state.selectedInteriorClientId);
    } else if (state.activeInteriorSubTab === 'vendor') {
      if (state.selectedInteriorVendorId) segments.push(state.selectedInteriorVendorId);
      if (state.selectedInteriorVendorId && state.selectedInteriorShopId) {
        segments.push(state.selectedInteriorShopId);
      }
    } else if (state.activeInteriorSubTab === 'labour_contract' && state.selectedLabourContractId) {
      segments.push(state.selectedLabourContractId);
    }
  } else if (state.activeTab === 'kabibullah_bricks') {
    segments.push(state.activeBricksSubTab);
    if (state.activeBricksSubTab === 'directory' && state.selectedBrickCustomerId) {
      segments.push(state.selectedBrickCustomerId);
    } else if (state.activeBricksSubTab === 'stock' && state.selectedStockItemId) {
      segments.push(state.selectedStockItemId);
    }
  }

  return segments.join('/');
};
