import React, { useState } from 'react';
import { SiteManagerProvider, useSiteManager } from './context/SiteManagerContext';
import { AppSidebar } from './layout/AppSidebar';
import { AppTopBar } from './layout/AppTopBar';
import { ToastContainer } from './layout/ToastContainer';
import { SiteListView } from './views/SiteListView';
import { SiteDetailView } from './views/SiteDetailView';
import { AddSiteModal } from './components/modals/AddSiteModal';
import { AddAdvanceModal } from './components/modals/AddAdvanceModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import './styles/app.css';

const AppContent: React.FC = () => {
  const { activeSite, setActiveSiteId } = useSiteManager();

  // Modals & Navigation state
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [isAddAdvanceOpen, setIsAddAdvanceOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('afrah_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('afrah_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="app-container app-shell-layout">
      {/* Background ambient lighting */}
      <div className="app-ambient-glow" />
      <div className="app-ambient-glow-2" />

      {/* Left Sidebar Navigation */}
      <AppSidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main Viewport */}
      <div className="app-main-viewport">
        {/* Top Header Bar */}
        <AppTopBar
          onOpenAddSite={() => setIsAddSiteOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Scrollable Main Content */}
        <main className="app-main-content">
          {activeSite ? (
            <SiteDetailView
              site={activeSite}
              onOpenAddAdvance={() => setIsAddAdvanceOpen(true)}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            />
          ) : (
            <SiteListView onOpenAddSite={() => setIsAddSiteOpen(true)} />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddSiteModal
        isOpen={isAddSiteOpen}
        onClose={() => setIsAddSiteOpen(false)}
        onSiteCreated={(newId) => setActiveSiteId(newId)}
      />

      {activeSite && (
        <>
          <AddAdvanceModal
            site={activeSite}
            isOpen={isAddAdvanceOpen}
            onClose={() => setIsAddAdvanceOpen(false)}
          />
          <AddExpenseModal
            site={activeSite}
            isOpen={isAddExpenseOpen}
            onClose={() => setIsAddExpenseOpen(false)}
          />
        </>
      )}

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export const AppPortal: React.FC = () => {
  return (
    <SiteManagerProvider>
      <AppContent />
    </SiteManagerProvider>
  );
};

export default AppPortal;
