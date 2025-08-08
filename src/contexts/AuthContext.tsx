import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config';

interface User {
  id: string;
  email: string;
  name: string;
  last_name?: string;
  hasCompletedAiQualityOnboarding?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, last_name?: string) => Promise<void>;
  getToken: () => string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  showAiGoChat: boolean;
  setShowAiGoChat: (show: boolean) => void;
  completeAiQualityOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showAiGoChat, setShowAiGoChat] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('auth_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Hacer petición real al API de login
      const response = await fetch(`${API_BASE_URL}user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }

      const data = await response.json();
      
      const user = {
        id: data.user?.id || '1',
        email: data.user?.email || email,
        name: data.user?.name || 'Usuario',
        hasCompletedAiQualityOnboarding: data.user?.hasCompletedAiQualityOnboarding || false
      };
      
      const authToken = data.access_token || data.token;
      if (!authToken) {
        throw new Error('Token de acceso no recibido');
      }
      
      setUser(user);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('auth_token', authToken);
      setIsAuthModalOpen(false);
      
      // Mostrar chat de AiGO si no ha completado el onboarding
      if (!user.hasCompletedAiQualityOnboarding) {
        setShowAiGoChat(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      // Aquí iría la lógica de cierre de sesión real
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, last_name?: string) => {
    try {
      setLoading(true);
      setError(null);
      // Aquí iría la lógica de registro real con tu backend
      const mockUser = {
        id: '1',
        email,
        name,
        last_name,
        hasCompletedAiQualityOnboarding: false
      };
      const mockToken = 'mock-jwt-token';
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', mockToken);
      setIsAuthModalOpen(false);
      setShowAiGoChat(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getToken = useCallback(() => token, [token]);
  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const completeAiQualityOnboarding = useCallback(() => {
    if (user) {
      const updatedUser = { ...user, hasCompletedAiQualityOnboarding: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowAiGoChat(false);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      isAuthenticated: !!user,
      login, 
      logout, 
      register,
      getToken,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      showAiGoChat,
      setShowAiGoChat,
      completeAiQualityOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
