const API_BASE = (import.meta.env.VITE_API_URL || "https://edp-3a45.onrender.com/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(localStorage.getItem("mh_token") ? { Authorization: `Bearer ${localStorage.getItem("mh_token")}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || body?.error || `Request failed (${response.status})`);
  return body;
}

const json = (method, data) => ({ method, body: JSON.stringify(data) });

export async function getHealth() { return request("/health"); }

export async function getServices(search = "") {
  const result = await request(`/services${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  return Array.isArray(result) ? result : result?.data || [];
}
export async function createService(data) { return request("/services", json("POST", data)); }
export async function updateService(id, data) { return request(`/services/${id}`, json("PUT", data)); }
export async function deleteService(id) { return request(`/services/${id}`, { method: "DELETE" }); }

export async function getAppointments() {
  const result = await request("/appointments");
  return Array.isArray(result) ? result : result?.data || [];
}
export async function createAppointment(data) { return request("/appointments", json("POST", data)); }
export async function updateAppointment(id, data) { return request(`/appointments/${id}`, json("PUT", data)); }
export async function deleteAppointment(id) { return request(`/appointments/${id}`, { method: "DELETE" }); }

export async function getHealthInformation(search = "") {
  const result = await request(`/health-information${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  return Array.isArray(result) ? result : result?.data || [];
}
export async function createHealthInformation(data) { return request("/health-information", json("POST", data)); }
export async function updateHealthInformation(id, data) { return request(`/health-information/${id}`, json("PUT", data)); }
export async function deleteHealthInformation(id) { return request(`/health-information/${id}`, { method: "DELETE" }); }

export async function sendChatMessage(message) {
  const result = await request("/chat", json("POST", { message }));
  return result.reply;
}

export async function loginAdmin(username, password) {
  const result = await request("/auth/login", json("POST", { username, password }));
  localStorage.setItem("mh_token", result.token);
  localStorage.setItem("mh_user", JSON.stringify(result.user));
  return result.user;
}
export function logoutAdmin() { localStorage.removeItem("mh_token"); localStorage.removeItem("mh_user"); }
