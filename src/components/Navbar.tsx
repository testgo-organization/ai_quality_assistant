
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Home,
  Upload,
  Menu,
  X,
  BarChart3,
  PieChart,
  Users,
  MessageSquare
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Inicio", path: "/", icon: Home },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Subir Archivos", path: "/upload", icon: Upload },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-piacc-blue to-piacc-purple flex items-center justify-center text-white font-bold">
                P
              </div>
              <span className="text-xl font-bold gradient-text">PIACC</span>
            </Link>
          </div>
          
          <div className="hidden sm:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-piacc-blue hover:bg-gray-100/50 dark:text-gray-200 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-2"
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </Link>
            ))}
            <Button size="sm" className="ml-4 bg-gradient-to-r from-piacc-blue to-piacc-purple">
              Iniciar Sesión
            </Button>
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
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-piacc-blue hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              onClick={() => setIsOpen(false)}
            >
              <item.icon size={16} />
              <span>{item.name}</span>
            </Link>
          ))}
          <Button size="sm" className="w-full mt-2 bg-gradient-to-r from-piacc-blue to-piacc-purple">
            Iniciar Sesión
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
