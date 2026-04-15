import React, { useState, useEffect } from 'react';
import { auth, db, collection, query, where, onSnapshot, setDoc, doc, OperationType, handleFirestoreError } from '@/src/firebase';
import { BudgetPlanner, Category } from '@/src/types';
import { CATEGORIES } from '@/src/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export const PlannerScreen: React.FC = () => {
  const [month, setMonth] = useState<string>(new Date().getMonth().toString());
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [estEarnings, setEstEarnings] = useState<string>('');
  const [allocations, setAllocations] = useState<Record<string, number>>({
    FinancialGoals: 0,
    Essential: 0,
    Family: 0,
    Lifestyle: 0,
    Discretionary: 0,
    Miscellaneous: 0
  });

  const monthYear = `${year}-${(parseInt(month) + 1).toString().padStart(2, '0')}`;

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', auth.currentUser.uid),
      where('monthYear', '==', monthYear)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data() as BudgetPlanner;
        setEstEarnings(data.estEarnings.toString());
        setAllocations(data.allocations);
      } else {
        setEstEarnings('');
        setAllocations({
          FinancialGoals: 0,
          Essential: 0,
          Family: 0,
          Lifestyle: 0,
          Discretionary: 0,
          Miscellaneous: 0
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'budgets');
    });

    return () => unsubscribe();
  }, [monthYear]);

  const handleAllocationChange = (cat: string, val: string) => {
    const numVal = parseFloat(val) || 0;
    setAllocations(prev => ({ ...prev, [cat]: numVal }));
  };

  const totalAllocation: number = (Object.values(allocations) as number[]).reduce((a, b) => a + b, 0);

  const handleSave = async () => {
    if (!auth.currentUser || !estEarnings) return;

    const budgetData: BudgetPlanner = {
      id: `${auth.currentUser.uid}_${monthYear}`,
      userId: auth.currentUser.uid,
      monthYear,
      estEarnings: parseFloat(estEarnings),
      allocations: allocations as BudgetPlanner['allocations']
    };

    try {
      await setDoc(doc(db, 'budgets', budgetData.id), budgetData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'budgets');
    }
  };

  const budgetCategories = CATEGORIES.filter(c => c !== 'Earnings');

  const calculateAmount = (pct: number) => {
    return (parseFloat(estEarnings) || 0) * (pct / 100);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <p className="label-natural">Budgeting</p>
          <h2 className="text-4xl font-serif text-natural-heading">Monthly Planner</h2>
        </div>
        <div className="flex gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[120px] rounded-full border-natural-line bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card-natural">
            <h3 className="text-lg font-serif text-natural-heading mb-4">Estimated Earnings</h3>
            <div className="space-y-2">
              <Label className="label-natural">Monthly Income (₹)</Label>
              <Input
                type="number"
                value={estEarnings}
                onChange={(e) => setEstEarnings(e.target.value)}
                className="rounded-xl border-natural-line bg-white h-12 text-lg font-serif"
                placeholder="0.00"
              />
              <p className="text-xs text-natural-muted italic">This is your base for percentage allocations.</p>
            </div>
          </div>

          <div className="card-natural bg-natural-olive/5 border-natural-olive/20">
            <h3 className="text-lg font-serif text-natural-heading mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-natural-muted">Total Allocated</span>
                <span className={cn(
                  "font-bold",
                  totalAllocation === 100 ? "text-natural-olive" : "text-natural-negative"
                )}>
                  {totalAllocation}%
                </span>
              </div>
              <div className="w-full h-2 bg-natural-accent/30 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    totalAllocation === 100 ? "bg-natural-olive" : "bg-natural-negative"
                  )}
                  style={{ width: `${Math.min(totalAllocation, 100)}%` }}
                />
              </div>
              {totalAllocation !== 100 && (
                <div className="flex items-start gap-2 p-3 bg-white/50 rounded-xl border border-natural-negative/20">
                  <AlertCircle className="h-4 w-4 text-natural-negative shrink-0 mt-0.5" />
                  <p className="text-xs text-natural-negative leading-relaxed">
                    Your total allocation is <strong>{totalAllocation}%</strong>. It should ideally be 100% for a balanced budget.
                  </p>
                </div>
              )}
              <Button 
                onClick={handleSave} 
                className="w-full rounded-full bg-natural-olive hover:bg-natural-olive/90 h-12 gap-2 mt-2"
              >
                <Save className="h-4 w-4" />
                Save Budget Plan
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card-natural">
            <h3 className="text-xl font-serif text-natural-heading mb-6">Category Allocations</h3>
            <div className="space-y-6">
              {budgetCategories.map((cat) => (
                <div key={cat} className="group">
                  <div className="flex justify-between items-end mb-3">
                    <div className="space-y-1">
                      <Label className="text-base font-medium text-natural-ink">{cat}</Label>
                      <p className="text-xs text-natural-muted">₹{calculateAmount(allocations[cat]).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={allocations[cat]}
                        onChange={(e) => handleAllocationChange(cat, e.target.value)}
                        className="w-20 text-right rounded-xl border-natural-line bg-white h-10 font-bold"
                      />
                      <span className="text-natural-muted font-bold">%</span>
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={allocations[cat]}
                      onChange={(e) => handleAllocationChange(cat, e.target.value)}
                      className="w-full h-1.5 bg-natural-accent/30 rounded-full appearance-none cursor-pointer accent-natural-olive"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
