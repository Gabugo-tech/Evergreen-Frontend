/**
 * Evergreen API client
 * Wraps all calls to the Node.js backend and Python analytics service.
 */

const NODE_URL  = process.env.NEXT_PUBLIC_NODE_API_URL  ?? "http://localhost:4000";
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL ?? "http://localhost:8000";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("eg_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  base: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new Error("Cannot reach the server. Please check your connection.");
  }

  const json = await res.json().catch(() => ({ message: "Server error — please try again" }));

  if (!res.ok) {
    const msg = json?.message ?? json?.error ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return json;
}

function node<T>(path: string, options?: RequestInit) {
  return request<T>(NODE_URL, path, options);
}

function python<T>(path: string, options?: RequestInit) {
  return request<T>(PYTHON_URL, path, options);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    account_type: "personal" | "business";
  }) =>
    node<{ data: { token: string; user: unknown } }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (email: string, password: string) =>
    node<{ data: { token: string; user: unknown } }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email: string) =>
    node("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, otp: string) =>
    node("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: (email: string, otp: string, password: string) =>
    node("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, password }),
    }),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  me: () => node<{ data: unknown }>("/api/users/me"),
  updateProfile: (body: unknown) =>
    node("/api/users/me", { method: "PATCH", body: JSON.stringify(body) }),
  kycStatus: () => node<{ data: { kyc_status: string } }>("/api/users/me/kyc"),
};

// ─── Accounts ────────────────────────────────────────────────────────────────

export const accountsApi = {
  list: () => node<{ data: unknown[] }>("/api/accounts"),
  get: (id: string) => node<{ data: unknown }>(`/api/accounts/${id}`),
  balance: (id: string) => node<{ data: unknown }>(`/api/accounts/${id}/balance`),
  create: (body: unknown) =>
    node("/api/accounts", { method: "POST", body: JSON.stringify(body) }),
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactionsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return node<{ data: unknown[]; pagination: unknown }>(`/api/transactions${qs}`);
  },
  summary: () => node<{ data: unknown }>("/api/transactions/summary"),
  get: (id: string) => node<{ data: unknown }>(`/api/transactions/${id}`),
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const paymentsApi = {
  send: (body: unknown) =>
    node<{ data: unknown }>("/api/payments/send", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  exchange: (body: unknown) =>
    node<{ data: unknown }>("/api/payments/exchange", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  rates: () => node<{ data: { rates: Record<string, number> } }>("/api/payments/rates"),
  history: () => node<{ data: unknown[] }>("/api/payments/history"),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () => node<{ data: unknown[] }>("/api/notifications"),
  unreadCount: () => node<{ data: { count: number } }>("/api/notifications/unread-count"),
  markRead: (id: string) =>
    node(`/api/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => node("/api/notifications/read-all", { method: "PATCH" }),
  delete: (id: string) => node(`/api/notifications/${id}`, { method: "DELETE" }),
  clearAll: () => node("/api/notifications", { method: "DELETE" }),
};

// ─── Analytics (Python service) ───────────────────────────────────────────────

export const analyticsApi = {
  spendingByCategory: (params?: { from?: string; to?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return python<{ data: unknown[] }>(`/api/analytics/spending/categories${qs}`);
  },
  monthlyTrends: (months = 6) =>
    python<{ data: unknown[] }>(`/api/analytics/spending/trends?months=${months}`),
  portfolioMetrics: () =>
    python<{ data: unknown }>("/api/analytics/portfolio/metrics"),
  portfolioHistory: (period = "1Y") =>
    python<{ data: unknown }>(`/api/analytics/portfolio/history?period=${period}`),
  assetAllocation: () =>
    python<{ data: unknown[] }>("/api/analytics/portfolio/allocation"),
  netWorth: () => python<{ data: unknown }>("/api/analytics/net-worth"),
};

// ─── Investments ──────────────────────────────────────────────────────────────

export const investmentsApi = {
  list: () => python<{ data: unknown[] }>("/api/investments"),
  add: (body: unknown) =>
    python<{ data: unknown }>("/api/investments", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: unknown) =>
    python<{ data: unknown }>(`/api/investments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    python(`/api/investments/${id}`, { method: "DELETE" }),
};
