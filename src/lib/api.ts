// Render API client (replaces Supabase data calls).
// Supabase remains only for auth — we attach the Supabase access token
// as a Bearer credential so the API can identify the user.

import { supabase } from "@/integrations/supabase/client";

export const API_BASE_URL = "https://caerphilly-api.onrender.com";

async function authHeaders(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...(await authHeaders()),
    ...((init.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    throw new Error(`API ${init.method ?? "GET"} ${path} failed: ${res.status}`);
  }
  // Some endpoints (e.g. 204) may return no body
  const text = await res.text();
  return (text ? JSON.parse(text) : (undefined as unknown)) as T;
}

export const api = {
  get:    <T>(path: string)             => request<T>(path),
  post:   <T>(path: string, body: any)  => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: any)  => request<T>(path, { method: "PATCH",  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: any)  => request<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  delete: <T>(path: string)             => request<T>(path, { method: "DELETE" }),
};

/* -------- Domain types -------- */

export interface ApiProfile {
  user_id: string;
  username?: string | null;
  display_name?: string | null;
  avatar_level?: number | null;
  wool_points?: number | null;
  tree_points?: number | null;
  total_points?: number | null;
  account_type?: "resident" | "business" | null;
}

/** Current user's profile. Falls back to scanning /profile list if /profile/me 404s. */
export async function fetchMyProfile(userId: string): Promise<ApiProfile | null> {
  try {
    return await api.get<ApiProfile>(`/profile/${userId}`);
  } catch {
    try {
      const all = await api.get<ApiProfile[]>(`/profile`);
      return all.find((p) => p.user_id === userId) ?? null;
    } catch {
      return null;
    }
  }
}

export interface ApiLeaderboardEntry {
  user_id: string;
  username?: string | null;
  display_name?: string | null;
  avatar_level?: number | null;
  wool_points?: number | null;
  tree_points?: number | null;
  total_points?: number | null;
}

/** Leaderboard is derived directly from GET /profile. No local data, no cached users. */
export async function fetchLeaderboard(limit = 50): Promise<ApiLeaderboardEntry[]> {
  const all = await api.get<ApiLeaderboardEntry[]>(`/profile`);
  return [...all]
    .sort(
      (a, b) =>
        ((b.wool_points ?? 0) + (b.tree_points ?? 0)) -
        ((a.wool_points ?? 0) + (a.tree_points ?? 0)),
    )
    .slice(0, limit);
}

/** Spend wool/tree points server-side. Returns the updated profile. */
export async function spendPoints(params: {
  user_id: string;
  woolDelta?: number;
  treeDelta?: number;
  reason?: string;
  reference_id?: string;
}): Promise<ApiProfile | void> {
  return api.post<ApiProfile>(`/spend-points`, params);
}
