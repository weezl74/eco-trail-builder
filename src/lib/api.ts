
const API_BASE = import.meta.env.VITE_API_URL || 'https://your-render-url.onrender.com';

// ✅ Generic API helper
export const api = {
  get: async (path: string) => {
    const res = await fetch(`${API_BASE}${path}`);

    if (!res.ok) {
      throw new Error(`GET ${path} failed`);
    }

    return res.json();
  },

  post: async (path: string, body: any) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`POST ${path} failed`);
    }

    return res.json();
  },
};

// ✅ THIS IS THE CRITICAL BIT
export const fetchMyProfile = async (userId: string) => {
  if (!userId) return null;

  try {
    const data = await api.get(`/profile/${userId}`);

    return {
      wool_points: data?.wool_points ?? 0,
      tree_points: data?.tree_points ?? 0,
    };
  } catch (err) {
    console.error('fetchMyProfile failed', err);
    return null;
  }
};
