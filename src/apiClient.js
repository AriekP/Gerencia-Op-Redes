// src/apiClient.ts
export async function apiGet(path: string, init?: RequestInit) {
  const url = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(url, { ...init, method: 'GET' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function apiPost<T = unknown>(path: string, body?: any, init?: RequestInit) {
  const url = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}
