// Central API base URL — uses Railway in production, Vite proxy in dev
const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Wrapper around fetch that prepends the API base URL.
 * Usage: apiFetch('/api/orders') works both locally and in production.
 */
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  return fetch(url, options);
}

export default API_BASE;
