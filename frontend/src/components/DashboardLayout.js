import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardFooter from './DashboardFooter';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background" data-testid="dashboard-layout">
      <Sidebar />
      <Header />
      {/* Main content - no margin on mobile, ml-64 on large screens, mt-16 for header */}
      <main className="flex-1 lg:ml-64 lg:mt-16 p-4 md:p-6 lg:p-8 pb-16" data-testid="main-content">
        {children}
      </main>
      <DashboardFooter />
    </div>
  );
};

export default DashboardLayout;