import Cookies from 'js-cookie';

const TOKEN_KEY = 'admin_token';

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,        // días
    secure: true,
    sameSite: 'strict',
  });
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};