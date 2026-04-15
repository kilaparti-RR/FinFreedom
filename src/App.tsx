import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, User, signInWithPopup, googleProvider } from './firebase';
import { Layout } from './components/layout/Layout';
import { TransactionsScreen } from './screens/TransactionsScreen';
import { PlannerScreen } from './screens/PlannerScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { UserProfileScreen } from './screens/UserProfileScreen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReceiptText, PieChart, CalendarDays, User as UserIcon, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-slate-500 font-medium">Loading FinFreedom...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center space-y-6">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-2">
              <Wallet className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome to FinFreedom</h1>
              <p className="text-slate-500">Take control of your finances with smart tracking and planning.</p>
            </div>
            <Button onClick={handleLogin} size="lg" className="w-full gap-2 text-lg h-12">
              <UserIcon className="h-5 w-5" />
              Sign in with Google
            </Button>
            <p className="text-xs text-slate-400">
              Secure authentication powered by Google
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-grow"
        >
          {activeTab === 'transactions' && <TransactionsScreen />}
          {activeTab === 'planner' && <PlannerScreen />}
          {activeTab === 'summary' && <SummaryScreen />}
          {activeTab === 'profile' && <UserProfileScreen />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
