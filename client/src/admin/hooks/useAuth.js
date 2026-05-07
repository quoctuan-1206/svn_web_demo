import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const TOKEN_KEY = 'svn_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export default function useAuth() {
  const navigate = useNavigate();

  const token = getToken();

  const isAuthenticated = useCallback(() => {
    return Boolean(getToken());
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  return { token, isAuthenticated, logout };
}

