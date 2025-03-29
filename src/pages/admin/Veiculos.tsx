import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Trash2
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

interface Veiculo {
  placa: string;
  modelo: string;
  oficina: string;
  ultimoFeedback: string | null;
  atrasado: boolean;
  consultor: string;
  possuiVistoriaEntrada: boolean;
  dataEntrada: string;
}

interface FeedbackHistorico {
  data: string;
  descricao: string;
  consultor: string;
  status: string;
}

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  workshop: string;
  lastUpdate: string;
  status: 'inprogress' | 'delayed' | 'completed';
  daysDelayed: number;
}

const veiculosTeste: Veiculo[] = [
  {
    placa: "ABC1234",
    modelo: "Toyota Corolla",
    oficina: "Oficina Central",
    ultimoFeedback: "22/02/2024",
    atrasado: false,
    consultor: "João Silva",
    possuiVistoriaEntrada: true,
    dataEntrada: "20/02/2024"
  },
  {
    placa: "DEF5678",
    modelo: "Honda Civic",
    oficina: "Oficina Sul",
    ultimoFeedback: "15/02/2024",
    atrasado: true,
    consultor: "Maria Santos",
    possuiVistoriaEntrada: false,
    dataEntrada: ""
  },
  {
    placa: "GHI9012",
    modelo: "Volkswagen Golf",
    oficina: "Oficina Norte",
    ultimoFeedback: "20/02/2024",
    atrasado: false,
    consultor: "Pedro Oliveira",
    possuiVistoriaEntrada: true,
    dataEntrada: "18/02/2024"
  },
  {
    placa: "JKL3456",
    modelo: "Fiat Pulse",
    oficina: "Oficina Central",
    ultimoFeedback: "10/02/2024",
    atrasado: true,
    consultor: "João Silva",
    possuiVistoriaEntrada: false,
    dataEntrada: ""
  },
  {
    placa: "MNO7890",
    modelo: "Chevrolet Onix",
    oficina: "Oficina Sul",
    ultimoFeedback: "18/02/2024",
    atrasado: false,
    consultor: "Maria Santos",
    possuiVistoriaEntrada: true,
    dataEntrada: "15/02/2024"
  }
];

const historicoTeste: FeedbackHistorico[] = [
  {
    data: "22/02/2024",
    descricao: "Troca de óleo realizada. Veículo em bom estado.",
    consultor: "João Silva",
    status: "Concluído"
  },
  {
    data: "15/02/2024",
    descricao: "Aguardando peças para substituição do filtro de ar.",
    consultor: "Maria Santos",
    status: "Pendente"
  },
  {
    data: "10/02/2024",
    descricao: "Inspeção inicial realizada. Necessária manutenção no sistema de freios.",
    consultor: "Pedro Oliveira",
    status: "Em Andamento"
  }
];

const mockVehicles: Vehicle[] = [
  { id: '1', plate: 'ABC1234', model: 'Toyota Corolla', workshop: 'Oficina Central', lastUpdate: '28/03/2023', status: 'inprogress' as const, daysDelayed: 0 },
  { id: '2', plate: 'DEF5678', model: 'Honda Civic', workshop: 'Oficina Sul', lastUpdate: '20/03/2023', status: 'delayed' as const, daysDelayed: 4 },
  { id: '3', plate: 'GHI9012', model: 'Volkswagen Golf', workshop: 'Oficina Norte', lastUpdate: '25/03/2023', status: 'inprogress' as const, daysDelayed: 0 },
  { id: '4', plate: 'JKL3456', model: 'Fiat Pulse', workshop: 'Oficina Central', lastUpdate: '18/03/2023', status: 'delayed' as const, daysDelayed: 6 },
  { id: '5', plate: 'MNO7890', model: 'Jeep Compass', workshop: 'Oficina Leste', lastUpdate: '26/03/2023', status: 'inprogress' as const, daysDelayed: 0 },
  { id: '6', plate: 'PQR1234', model: 'Chevrolet Onix', workshop: 'Oficina Oeste', lastUpdate: '27/03/2023', status: 'inprogress' as const, daysDelayed: 0 },
  { id: '7', plate: 'STU5678', model: 'Hyundai HB20', workshop: 'Oficina Sul', lastUpdate: '15/03/2023', status: 'completed' as const, daysDelayed: 0 },
  { id: '8', plate: 'VWX9012', model: 'Renault Kwid', workshop: 'Oficina Norte', lastUpdate: '10/03/2023', status: 'completed' as const, daysDelayed: 0 },
];

