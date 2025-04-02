import React, { useState, useEffect } from 'react';
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
  Clock3,
  Pencil
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
  DialogDescription,
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
import { HashLinkWrapper as Link } from '@/router/HashLinkWrapper';
import { useHashNavigate } from '@/router/useHashNavigate';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
  oficina: string;
  lastUpdate: string;
  status: 'aguardando' | 'em_andamento' | 'finalizado' | 'atrasado';
  daysDelayed: number;
  inspection_status: 'pending' | 'approved' | 'rejected';
  inspection_date: string;
  chassi: string;
  renavam: string;
  cpf_cnpj_cliente: string;
  nome_cliente: string;
  telefone_cliente: string;
  valor_fipe: number;
  nome_consultor: string;
  is_terceiro: boolean;
  data_entrada: string;
  oficina_id: number;
}

interface Feedback {
  id: string;
  data: string;
  descricao: string;
  oficina: string;
  fotos: string[];
  status: 'pending' | 'approved' | 'rejected';
}

const Dashboard = () => {
  const { supabase } = useSupabase();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Vehicle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [veiculoEmEdicao, setVeiculoEmEdicao] = useState<Vehicle | null>(null);
  const [loadingEdicao, setLoadingEdicao] = useState(false);
  const [oficinas, setOficinas] = useState<Array<{ id: number; nome: string }>>([]);

  const navigate = useHashNavigate();

  // Buscar veículos do banco de dados
  const fetchVehicles = async () => {
    try {
      console.log('Iniciando busca de veículos...');
      const { data, error } = await supabase
        .from('veiculos')
        .select(`
          *,
          oficinas (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        throw error;
      }

      console.log('Dados recebidos:', data);

      // Processar os dados para o formato necessário
      const processedVehicles = data.map(vehicle => ({
        id: vehicle.id,
        placa: vehicle.placa,
        modelo: vehicle.modelo,
        oficina: vehicle.oficinas?.nome || 'Oficina não definida',
        lastUpdate: new Date(vehicle.updated_at).toLocaleDateString('pt-BR'),
        status: mapStatus(vehicle.status),
        daysDelayed: calculateDaysDelayed(vehicle.updated_at),
        inspection_status: vehicle.status || 'pending',
        inspection_date: vehicle.data_entrada || new Date().toISOString(),
        chassi: vehicle.chassi,
        renavam: vehicle.renavam,
        cpf_cnpj_cliente: vehicle.cpf_cnpj_cliente,
        nome_cliente: vehicle.nome_cliente,
        telefone_cliente: vehicle.telefone_cliente,
        valor_fipe: vehicle.valor_fipe,
        nome_consultor: vehicle.nome_consultor,
        is_terceiro: vehicle.is_terceiro,
        data_entrada: vehicle.data_entrada,
        oficina_id: vehicle.oficina_id,
      }));

      console.log('Veículos processados:', processedVehicles);
      setVehicles(processedVehicles);
      setFilteredVehicles(processedVehicles);
    } catch (error) {
      console.error('Erro completo ao buscar veículos:', error);
      toast({
        title: "Erro ao carregar veículos",
        description: "Verifique se a tabela 'veiculos' existe e está configurada corretamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar feedbacks do banco de dados
  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedFeedbacks = data.map(feedback => ({
        id: feedback.id,
        data: new Date(feedback.created_at).toLocaleDateString('pt-BR'),
        descricao: feedback.description,
        oficina: feedback.workshop,
        fotos: feedback.photos || [],
        status: feedback.status
      }));

      setFeedbacks(processedFeedbacks);
    } catch (error) {
      console.error('Erro ao buscar feedbacks:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os feedbacks.",
        variant: "destructive"
      });
    }
  };

  // Calcular dias de atraso
  const calculateDaysDelayed = (lastUpdate: string) => {
    const lastUpdateDate = new Date(lastUpdate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastUpdateDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7 ? diffDays - 7 : 0;
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchVehicles();
    fetchFeedbacks();
  }, []);

  // Atualizar dados a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVehicles();
      fetchFeedbacks();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Carregar oficinas ao montar o componente
  useEffect(() => {
    const fetchOficinas = async () => {
      try {
        const { data, error } = await supabase
          .from('oficinas')
          .select('id, nome')
          .order('nome');

        if (error) throw error;
        setOficinas(data || []);
      } catch (err) {
        console.error('Erro ao carregar oficinas:', err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de oficinas.",
          variant: "destructive"
        });
      }
    };

    fetchOficinas();
  }, [supabase]);

  // Filtrar veículos baseado na busca e status selecionado
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterVehicles(query, selectedStatus);
  };

  const filterVehicles = (query: string, status: string | null) => {
    let filtered = vehicles;

    // Aplicar filtro de status se selecionado
    if (status) {
      filtered = filtered.filter(v => v.status === status);
    }

    // Aplicar filtro de busca se houver query
    if (query) {
      filtered = filtered.filter(
        v => v.placa.toLowerCase().includes(query.toLowerCase()) || 
             v.modelo.toLowerCase().includes(query.toLowerCase()) ||
             v.oficina.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredVehicles(filtered);
  };

  // Handler para seleção no gráfico
  const handleStatusSelect = (status: string) => {
    // Mapear o nome do status do gráfico para o valor do banco
    const statusMapping: { [key: string]: string } = {
      'Aguardando Vistoria': 'aguardando',
      'Em Andamento': 'em_andamento',
      'Finalizado': 'finalizado',
      'Atrasado': 'atrasado'
    };

    const mappedStatus = statusMapping[status];
    setSelectedStatus(mappedStatus === selectedStatus ? null : mappedStatus);
    filterVehicles(searchQuery, mappedStatus === selectedStatus ? null : mappedStatus);
  };

  // Calcular estatísticas para os gráficos
  const getStatistics = () => {
    const totalVehicles = vehicles.length;
    const pendingInspection = vehicles.filter(v => v.inspection_status === 'pending').length;
    const approvedInspection = vehicles.filter(v => v.inspection_status === 'approved').length;
    const rejectedInspection = vehicles.filter(v => v.inspection_status === 'rejected').length;

    const feedbacksByWorkshop = feedbacks.reduce((acc, feedback) => {
      acc[feedback.oficina] = (acc[feedback.oficina] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const workshopData = Object.entries(feedbacksByWorkshop).map(([name, value]) => ({
      name,
      value
    }));

    // Contagem dos status reais dos veículos
    const waitingCount = vehicles.filter(v => v.status === 'aguardando').length;
    const inProgressCount = vehicles.filter(v => v.status === 'em_andamento').length;
    const completedCount = vehicles.filter(v => v.status === 'finalizado').length;
    const delayedCount = vehicles.filter(v => v.status === 'atrasado').length;

    const statusDistribution = [
      { name: 'Aguardando Vistoria', value: waitingCount, color: '#FFA500' },
      { name: 'Em Andamento', value: inProgressCount, color: '#3B82F6' },
      { name: 'Finalizado', value: completedCount, color: '#00C853' },
      { name: 'Atrasado', value: delayedCount, color: '#FF4444' }
    ];

    return {
      totalVehicles,
      pendingInspection,
      approvedInspection,
      rejectedInspection,
      workshopData,
      statusDistribution
    };
  };

  const stats = getStatistics();

  const delayedVehicles = vehicles.filter(v => v.status === 'atrasado');
  const inProgressVehicles = vehicles.filter(v => v.status === 'em_andamento');
  const completedVehicles = vehicles.filter(v => v.status === 'finalizado');
  const waitingVehicles = vehicles.filter(v => v.status === 'aguardando');
  
  const [feedbacksAprovados, setFeedbacksAprovados] = useState<Feedback[]>([]);
  const [feedbacksPendentes, setFeedbacksPendentes] = useState<Feedback[]>([]);

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

  const handleVerDetalhes = (veiculo: Vehicle) => {
    setVeiculoSelecionado(veiculo);
    setModalAberto(true);
  };

  const handleNovaAtualizacao = () => {
    // Redirecionar para a página de nova atualização com a placa pré-selecionada
    navigate(`/admin/atualizacoes?plate=${veiculoSelecionado?.placa}`);
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

  // Adicionar a função de mapeamento de status antes do return do componente
  const mapStatus = (status: string): 'aguardando' | 'em_andamento' | 'finalizado' | 'atrasado' => {
    switch (status) {
      case 'atrasado':
        return 'atrasado';
      case 'em_andamento':
        return 'em_andamento';
      case 'finalizado':
        return 'finalizado';
      default:
        return 'aguardando';
    }
  };

  const handleEditarVeiculo = (veiculo: Vehicle) => {
    setVeiculoEmEdicao(veiculo);
    setModalEdicaoAberto(true);
  };

  const handleSalvarEdicao = async () => {
    if (!veiculoEmEdicao) return;

    // Verificar se está tentando mudar o status sem vistoria aprovada
    if (veiculoEmEdicao.inspection_status !== 'approved' && 
        veiculoEmEdicao.status !== 'aguardando') {
      toast({
        title: "Atenção",
        description: "O veículo precisa ter a vistoria aprovada antes de mudar o status. Por favor, realize a vistoria primeiro.",
        variant: "destructive"
      });
      return;
    }

    setLoadingEdicao(true);
    try {
      const { error } = await supabase
        .from('veiculos')
        .update({
          placa: veiculoEmEdicao.placa,
          modelo: veiculoEmEdicao.modelo,
          chassi: veiculoEmEdicao.chassi,
          renavam: veiculoEmEdicao.renavam,
          cpf_cnpj_cliente: veiculoEmEdicao.cpf_cnpj_cliente,
          nome_cliente: veiculoEmEdicao.nome_cliente,
          telefone_cliente: veiculoEmEdicao.telefone_cliente,
          valor_fipe: veiculoEmEdicao.valor_fipe,
          nome_consultor: veiculoEmEdicao.nome_consultor,
          is_terceiro: veiculoEmEdicao.is_terceiro,
          status: veiculoEmEdicao.status,
          data_entrada: veiculoEmEdicao.data_entrada,
          oficina_id: veiculoEmEdicao.oficina_id
        })
        .eq('id', veiculoEmEdicao.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Veículo atualizado com sucesso!",
      });

      setModalEdicaoAberto(false);
      fetchVehicles(); // Recarregar os dados
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o veículo.",
        variant: "destructive"
      });
    } finally {
      setLoadingEdicao(false);
    }
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
                <Link to="/admin/relatorios">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Relatórios
                </Link>
              </Button>
              
              <Button asChild>
                <Link to="/admin/adicionar-veiculo">
                  <Car className="w-4 h-4 mr-2" />
                  Adicionar Veículo
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <Clock3 className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Aguardando Vistoria
                  </h3>
                  <p className="text-2xl font-bold text-yellow-500">
                    {waitingVehicles.length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {waitingVehicles.length > 0 
                      ? `${Math.round((waitingVehicles.length / vehicles.length) * 100)}% do total`
                      : 'Nenhum veículo aguardando'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Veículos Atrasados
                  </h3>
                  <p className="text-2xl font-bold text-red-500">
                    {delayedVehicles.length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {delayedVehicles.length > 0 
                      ? `${Math.round((delayedVehicles.length / vehicles.length) * 100)}% do total`
                      : 'Nenhum veículo atrasado'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Em Andamento
                  </h3>
                  <p className="text-2xl font-bold text-blue-500">
                    {inProgressVehicles.length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {inProgressVehicles.length > 0 
                      ? `${Math.round((inProgressVehicles.length / vehicles.length) * 100)}% do total`
                      : 'Nenhum veículo em andamento'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Finalizados
                  </h3>
                  <p className="text-2xl font-bold text-green-500">
                    {completedVehicles.length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {completedVehicles.length > 0 
                      ? `${Math.round((completedVehicles.length / vehicles.length) * 100)}% do total`
                      : 'Nenhum veículo finalizado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Feedbacks por Oficina
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.workshopData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Distribuição de Status
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      onClick={(data) => handleStatusSelect(data.name)}
                    >
                      {stats.statusDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          style={{ 
                            cursor: 'pointer',
                            filter: selectedStatus && selectedStatus !== entry.name ? 'grayscale(100%)' : 'none',
                            transition: 'filter 0.3s ease'
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} veículos`, '']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => (
                        <span className="text-sm">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-0">
                  Veículos na Base
                </h2>
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-red-50 dark:bg-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-black-500 dark:text-gray-300 uppercase tracking-wider">
                      Placa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black-500 dark:text-gray-300 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black-500 dark:text-gray-300 uppercase tracking-wider">
                      Oficina
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black-500 dark:text-gray-300 uppercase tracking-wider">
                      Vistoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black-500 dark:text-gray-300 uppercase tracking-wider">
                      Última Atualização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center">
                        Carregando...
                      </td>
                    </tr>
                  ) : filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center">
                        Nenhum veículo encontrado
                      </td>
                    </tr>
                  ) : (
                    getCurrentPageVehicles().map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black-900 dark:text-white">
                          {vehicle.placa}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black-500 dark:text-black-400">
                          {vehicle.modelo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black-500 dark:text-black-400">
                          {vehicle.oficina}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={vehicle.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={
                              vehicle.inspection_status === 'approved' 
                                ? 'default' 
                                : vehicle.inspection_status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className={
                              vehicle.inspection_status === 'approved' 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
                                : vehicle.inspection_status === 'rejected'
                                ? 'bg-red-100 text-red-800 hover:bg-red-100'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                            }
                          >
                            {vehicle.inspection_status === 'approved' 
                              ? 'Aprovado' 
                              : vehicle.inspection_status === 'rejected'
                              ? 'Rejeitado'
                              : 'Pendente'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black-500 dark:text-black-400">
                          {vehicle.lastUpdate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black-500 dark:text-black-400">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerDetalhes(vehicle)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditarVeiculo(vehicle)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNovaAtualizacao()}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Paginação */}
            {!loading && filteredVehicles.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
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
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Modal de Detalhes */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Veículo</DialogTitle>
            <DialogDescription>
              Visualize todas as informações do veículo selecionado
            </DialogDescription>
          </DialogHeader>
          {veiculoSelecionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Placa</h4>
                  <p>{veiculoSelecionado.placa}</p>
                </div>
                <div>
                  <h4 className="font-medium">Modelo</h4>
                  <p>{veiculoSelecionado.modelo}</p>
                </div>
                <div>
                  <h4 className="font-medium">Oficina</h4>
                  <p>{veiculoSelecionado.oficina}</p>
                </div>
                <div>
                  <h4 className="font-medium">Status</h4>
                  <StatusBadge status={veiculoSelecionado.status} />
                </div>
                <div>
                  <h4 className="font-medium">Status da Vistoria</h4>
                  <Badge 
                    variant={
                      veiculoSelecionado.inspection_status === 'approved' 
                        ? 'default' 
                        : veiculoSelecionado.inspection_status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className={
                      veiculoSelecionado.inspection_status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
                        : veiculoSelecionado.inspection_status === 'rejected'
                        ? 'bg-red-100 text-red-800 hover:bg-red-100'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                    }
                  >
                    {veiculoSelecionado.inspection_status === 'approved' 
                      ? 'Aprovado' 
                      : veiculoSelecionado.inspection_status === 'rejected'
                      ? 'Rejeitado'
                      : 'Pendente'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium">Data da Vistoria</h4>
                  <p>{new Date(veiculoSelecionado.inspection_date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setModalAberto(false)}>
                  Fechar
                </Button>
                <Button onClick={handleNovaAtualizacao}>
                  Nova Atualização
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={modalEdicaoAberto} onOpenChange={setModalEdicaoAberto}>
        <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle>Editar Veículo</DialogTitle>
            <DialogDescription>
              Faça alterações nas informações do veículo. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          {veiculoEmEdicao && (
            <div className="flex-1 overflow-y-auto py-4">
              {veiculoEmEdicao.inspection_status !== 'approved' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Atenção:</strong> Este veículo precisa ter a vistoria aprovada antes de poder mudar o status. 
                      Por favor, realize a vistoria primeiro.
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Placa</Label>
                  <Input
                    value={veiculoEmEdicao.placa}
                    onChange={(e) => setVeiculoEmEdicao({...veiculoEmEdicao, placa: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Modelo</Label>
                  <Input
                    value={veiculoEmEdicao.modelo}
                    onChange={(e) => setVeiculoEmEdicao({...veiculoEmEdicao, modelo: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Chassi</Label>
                  <Input
                    value={veiculoEmEdicao.chassi}
                    onChange={(e) => setVeiculoEmEdicao({...veiculoEmEdicao, chassi: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Renavam</Label>
                  <Input
                    value={veiculoEmEdicao.renavam}
                    onChange={(e) => setVeiculoEmEdicao({...veiculoEmEdicao, renavam: e.target.value})}
                  />
                </div>
                <div>
                  <Label>CPF/CNPJ do Cliente</Label>
                  <Input
                    value={veiculoEmEdicao.cpf_cnpj_cliente}
                    onChange={(e) => setVeiculoEmEdicao({...veiculoEmEdicao, cpf_cnpj_cliente: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Nome do Cliente</Label>
                  <Input
                    value={veiculoEmEdicao.nome_cliente}
                    onChange={(e) => setVeiculoEmEdicao({...veiculoEmEdicao, nome_cliente: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Telefone do Cliente</Label>
                  <Input
                    value={veiculoEmEdicao.telefone_cliente}
                    onChange={(e) => setVeiculoEmEdicao({...veiculoEmEdicao, telefone_cliente: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Valor FIPE</Label>
                  <Input
                    type="number"
                    value={veiculoEmEdicao.valor_fipe}
                    onChange={(e) => setVeiculoEmEdicao({...veiculoEmEdicao, valor_fipe: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Nome do Consultor</Label>
                  <Input
                    value={veiculoEmEdicao.nome_consultor}
                    onChange={(e) => setVeiculoEmEdicao({...veiculoEmEdicao, nome_consultor: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Oficina</Label>
                  <Select
                    value={veiculoEmEdicao.oficina_id.toString()}
                    onValueChange={(value) => setVeiculoEmEdicao({...veiculoEmEdicao, oficina_id: Number(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {oficinas.map((oficina) => (
                        <SelectItem key={oficina.id} value={oficina.id.toString()}>
                          {oficina.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Terceiro</Label>
                  <Select
                    value={veiculoEmEdicao.is_terceiro ? "true" : "false"}
                    onValueChange={(value) => setVeiculoEmEdicao({...veiculoEmEdicao, is_terceiro: value === "true"})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={veiculoEmEdicao.status}
                    onValueChange={(value) => setVeiculoEmEdicao({...veiculoEmEdicao, status: value as Vehicle['status']})}
                    disabled={veiculoEmEdicao.inspection_status !== 'approved'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aguardando">Aguardando Vistoria</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                      <SelectItem value="atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                  {veiculoEmEdicao.inspection_status !== 'approved' && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                      Status bloqueado até a vistoria ser aprovada
                    </p>
                  )}
                </div>
                <div>
                  <Label>Data de Entrada</Label>
                  <Input
                    type="date"
                    value={veiculoEmEdicao.data_entrada.split('T')[0]}
                    onChange={(e) => setVeiculoEmEdicao({...veiculoEmEdicao, data_entrada: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex-none border-t pt-4">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setModalEdicaoAberto(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSalvarEdicao} 
                disabled={loadingEdicao || (veiculoEmEdicao?.inspection_status !== 'approved' && veiculoEmEdicao?.status !== 'aguardando')}
              >
                {loadingEdicao ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
