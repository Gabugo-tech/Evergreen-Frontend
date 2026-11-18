/**
 * Evergreen API client
 * ALL requests go through the Node.js gateway — including analytics and investments.
 * The Node gateway proxies /api/analytics/* and /api/investments/* to the Python
 * microservice internally, adding the X-Internal-Secret header. This prevents
 * direct access to the Python service from the browser.
 */

const NODE_URL = process.env.NEXT_PUBLIC_NODE_API_URL ?? "http://localhost:4000";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("eg_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${NODE_URL}${path}`, {
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
    const error = new Error(msg) as Error & { status: number };
    error.status = res.status;
    throw error;
  }

  return json;
}

function node<T>(path: string, options?: RequestInit) {
  return request<T>(path, options);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: {
    full_name:    string;
    email:        string;
    phone:        string;
    password:     string;
    account_type: "personal" | "business";
    payment_pin:  string;
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

  setPin: (pin: string) =>
    node("/api/auth/set-pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    }),

  verifyPin: (pin: string) =>
    node<{ data: { verified: boolean } }>("/api/auth/verify-pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    }),

  requestPinReset: () =>
    node("/api/auth/request-pin-reset", { method: "POST" }),

  verifyPinOtp: (otp: string) =>
    node<{ data: { verified: boolean } }>("/api/auth/verify-pin-reset-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),

  resetPin: (otp: string, new_pin: string) =>
    node("/api/auth/reset-pin", {
      method: "POST",
      body: JSON.stringify({ otp, new_pin }),
    }),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  me: () => node<{ data: unknown }>("/api/users/me"),
  updateProfile: (body: unknown) =>
    node("/api/users/me", { method: "PATCH", body: JSON.stringify(body) }),
  kycStatus: () => node<{ data: { kyc_status: string } }>("/api/users/me/kyc"),
  removeAvatar: () =>
    node("/api/users/me/avatar", { method: "DELETE" }),
  uploadAvatar: (file: File) => {
    const form  = new FormData();
    form.append("avatar", file);
    const token = typeof window !== "undefined" ? localStorage.getItem("eg_token") ?? "" : "";
    return fetch(`${NODE_URL}/api/users/me/avatar`, {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}` },
      body:    form,
    }).then(async (res) => {
      const json = await res.json().catch(() => ({ message: "Server error" }));
      if (!res.ok) throw new Error(json.message ?? `Upload failed (${res.status})`);
      return json as { data: unknown };
    });
  },
};

// ─── Accounts ────────────────────────────────────────────────────────────────

export const accountsApi = {
  list: () => node<{ data: unknown[] }>("/api/accounts"),
  get: (id: string) => node<{ data: unknown }>(`/api/accounts/${id}`),
  balance: (id: string) => node<{ data: unknown }>(`/api/accounts/${id}/balance`),
  create: (body: unknown) =>
    node("/api/accounts", { method: "POST", body: JSON.stringify(body) }),
  lookup: (accountNumber: string) => {
    const clean = accountNumber.replace(/\D/g, "");
    return node<{ data: { account_number: string; account_name: string; account_type: string; currency: string } }>(
      `/api/accounts/lookup/${clean}`
    );
  },
  resolveExternal: (accountNumber: string, bankCode: string, country = "NG") => {
    const clean = accountNumber.replace(/\D/g, "");
    return node<{ data: { account_number: string; account_name: string | null; bank_code: string; country: string; source: string; can_resolve: boolean; message?: string } }>(
      `/api/accounts/resolve?account_number=${clean}&bank_code=${encodeURIComponent(bankCode)}&country=${country}`
    );
  },
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

// ─── Analytics — routed through Node gateway ──────────────────────────────────

export const analyticsApi = {
  spendingByCategory: (params?: { from?: string; to?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return node<{ data: unknown[] }>(`/api/analytics/spending/categories${qs}`);
  },
  monthlyTrends: (months = 6) =>
    node<{ data: unknown[] }>(`/api/analytics/spending/trends?months=${months}`),
  portfolioMetrics: () =>
    node<{ data: unknown }>("/api/analytics/portfolio/metrics"),
  portfolioHistory: (period = "1Y") =>
    node<{ data: unknown }>(`/api/analytics/portfolio/history?period=${period}`),
  assetAllocation: () =>
    node<{ data: unknown[] }>("/api/analytics/portfolio/allocation"),
  netWorth: () => node<{ data: unknown }>("/api/analytics/net-worth"),
};

// ─── Investments — routed through Node gateway ────────────────────────────────

export const investmentsApi = {
  list: () => node<{ data: unknown[] }>("/api/investments"),
  add: (body: unknown) =>
    node<{ data: unknown }>("/api/investments", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: unknown) =>
    node<{ data: unknown }>(`/api/investments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    node(`/api/investments/${id}`, { method: "DELETE" }),
};

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const chatApi = {
  send: (message: string, history: ChatMessage[]) =>
    node<{ data: { reply: string } }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
};
