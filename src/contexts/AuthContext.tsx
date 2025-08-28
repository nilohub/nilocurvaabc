import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  code: string;
  role: 'supervisor' | 'buyer';
}

interface AuthContextType {
  user: User | null;
  login: (code: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isSupervisor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const users: User[] = [
  { id: '1', name: 'DHIONE ALVES', code: '170', role: 'supervisor' },
  { id: '2', name: 'FRANCISCO FILHO', code: '2689', role: 'supervisor' },
  { id: '3', name: 'ANNYBAL R.', code: '3935', role: 'buyer' },
  { id: '4', name: 'LENILDA', code: '582', role: 'buyer' },
  { id: '5', name: 'ELITA S.', code: '437', role: 'buyer' },
  { id: '6', name: 'ANTONIO F.', code: '3302', role: 'buyer' },
  { id: '7', name: 'KATIELLEN', code: '2379', role: 'buyer' },
  { id: '8', name: 'LINDIANE', code: '4698', role: 'buyer' },
  { id: '9', name: 'JESSICA R.', code: '60', role: 'buyer' },
  { id: '10', name: 'EULINO', code: '646', role: 'buyer' },
  { id: '11', name: 'MARCELO H.', code: '4725', role: 'buyer' },
  { id: '12', name: 'JOSE BARBOSA', code: '4722', role: 'buyer' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('nilo-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (code: string): boolean => {
    const foundUser = users.find(u => u.code === code);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('nilo-user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nilo-user');
  };

  const isAuthenticated = !!user;
  const isSupervisor = user?.role === 'supervisor';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      isSupervisor
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}