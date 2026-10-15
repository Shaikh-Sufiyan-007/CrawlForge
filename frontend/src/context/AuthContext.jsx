import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('crawlforge_token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('crawlforge_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Validate existing session on mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('crawlforge_token');
      if (!storedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const status = await authService.checkStatus(storedToken);
        if (status.authenticated) {
          const userData = {
            id: status.id,
            username: status.username,
            email: status.email,
            role: status.role,
          };
          setUser(userData);
          localStorage.setItem('crawlforge_user', JSON.stringify(userData));
        } else {
          // Token is invalid/expired
          localStorage.removeItem('crawlforge_token');
          localStorage.removeItem('crawlforge_user');
          setToken(null);
          setUser(null);
        }
      } catch {
        // If backend is offline or network error, keep offline token or clear
      } finally {
        setAuthLoading(false);
      }
    };

    verifySession();
  }, []);

  // Listen for session expiration events from axios interceptor
  useEffect(() => {
    const handleSessionExpired = (e) => {
      const msg = e.detail || 'Your session has expired. Please log in again.';
      setAuthError(msg);
      localStorage.removeItem('crawlforge_token');
      localStorage.removeItem('crawlforge_user');
      setToken(null);
      setUser(null);
    };

    window.addEventListener('crawlforge:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('crawlforge:session-expired', handleSessionExpired);
    };
  }, []);

  const login = async (username, password) => {
    setAuthError(null);
    try {
      const response = await authService.login(username, password);
      const authToken = response.token;
      const userData = {
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role,
      };

      localStorage.setItem('crawlforge_token', authToken);
      localStorage.setItem('crawlforge_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      return response;
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot connect to authentication service. Please ensure the backend is running.'
          : 'Invalid username or password.');
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const signup = async (username, email, password) => {
    setAuthError(null);
    try {
      const response = await authService.signup(username, email, password);
      const authToken = response.token;
      const userData = {
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role,
      };

      localStorage.setItem('crawlforge_token', authToken);
      localStorage.setItem('crawlforge_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      return response;
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot connect to server. Please ensure the backend is running.'
          : 'Registration failed. Please try again.');
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch {
    } finally {
      localStorage.removeItem('crawlforge_token');
      localStorage.removeItem('crawlforge_user');
      setToken(null);
      setUser(null);
      setAuthError(null);
    }
  };

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        authLoading,
        authError,
        login,
        signup,
        logout,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
