import React, { useState, useEffect } from 'react';
import { useHashNavigate } from '@/router/useHashNavigate';
import {
  Car,
  Search,
  Plus,
  Clock,
  Filter,
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Wrench,
  ClipboardCheck,
  RefreshCw,
  Camera,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SearchBar } from '@/components/ui/SearchBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSupabase } from '@/contexts/SupabaseContext';
import { AlertBanner } from '@/components/ui/AlertBanner';

interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  chassi: string;
  renavam: string;
  cpf_cnpj_cliente: string;
  nome_cliente: string;
  telefone_cliente: string;
  valor_fipe: number;
  oficina_id: number;
  consultor_id: string;
  nome_consultor: string;
  email_consultor: string | null;
  is_terceiro: boolean;
  status: 'aguardando' | 'em_andamento' | 'finalizado' | 'atrasado';
  data_entrada: string;
  data_saida: string | null;
  oficina: {
    nome: string;
  };
  inspection_status: 'pending' | 'approved' | 'rejected';
}

const Veiculos = () => {
  const { supabase } = useSupabase();
  const navigate = useHashNavigate();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [oficinas, setOficinas] = useState<Array<{ id: number; nome: string }>>([]);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    placa: '',
    modelo: '',
    oficina: 'todos',
    status: 'todos'
  });

  // Carregar oficinas
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar oficinas
        const { data: oficinasData, error: oficinasError } = await supabase
          .from('oficinas')
          .select('id, nome')
          .order('nome');

        if (oficinasError) throw oficinasError;
        setOficinas(oficinasData || []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados das oficinas.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [supabase]);

  const buscarVeiculos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('veiculos')
        .select(`
          *,
          oficina:oficinas (nome)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros.placa) {
        query = query.ilike('placa', `%${filtros.placa}%`);
      }
      if (filtros.modelo) {
        query = query.ilike('modelo', `%${filtros.modelo}%`);
      }
      if (filtros.oficina !== 'todos') {
        query = query.eq('oficina_id', filtros.oficina);
      }
      if (filtros.status !== 'todos') {
        query = query.eq('status', filtros.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Paginação
      const itemsPerPage = 10;
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedVeiculos = data.slice(start, end);

      setVeiculos(paginatedVeiculos);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (err) {
      console.error('Erro:', err);
      toast({
        title: "Erro ao carregar veículos",
        description: "Ocorreu um erro ao carregar os veículos. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setVeiculos([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarVeiculos();
  }, [currentPage, filtros]);

  const handleFiltroChange = (campo: string, valor: any) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setCurrentPage(1);
  };

  const handleDetalhesClick = (veiculo: Veiculo) => {
    setSelectedVeiculo(veiculo);
  };

  // Função para redirecionar para a vistoria de entrada
  const irParaVistoriaEntrada = (placa: string) => {
    navigate(`/admin/vistoria-entrada?placa=${placa}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleFiltroChange('placa', query);
  };

  // Função para calcular dias sem atualização
  const calculateDaysWithoutUpdate = (lastUpdate: string) => {
    const lastUpdateDate = new Date(lastUpdate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastUpdateDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filtrar veículos sem vistoria aprovada
  const vehiclesWithoutInspection = veiculos
    .filter(vehicle => {
      // Verifica se o veículo está com status aguardando e não tem vistoria aprovada
      return vehicle.status === 'aguardando' && vehicle.inspection_status !== 'approved';
    })
    .map(vehicle => ({
      placa: vehicle.placa,
      modelo: vehicle.modelo,
      oficina: vehicle.oficina.nome,
      lastUpdate: vehicle.data_entrada
    }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 pt-28">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Car className="h-8 w-8 mr-2" />
            Veículos
          </h1>
          <div className="space-x-4">
            <Button
              onClick={() => navigate('/admin/atualizacoes')}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizações
            </Button>
            <Button
              onClick={() => navigate('/admin/aguardando-aprovacao')}
              variant="outline"
            >
              <Clock className="h-4 w-4 mr-2" />
              Aguardando Aprovação
            </Button>
            <Button
              onClick={() => navigate('/admin/adicionar-veiculo')}
              variant="default"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Veículo
            </Button>
          </div>
        </div>

        {/* Banner de Alertas */}
        {vehiclesWithoutInspection.length > 0 && (
          <AlertBanner
            title="Veículos Aguardando Vistoria"
            description={`Existem ${vehiclesWithoutInspection.length} veículos com vistoria pendente. Por favor, realize a vistoria de entrada para liberar as atualizações.`}
            vehicles={vehiclesWithoutInspection}
          />
        )}

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Placa</Label>
              <Input
                placeholder="Buscar por placa"
                value={filtros.placa}
                onChange={(e) => handleFiltroChange('placa', e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <Label>Modelo</Label>
              <Input
                placeholder="Buscar por modelo"
                value={filtros.modelo}
                onChange={(e) => handleFiltroChange('modelo', e.target.value)}
              />
            </div>
            <div>
              <Label>Oficina</Label>
              <Select
                value={filtros.oficina}
                onValueChange={(value) => handleFiltroChange('oficina', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a oficina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {oficinas.map((oficina) => (
                    <SelectItem key={oficina.id} value={oficina.id.toString()}>
                      {oficina.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={filtros.status}
                onValueChange={(value) => handleFiltroChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="aguardando">Aguardando</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabela de Veículos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Oficina</TableHead>
                <TableHead>Consultor</TableHead>
                <TableHead>Data Entrada</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : veiculos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Nenhum veículo encontrado
                  </TableCell>
                </TableRow>
              ) : (
                veiculos.map((veiculo) => (
                  <TableRow key={veiculo.id}>
                    <TableCell>
                      <StatusBadge status={veiculo.status} />
                    </TableCell>
                    <TableCell className="font-medium">{veiculo.placa}</TableCell>
                    <TableCell>{veiculo.modelo}</TableCell>
                    <TableCell>{veiculo.nome_cliente}</TableCell>
                    <TableCell>{veiculo.oficina.nome}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{veiculo.nome_consultor}</span>
                        {veiculo.email_consultor && (
                          <span className="text-sm text-gray-500">{veiculo.email_consultor}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(veiculo.data_entrada), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDetalhesClick(veiculo)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {veiculo.status === 'aguardando' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => irParaVistoriaEntrada(veiculo.placa)}
                            className="text-yellow-600 border-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                          >
                            <ClipboardCheck className="h-4 w-4 mr-2" />
                            Realizar Vistoria
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/atualizacoes?placa=${veiculo.placa}`)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-9 w-9"
                >
                  <PaginationPrevious className="h-4 w-4" />
                </Button>
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9"
                >
                  <PaginationNext className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Veiculos; 