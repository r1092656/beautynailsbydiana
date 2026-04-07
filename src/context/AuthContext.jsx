import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminSession = localStorage.getItem('diana_admin_session');
    if (adminSession === 'true') {
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const login = (password) => {
    if (password === 'diana2026') {
      setIsAdmin(true);
      localStorage.setItem('diana_admin_session', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('diana_admin_session');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