const Veiculos = () => {
  const navigate = useNavigate();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [historicoFeedbacks, setHistoricoFeedbacks] = useState<FeedbackHistorico[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(mockVehicles);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    placa: '',
    modelo: '',
    oficina: '',
    dataUltimoFeedback: null as Date | null,
    atrasado: '',
    consultor: ''
  });

  const buscarVeiculos = async () => {
    setLoading(true);
    try {
      // Simulando delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filtragem local dos dados de teste
      let veiculosFiltrados = veiculosTeste.filter(veiculo => {
        const matchPlaca = veiculo.placa.toLowerCase().includes(filtros.placa.toLowerCase());
        const matchModelo = veiculo.modelo.toLowerCase().includes(filtros.modelo.toLowerCase());
        const matchOficina = !filtros.oficina || filtros.oficina === 'todas' || veiculo.oficina.toLowerCase().includes(filtros.oficina.toLowerCase());
        const matchAtrasado = !filtros.atrasado || filtros.atrasado === 'todos' || veiculo.atrasado.toString() === filtros.atrasado;
        const matchConsultor = !filtros.consultor || filtros.consultor === 'todos' || veiculo.consultor.toLowerCase().includes(filtros.consultor.toLowerCase());
        
        return matchPlaca && matchModelo && matchOficina && matchAtrasado && matchConsultor;
      });

      // Paginação simulada
      const itemsPerPage = 5;
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedVeiculos = veiculosFiltrados.slice(start, end);

      setVeiculos(paginatedVeiculos);
      setTotalPages(Math.ceil(veiculosFiltrados.length / itemsPerPage));
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

  const buscarHistoricoFeedbacks = async (placa: string) => {
    try {
      // Simulando delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Retornando dados de teste
      setHistoricoFeedbacks(historicoTeste);
    } catch (err) {
      console.error('Erro:', err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      });
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
    buscarHistoricoFeedbacks(veiculo.placa);
  };

  // Filtrar os veículos sem vistoria para exibir um alerta
  const veiculosSemVistoria = veiculos.filter(v => !v.possuiVistoriaEntrada);

  // Função para redirecionar para a vistoria de entrada
  const irParaVistoriaEntrada = (placa: string) => {
    navigate(`/admin/vistoria-entrada?placa=${placa}`);
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

  const handleVerDetalhes = (id: string) => {
    // Implementar visualização de detalhes
    toast({
      title: "Visualizar detalhes",
      description: "Funcionalidade em desenvolvimento.",
    });
  };

  const handleEditar = (id: string) => {
    // Implementar edição
    toast({
      title: "Editar veículo",
      description: "Funcionalidade em desenvolvimento.",
    });
  };

  const handleExcluir = (id: string) => {
    // Implementar exclusão
    toast({
      title: "Excluir veículo",
      description: "Funcionalidade em desenvolvimento.",
    });
  };

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

        {/* Alerta de veículos sem vistoria */}
        {veiculosSemVistoria.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Atenção! {veiculosSemVistoria.length} veículo(s) aguardando vistoria de entrada
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>Os seguintes veículos precisam passar pela vistoria de entrada antes de iniciar as atualizações:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {veiculosSemVistoria.map(v => (
                      <li key={v.placa}>
                        <button 
                          onClick={() => irParaVistoriaEntrada(v.placa)}
                          className="underline hover:text-amber-900 font-medium"
                        >
                          {v.placa} - {v.modelo}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
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
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="central">Oficina Central</SelectItem>
                  <SelectItem value="sul">Oficina Sul</SelectItem>
                  <SelectItem value="norte">Oficina Norte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data do último feedback</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {filtros.dataUltimoFeedback ? (
                      format(filtros.dataUltimoFeedback, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filtros.dataUltimoFeedback}
                    onSelect={(date) => handleFiltroChange('dataUltimoFeedback', date)}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Status de atraso</Label>
              <Select
                value={filtros.atrasado}
                onValueChange={(value) => handleFiltroChange('atrasado', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="true">Atrasado</SelectItem>
                  <SelectItem value="false">Em dia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Consultor</Label>
              <Select
                value={filtros.consultor}
                onValueChange={(value) => handleFiltroChange('consultor', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o consultor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="joao">João Silva</SelectItem>
                  <SelectItem value="maria">Maria Santos</SelectItem>
                  <SelectItem value="pedro">Pedro Oliveira</SelectItem>
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
                <TableHead>Oficina</TableHead>
                <TableHead>Data Entrada</TableHead>
                <TableHead>Último Feedback</TableHead>
                <TableHead>Consultor</TableHead>
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
                  <TableRow 
                    key={veiculo.placa}
                    className={!veiculo.possuiVistoriaEntrada ? "bg-amber-50 hover:bg-amber-100" : ""}
                  >
                    <TableCell>
                      {!veiculo.possuiVistoriaEntrada ? (
                        <Badge 
                          variant="outline"
                          className="bg-amber-100 text-amber-800 hover:bg-amber-100 hover:text-amber-800 border-amber-200 whitespace-nowrap"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Aguardando Vistoria
                        </Badge>
                      ) : veiculo.atrasado ? (
                        <Badge variant="destructive">
                          Atrasado
                        </Badge>
                      ) : (
                        <Badge 
                          variant="outline"
                          className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200"
                        >
                          Em dia
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {!veiculo.possuiVistoriaEntrada ? (
                        <button
                          onClick={() => irParaVistoriaEntrada(veiculo.placa)}
                          className="underline text-amber-700 hover:text-amber-900"
                        >
                          {veiculo.placa}
                        </button>
                      ) : (
                        veiculo.placa
                      )}
                    </TableCell>
                    <TableCell>{veiculo.modelo}</TableCell>
                    <TableCell>{veiculo.oficina}</TableCell>
                    <TableCell>{veiculo.dataEntrada}</TableCell>
                    <TableCell>
                      {veiculo.ultimoFeedback || (
                        <span className="text-gray-400 italic text-sm">Sem feedbacks</span>
                      )}
                    </TableCell>
                    <TableCell>{veiculo.consultor}</TableCell>
                    <TableCell>
                      {!veiculo.possuiVistoriaEntrada ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800 hover:border-amber-300"
                          onClick={() => irParaVistoriaEntrada(veiculo.placa)}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Realizar Vistoria
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDetalhesClick(veiculo)}
                        >
                          <Info className="h-4 w-4 mr-2" />
                          Detalhes
                        </Button>
                      )}
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