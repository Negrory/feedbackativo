import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type SupabaseContextType = {
  user: User | null;
  session: Session | null;
  supabase: SupabaseClient;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase deve ser usado dentro de um SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erro ao verificar sessão:', error.message);
      } else {
        setSession(data.session);
        setUser(data.session?.user || null);
      }
      setLoading(false);
    };

    getSession();

    // Configurar listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setSession(data.session);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
      console.error('Erro de login:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Se email de confirmação estiver habilitado, avisa o usuário
        if (!data.session) {
          setError('Verifique seu email para confirmar o cadastro');
        } else {
          setSession(data.session);
          setUser(data.user);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
      console.error('Erro de cadastro:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      setSession(null);
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao sair');
      console.error('Erro ao sair:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    supabase,
    signIn,
    signUp,
    signOut,
    loading,
    error,
  };

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}; 