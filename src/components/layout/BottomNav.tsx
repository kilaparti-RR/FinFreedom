import React from 'react';
import { PieChart, ReceiptText, CalendarDays, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'summary', label: 'Summary', icon: PieChart },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'planner', label: 'Planner', icon: CalendarDays },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-natural-olive text-white border-t border-white/10 z-50 px-4 pb-safe pt-2">
      <ul className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <li
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200",
              activeTab === item.id 
                ? "text-white opacity-100" 
                : "text-white/60 hover:text-white/80"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-xl transition-all duration-200",
              activeTab === item.id ? "bg-white/15 shadow-sm" : ""
            )}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
};
