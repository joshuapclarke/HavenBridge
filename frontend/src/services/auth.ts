const TOKEN_KEY = 'hb_token';

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  exp: number;
}

export function parseToken(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      username: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const payload = parseToken();
  if (!payload) return false;
  return payload.exp * 1000 > Date.now();
}

export function getUserRole(): string | null {
  const payload = parseToken();
  return payload?.role ?? null;
}

export function getUserName(): string | null {
  const payload = parseToken();
  return payload?.username ?? null;
}

const ROLE_HIERARCHY: Record<string, number> = {
  Donor: 1,
  Staff: 2,
  Admin: 3,
};

export function hasRole(minimumRole: string): boolean {
  const currentRole = getUserRole();
  if (!currentRole) return false;
  return (ROLE_HIERARCHY[currentRole] ?? 0) >= (ROLE_HIERARCHY[minimumRole] ?? 99);
}
