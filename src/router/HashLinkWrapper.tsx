import React from 'react';
import { Link, LinkProps, useLocation } from 'react-router-dom';

/**
 * Componente que serve como wrapper para os links na aplicação
 * Ele garante que os links funcionem corretamente com o HashRouter
 */
export const HashLinkWrapper: React.FC<LinkProps> = ({ to, ...props }) => {
  const location = useLocation();
  
  // Se estamos no modo de desenvolvimento (local), vamos remover o pathname
  // da URL atual para evitar duplicação
  const adjustedTo = typeof to === 'string' ? 
    to.startsWith('/') ? 
      to : 
      `/${to}` : 
    to;
    
  return <Link to={adjustedTo} {...props} />;
};

export default HashLinkWrapper; 