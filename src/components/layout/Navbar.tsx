import React, { useState, useEffect } from 'react';
import { HashLinkWrapper as Link } from '@/router/HashLinkWrapper';
import { useLocation } from 'react-router-dom';
import { Menu, X, Search, Car, BarChart3, ClipboardCheck, RefreshCw, AlertTriangle, LayoutDashboard, FileText, CheckSquare, Building, BarChart, UserCircle, LogOut, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/contexts/SupabaseContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface NavbarProps {
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useSupabase();

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

            {/* Botão de login ou perfil */}
            <div className="hidden md:block ml-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Minha Conta
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="truncate max-w-[200px]">
                        {user.email}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '#/admin/dashboard'}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '#/login'}
                  className="flex items-center"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
              )}
            </div>
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

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                    Logado como: <span className="font-medium">{user.email}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 flex items-center text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </button>
                </>
              ) : (
                <button
                  onClick={() => window.location.href = '#/login'}
                  className="w-full text-left px-4 py-2 flex items-center text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
