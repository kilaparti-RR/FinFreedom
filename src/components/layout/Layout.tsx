import React from 'react';
import { Sidebar } from './Navbar';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-natural-bg font-sans flex flex-col md:flex-row">
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <main className="flex-grow p-6 md:p-10 flex flex-col gap-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen pb-24 md:pb-10">
        {children}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};
