import { Category, SubCategoryMap, PaymentMode } from './types';

export const CATEGORIES: Category[] = [
  'Earnings',
  'FinancialGoals',
  'Essential',
  'Family',
  'Lifestyle',
  'Discretionary',
  'Miscellaneous'
];

export const SUB_CATEGORIES: Record<Category, string[]> = {
  Earnings: ['Salary', 'Rent', 'Business', 'Others'],
  FinancialGoals: ['Investments', 'Savings', 'Debt_Repayment'],
  Essential: ['Housing', 'Utilities', 'Insurance', 'Transportation'],
  Family: ['Education', 'Healthcare', 'Childcare', 'Dependents'],
  Lifestyle: ['Groceries', 'Dining', 'Entertainment', 'Shopping'],
  Discretionary: ['Travel', 'Vacation', 'Gift', 'Celebrations'],
  Miscellaneous: ['Unexpected']
};

export const PAYMENT_MODES: PaymentMode[] = [
  'Bank',
  'Credit Card',
  'Debit Card',
  'Cash',
  'UPI'
];

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
