export type Category = 
  | 'Earnings' 
  | 'FinancialGoals' 
  | 'Essential' 
  | 'Family' 
  | 'Lifestyle' 
  | 'Discretionary' 
  | 'Miscellaneous';

export type SubCategoryMap = {
  Earnings: 'Salary' | 'Rent' | 'Business' | 'Others';
  FinancialGoals: 'Investments' | 'Savings' | 'Debt_Repayment';
  Essential: 'Housing' | 'Utilities' | 'Insurance' | 'Transportation';
  Family: 'Education' | 'Healthcare' | 'Childcare' | 'Dependents';
  Lifestyle: 'Groceries' | 'Dining' | 'Entertainment' | 'Shopping';
  Discretionary: 'Travel' | 'Vacation' | 'Gift' | 'Celebrations';
  Miscellaneous: 'Unexpected';
};

export type PaymentMode = 'Bank' | 'Credit Card' | 'Debit Card' | 'Cash' | 'UPI';

export interface Transaction {
  id: string;
  userId: string;
  date: string; // ISO string
  category: Category;
  subCategory: string;
  details: string;
  amount: number;
  paymentMode: PaymentMode;
  createdAt: string;
}

export interface BudgetPlanner {
  id: string;
  userId: string;
  monthYear: string; // e.g., "2026-01"
  estEarnings: number;
  allocations: {
    FinancialGoals: number; // percentage
    Essential: number;
    Family: number;
    Lifestyle: number;
    Discretionary: number;
    Miscellaneous: number;
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
}
