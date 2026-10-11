const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      return 'http://localhost:3000/v1';
    }
  }
  return '/v1';
};

const API_URL = getApiUrl();

export const api = {
  async createRoom(name: string, personality: string) {
    const res = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, personality })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  
  async getRoom(code: string) {
    const res = await fetch(`${API_URL}/rooms/${code}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async joinRoom(code: string, displayName: string, password?: string) {
    const res = await fetch(`${API_URL}/rooms/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, password })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
