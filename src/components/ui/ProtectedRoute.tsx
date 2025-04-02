import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from '@/hooks/use-toast';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useSupabase();
  const location = useLocation();

  useEffect(() => {
    // Mostrar toast apenas quando o usuário tenta acessar rota protegida sem estar logado
    // e já não estamos redirecionando ou carregando
    if (!loading && !user) {
      toast({
        title: "Acesso Restrito",
        description: "Você precisa fazer login para acessar esta área.",
        variant: "destructive",
        action: (
          <div className="flex items-center">
            <ShieldAlert className="h-5 w-5 mr-2" />
            Área Protegida
          </div>
        )
      });
    }
  }, [loading, user]);

  // Se estiver carregando, exibe um spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-blue-500"></div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para a página de login
  if (!user) {
    // Salva a localização atual para redirecionar de volta após login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Se estiver autenticado, renderiza os filhos
  return <>{children}</>;
};

export default ProtectedRoute; 