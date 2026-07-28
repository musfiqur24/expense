import { apiRequest, buildQuery, extractCollection, unwrapData } from "./client";

export const authApi = {
  async me() {
    const payload = await apiRequest("/auth/me");
    const data = unwrapData(payload);
    return data?.user || payload?.user || data;
  },

  logout() {
    return apiRequest("/auth/logout", { method: "POST" });
  }
};

export const categoryApi = {
  async list(type) {
    const payload = await apiRequest(`/categories${buildQuery({ type })}`);
    return extractCollection(payload, ["categories", "items"]);
  },

  create(category) {
    return apiRequest("/categories", { method: "POST", body: category });
  },

  update(id, category) {
    return apiRequest(`/categories/${id}`, { method: "PUT", body: category });
  },

  remove(id) {
    return apiRequest(`/categories/${id}`, { method: "DELETE" });
  }
};

export const transactionApi = {
  async list(filters = {}) {
    const payload = await apiRequest(`/transactions${buildQuery(filters)}`);
    return extractCollection(payload, ["transactions", "items"]);
  },

  create(transaction) {
    return apiRequest("/transactions", { method: "POST", body: transaction });
  },

  update(id, transaction) {
    return apiRequest(`/transactions/${id}`, { method: "PUT", body: transaction });
  },

  remove(id) {
    return apiRequest(`/transactions/${id}`, { method: "DELETE" });
  },

  exportMonth(month) {
    return apiRequest(`/transactions/export${buildQuery({ month })}`, { responseType: "blob" });
  }
};

export const budgetApi = {
  async list(month) {
    const payload = await apiRequest(`/budgets${buildQuery({ month })}`);
    return extractCollection(payload, ["budgets", "items"]);
  },

  create(budget) {
    return apiRequest("/budgets", { method: "POST", body: budget });
  },

  update(id, budget) {
    return apiRequest(`/budgets/${id}`, { method: "PUT", body: budget });
  },

  remove(id) {
    return apiRequest(`/budgets/${id}`, { method: "DELETE" });
  }
};

export const dashboardApi = {
  async get(month) {
    const payload = await apiRequest(`/dashboard${buildQuery({ month })}`);
    const data = unwrapData(payload);
    return data?.dashboard || payload?.dashboard || data || {};
  }
};
