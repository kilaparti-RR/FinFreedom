import React from 'react';
import { auth, signOut, signInWithPopup, googleProvider } from '@/src/firebase';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Wallet, ReceiptText, PieChart, CalendarDays, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const user = auth.currentUser;

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navItems = [
    { id: 'summary', label: 'Summary', icon: PieChart },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'planner', label: 'Planner', icon: CalendarDays },
    { id: 'profile', label: 'User Profile', icon: UserIcon },
  ];

  return (
    <aside className="w-64 bg-natural-olive text-white h-screen sticky top-0 flex flex-col p-8 gap-10">
      <div className="flex items-center gap-3">
        <div className="bg-white/10 p-2 rounded-xl">
          <Wallet className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-serif italic tracking-tight">FinFreedom</span>
      </div>

      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-full cursor-pointer transition-all duration-200 text-sm tracking-wide",
                activeTab === item.id 
                  ? "bg-white/15 font-semibold shadow-sm" 
                  : "hover:bg-white/10 opacity-70 hover:opacity-100"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto space-y-6">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-full bg-natural-accent/20 flex items-center justify-center overflow-hidden border border-white/10">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="h-5 w-5 text-white/50" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.displayName}</p>
                <p className="text-[10px] opacity-50 truncate">{user.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              className="w-full justify-start gap-2 text-white hover:bg-white/10 hover:text-white rounded-full"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <Button onClick={handleLogin} className="w-full gap-2 bg-white text-natural-olive hover:bg-natural-accent rounded-full">
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        )}
        <p className="text-[10px] opacity-40 text-center uppercase tracking-[2px]">
          © 2026 Financial Control
        </p>
      </div>
    </aside>
  );
};
