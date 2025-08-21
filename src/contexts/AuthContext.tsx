import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config';
import { User } from '@/types/User';

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
    // Quitar cualquier lógica que muestre el chat aquí
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
        onboarding_process: data.user?.onboarding_process || false
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

      // Mostrar chat de AiGO solo justo después de login exitoso
      if (!user.onboarding_process) {
        setShowAiGoChat(true);
      } else {
        setShowAiGoChat(false);
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
      // Registro real con el backend
      const response = await fetch(`${API_BASE_URL}user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, last_name }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al registrarse');
      }

      const data = await response.json();

      // Ajusta los campos según la respuesta real de tu backend
      const user = {
        id: data.user?.id || '1',
        email: data.user?.email || email,
        name: data.user?.name || name,
        last_name: data.user?.last_name || last_name,
        onboarding_process: data.user?.onboarding_process || false
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
      // Mostrar chat de AiGO solo justo después de registro exitoso
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

  const completeAiQualityOnboarding = useCallback(async () => {
    if (user) {
      try {
        setLoading(true);
        setError(null);
        const tokenValue = getToken();
        const response = await fetch(`${API_BASE_URL}user/update_onboarding_aigo`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenValue}`,
          },
          body: JSON.stringify({ onboarding_process: true }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al actualizar el usuario');
        }

        // Actualiza el usuario localmente
        const updatedUser = { ...user, onboarding_process: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setShowAiGoChat(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al actualizar el usuario');
        throw err;
      } finally {
        setLoading(false);
      }
    }
  }, [user, getToken]);

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
