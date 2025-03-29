import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 mt-auto">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Car className="h-5 w-5 text-primary" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">Feedback Ativo</span>
          </div>
          
          <div className="flex space-x-6">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/consulta" className="text-gray-400 hover:text-white transition-colors">
              Consulta
            </Link>
            <Link to="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Área Administrativa
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center md:text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {currentYear} Sistema Feedback Ativo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
