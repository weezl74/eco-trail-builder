
const API_BASE = import.meta.env.VITE_API_URL;

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

// ✅ ✅ PROFILE (CORRECT ENDPOINT)
export const fetchMyProfile = async (userId: string) => {
  if (!userId) return null;

  return api.get(`/profile/${userId}`);
};
