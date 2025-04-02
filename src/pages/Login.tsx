import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { LogIn, LockKeyhole, Mail, UserCircle2, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LocationState {
  from?: string;
}

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, loading, error } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const from = state?.from || '/admin/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: 'Login bem-sucedido',
          description: 'Você foi autenticado com sucesso!',
        });
        navigate(from);
      } else {
        await signUp(email, password);
        toast({
          title: 'Conta criada com sucesso',
          description: 'Sua conta foi criada! Você já pode fazer login.',
          variant: "default",
          action: (
            <div className="flex items-center text-green-500">
              <CheckCircle className="h-5 w-5 mr-2" />
              Bem-vindo(a)!
            </div>
          )
        });
        
        // Alternar para o formulário de login após o cadastro bem-sucedido
        setIsLogin(true);
      }
    } catch (err) {
      console.error('Erro na autenticação:', err);
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(https://images7.alphacoders.com/117/1170706.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay escuro para melhorar a legibilidade */}
      <div className="absolute inset-0 bg-black/50" />
      
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center">
            <UserCircle2 className="mr-2 h-6 w-6" />
            {isLogin ? 'Login' : 'Criar Conta'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Entre com suas credenciais para acessar o FeedBack Ativo'
              : 'Crie uma nova conta para acessar o FeedBack Ativo'}
          </CardDescription>
          
          {from !== '/admin/dashboard' && isLogin && (
            <Alert className="mt-4 bg-blue-50 border-blue-100 text-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertTitle>Acesso Restrito</AlertTitle>
              <AlertDescription>
                Você precisa fazer login para acessar a área solicitada.
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro de autenticação</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  Email
                </div>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                <div className="flex items-center">
                  <LockKeyhole className="h-4 w-4 mr-2 text-gray-500" />
                  Senha
                </div>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {loading
                ? isLogin ? 'Entrando...' : 'Criando conta...'
                : isLogin ? 'Entrar' : 'Criar conta'}
            </Button>

            <Button 
            asChild variant="outline"
            className="w-full" 
            >
                <Link to="/">
                  Home
                </Link>

           </Button>

            <div className="text-center text-sm">
              {isLogin ? (
                <p>
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setIsLogin(false)}
                  >
                    Criar conta
                  </button>
                </p>
              ) : (
                <p>
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setIsLogin(true)}
                  >
                    Entrar
                  </button>


                </p>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login; 