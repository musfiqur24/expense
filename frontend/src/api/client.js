const API_ROOT = "/api";

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function buildQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function readError(response) {
  try {
    const payload = await response.json();
    return {
      payload,
      message: payload?.message || payload?.error || "Something went wrong. Please try again."
    };
  } catch {
    return { payload: null, message: response.statusText || "Something went wrong. Please try again." };
  }
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    signal,
    responseType = "json"
  } = options;

  const response = await fetch(`${API_ROOT}${path}`, {
    method,
    credentials: "include",
    signal,
    headers: body === undefined ? headers : { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await readError(response);
    throw new ApiError(error.message, response.status, error.payload);
  }

  if (responseType === "blob") return response.blob();
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

export function unwrapData(payload) {
  if (payload && typeof payload === "object" && "data" in payload) return payload.data;
  return payload;
}

export function extractCollection(payload, names = []) {
  const data = unwrapData(payload);
  if (Array.isArray(data)) return data;

  for (const name of names) {
    if (Array.isArray(data?.[name])) return data[name];
    if (Array.isArray(payload?.[name])) return payload[name];
  }

  return [];
}
