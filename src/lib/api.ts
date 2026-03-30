/**
 * MediQ API Client
 * Centralized API calls with JWT auth header injection.
 */

const API_BASE = import.meta.env.VITE_API_URL as string || "http://127.0.0.1:5001";

// ==========================================
// TOKEN MANAGEMENT
// ==========================================

export function getToken(): string | null {
  return localStorage.getItem("mediq_token");
}

export function setToken(token: string): void {
  localStorage.setItem("mediq_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("mediq_token");
  localStorage.removeItem("mediq_user");
}

export function getUser(): any | null {
  const u = localStorage.getItem("mediq_user");
  return u ? JSON.parse(u) : null;
}

export function setUser(user: any): void {
  localStorage.setItem("mediq_user", JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// Global auth-error callback — lets App.tsx auto-logout on 401
let _onAuthError: (() => void) | null = null;
export function setOnAuthError(cb: () => void) {
  _onAuthError = cb;
}

function handleAuthError() {
  removeToken();
  if (_onAuthError) _onAuthError();
}


// ==========================================
// HTTP HELPERS
// ==========================================

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

async function jsonFetch(url: string, options: RequestInit = {}): Promise<any> {
  const res = await authFetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    // If token is invalid/expired, clear it and notify the app
    if (res.status === 401) {
      handleAuthError();
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error(data.error || "Request failed");
  }
  return data;
}


// ==========================================
// AUTH API
// ==========================================

export async function signup(email: string, password: string, full_name: string) {
  const data = await jsonFetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name }),
  });

  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function login(email: string, password: string) {
  const data = await jsonFetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function getMe() {
  return jsonFetch(`${API_BASE}/auth/me`);
}

export function logout() {
  removeToken();
}


// ==========================================
// UPLOAD API
// ==========================================

export async function uploadFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  // 90-second timeout — AI processing can be slow but shouldn't hang forever
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90_000);

  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      signal: controller.signal,
    });

    const data = await res.json();

    if (!res.ok) {
      // Detect auth failure and give a clear message
      if (res.status === 401) {
        handleAuthError();
        throw new Error("Session expired. Please log in again to upload.");
      }
      throw new Error(data.error || data.detail || "Upload failed");
    }
    return data;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Analysis timed out after 90 seconds. Please try again or use a smaller file.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}


// ==========================================
// REPORTS API
// ==========================================

export async function getReports() {
  return jsonFetch(`${API_BASE}/reports`);
}

export async function getReport(reportUid: string) {
  return jsonFetch(`${API_BASE}/reports/${reportUid}`);
}

export async function deleteReport(reportUid: string) {
  return jsonFetch(`${API_BASE}/reports/${reportUid}`, { method: "DELETE" });
}

export async function compareReports(uidOld: string, uidNew: string) {
  return jsonFetch(`${API_BASE}/reports/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ report_old: uidOld, report_new: uidNew }),
  });
}


// ==========================================
// HEALTH CHECK
// ==========================================

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
