import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Breadcrumb } from '../components/Breadcrumb';
import { AiChatWidget } from '../components/AiChatWidget';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>

      {/* Persistent Floating AI Chat Assistant */}
      <AiChatWidget />
    </div>
  );
};
