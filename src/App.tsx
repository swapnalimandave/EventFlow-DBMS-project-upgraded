import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CalendarPage } from './components/CalendarPage';
import { ClientsPage } from './components/ClientsPage';
import { VenuesPage } from './components/VenuesPage';
import { StaffPage } from './components/StaffPage';
import { VendorsPage } from './components/VendorsPage';
import { ServicesPage } from './components/ServicesPage';
import { EventsPage } from './components/EventsPage';
import { AIWidget } from './components/AIWidget';
import { EventFlowLogo } from './components/EventFlowLogo';
import { Loader } from 'lucide-react';

function AppShell() {
  const { user, loading } = useApp();
  
  // Navigation Routing States
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Auth state gates for logged-out visitors
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  
  // Search input filter state
  const [searchFilter, setSearchFilter] = useState('');
  
  // Mobile drawers states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    setSearchFilter('');
    setSelectedEventId(null); // Clear active detail board
  };

  const handleSelectEvent = (eventId: string) => {
    setActivePage('events');
    setSelectedEventId(eventId);
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <EventFlowLogo size="xl" className="mb-4 animate-pulse" />
        <div className="flex items-center gap-2 mt-4 justify-center">
          <Loader className="h-4 w-4 animate-spin text-indigo-600" />
          <h2 className="font-sans font-black text-lg text-slate-800 dark:text-white">Initializing EventFlow Workspace...</h2>
        </div>
        <p className="font-sans text-xs text-slate-450 dark:text-slate-500 mt-1">Connecting to Firestore real-time instances.</p>
      </div>
    );
  }

  // Marketing Landing / Authentication guards
  if (!user) {
    if (authMode) {
      return (
        <LoginPage
          initialMode={authMode}
          onBackToLanding={() => setAuthMode(null)}
        />
      );
    }
    return (
      <LandingPage
        onNavigateToAuth={(mode) => setAuthMode(mode as any)}
      />
    );
  }

  // Main Display Router
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
          />
        );
      case 'events':
        return (
          <EventsPage
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
          />
        );
      case 'calendar':
        return (
          <CalendarPage
            onSelectEvent={handleSelectEvent}
            onNavigate={handleNavigate}
          />
        );
      case 'clients':
        return <ClientsPage />;
      case 'venues':
        return <VenuesPage />;
      case 'staff':
        return <StaffPage />;
      case 'vendors':
        return <VendorsPage />;
      case 'services':
        return <ServicesPage />;
      default:
        return <Dashboard onNavigate={handleNavigate} onSelectEvent={handleSelectEvent} />;
    }
  };

  return (
    <div id="workspace-frame" className="min-h-screen bg-[#F4F5F7] text-gray-900 dark:bg-slate-950 dark:text-gray-100 flex transition-colors">
      
      {/* 1. Sidebar desktop navigation rail */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      </aside>

      {/* 1b. Sidebar Mobile slides-in drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop mask */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer container */}
          <div className="relative w-64 max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar
              activePage={activePage}
              onNavigate={handleNavigate}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 2. Main flex area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header toolbar banner */}
        <Header
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
        />

        {/* Core routing dashboard view panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24">
          {renderActivePage()}
        </main>
      </div>

      {/* 3. Global Floating Conversational AI widget */}
      <AIWidget />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
