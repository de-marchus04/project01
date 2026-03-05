"use server";

const API_BASE = process.env.BACKEND_API_URL || 'http://localhost:5253';

interface ApiResponse<T> {
  data: T;
  ok: boolean;
  status: number;
  error?: string;
}

export async function backendFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      data: data as T,
      ok: false,
      status: res.status,
      error: data?.error || data?.title || `Request failed with status ${res.status}`,
    };
  }

  return { data: data as T, ok: true, status: res.status };
}

export async function backendGet<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const result = await backendFetch<T>(path, { method: 'GET', headers });
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export async function backendPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const result = await backendFetch<T>(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export async function backendPut<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const result = await backendFetch<T>(path, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export async function backendDelete(path: string, token?: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const result = await backendFetch<void>(path, { method: 'DELETE', headers });
  if (!result.ok) throw new Error(result.error);
}
