import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { useAppSelector } from '@/hooks/useAppDispatch';

const DashboardLayout: React.FC = () => {
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <DashboardHeader />
        <motion.main 
          className="flex-1 p-4 lg:p-6 overflow-auto scrollbar-thin"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;
