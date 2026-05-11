const TOKEN_KEY = "volunteer_token";
const USER_KEY = "volunteer_user";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return {};
  }

  try {
    const user = JSON.parse(rawUser);
    return user && typeof user === "object" ? user : {};
  } catch {
    clearStoredAuth();
    return {};
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
