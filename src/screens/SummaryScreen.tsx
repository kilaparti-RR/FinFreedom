import React, { useState, useEffect, useMemo } from 'react';
import { auth, db, collection, query, where, onSnapshot, OperationType, handleFirestoreError } from '@/src/firebase';
import { Transaction, BudgetPlanner, Category } from '@/src/types';
import { CATEGORIES, MONTHS } from '@/src/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Scale, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#5A5A40', '#8A8A70', '#B0B098', '#D6D6C8', '#A64D4D', '#C8C8B0', '#707050'];

export const SummaryScreen: React.FC = () => {
  const [month, setMonth] = useState<string>(new Date().getMonth().toString());
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<BudgetPlanner | null>(null);
  const [yearlyTransactions, setYearlyTransactions] = useState<Transaction[]>([]);

  const monthYear = `${year}-${(parseInt(month) + 1).toString().padStart(2, '0')}`;

  useEffect(() => {
    if (!auth.currentUser) return;

    // Monthly Transactions
    const startOfMonth = new Date(parseInt(year), parseInt(month), 1).toISOString();
    const endOfMonth = new Date(parseInt(year), parseInt(month) + 1, 0, 23, 59, 59).toISOString();

    const qTrans = query(
      collection(db, 'transactions'),
      where('userId', '==', auth.currentUser.uid),
      where('date', '>=', startOfMonth),
      where('date', '<=', endOfMonth)
    );

    const unsubscribeTrans = onSnapshot(qTrans, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    });

    // Yearly Transactions for Line Chart
    const startOfYear = new Date(parseInt(year), 0, 1).toISOString();
    const endOfYear = new Date(parseInt(year), 11, 31, 23, 59, 59).toISOString();

    const qYearly = query(
      collection(db, 'transactions'),
      where('userId', '==', auth.currentUser.uid),
      where('date', '>=', startOfYear),
      where('date', '<=', endOfYear)
    );

    const unsubscribeYearly = onSnapshot(qYearly, (snapshot) => {
      setYearlyTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    });

    // Budget
    const qBudget = query(
      collection(db, 'budgets'),
      where('userId', '==', auth.currentUser.uid),
      where('monthYear', '==', monthYear)
    );

    const unsubscribeBudget = onSnapshot(qBudget, (snapshot) => {
      if (!snapshot.empty) {
        setBudget(snapshot.docs[0].data() as BudgetPlanner);
      } else {
        setBudget(null);
      }
    });

    return () => {
      unsubscribeTrans();
      unsubscribeYearly();
      unsubscribeBudget();
    };
  }, [month, year, monthYear]);

  const summaryData = useMemo(() => {
    const earnings = transactions
      .filter(t => t.category === 'Earnings')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    
    const spending = transactions
      .filter(t => t.category !== 'Earnings')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const categorySpending = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = transactions
        .filter(t => t.category === cat)
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      return acc;
    }, {} as Record<string, number>);

    return { earnings, spending, balance: earnings - spending, categorySpending };
  }, [transactions]);

  const tableData = CATEGORIES.filter(c => c !== 'Earnings').map(cat => {
    const budgetAmt = budget ? (budget.estEarnings * (budget.allocations[cat as keyof BudgetPlanner['allocations']] / 100)) : 0;
    const spendingAmt = summaryData.categorySpending[cat] || 0;
    const spendingPct = budgetAmt > 0 ? (spendingAmt / budgetAmt) * 100 : 0;
    const budgetPct = budget ? budget.allocations[cat as keyof BudgetPlanner['allocations']] : 0;

    return {
      category: cat,
      budget: budgetAmt,
      spending: spendingAmt,
      spendingPct,
      budgetPct
    };
  });

  const pieData = Object.entries(summaryData.categorySpending)
    .filter(([cat, amt]) => cat !== 'Earnings' && (amt as number) > 0)
    .map(([name, value]) => ({ name, value }));

  const barData = tableData.map(d => ({
    name: d.category,
    Budget: d.budget,
    Actual: d.spending
  }));

  const lineData = Array.from({ length: 12 }, (_, i) => {
    const monthTrans = yearlyTransactions.filter(t => new Date(t.date).getMonth() === i);
    const earnings = monthTrans.filter(t => t.category === 'Earnings').reduce((s: number, t: Transaction) => s + t.amount, 0);
    const spending = monthTrans.filter(t => t.category !== 'Earnings').reduce((s: number, t: Transaction) => s + t.amount, 0);
    return {
      name: MONTHS[i],
      Earnings: earnings,
      Spending: spending
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <p className="label-natural">Overview</p>
          <h2 className="text-4xl font-serif text-natural-heading">{MONTHS[parseInt(month)]} {year}</h2>
        </div>
        <div className="flex gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[120px] rounded-full border-natural-line bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={i.toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px] rounded-full border-natural-line bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-natural">
          <p className="label-natural">Earnings</p>
          <div className="text-3xl font-serif text-natural-olive">₹{summaryData.earnings.toLocaleString('en-IN')}</div>
        </div>
        <div className="card-natural">
          <p className="label-natural">Total Spending</p>
          <div className="text-3xl font-serif text-natural-olive">₹{summaryData.spending.toLocaleString('en-IN')}</div>
        </div>
        <div className="card-natural">
          <p className="label-natural">Balance</p>
          <div className={cn(
            "text-3xl font-serif",
            summaryData.balance >= 0 ? "text-natural-olive" : "text-natural-negative"
          )}>
            ₹{summaryData.balance.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="card-natural p-0 overflow-hidden">
        <div className="p-6 border-b border-natural-line">
          <h3 className="text-lg font-serif text-natural-heading">Budget vs Actual</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-natural-bg/50">
              <TableRow className="hover:bg-transparent border-natural-line">
                <TableHead className="label-natural py-4 px-6">Category</TableHead>
                <TableHead className="label-natural py-4 px-6 text-right">Budget (₹)</TableHead>
                <TableHead className="label-natural py-4 px-6 text-right">Actual (₹)</TableHead>
                <TableHead className="label-natural py-4 px-6 text-right">Usage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.category} className="border-natural-line hover:bg-natural-bg/20">
                  <TableCell className="font-medium py-4 px-6">{row.category}</TableCell>
                  <TableCell className="text-right py-4 px-6">₹{row.budget.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right py-4 px-6">₹{row.spending.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right py-4 px-6 min-w-[150px]">
                    <div className="flex flex-col gap-1">
                      <div className="w-full h-1.5 bg-natural-accent/30 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            row.spendingPct > 100 ? "bg-natural-negative" : "bg-natural-olive"
                          )}
                          style={{ width: `${Math.min(row.spendingPct, 100)}%` }}
                        />
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold",
                        row.spendingPct > 100 ? "text-natural-negative" : "text-natural-olive"
                      )}>
                        {row.spendingPct.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-natural">
          <h3 className="text-lg font-serif text-natural-heading mb-6">Spending Composition</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} 
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-natural">
          <h3 className="text-lg font-serif text-natural-heading mb-6">Budget vs Actual Comparison</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E6E1" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#888' }} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#888' }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#F5F5F0' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} 
                />
                <Legend iconType="circle" />
                <Bar dataKey="Budget" fill="#D6D6C8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#5A5A40" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-natural lg:col-span-2">
          <h3 className="text-lg font-serif text-natural-heading mb-6">Earnings vs Spending ({year})</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E6E1" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#888' }} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#888' }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} 
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="Earnings" stroke="#5A5A40" strokeWidth={3} dot={{ r: 4, fill: '#5A5A40' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Spending" stroke="#A64D4D" strokeWidth={3} dot={{ r: 4, fill: '#A64D4D' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
