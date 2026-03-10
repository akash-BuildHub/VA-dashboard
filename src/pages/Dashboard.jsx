import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-900 font-sans">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close dashboard menu"
          className="absolute inset-0 z-20 bg-transparent"
          onClick={closeSidebar}
        />
      )}
      <Sidebar isOpen={isSidebarOpen} className="absolute left-5 top-24 z-30" onNavigate={closeSidebar} />
      <div className="relative z-10 min-h-0 flex-1">
        <main className="h-full overflow-hidden px-3 py-3 md:px-5 md:py-4">
          <Outlet context={{ isSidebarOpen, toggleSidebar }} />
        </main>
      </div>
    </div>
  );
}
