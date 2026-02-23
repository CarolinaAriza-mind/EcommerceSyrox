import Cookies from 'js-cookie';

const TOKEN_KEY = 'admin_token';

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    sameSite: 'strict',
    // ← sin secure para que funcione en localhost
  });
};

export const getTokenFromCookie = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('admin_token='));
  return match ? match.split('=')[1] : undefined;
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getTokenFromCookie();
};