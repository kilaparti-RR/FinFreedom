import React, { useState, useEffect } from 'react';
import { auth, db, collection, addDoc, query, where, onSnapshot, updateDoc, doc, deleteDoc, OperationType, handleFirestoreError } from '@/src/firebase';
import { Transaction, Category, PaymentMode } from '@/src/types';
import { CATEGORIES, SUB_CATEGORIES, PAYMENT_MODES } from '@/src/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Pencil, Trash2, ArrowUpDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TransactionsScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState<Category | ''>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode | ''>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Sorting and Filtering
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !date || !category || !subCategory || !amount) return;

    const transactionData = {
      userId: auth.currentUser.uid,
      date: date.toISOString(),
      category,
      subCategory,
      details,
      amount: parseFloat(amount),
      paymentMode: paymentMode as PaymentMode,
      createdAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'transactions', editingId), transactionData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'transactions'), transactionData);
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'transactions');
    }
  };

  const resetForm = () => {
    setDate(new Date());
    setCategory('');
    setSubCategory('');
    setDetails('');
    setAmount('');
    setPaymentMode('');
    setEditingId(null);
  };

  const handleEdit = (t: Transaction) => {
    setEditingId(t.id);
    setDate(new Date(t.date));
    setCategory(t.category);
    setSubCategory(t.subCategory);
    setDetails(t.details);
    setAmount(t.amount.toString());
    setPaymentMode(t.paymentMode);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'transactions');
    }
  };

  const toggleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedTransactions = transactions
    .filter(t => filterCategory === 'all' || t.category === filterCategory)
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-8">
      <div className="card-natural">
        <div className="mb-6">
          <p className="label-natural">Management</p>
          <h2 className="text-3xl font-serif text-natural-heading">
            {editingId ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="label-natural">Date</Label>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-xl border-natural-line bg-white",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-natural-line shadow-xl">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="label-natural">Category</Label>
            <Select value={category} onValueChange={(v) => { setCategory(v as Category); setSubCategory(''); }}>
              <SelectTrigger className="rounded-xl border-natural-line bg-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-natural-line">
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="label-natural">SubCategory</Label>
            <Select value={subCategory} onValueChange={setSubCategory} disabled={!category}>
              <SelectTrigger className="rounded-xl border-natural-line bg-white">
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-natural-line">
                {category && SUB_CATEGORIES[category as Category].map(sc => (
                  <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="label-natural">Details</Label>
            <Input 
              value={details} 
              onChange={(e) => setDetails(e.target.value)} 
              placeholder="Enter details" 
              className="rounded-xl border-natural-line bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="label-natural">Amount (₹)</Label>
            <Input 
              type="number" 
              min="0" 
              step="0.01" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="0.00" 
              required 
              className="rounded-xl border-natural-line bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="label-natural">Payment Mode</Label>
            <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as PaymentMode)}>
              <SelectTrigger className="rounded-xl border-natural-line bg-white">
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-natural-line">
                {PAYMENT_MODES.map(pm => (
                  <SelectItem key={pm} value={pm}>{pm}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex gap-4 pt-4">
            <Button type="submit" className="flex-1 gap-2 rounded-full bg-natural-olive hover:bg-natural-olive/90 h-12">
              {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? 'Update Transaction' : 'Add Transaction'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-full h-12 border-natural-line">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="card-natural p-0 overflow-hidden">
        <div className="p-6 border-b border-natural-line flex flex-row items-center justify-between gap-4">
          <h3 className="text-xl font-serif text-natural-heading">Recent Transactions</h3>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-natural-muted" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px] rounded-full border-natural-line bg-white h-9">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-natural-line">
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-natural-bg/50">
              <TableRow className="hover:bg-transparent border-natural-line">
                <TableHead className="label-natural py-4 px-6 cursor-pointer hover:text-natural-olive transition-colors" onClick={() => toggleSort('date')}>
                  <div className="flex items-center gap-2">Date <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead className="label-natural py-4 px-6 cursor-pointer hover:text-natural-olive transition-colors" onClick={() => toggleSort('category')}>
                  <div className="flex items-center gap-2">Category <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead className="label-natural py-4 px-6">SubCategory</TableHead>
                <TableHead className="label-natural py-4 px-6">Details</TableHead>
                <TableHead className="label-natural py-4 px-6 cursor-pointer hover:text-natural-olive transition-colors text-right" onClick={() => toggleSort('amount')}>
                  <div className="flex items-center justify-end gap-2">Amount <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead className="label-natural py-4 px-6">Payment Mode</TableHead>
                <TableHead className="label-natural py-4 px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-natural-muted italic">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedTransactions.map((t) => (
                  <TableRow 
                    key={t.id} 
                    className="border-natural-line hover:bg-natural-bg/20 cursor-pointer transition-colors"
                    onClick={() => handleEdit(t)}
                  >
                    <TableCell className="py-4 px-6">{format(new Date(t.date), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="py-4 px-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        t.category === 'Earnings' ? "bg-natural-olive/10 text-natural-olive" : "bg-natural-accent/30 text-natural-muted"
                      )}>
                        {t.category}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6">{t.subCategory}</TableCell>
                    <TableCell className="py-4 px-6 max-w-[200px] truncate">{t.details}</TableCell>
                    <TableCell className={cn(
                      "py-4 px-6 text-right font-serif text-lg",
                      t.category === 'Earnings' ? "text-natural-olive" : "text-natural-ink"
                    )}>
                      {t.category === 'Earnings' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-natural-muted">{t.paymentMode}</TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-natural-accent/50" onClick={(e) => { e.stopPropagation(); handleEdit(t); }}>
                          <Pencil className="h-4 w-4 text-natural-olive" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-natural-negative/10" onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}>
                          <Trash2 className="h-4 w-4 text-natural-negative" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
