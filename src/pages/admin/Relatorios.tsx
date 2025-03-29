import React, { useState, useEffect } from 'react';
import { useHashNavigate } from '@/router/useHashNavigate';
import {
  BarChart3, 
  PieChart, 
  Calendar, 
  Car, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Filter, 
  ChevronDown,
  FileText,
  TrendingUp,
  Tag,
  Clipboard
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Tipos de dados
interface VeiculoFinalizado {
  placa: string;
  modelo: string;
  oficina: string;
  dataEntrada: string;
  dataFinalizacao: string;
  diasReparo: number;
  consultor: string;
  valorTotal: number;
}

interface VeiculoAtrasado {
  placa: string;
  modelo: string;
  oficina: string;
  diasAtraso: number;
  proximaEtapa: string;
  motivoAtraso: string;
  consultor: string;
}

// Dados de teste para veículos finalizados
const veiculosFinalizadosTeste: VeiculoFinalizado[] = [
  {
    placa: "ABC1234",
    modelo: "Toyota Corolla",
    oficina: "Oficina Central",
    dataEntrada: "10/02/2024",
    dataFinalizacao: "28/02/2024",
    diasReparo: 18,
    consultor: "João Silva",
    valorTotal: 3500.00
  },
  {
    placa: "DEF5678",
    modelo: "Honda Civic",
    oficina: "Oficina Sul",
    dataEntrada: "05/03/2024",
    dataFinalizacao: "20/03/2024",
    diasReparo: 15,
    consultor: "Maria Santos",
    valorTotal: 2800.00
  },
  {
    placa: "GHI9012",
    modelo: "Volkswagen Golf",
    oficina: "Oficina Norte",
    dataEntrada: "12/03/2024",
    dataFinalizacao: "05/04/2024",
    diasReparo: 24,
    consultor: "Pedro Oliveira",
    valorTotal: 4200.00
  },
  {
    placa: "JKL3456",
    modelo: "Hyundai HB20",
    oficina: "Oficina Central",
    dataEntrada: "20/03/2024",
    dataFinalizacao: "15/04/2024",
    diasReparo: 26,
    consultor: "João Silva",
    valorTotal: 3100.00
  },
  {
    placa: "MNO7890",
    modelo: "Chevrolet Onix",
    oficina: "Oficina Sul",
    dataEntrada: "01/04/2024",
    dataFinalizacao: "20/04/2024",
    diasReparo: 19,
    consultor: "Maria Santos",
    valorTotal: 2500.00
  }
];

// Dados de teste para veículos atrasados
const veiculosAtrasadosTeste: VeiculoAtrasado[] = [
  {
    placa: "PQR1234",
    modelo: "Fiat Pulse",
    oficina: "Oficina Central",
    diasAtraso: 5,
    proximaEtapa: "Pintura",
    motivoAtraso: "Aguardando peças",
    consultor: "João Silva"
  },
  {
    placa: "STU5678",
    modelo: "Jeep Renegade",
    oficina: "Oficina Norte",
    diasAtraso: 8,
    proximaEtapa: "Montagem",
    motivoAtraso: "Falta de mão-de-obra especializada",
    consultor: "Pedro Oliveira"
  },
  {
    placa: "VWX9012",
    modelo: "Nissan Kicks",
    oficina: "Oficina Sul",
    diasAtraso: 3,
    proximaEtapa: "Funilaria",
    motivoAtraso: "Atraso na aprovação do orçamento",
    consultor: "Maria Santos"
  }
];

const Relatorios = () => {
  const navigate = useHashNavigate();
  
  // Estado para controle de filtros
  const [filtroData, setFiltroData] = useState('mes');
  const [filtroOficina, setFiltroOficina] = useState('todas');
  
  // Estados para armazenar dados
  const [veiculosFinalizados, setVeiculosFinalizados] = useState<VeiculoFinalizado[]>([]);
  const [veiculosAtrasados, setVeiculosAtrasados] = useState<VeiculoAtrasado[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Métricas calculadas
  const [metricas, setMetricas] = useState({
    totalFinalizados: 0,
    mediaTempoFinalizacao: 0,
    totalAtrasados: 0,
    mediaTempoAtraso: 0,
    totalValorReparos: 0,
  });

  // Função para carregar dados com base nos filtros
  const carregarDados = async () => {
    setLoading(true);
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simular filtragem por período
      let datasFiltradas = [...veiculosFinalizadosTeste];
      const hoje = new Date();
      
      if (filtroData === 'semana') {
        const ultimaSemana = subDays(hoje, 7);
        datasFiltradas = datasFiltradas.filter(v => {
          const dataFim = new Date(v.dataFinalizacao.split('/').reverse().join('-'));
          return dataFim >= ultimaSemana;
        });
      } else if (filtroData === 'mes') {
        const ultimoMes = subDays(hoje, 30);
        datasFiltradas = datasFiltradas.filter(v => {
          const dataFim = new Date(v.dataFinalizacao.split('/').reverse().join('-'));
          return dataFim >= ultimoMes;
        });
      } else if (filtroData === 'trimestre') {
        const ultimoTrimestre = subMonths(hoje, 3);
        datasFiltradas = datasFiltradas.filter(v => {
          const dataFim = new Date(v.dataFinalizacao.split('/').reverse().join('-'));
          return dataFim >= ultimoTrimestre;
        });
      }
      // 'ano' mostra todos os dados do ano atual
      
      // Filtrar por oficina, se necessário
      if (filtroOficina !== 'todas') {
        datasFiltradas = datasFiltradas.filter(v => 
          v.oficina.toLowerCase().includes(filtroOficina.toLowerCase())
        );
      }
      
      // Atualizar os estados
      setVeiculosFinalizados(datasFiltradas);
      setVeiculosAtrasados(veiculosAtrasadosTeste);
      
      // Calcular métricas
      const totalFinalizados = datasFiltradas.length;
      const mediaTempoFinalizacao = datasFiltradas.reduce((acc, v) => acc + v.diasReparo, 0) / (totalFinalizados || 1);
      const totalValorReparos = datasFiltradas.reduce((acc, v) => acc + v.valorTotal, 0);
      const totalAtrasados = veiculosAtrasadosTeste.length;
      const mediaTempoAtraso = veiculosAtrasadosTeste.reduce((acc, v) => acc + v.diasAtraso, 0) / (totalAtrasados || 1);
      
      setMetricas({
        totalFinalizados,
        mediaTempoFinalizacao,
        totalAtrasados,
        mediaTempoAtraso,
        totalValorReparos
      });
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar dados quando os filtros mudarem
  useEffect(() => {
    carregarDados();
  }, [filtroData, filtroOficina]);
  
  // Formatar valor monetário
  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Formatar data legível
  const obterLabelPeriodo = () => {
    const hoje = new Date();
    switch (filtroData) {
      case 'semana':
        return `Últimos 7 dias (${format(subDays(hoje, 7), 'dd/MM/yyyy')} - ${format(hoje, 'dd/MM/yyyy')})`;
      case 'mes':
        return `Últimos 30 dias (${format(subDays(hoje, 30), 'dd/MM/yyyy')} - ${format(hoje, 'dd/MM/yyyy')})`;
      case 'trimestre':
        return `Últimos 3 meses (${format(subMonths(hoje, 3), 'dd/MM/yyyy')} - ${format(hoje, 'dd/MM/yyyy')})`;
      case 'ano':
        return `Ano atual (${format(startOfMonth(new Date(hoje.getFullYear(), 0, 1)), 'dd/MM/yyyy')} - ${format(hoje, 'dd/MM/yyyy')})`;
      default:
        return 'Período selecionado';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 pt-28">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <BarChart3 className="h-8 w-8 mr-2" />
            Relatórios e Auditoria
          </h1>
          <div className="space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  Exportar como PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Exportar como Excel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Exportar como CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Período</label>
                <Select value={filtroData} onValueChange={setFiltroData}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semana">Última semana</SelectItem>
                    <SelectItem value="mes">Último mês</SelectItem>
                    <SelectItem value="trimestre">Último trimestre</SelectItem>
                    <SelectItem value="ano">Ano atual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Oficina</label>
                <Select value={filtroOficina} onValueChange={setFiltroOficina}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a oficina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as oficinas</SelectItem>
                    <SelectItem value="central">Oficina Central</SelectItem>
                    <SelectItem value="sul">Oficina Sul</SelectItem>
                    <SelectItem value="norte">Oficina Norte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              <span>{obterLabelPeriodo()}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Veículos Finalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{metricas.totalFinalizados}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {obterLabelPeriodo()}
                  </p>
                </div>
                <div className="p-2 bg-green-100/50 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="mt-4 pt-2 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Média de tempo</span>
                  <span className="font-medium">{metricas.mediaTempoFinalizacao.toFixed(1)} dias</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Veículos Atrasados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{metricas.totalAtrasados}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Atualmente em atraso
                  </p>
                </div>
                <div className="p-2 bg-orange-100/50 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              <div className="mt-4 pt-2 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Média de dias em atraso</span>
                  <span className="font-medium">{metricas.mediaTempoAtraso.toFixed(1)} dias</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabelas de Relatórios */}
        <Tabs defaultValue="finalizados" className="space-y-6">
          <TabsList className="w-full flex bg-slate-100 p-1">
            <TabsTrigger 
              value="finalizados" 
              className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Veículos Finalizados
            </TabsTrigger>
            <TabsTrigger 
              value="atrasados" 
              className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Veículos em Atraso
            </TabsTrigger>
          </TabsList>
          
          {/* Tabela de Veículos Finalizados */}
          <TabsContent value="finalizados">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Veículos Finalizados</CardTitle>
                <CardDescription>
                  Lista de veículos entregues no período selecionado: {obterLabelPeriodo()}
                </CardDescription>
              </CardHeader>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <CardContent>
                  {veiculosFinalizados.length === 0 ? (
                    <div className="text-center py-8">
                      <Clipboard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhum veículo finalizado no período selecionado.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Placa</TableHead>
                          <TableHead>Modelo</TableHead>
                          <TableHead>Oficina</TableHead>
                          <TableHead>Data Entrada</TableHead>
                          <TableHead>Data Finalização</TableHead>
                          <TableHead>Tempo (dias)</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {veiculosFinalizados.map((veiculo) => (
                          <TableRow key={veiculo.placa}>
                            <TableCell className="font-medium">{veiculo.placa}</TableCell>
                            <TableCell>{veiculo.modelo}</TableCell>
                            <TableCell>{veiculo.oficina}</TableCell>
                            <TableCell>{veiculo.dataEntrada}</TableCell>
                            <TableCell>{veiculo.dataFinalizacao}</TableCell>
                            <TableCell>{veiculo.diasReparo}</TableCell>
                            <TableCell>{formatarValor(veiculo.valorTotal)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              )}
            </Card>
          </TabsContent>
          
          {/* Tabela de Veículos em Atraso */}
          <TabsContent value="atrasados">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Veículos em Atraso</CardTitle>
                <CardDescription>
                  Lista de veículos atualmente em atraso
                </CardDescription>
              </CardHeader>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <CardContent>
                  {veiculosAtrasados.length === 0 ? (
                    <div className="text-center py-8">
                      <Clipboard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhum veículo em atraso no momento.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Placa</TableHead>
                          <TableHead>Modelo</TableHead>
                          <TableHead>Oficina</TableHead>
                          <TableHead>Dias em Atraso</TableHead>
                          <TableHead>Próxima Etapa</TableHead>
                          <TableHead>Motivo do Atraso</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {veiculosAtrasados.map((veiculo) => (
                          <TableRow key={veiculo.placa}>
                            <TableCell className="font-medium">{veiculo.placa}</TableCell>
                            <TableCell>{veiculo.modelo}</TableCell>
                            <TableCell>{veiculo.oficina}</TableCell>
                            <TableCell>
                              <Badge variant="destructive">{veiculo.diasAtraso} dias</Badge>
                            </TableCell>
                            <TableCell>{veiculo.proximaEtapa}</TableCell>
                            <TableCell>{veiculo.motivoAtraso}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Relatorios; 