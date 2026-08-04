import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'SALES_SUPERVISOR' | 'SALES_REPRESENTATIVE' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companies: { id: string; name: string }[];
  currentCompanyId: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchCompany: (companyId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load from local storage for persistence
    const savedUser = localStorage.getItem('erp_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login logic
    
    if (email === 'admin@erp.com' && password === 'admin') {
      const newUser: User = {
        id: '1',
        name: 'Admin User',
        email,
        role: 'ADMIN',
        companies: [{ id: 'COM-0001', name: 'NmoLabs' }],
        currentCompanyId: 'COM-0001',
      };
      setUser(newUser);
      localStorage.setItem('erp_user', JSON.stringify(newUser));
    } else if (email === 'rep@erp.com' && password === 'rep') {
      const newUser: User = {
        id: '2',
        name: 'Sales Rep',
        email,
        role: 'SALES_REPRESENTATIVE',
        companies: [{ id: 'COM-0001', name: 'NmoLabs' }],
        currentCompanyId: 'COM-0001',
      };
      setUser(newUser);
      localStorage.setItem('erp_user', JSON.stringify(newUser));
    } else if (email === 'acc@erp.com' && password === 'acc') {
      const newUser: User = {
        id: '3',
        name: 'Accountant User',
        email,
        role: 'ACCOUNTANT',
        companies: [{ id: 'COM-0001', name: 'NmoLabs' }],
        currentCompanyId: 'COM-0001',
      };
      setUser(newUser);
      localStorage.setItem('erp_user', JSON.stringify(newUser));
    } else {

      throw new Error('Invalid credentials. Use admin@erp.com / admin or user@erp.com / user');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('erp_user');
  };

  const switchCompany = (companyId: string) => {
    if (user) {
      const updatedUser = { ...user, currentCompanyId: companyId };
      setUser(updatedUser);
      localStorage.setItem('erp_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchCompany }}>
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
