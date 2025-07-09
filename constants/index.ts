export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Travel',
  'Healthcare',
  'Education',
  'Other',
];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export const SPLIT_TYPES = [
  { value: 'equal', label: 'Split Equally' },
  { value: 'percentage', label: 'Split by Percentage' },
  { value: 'exact', label: 'Split by Exact Amount' },
];

export const PREMIUM_FEATURES = [
  'Advanced Analytics',
  'Recurring Expense Reminders',
  'Export to PDF/Excel',
  'Priority Support',
  'Ad-free Experience',
];

export const NOTIFICATION_TYPES = {
  EXPENSE_ADDED: 'expense_added',
  MEMBER_ADDED: 'member_added',
  SETTLEMENT_REQUEST: 'settlement_request',
  GROUP_CLOSED: 'group_closed',
} as const;