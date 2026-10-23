/**
 * @file client.ts
 * @description HTTP Client trung tâm cho GDGoC Portal Frontend.
 * Tự động gắn credentials (HttpOnly Cookie session_token) và chuẩn hóa response.
 */

export interface ApiResponse<T = any> {
  statusCode?: number;
  message?: string;
  data: T;
}

export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  ttl?: number;         // Time to live in ms (default: 60s for CMS, 15s for general GET)
  skipCache?: boolean;   // Set true to bypass cache and fetch fresh
}

const memoryCache = new Map<string, { data: any; expiresAt: number }>();
const inFlightRequests = new Map<string, Promise<any>>();

export function clearApiCache(filterPrefix?: string) {
  if (!filterPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(filterPrefix)) {
      memoryCache.delete(key);
    }
  }
}

export async function request<T = any>(
  url: string,
  options: RequestOptions = {},
  unwrapData = true,
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();

  // If mutation, execute request and clear GET cache so UI stays consistent
  if (method !== 'GET') {
    const res = await performRequest<T>(url, options, unwrapData);
    clearApiCache();
    return res;
  }

  // 1. Check in-memory cache for GET
  const cacheKey = `${url}:${unwrapData}`;
  const now = Date.now();
  if (!options.skipCache) {
    const cached = memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data as T;
    }

    // 2. In-flight request deduplication (avoid multiple identical requests at once)
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight as Promise<T>;
    }
  }

  const controller = new AbortController();
  const abort = () => controller.abort(options.signal?.reason);
  if (options.signal?.aborted) abort();
  else options.signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), 20_000);

  const fetchPromise = (async () => {
    try {
      const data = await performRequest<T>(url, { ...options, signal: controller.signal }, unwrapData);
      
      // Cache successful response
      const ttl = options.ttl ?? (url.includes('/api/cms/') || url.includes('/recruitment/status') ? 60_000 : 15_000);
      if (ttl > 0 && !options.skipCache) {
        memoryCache.set(cacheKey, { data, expiresAt: Date.now() + ttl });
      }
      return data;
    } finally {
      clearTimeout(timeout);
      options.signal?.removeEventListener('abort', abort);
      inFlightRequests.delete(cacheKey);
    }
  })();

  if (!options.skipCache) {
    inFlightRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

async function performRequest<T>(
  url: string,
  options: RequestInit,
  unwrapData: boolean,
): Promise<T> {
  const defaultHeaders: Record<string, string> = {};

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const response = await fetch(baseUrl + url, {
    ...options,
    credentials: 'include', // Bắt buộc để gửi và nhận Cookie session_token
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null as T;
  }

  let json: any;
  try {
    json = await response.json();
  } catch (error) {
    if (options.signal?.aborted || response.ok) throw error;
    json = null;
  }

  if (!response.ok) {
    const errorMessage =
      json?.message ||
      (Array.isArray(json?.message) ? json.message.join(', ') : null) ||
      `HTTP error! status: ${response.status}`;
    throw new ApiError(errorMessage, response.status, json);
  }

  // Nếu backend trả về cấu trúc { data: T, ... } thì unwrap data
  if (unwrapData && json && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }

  return json as T;
}

export const api = {
  // Task pagination includes sibling items/data/total fields. Keep the envelope.
  getPage: <T = any>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'GET' }, false),
  get: <T = any>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'DELETE' }),

  clearCache: (filterPrefix?: string) => clearApiCache(filterPrefix),
};
