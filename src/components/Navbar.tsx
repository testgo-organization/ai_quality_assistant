
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Home,
  Upload,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, openAuthModal, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: "Inicio", path: "/", icon: Home, requiresAuth: false },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, requiresAuth: true },
    { name: "Subir Archivos", path: "/upload", icon: Upload, requiresAuth: true },
  ];

  const handleNavClick = (e: React.MouseEvent, path: string, requiresAuth: boolean) => {
    // Lógica especial para Dashboard
    if (path === '/dashboard') {
      e.preventDefault();
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/dashboard-demo');
      }
      setIsOpen(false);
      return;
    }
    // Para rutas que requieren autenticación (como /upload)
    if (requiresAuth && !isAuthenticated) {
      e.preventDefault();
      openAuthModal();
      setIsOpen(false);
    } else {
      navigate(path);
      setIsOpen(false);
    }
  };

  // Determinar la ruta activa considerando dashboard-demo
  const getActivePath = () => {
    if (location.pathname.startsWith('/dashboard-demo')) return '/dashboard-demo';
    if (location.pathname.startsWith('/dashboard')) return '/dashboard';
    if (location.pathname.startsWith('/upload')) return '/upload';
    return location.pathname;
  };
  const activePath = getActivePath();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-16 rounded-full bg-gradient-to-r from-tetgoai-blue to-tetgoai-purple flex items-center justify-center text-white font-bold">
                TGAi
              </div>
              <span className="text-xl font-bold gradient-text">TestGoAi</span>
            </Link>
          </div>
          
          <div className="hidden sm:flex items-center space-x-4">
            {navItems.map((item) => {
              // Marcar dashboard-demo como activo si corresponde
              const isActive = (item.path === '/dashboard' && activePath === '/dashboard-demo') || activePath === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item.path, item.requiresAuth)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors",
                    "text-gray-700 hover:text-tetgoai-blue hover:bg-gray-100/50 dark:text-gray-200 dark:hover:bg-gray-800/50",
                    isActive && "text-tetgoai-blue border-b-2 border-b-0 bg-transparent border-none relative after:absolute after:left-3 after:right-3 after:bottom-0 after:h-1 after:rounded after:bg-gradient-to-r after:from-tetgoai-blue after:to-tetgoai-purple after:content-[''] after:pointer-events-none after:z-10"
                  )}
                  style={isActive ? { paddingBottom: '0.5rem' } : {}}
                >
                  <item.icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            {isAuthenticated ? (
              <Button onClick={handleLogout} size="sm" variant="outline">
                Cerrar Sesión
              </Button>
            ) : (
              <Button onClick={openAuthModal} size="sm" className="ml-4 bg-gradient-to-r from-tetgoai-blue to-tetgoai-purple">
                Iniciar Sesión
              </Button>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={cn("sm:hidden", isOpen ? "block" : "hidden")}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const isActive = (item.path === '/dashboard' && activePath === '/dashboard-demo') || activePath === item.path;
            return (
              <a
                key={item.name}
                href={item.path}
                onClick={(e) => handleNavClick(e, item.path, item.requiresAuth)}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 cursor-pointer transition-colors",
                  "text-gray-700 hover:text-tetgoai-blue hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700",
                  isActive && "text-tetgoai-blue border-l-0 bg-transparent border-none relative after:absolute after:top-2 after:bottom-2 after:left-0 after:w-1 after:rounded after:bg-gradient-to-b after:from-tetgoai-blue after:to-tetgoai-purple after:content-[''] after:pointer-events-none after:z-10"
                )}
                style={isActive ? { paddingLeft: '1rem' } : {}}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </a>
            );
          })}
          {isAuthenticated ? (
            <Button onClick={handleLogout} size="sm" variant="outline" className="w-full mt-2">
              Cerrar Sesión
            </Button>
          ) : (
            <Button onClick={openAuthModal} size="sm" className="w-full mt-2 bg-gradient-to-r from-tetgoai-blue to-tetgoai-purple">
              Iniciar Sesión
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
