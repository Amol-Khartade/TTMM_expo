export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface GroupMember {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  joinedAt: Date;
  role: 'admin' | 'member';
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitType: 'equal' | 'percentage' | 'exact';
  splitDetails: ExpenseSplit[];
  category: string;
  date: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage?: number;
}

export interface Balance {
  userId: string;
  groupId: string;
  amount: number;
  currency: string;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  settledAt?: Date;
}

export interface Subscription {
  userId: string;
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  paymentMethod?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'expense_added' | 'member_added' | 'settlement_request' | 'group_closed';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface AppState {
  auth: AuthState;
  groups: GroupsState;
  expenses: ExpensesState;
  notifications: NotificationsState;
  theme: ThemeState;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  loading: boolean;
  error: string | null;
}

export interface ExpensesState {
  expenses: Expense[];
  balances: Balance[];
  settlements: Settlement[];
  loading: boolean;
  error: string | null;
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
}

export interface ThemeState {
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    error: string;
  };
}