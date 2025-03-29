import { useNavigate } from 'react-router-dom';

/**
 * Hook customizado para navegação com HashRouter
 * Garante que as navegações funcionem corretamente sem duplicar o caminho
 */
export const useHashNavigate = () => {
  const navigate = useNavigate();
  
  return (path: string, options?: any) => {
    // Ajustar o caminho para garantir que não haja duplicação
    const adjustedPath = path.startsWith('/') ? path : `/${path}`;
    return navigate(adjustedPath, options);
  };
};

export default useHashNavigate; 