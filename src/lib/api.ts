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
};

// ✅ TYPES
export interface ApiLeaderboardEntry {
  user_id: string;
  display_name?: string | null;
  username?: string | null;
  wool_points?: number | null;
  tree_points?: number | null;
}

// ✅ PROFILE
export const fetchMyProfile = async (userId: string) => {
  if (!userId) return null;
  return api.get(`/profile?user_id=${encodeURIComponent(userId)}`);
};

// ✅ LEADERBOARD
export const fetchLeaderboard = async (limit = 100): Promise<ApiLeaderboardEntry[]> => {
  try {
    const data = await api.get(`/profile`);
    const arr: ApiLeaderboardEntry[] = Array.isArray(data) ? data : [];

    return arr
      .slice()
      .sort((a, b) => (b.wool_points || 0) + (b.tree_points || 0) - ((a.wool_points || 0) + (a.tree_points || 0)))
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
