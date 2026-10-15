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

export async function request<T = any>(
  url: string,
  options: RequestInit = {},
  unwrapData = true,
): Promise<T> {
  // Bound background reads, including response-body parsing. Mutations keep their
  // existing semantics: timing out a write does not imply the write was rejected.
  if ((options.method || 'GET') !== 'GET') return performRequest<T>(url, options, unwrapData);
  const controller = new AbortController();
  const abort = () => controller.abort(options.signal?.reason);
  if (options.signal?.aborted) abort();
  else options.signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), 20_000);
  try {
    return await performRequest<T>(url, { ...options, cache: 'no-store', signal: controller.signal }, unwrapData);
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
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
  getPage: <T = any>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'GET' }, false),
  get: <T = any>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = any>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'DELETE' }),
};
