import React, { useState } from 'react';
import { 
  Car, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  Plus,
  Eye,
  FileText,
  Clock3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SearchBar } from '@/components/ui/SearchBar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  workshop: string;
  lastUpdate: string;
  status: 'inprogress' | 'delayed' | 'completed';
  daysDelayed: number;
}

interface Feedback {
  id: string;
  data: string;
  descricao: string;
  oficina: string;
  fotos: string[];
}

const mockVehicles = [
  { id: '1', plate: 'ABC1234', model: 'Toyota Corolla', workshop: 'Oficina Central', lastUpdate: '28/03/2023', status: 'inprogress' as const, daysDelayed: 0 },
  { id: '2', plate: 'DEF5678', model: 'Honda Civic', workshop: 'Oficina Sul', lastUpdate: '20/03/2023', status: 'delayed' as const, daysDelayed: 4 },
  { id: '3', plate: 'GHI9012', model: 'Volkswagen Golf', workshop: 'Oficina Norte', lastUpdate: '25/03/2023', status: 'inprogress' as const, daysDelayed: 0 },
  { id: '4', plate: 'JKL3456', model: 'Fiat Pulse', workshop: 'Oficina Central', lastUpdate: '18/03/2023', status: 'delayed' as const, daysDelayed: 6 },
  { id: '5', plate: 'MNO7890', model: 'Jeep Compass', workshop: 'Oficina Leste', lastUpdate: '26/03/2023', status: 'inprogress' as const, daysDelayed: 0 },
  { id: '6', plate: 'PQR1234', model: 'Chevrolet Onix', workshop: 'Oficina Oeste', lastUpdate: '27/03/2023', status: 'inprogress' as const, daysDelayed: 0 },
  { id: '7', plate: 'STU5678', model: 'Hyundai HB20', workshop: 'Oficina Sul', lastUpdate: '15/03/2023', status: 'completed' as const, daysDelayed: 0 },
  { id: '8', plate: 'VWX9012', model: 'Renault Kwid', workshop: 'Oficina Norte', lastUpdate: '10/03/2023', status: 'completed' as const, daysDelayed: 0 },
];

// Mock data para feedbacks
const mockFeedbacksAprovados: Feedback[] = [
  {
    id: '1',
    data: '2024-03-25',
    descricao: 'Troca de óleo e filtros realizada com sucesso.',
    oficina: 'Oficina Central',
    fotos: ['foto1.jpg', 'foto2.jpg']
  },
  {
    id: '2',
    data: '2024-03-20',
    descricao: 'Alinhamento e balanceamento concluídos.',
    oficina: 'Oficina Sul',
    fotos: ['foto3.jpg']
  }
];

const mockFeedbacksPendentes: Feedback[] = [
  {
    id: '3',
    data: '2024-03-28',
    descricao: 'Reparo na suspensão finalizado, aguardando aprovação.',
    oficina: 'Oficina Norte',
    fotos: ['foto4.jpg', 'foto5.jpg']
  }
];

// Dados para o gráfico de barras
const feedbacksPorOficina = [
  { name: 'Oficina Central', feedbacks: 65 },
  { name: 'Oficina Sul', feedbacks: 45 },
  { name: 'Oficina Norte', feedbacks: 38 },
  { name: 'Oficina Leste', feedbacks: 28 },
  { name: 'Oficina Oeste', feedbacks: 22 },
];

// Dados para o gráfico de pizza
const distribuicaoStatus = [
  { name: 'Em Andamento', value: 45, color: '#FFA500' },
  { name: 'Atrasados', value: 15, color: '#FF4444' },
  { name: 'Finalizados', value: 40, color: '#00C853' },
];

