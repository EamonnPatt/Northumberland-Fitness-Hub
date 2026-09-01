export const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export class ApiError extends Error {}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("nf_token");
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    throw new ApiError(data?.message || "Something went wrong. Please try again.");
  }
  return data;
}
