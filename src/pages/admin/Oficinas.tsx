import React, { useState, useEffect } from 'react';
import { useHashNavigate } from '@/router/useHashNavigate';
import { useSupabase } from '@/contexts/SupabaseContext';
import {
  Wrench,
  Building,
  Phone,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Clock,
  Car,
  Filter,
  RefreshCcw,
  MoreHorizontal,
  MapPin
} from 'lucide-react';
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
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface Oficina {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  status: 'ativa' | 'ociosa' | 'analise';
  servicos: string[];
  veiculos_ativos: number;
  responsavel: string;
}

// Opções para serviços
const servicosOptions = [
  { id: 'funilaria', label: 'Funilaria' },
  { id: 'pintura', label: 'Pintura' },
  { id: 'mecanica', label: 'Mecânica' },
  { id: 'eletrica', label: 'Elétrica' },
  { id: 'arcondicionado', label: 'Ar Condicionado' },
  { id: 'suspensao', label: 'Suspensão' },
  { id: 'freios', label: 'Freios' },
  { id: 'escapamento', label: 'Escapamento' }
];

const Oficinas = () => {
  const navigate = useHashNavigate();
  const { supabase } = useSupabase();
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOficina, setSelectedOficina] = useState<Oficina | null>(null);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    nome: '',
    status: ''
  });

  // Estado para formulário do modal
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    status: 'ativa' as 'ativa' | 'ociosa' | 'analise',
    servicos: [] as string[],
    responsavel: ''
  });

  // Métricas
  const [metricas, setMetricas] = useState({
    oficinasAtivas: 0,
    oficinasOciosas: 0,
    veiculosAtivos: 0
  });

  // Carrega dados do Supabase
  const carregarOficinas = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('oficinas')
        .select('*')
        .order('nome');

      // Aplicar filtros se existirem
      if (filtros.nome) {
        query = query.ilike('nome', `%${filtros.nome}%`);
      }
      if (filtros.status && filtros.status !== 'todos') {
        query = query.eq('status', filtros.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      setOficinas(data || []);

      // Calcular métricas
      const oficinasAtivas = data?.filter(o => o.status === 'ativa').length || 0;
      const oficinasOciosas = data?.filter(o => o.status === 'ociosa').length || 0;
      const veiculosAtivos = data?.reduce((sum, o) => sum + (o.veiculos_ativos || 0), 0) || 0;

      setMetricas({
        oficinasAtivas,
        oficinasOciosas,
        veiculosAtivos
      });
    } catch (err) {
      console.error('Erro:', err);
      toast({
        title: "Erro ao carregar oficinas",
        description: "Ocorreu um erro ao carregar as oficinas. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarOficinas();
  }, [filtros]);

  const handleFiltroChange = (campo: string, valor: any) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleInputChange = (campo: string, valor: any) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleServicoChange = (id: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ 
        ...prev, 
        servicos: [...prev.servicos, servicosOptions.find(s => s.id === id)?.label || ''] 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        servicos: prev.servicos.filter(s => s !== servicosOptions.find(s => s.id === id)?.label) 
      }));
    }
  };

  const handleCnpjChange = (valor: string) => {
    // Formatar CNPJ: XX.XXX.XXX/XXXX-XX
    valor = valor.replace(/\D/g, '');
    if (valor.length <= 14) {
      valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
      valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
      valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    }
    handleInputChange('cnpj', valor);
  };

  const handleTelefoneChange = (valor: string) => {
    // Formatar Telefone: (XX) XXXXX-XXXX
    valor = valor.replace(/\D/g, '');
    if (valor.length <= 11) {
      valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
      valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    handleInputChange('telefone', valor);
  };

  const handleEditarOficina = (oficina: Oficina) => {
    setSelectedOficina(oficina);
    setFormData({
      nome: oficina.nome,
      cnpj: oficina.cnpj,
      telefone: oficina.telefone,
      email: oficina.email,
      endereco: oficina.endereco,
      cidade: oficina.cidade,
      estado: oficina.estado,
      status: oficina.status,
      servicos: oficina.servicos,
      responsavel: oficina.responsavel
    });
    setIsModalOpen(true);
  };

  const handleNovaOficina = () => {
    setSelectedOficina(null);
    setFormData({
      nome: '',
      cnpj: '',
      telefone: '',
      email: '',
      endereco: '',
      cidade: '',
      estado: '',
      status: 'ativa',
      servicos: [],
      responsavel: ''
    });
    setIsModalOpen(true);
  };

  const handleExcluirOficina = async (id: number) => {
    try {
      const { error } = await supabase
        .from('oficinas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Oficina excluída com sucesso!",
      });
      
      carregarOficinas();
    } catch (err) {
      console.error('Erro:', err);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a oficina.",
        variant: "destructive",
      });
    }
  };

  const handleSalvarOficina = async () => {
    // Validação dos campos obrigatórios
    if (!formData.nome || !formData.cnpj || !formData.telefone || !formData.endereco || !formData.responsavel) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const oficinaData = {
        nome: formData.nome.trim(),
        cnpj: formData.cnpj.trim(),
        telefone: formData.telefone.trim(),
        email: formData.email?.trim() || null,
        endereco: formData.endereco.trim(),
        cidade: formData.cidade?.trim() || null,
        estado: formData.estado?.trim() || null,
        status: formData.status,
        servicos: formData.servicos || [],
        veiculos_ativos: selectedOficina?.veiculos_ativos || 0,
        responsavel: formData.responsavel.trim()
      };

      if (selectedOficina) {
        // Atualizando oficina existente
        const { data, error } = await supabase
          .from('oficinas')
          .update(oficinaData)
          .eq('id', selectedOficina.id)
          .select();

        if (error) {
          console.error('Erro ao atualizar oficina:', error);
          throw error;
        }
        
        toast({
          title: "Sucesso",
          description: "Oficina atualizada com sucesso!",
        });
      } else {
        // Adicionando nova oficina
        const { data, error } = await supabase
          .from('oficinas')
          .insert([oficinaData])
          .select();

        if (error) {
          console.error('Erro ao inserir oficina:', error);
          throw error;
        }
        
        toast({
          title: "Sucesso",
          description: "Oficina adicionada com sucesso!",
        });
      }
      
      setIsModalOpen(false);
      carregarOficinas();
    } catch (err: any) {
      console.error('Erro ao salvar oficina:', err);
      toast({
        title: "Erro",
        description: err.message || "Não foi possível salvar a oficina. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 pt-28">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Building className="h-8 w-8 mr-2" />
            Oficinas
          </h1>
          <div className="space-x-4">
            <Button
              onClick={handleNovaOficina}
              variant="default"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Oficina
            </Button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Oficinas Ativas</CardTitle>
              <Check className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.oficinasAtivas}</div>
              <p className="text-xs text-muted-foreground">
                Oficinas em operação
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Oficinas Ociosas</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.oficinasOciosas}</div>
              <p className="text-xs text-muted-foreground">
                Sem veículos ativos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Veículos Ativos</CardTitle>
              <Car className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.veiculosAtivos}</div>
              <p className="text-xs text-muted-foreground">
                Total de veículos em reparo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Nome da Oficina</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por nome"
                  value={filtros.nome}
                  onChange={(e) => handleFiltroChange('nome', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={filtros.status}
                onValueChange={(value) => handleFiltroChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="ociosa">Ociosa</SelectItem>
                  <SelectItem value="analise">Em Análise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setFiltros({ nome: '', status: '' });
                }}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Tabela de Oficinas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Oficina</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Veículos Ativos</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : oficinas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhuma oficina encontrada
                  </TableCell>
                </TableRow>
              ) : (
                oficinas.map((oficina) => (
                  <TableRow key={oficina.id}>
                    <TableCell className="font-medium">{oficina.nome}</TableCell>
                    <TableCell>{oficina.cnpj}</TableCell>
                    <TableCell>{oficina.telefone}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          oficina.status === 'ativa' 
                            ? "default" 
                            : oficina.status === 'ociosa' 
                              ? "outline" 
                              : "secondary"
                        } 
                        className={
                          oficina.status === 'ativa' 
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" 
                            : oficina.status === 'ociosa' 
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-100" 
                              : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        }
                      >
                        {oficina.status === 'ativa' 
                          ? "Ativa" 
                          : oficina.status === 'ociosa' 
                            ? "Ociosa" 
                            : "Em Análise"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {oficina.veiculos_ativos}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleEditarOficina(oficina)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleExcluirOficina(oficina.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
      
      {/* Modal de Adicionar/Editar Oficina - Com Espaçamento Melhorado */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle className="text-xl">
              {selectedOficina ? 'Editar Oficina' : 'Adicionar Nova Oficina'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações para {selectedOficina ? 'editar a' : 'cadastrar uma nova'} oficina.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-5">
              {/* Seção de Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Informações Básicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome" className="text-sm mb-1.5 inline-block">
                      Nome da Oficina <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nome"
                      placeholder="Nome da oficina"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cnpj" className="text-sm mb-1.5 inline-block">
                      CNPJ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cnpj"
                      placeholder="XX.XXX.XXX/XXXX-XX"
                      value={formData.cnpj}
                      onChange={(e) => handleCnpjChange(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Seção de Contato */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Informações de Contato
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone" className="text-sm mb-1.5 inline-block">
                      Telefone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="telefone"
                      placeholder="(XX) XXXXX-XXXX"
                      value={formData.telefone}
                      onChange={(e) => handleTelefoneChange(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm mb-1.5 inline-block">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="responsavel" className="text-sm mb-1.5 inline-block">
                      Responsável <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="responsavel"
                      placeholder="Nome do responsável"
                      value={formData.responsavel}
                      onChange={(e) => handleInputChange('responsavel', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Seção de Endereço */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="endereco" className="text-sm mb-1.5 inline-block">
                      Endereço <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="endereco"
                      placeholder="Rua, número, complemento"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange('endereco', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cidade" className="text-sm mb-1.5 inline-block">
                      Cidade
                    </Label>
                    <Input
                      id="cidade"
                      placeholder="Cidade"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="estado" className="text-sm mb-1.5 inline-block">
                      Estado
                    </Label>
                    <Input
                      id="estado"
                      placeholder="Estado"
                      value={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Seção de Status e Serviços */}
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status" className="text-sm mb-1.5 inline-block">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'ativa' | 'ociosa' | 'analise') => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativa">Ativa</SelectItem>
                        <SelectItem value="ociosa">Ociosa</SelectItem>
                        <SelectItem value="analise">Em Análise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Serviços Oferecidos */}
                <div className="pt-2">
                  <Label className="text-sm mb-3 inline-block">
                    Serviços Oferecidos
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {servicosOptions.map(servico => (
                      <div key={servico.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={servico.id} 
                          checked={formData.servicos.includes(servico.label)}
                          onCheckedChange={(checked) => handleServicoChange(servico.id, checked as boolean)}
                        />
                        <Label htmlFor={servico.id} className="cursor-pointer text-sm">
                          {servico.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-none border-t pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarOficina} disabled={!formData.nome || !formData.cnpj || !formData.telefone || !formData.endereco || !formData.responsavel}>
              {selectedOficina ? 'Salvar Alterações' : 'Adicionar Oficina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Oficinas; 