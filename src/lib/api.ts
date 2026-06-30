// ✅ FORCE SINGLE WORKING API (NO ENV VARIABLES)

export const API_BASE_URL = "https://caerphilly-api.onrender.com";

const API_BASE = API_BASE_URL;

// ✅ GENERIC API
export const api = {
  get: async (path: string) => {
    const res = await fetch(`${API_BASE}${path}`);

    if (!res.ok) {
      console.error(`GET failed: ${path}`, res.status);
      throw new Error(`GET ${path} failed`);
    }

    return res.json();
  },

  post: async (path: string, body: any) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`POST failed: ${path}`, res.status);
      throw new Error(`POST ${path} failed`);
    }

    return res.json();
  },

  patch: async (path: string, body: any) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`PATCH failed: ${path}`, res.status);
      throw new Error(`PATCH ${path} failed`);
    }

    return res.json();
  },

  delete: async (path: string, body?: any) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      console.error(`DELETE failed: ${path}`, res.status);
      throw new Error(`DELETE ${path} failed`);
    }

    try { return await res.json(); } catch { return null; }
  },
};

// ✅ TYPES
export interface ApiLeaderboardEntry {
  user_id: string;
  username?: string | null;
  display_name?: string | null;
  wool_points?: number | null;
  tree_points?: number | null;
  total_points?: number | null;
}

export interface ApiTreeRequest {
  id: string;
  user_id?: string;
  points_used: number;
  status: string;
  what3words_location?: string | null;
  planting_date?: string | null;
  tree_species: string;
  created_at: string;
}

export interface ApiRenewable {
  id: string;
  user_id?: string;
  technology_type: string;
  points_cost: number;
  position_x?: number | null;
  position_y?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
  created_at?: string;
}

const unwrapArray = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

// ✅ PROFILE
export const fetchMyProfile = async (userId: string) => {
  if (!userId) return null;
  return api.get(`/profile?user_id=${encodeURIComponent(userId)}`);
};

// ✅ LEADERBOARD
export const fetchLeaderboard = async (limit = 100): Promise<ApiLeaderboardEntry[]> => {
  try {
    const data = await api.get(`/leaderboard`);
    const arr: ApiLeaderboardEntry[] = Array.isArray(data) ? data : [];

    return arr
      .slice()
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
      .slice(0, limit);
  } catch (e) {
    console.error("[api] fetchLeaderboard failed", e);
    return [];
  }
};

// ✅ CREATE USER
export const createUser = async (payload: { user_id: string; display_name?: string | null }) => {
  try {
    return await api.post("/create-user", payload);
  } catch (e) {
    console.error("[api] createUser failed", e);
    return null;
  }
};

// ✅ SPEND POINTS
export const spendPoints = async (payload: {
  user_id: string;
  woolDelta?: number;
  treeDelta?: number;
  source: string;
  reference_id?: string;
}) => {
  return api.post("/spend-points", payload);
};

// ✅ TREE REQUESTS
export const fetchTreeRequests = async (userId: string): Promise<ApiTreeRequest[]> => {
  if (!userId) return [];
  const data = await api.get(`/tree-requests?user_id=${encodeURIComponent(userId)}`);
  return unwrapArray<ApiTreeRequest>(data);
};

export const createTreeRequest = async (payload: {
  user_id: string;
  points_used: number;
  status: string;
  tree_species: string;
}) => {
  return api.post("/tree-requests", payload);
};

export const updateTreeRequest = async (
  id: string,
  payload: Partial<ApiTreeRequest> & { user_id?: string }
) => {
  return api.patch(`/tree-requests/${encodeURIComponent(id)}`, payload);
};

// ✅ RENEWABLES
export const fetchRenewables = async (userId: string): Promise<ApiRenewable[]> => {
  if (!userId) return [];
  const data = await api.get(`/renewables?user_id=${encodeURIComponent(userId)}`);
  return unwrapArray<ApiRenewable>(data);
};

export const createRenewable = async (payload: {
  user_id: string;
  technology_type: string;
  points_cost: number;
  position_x?: number | null;
  position_y?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}) => {
  return api.post("/renewables", payload);
};

export const updateRenewable = async (
  id: string,
  payload: Partial<ApiRenewable> & { user_id?: string }
) => {
  return api.patch(`/renewables/${encodeURIComponent(id)}`, payload);
};

// ✅ SPRINTS
const parseSprintData = (raw: any): any => {
  if (raw == null) return null;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return raw;
};

export const fetchUserSprintData = async (
  userId: string,
  sprintKey: string
): Promise<any | null> => {
  if (!userId) return null;
  try {
    const rows = await api.get(`/sprints?user_id=${encodeURIComponent(userId)}`);
    const list: any[] = Array.isArray(rows) ? rows : [];
    const row = list.find((r) => r?.sprint_key === sprintKey);
    if (!row) return null;
    return parseSprintData(row.data);
  } catch (e) {
    console.error("[api] fetchUserSprintData failed", e);
    return null;
  }
};

export const saveUserSprintData = async (
  userId: string,
  sprintKey: string,
  data: any
) => {
  if (!userId) return null;
  try {
    return await api.post(`/sprints/save`, {
      user_id: userId,
      sprint_key: sprintKey,
      data: typeof data === "string" ? data : JSON.stringify(data),
    });
  } catch (e) {
    console.error("[api] saveUserSprintData failed", e);
    return null;
  }
};