const Dashboard = () => {
  const delayedVehicles = mockVehicles.filter(v => v.status === 'delayed');
  const inProgressVehicles = mockVehicles.filter(v => v.status === 'inprogress');
  const completedVehicles = mockVehicles.filter(v => v.status === 'completed');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(mockVehicles);
  
  const [modalAberto, setModalAberto] = useState(false);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Vehicle | null>(null);
  const [feedbacksAprovados, setFeedbacksAprovados] = useState<Feedback[]>(mockFeedbacksAprovados);
  const [feedbacksPendentes, setFeedbacksPendentes] = useState<Feedback[]>(mockFeedbacksPendentes);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  // Obter veículos da página atual
  const getCurrentPageVehicles = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVehicles.slice(startIndex, endIndex);
  };

  // Gerar array de páginas para navegação
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Handler para mudança de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setFilteredVehicles(
        mockVehicles.filter(
          v => v.plate.toLowerCase().includes(query.toLowerCase()) || 
               v.model.toLowerCase().includes(query.toLowerCase()) ||
               v.workshop.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      setFilteredVehicles(mockVehicles);
    }
  };

  const handleVerDetalhes = (veiculo: Vehicle) => {
    setVeiculoSelecionado(veiculo);
    setModalAberto(true);
  };

  const handleNovaAtualizacao = () => {
    // Redirecionar para a página de nova atualização com a placa pré-selecionada
    window.location.href = `#/admin/atualizacoes?plate=${veiculoSelecionado?.plate}`;
  };

  const handleAprovarFeedback = (id: string) => {
    const feedbackParaAprovar = feedbacksPendentes.find(f => f.id === id);
    if (feedbackParaAprovar) {
      setFeedbacksAprovados([...feedbacksAprovados, feedbackParaAprovar]);
      setFeedbacksPendentes(feedbacksPendentes.filter(f => f.id !== id));
      toast({
        title: "Feedback aprovado",
        description: "O feedback foi aprovado e está disponível para consulta.",
      });
    }
  };

  const handleRejeitarFeedback = (id: string) => {
    setFeedbacksPendentes(feedbacksPendentes.filter(f => f.id !== id));
    toast({
      title: "Feedback rejeitado",
      description: "O feedback foi rejeitado e será removido da lista.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Gestão de veículos e acompanhamento de feedbacks
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button asChild variant="outline">
                <a href="/admin/relatorios">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Relatórios
                </a>
              </Button>

              <Button asChild>
                <a href="/admin/adicionar-veiculo">
                  <Car className="w-4 h-4 mr-2" />
                  Adicionar Veículo
                </a>
              </Button>


            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <AlertCircle className="w-6 h-6 text-status-delayed" />
                </div>
                
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Veículos com Atraso</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{delayedVehicles.length}</h3>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {delayedVehicles.length > 0 
                    ? `${Math.round((delayedVehicles.length / mockVehicles.length) * 100)}% do total`
                    : 'Nenhum veículo atrasado'}
                </p>
                
                <Button asChild variant="ghost" size="sm" className="text-xs">
                  <a href="#/admin/relatorios">
                    Ver detalhes
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-status-inprogress" />
                </div>
                
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Em Andamento</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{inProgressVehicles.length}</h3>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {inProgressVehicles.length > 0 
                    ? `${Math.round((inProgressVehicles.length / mockVehicles.length) * 100)}% do total`
                    : 'Nenhum veículo em andamento'}
                </p>
                
                <Button asChild variant="ghost" size="sm" className="text-xs">
                  <a href="#/admin/atualizacoes">
                    Atualizar
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-status-completed" />
                </div>
                
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Finalizados</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{completedVehicles.length}</h3>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {completedVehicles.length > 0 
                    ? `${Math.round((completedVehicles.length / mockVehicles.length) * 100)}% do total`
                    : 'Nenhum veículo finalizado'}
                </p>
                
                <Button asChild variant="ghost" size="sm" className="text-xs">
                  <a href="#/admin/relatorios">
                    Ver detalhes
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Feedbacks por Oficina
                </h3>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feedbacksPorOficina}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="feedbacks" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2" />
                  Distribuição de Status
                </h3>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribuicaoStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distribuicaoStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 md:mb-0">
                Veículos em Sinistro
              </h3>
              
              <SearchBar 
                placeholder="Buscar por placa, modelo ou oficina" 
                onSearch={handleSearch}
                className="max-w-md"
              />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                <thead className="text-xs text-gray-600 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Placa</th>
                    <th scope="col" className="px-6 py-3">Modelo</th>
                    <th scope="col" className="px-6 py-3">Oficina</th>
                    <th scope="col" className="px-6 py-3">Última Atualização</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Dias em Atraso</th>
                    <th scope="col" className="px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageVehicles().map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-6 py-4 font-medium">{vehicle.plate}</td>
                      <td className="px-6 py-4">{vehicle.model}</td>
                      <td className="px-6 py-4">{vehicle.workshop}</td>
                      <td className="px-6 py-4">{vehicle.lastUpdate}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={vehicle.status} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        {vehicle.status === 'delayed' ? (
                          <span className="text-status-delayed font-medium">{vehicle.daysDelayed} dias</span>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => handleVerDetalhes(vehicle)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhum veículo encontrado na busca.
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} de {filteredVehicles.length} veículos
                </p>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Modal de Detalhes */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Car className="h-6 w-6" />
              <span>
                Detalhes do Veículo - {veiculoSelecionado?.plate}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Modelo</p>
                <p className="font-medium">{veiculoSelecionado?.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Oficina</p>
                <p className="font-medium">{veiculoSelecionado?.workshop}</p>
              </div>
            </div>

            <Button onClick={handleNovaAtualizacao} className="mb-6">
              <Plus className="h-4 w-4 mr-2" />
              Nova Atualização
            </Button>

            <Tabs defaultValue="aprovados" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="aprovados" className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Feedbacks Aprovados
                </TabsTrigger>
                <TabsTrigger value="pendentes" className="flex items-center">
                  <Clock3 className="h-4 w-4 mr-2" />
                  Aguardando Aprovação
                </TabsTrigger>
              </TabsList>

              <TabsContent value="aprovados">
                <div className="space-y-4">
                  {feedbacksAprovados.length > 0 ? (
                    feedbacksAprovados.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {new Date(feedback.data).toLocaleDateString()}
                            </span>
                          </div>
                          <Badge variant="outline">{feedback.oficina}</Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {feedback.descricao}
                        </p>
                        <div className="text-sm text-gray-500">
                          {feedback.fotos.length} foto(s) anexada(s)
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum feedback aprovado encontrado.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pendentes">
                <div className="space-y-4">
                  {feedbacksPendentes.length > 0 ? (
                    feedbacksPendentes.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">
                              {new Date(feedback.data).toLocaleDateString()}
                            </span>
                          </div>
                          <Badge variant="outline">{feedback.oficina}</Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {feedback.descricao}
                        </p>
                        <div className="text-sm text-gray-500 mb-3">
                          {feedback.fotos.length} foto(s) anexada(s)
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleAprovarFeedback(feedback.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRejeitarFeedback(feedback.id)}
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum feedback aguardando aprovação.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Dashboard;
