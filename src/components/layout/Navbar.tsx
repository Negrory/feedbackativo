import React, { useState, useEffect } from 'react';
import { HashLinkWrapper as Link } from '@/router/HashLinkWrapper';
import { useLocation } from 'react-router-dom';
import { Menu, X, Search, Car, BarChart3, ClipboardCheck, RefreshCw, AlertTriangle, LayoutDashboard, FileText, CheckSquare, Building, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isAdminPath = location.pathname.includes('/admin');

  const navLinks = isAdminPath
    ? [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <BarChart3 className="h-5 w-5" /> },
        { 
          name: 'Aguardando Aprovação', 
          path: '/admin/aguardando-aprovacao', 
          icon: <AlertTriangle className="h-5 w-5" />,
          highlight: true 
        },
        {
          name: 'Veículos',
          path: '/admin/veiculos',
          icon: <Car className="h-5 w-5" />
        },
        {
          name: 'Oficinas',
          path: '/admin/oficinas',
          icon: <Building className="h-5 w-5" />
        },
      ]
    : [
        { name: 'Home', path: '/', icon: null},
        { name: 'Consulta', path: '/consulta', icon: <Search className="h-5 w-5"/> },
      ];

  // Use os mesmos itens do navLinks para o menu mobile, para manter consistência
  const mobileMenuItems = isAdminPath
    ? [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
        { name: 'Veículos', path: '/admin/veiculos', icon: <Car className="h-5 w-5" /> },
        { name: 'Oficinas', path: '/admin/oficinas', icon: <Building className="h-5 w-5" /> },
        { 
          name: 'Aguardando Aprovação', 
          path: '/admin/aguardando-aprovacao', 
          icon: <AlertTriangle className="h-5 w-5" />,
          highlight: true 
        },
      ]
    : [
        { name: 'Home', path: '/', icon: null },
        { name: 'Consulta', path: '/consulta', icon: <Search className="h-5 w-5"/> },
      ];

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm dark:bg-gray-900/80" : "bg-transparent",
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/"
            className="flex items-center space-x-2 text-primary font-semibold text-lg transition duration-150 ease-in-out animate-fade-in"
          >
            <Car className="h-6 w-6" />
            <span>Feedback Ativo</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                  link.name === "Home"
                    ? "text-red-500"
                    : link.highlight
                    ? "text-[#ff4d4d] hover:text-red-600 font-semibold"
                    : location.pathname === link.path
                      ? "text-primary bg-primary/10"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>            
            ))}
            {!isAdminPath && (
              <Button asChild variant="outline" className="ml-4">
                <Link to="/admin/dashboard">Área Administrativa</Link>
              </Button>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden py-4 bg-white dark:bg-gray-900 shadow-md animate-slide-down">
          <div className="container mx-auto px-4 space-y-4">
            {mobileMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 py-2 text-base font-medium transition-colors duration-200",
                  item.highlight
                    ? "text-[#ff4d4d] hover:text-red-600 font-semibold"
                    : location.pathname === item.path
                      ? "text-primary" 
                      : "text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            {!isAdminPath && (
              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/admin/dashboard">Área Administrativa</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
