import React, { ReactNode } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';

interface DashboardLayoutProps {
  children: ReactNode; // Definimos el tipo de children
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="px-8 py-4 min-h-screen ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
