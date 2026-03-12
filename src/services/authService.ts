import axios from 'axios';

const BASE_API = `${import.meta.env.VITE_BACKEND_URL}/api/auth` || "http://localhost:3000";

type AuthTokens = {
  token: string;
  refreshToken: string;
  userId: string;
};

export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_ID_KEY = 'userId';

export const storeAuthTokens = ({ token, refreshToken, userId }: AuthTokens) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_ID_KEY, userId);
};

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
};

export const login = async (identifier: string, password: string) => {
  const res = await axios.post(`${BASE_API}/login`, { 
    identifier: identifier,
    password 
  });
  return res.data; 
};


export const googleLogin = async (credential: string) => {
  const res = await axios.post(`${BASE_API}/google`, { credential });
  return res.data;
};

export const registerUser = async (email: string, username: string, password: string) => {
    const res = await axios.post(`${BASE_API}/register`, {
        email,
        username,
        password,
    });

    return res.data;
};


export const refreshToken = async (refreshToken: string) => {
  const res = await axios.post(`${BASE_API}/refresh-token`, { refreshToken });
  return res.data;
};


export const logout = async (refreshToken: string) => {
  await axios.post(`${BASE_API}/logout`, { refreshToken });
};