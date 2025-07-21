
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

// Define la forma del contexto de autenticación
interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string } | null;
  login: (email: string, token: string, refreshToken: string) => void;
  logout: () => void;
  getToken: () => string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

// Crea el contexto con un valor por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define las props del proveedor de autenticación
interface AuthProviderProps {
  children: ReactNode;
}

// Crea el proveedor de autenticación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Al cargar el componente, intenta recuperar la sesión
  useEffect(() => {
    const storedToken = sessionStorage.getItem('accessToken');
    const storedUser = sessionStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, accessToken: string, refreshToken: string) => {
    const userData = { email };
    setUser(userData);
    setToken(accessToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    setIsAuthModalOpen(false); // Cierra el modal al iniciar sesión
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  };

  const getToken = () => token;

  // Usar useCallback para exponer funciones estables
  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);
  
  // TODO: Implementar lógica para refrescar el token cuando sea necesario

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!token, 
      user, 
      login, 
      logout, 
      getToken,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 