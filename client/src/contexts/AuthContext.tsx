

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Backend URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Auth API URL
const AUTH_API_URL = `${API_BASE_URL}/api/auth`;

const normalizeResumeUrl = (value?: string) => {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
};

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  department?: string;
  year?: string;
  cgpa?: number;       
  backlogs?: number;   
  phone?: string;      
  address?: string;    
  headline?: string;   
  skills?: string[];   
  token: string;
  [key: string]: any; 
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'student' | 'admin') => Promise<boolean>;
  register: (data: Record<string, any>) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
  logout: () => void;
  isProfileComplete: () => boolean;
  hasDismissedProfileModal: boolean;
  dismissProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export hook only once
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDismissedProfileModal, setHasDismissedProfileModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser?.resumeUrl) {
              parsedUser.resumeUrl = normalizeResumeUrl(parsedUser.resumeUrl);
            }
            setUser(parsedUser);
            localStorage.setItem('user', JSON.stringify(parsedUser));
        } catch (e) {
            console.error("Failed to parse user", e);
        }
    }
    setIsLoading(false); 
  }, []);

  const isProfileComplete = () => {
    if (!user) return false;
    return !!(
      user.name && 
      user.email && 
      user.cgpa && 
      user.department && 
      user.year && 
      user.phone
    );
  };

  const dismissProfileModal = () => {
    setHasDismissedProfileModal(true);
  };

 const login = async (
  email: string,
  password: string,
  role: 'student' | 'admin'
) => {
  try {
    const response = await axios.post(
      `${AUTH_API_URL}/login`,
      { email, password, role }
    );

    if (response.data) {
      setUser(response.data);

      localStorage.setItem('user', JSON.stringify(response.data));

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Login Error:', error);
    return false;
  }
};
const register = async (data: any) => {
  try {
    const response = await axios.post(
      `${AUTH_API_URL}/register`,
      { ...data, role: 'student' }
    );

    if (response.data) {
      setUser(response.data);

      localStorage.setItem('user', JSON.stringify(response.data));

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Registration Error:', error);
    return false;
  }
};
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const normalizedUpdates = {
        ...updates,
        resumeUrl: normalizeResumeUrl(updates.resumeUrl),
      };
      const updatedUser = { ...user, ...normalizedUpdates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // No need to update 'token' key here as updates usually don't change the token
    }
  };

  const logout = () => {
    setUser(null);
    // --- FIX 3: Remove Token on Logout ---
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout, 
      updateUser, 
      isLoading, 
      isProfileComplete, 
      hasDismissedProfileModal,
      dismissProfileModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};
