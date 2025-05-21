import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

interface AuthActions {
  login: (token: string) => void;
  logout: () => void;
  setAuthStatus: (status: boolean) => void;
}

interface AuthContextType extends AuthState, AuthActions {}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    return {
      isAuthenticated: !!token,
      token: token || null
    };
  });

  const login = (token: string) => {
    setState(prev => ({ ...prev, isAuthenticated: true, token }));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setState(prev => ({ ...prev, isAuthenticated: false, token: null }));
    localStorage.removeItem('token');
  };

  const setAuthStatus = (status: boolean) => {
    setState(prev => ({ ...prev, isAuthenticated: status }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
