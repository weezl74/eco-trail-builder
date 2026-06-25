
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  'https://caerphilly-api.onrender.com';

const API_BASE = API_BASE_URL;

// ✅ GENERIC API
export const api = {
  get: async (path: string) => {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`GET ${path} failed`);
    return res.json();
  },

  post: async (path: string, body: any) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`POST ${path} failed: ${res.status}`);
    }

    return res.json();
  },
};

// ✅ PROFILE
export const fetchMyProfile = async (userId: string) => {
  if (!userId) return null;
  return api.get(`/profile/${userId}`);
};

// ✅ LEADERBOARD
export interface ApiLeaderboardEntry {
  user_id: string;
  display_name?: string | null;
  username?: string | null;
  wool_points?: number | null;
  tree_points?: number | null;
  total_points?: number | null;
}

export const fetchLeaderboard = async (limit = 100): Promise<ApiLeaderboardEntry[]> => {
  try {
    const data = await api.get('/profile');
    const arr: ApiLeaderboardEntry[] = Array.isArray(data) ? data : [];
    return arr
      .slice()
      .sort(
        (a, b) =>
          ((b.wool_points || 0) + (b.tree_points || 0)) -
          ((a.wool_points || 0) + (a.tree_points || 0)),
      )
      .slice(0, limit);
  } catch (e) {
    console.error('[api] fetchLeaderboard failed', e);
    return [];
  }
};

// ✅ CREATE USER (idempotent)
export const createUser = async (payload: { user_id: string; display_name?: string | null }) => {
  try {
    return await api.post('/create-user', payload);
  } catch (e) {
    console.error('[api] createUser failed', e);
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
}) => api.post('/spend-points', payload);
