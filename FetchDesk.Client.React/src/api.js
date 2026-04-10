const API_BASE_URL = (() => {
  const url = import.meta.env.VITE_API_URL?.trim() || import.meta.env.VITE_API_BASE_URL?.trim();
  if (url) {
    return url;
  }

  if (import.meta.env.MODE === "production") {
    throw new Error("Missing VITE_API_URL in production build");
  }

  return "http://localhost:5000";
})();

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  return response;
}

export async function apiGetJson(path) {
  const response = await apiFetch(path, { method: "GET" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}
