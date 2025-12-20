import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background" data-testid="dashboard-layout">
      <Sidebar />
      {/* Main content - no margin on mobile, ml-64 on large screens */}
      <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8" data-testid="main-content">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;