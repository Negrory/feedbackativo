import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ClipboardCheck, BarChart3, Search, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Index = () => {
  const { user } = useSupabase();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-20 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent dark:from-gray-900 dark:to-gray-900/50 z-0" />
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Acompanhe o Status do Seu Veículo em Tempo Real
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Receba atualizações semanais sobre o progresso dos reparos do seu veículo.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2 custom-button">
                  <Link to="/consulta">
                    <Search className="w-5 h-5" />
                    Consultar Veículo
                  </Link>
                </Button>
              </div>
            </div>
          </div>

        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Como Funciona o Sistema de Feedback Ativo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
                <div className="bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Car className="w-6 h-6 text-red-600" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Rastreamento de Veículos
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300">
                  Acompanhe o status do seu veículo através da placa ou CPF e veja o progresso dos reparos em tempo real.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
                <div className="bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-6 h-6 text-red-600" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Atualizações Semanais
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300">
                  Receba relatórios detalhados e fotos sobre o andamento dos reparos, com informações claras e objetivas.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
                <div className="bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-red-600" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Gestão Transparente
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300">
                  Acompanhe a evolução de todos os veículos com relatórios completos, facilitando o trabalho de oficinas e administradores.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Acesse o Status do Seu Veículo Agora!
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Obtenha informações atualizadas sobre o reparo do seu veículo de forma simples e rápida, em qualquer lugar.
            </p>
            
            <Button asChild size="lg" className="gap-2 custom-button">
              <Link to="/consulta">
                <Search className="w-5 h-5" />
                Consultar Agora
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
