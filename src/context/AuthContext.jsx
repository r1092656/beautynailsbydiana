import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components -- hook is intentionally colocated with its provider
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin-session', { credentials: 'include' });
        const data = await response.json();
        setIsAdmin(Boolean(data.isAdmin));
      } catch (err) {
        console.error('Session check failed:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Real authentication now happens server-side (see /api/admin-login.js).
  // The password is never shipped to the browser and the session is a signed,
  // httpOnly cookie that the server verifies on every check.
  const login = async (password) => {
    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (data.success) {
        setIsAdmin(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin-logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
