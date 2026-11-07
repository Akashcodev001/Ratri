/**
 * Ratri API Client Service
 * Production-ready HTTP client with timeout protection, safe JSON handling,
 * Unicode UTF-8 byte accuracy, and structured HTTP error mapping.
 */

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const getApiUrl = (): string => {
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
const DEFAULT_TIMEOUT_MS = 25000;

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let parsedBody: any = null;
    if (isJson) {
      try {
        parsedBody = await res.json();
      } catch {
        parsedBody = null;
      }
    } else {
      try {
        await res.text(); // Drain stream
      } catch {
        // Ignored
      }
    }

    // 200 OK, 201 Created, 204 No Content
    if (res.ok) {
      if (res.status === 204 || parsedBody === null) {
        return (parsedBody || {}) as T;
      }
      return parsedBody as T;
    }

    // Map non-2xx HTTP status codes to user-friendly safe errors
    const status = res.status;
    let errorMessage = 'An unexpected error occurred.';
    let errorCode = 'UNKNOWN_ERROR';

    if (parsedBody && typeof parsedBody === 'object') {
      errorMessage = parsedBody.message || parsedBody.error || errorMessage;
      errorCode = parsedBody.code || parsedBody.error || `HTTP_${status}`;
    } else if (status === 400) {
      errorMessage = 'Invalid room request. Please check room details.';
      errorCode = 'BAD_REQUEST';
    } else if (status === 401) {
      errorMessage = 'Authentication required to access this room.';
      errorCode = 'UNAUTHORIZED';
    } else if (status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
      errorCode = 'FORBIDDEN';
    } else if (status === 404) {
      errorMessage = 'Room not found or link has expired.';
      errorCode = 'NOT_FOUND';
    } else if (status === 409) {
      errorMessage = 'Room code conflict or room already exists.';
      errorCode = 'CONFLICT';
    } else if (status === 429) {
      errorMessage = 'Too many requests. Please wait a moment before trying again.';
      errorCode = 'RATE_LIMITED';
    } else if (status === 502 || status === 503 || status === 504) {
      errorMessage = 'Backend service is starting up. Please try again in a few seconds.';
      errorCode = 'SERVICE_UNAVAILABLE';
    } else if (status >= 500) {
      errorMessage = 'Internal server error. Please try again later.';
      errorCode = 'SERVER_ERROR';
    }

    throw new ApiError(errorMessage, status, errorCode, parsedBody);
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      throw err;
    }

    if (err?.name === 'AbortError') {
      throw new ApiError(
        'Request timed out. The server took too long to respond. Please check your connection and try again.',
        408,
        'TIMEOUT'
      );
    }

    if (err instanceof TypeError && String(err.message || '').toLowerCase().includes('fetch')) {
      throw new ApiError(
        'Network connection failed. Could not connect to Ratri backend.',
        0,
        'NETWORK_ERROR'
      );
    }

    throw new ApiError(err?.message || 'Connection failed', 0, 'FETCH_FAILED');
  }
}

export const api = {
  warmup(): void {
    try {
      fetch(`${API_URL}`, { method: 'GET', keepalive: true }).catch(() => {});
    } catch {
      // Ignored
    }
  },

  async createRoom(name: string, personality: string): Promise<{ roomCode: string; name: string; status: string; personality: string }> {
    const cleanName = String(name || '').trim();
    const cleanPersonality = String(personality || 'chill').trim();
    return request('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name: cleanName, personality: cleanPersonality }),
    });
  },

  async getRoom(code: string): Promise<any> {
    const cleanCode = String(code || '').trim().toUpperCase();
    return request(`/rooms/${encodeURIComponent(cleanCode)}`);
  },

  async getMessages(code: string): Promise<{ roomCode: string; messages: any[] }> {
    const cleanCode = String(code || '').trim().toUpperCase();
    return request(`/rooms/${encodeURIComponent(cleanCode)}/messages`);
  },

  async joinRoom(code: string, displayName: string, password?: string): Promise<any> {
    const cleanCode = String(code || '').trim().toUpperCase();
    return request(`/rooms/${encodeURIComponent(cleanCode)}/join`, {
      method: 'POST',
      body: JSON.stringify({
        displayName: String(displayName || '').trim(),
        ...(password ? { password: String(password) } : {}),
      }),
    });
  },
};
