// ─── User & Auth ────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  kyc_status: "pending" | "verified" | "rejected";
  account_type: "personal" | "business";
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Accounts & Banking ─────────────────────────────────────────────────────
export interface BankAccount {
  id: string;
  user_id: string;
  account_number: string;
  account_name: string;
  account_type: "checking" | "savings" | "investment";
  currency: string;
  balance: number;
  available_balance: number;
  is_primary: boolean;
  created_at: string;
}

// ─── Transactions ────────────────────────────────────────────────────────────
export type TransactionType = "credit" | "debit" | "transfer";
export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled";

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  recipient_name?: string;
  recipient_account?: string;
  category: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

// ─── Payments ────────────────────────────────────────────────────────────────
export interface PaymentPayload {
  from_account_id: string;
  to_account_number: string;
  to_bank_code?: string;
  amount: number;
  currency: string;
  description: string;
  recipient_name: string;
  transfer_type: "local" | "international";
}

// ─── Portfolio & Investments ──────────────────────────────────────────────────
export interface Investment {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  asset_type: "stock" | "etf" | "crypto" | "bond" | "mutual_fund";
  quantity: number;
  avg_buy_price: number;
  current_price: number;
  currency: string;
  market_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  logo_url?: string;
  created_at: string;
}

export interface PortfolioSummary {
  total_value: number;
  total_invested: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  day_change: number;
  day_change_percent: number;
  currency: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────
export type NotificationType =
  | "transaction"
  | "security"
  | "payment"
  | "system"
  | "investment";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// ─── Currency ────────────────────────────────────────────────────────────────
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
}

// ─── Charts ──────────────────────────────────────────────────────────────────
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}
