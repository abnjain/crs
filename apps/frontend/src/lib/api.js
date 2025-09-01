const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
const API_VERSION = "/api/v1";

export async function getCurrentUser() {
  const res = await fetch(`${API_URL}${API_VERSION}/auth/me`, { credentials: "include" });
  return res.json();
}

export async function loginUser(credentials) {
  const res = await fetch(`${API_URL}${API_VERSION}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include",
  });
  return res.json();
}

export async function logoutUser() {
  const res = await fetch(`${API_URL}${API_VERSION}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}
