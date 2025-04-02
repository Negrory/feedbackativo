import React, { useState, useEffect } from 'react';
import { Car, Search, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSupabase } from '@/contexts/SupabaseContext';

interface VeiculoSGA {
  placa: string;
  modelo: string;
  chassi: string;
  cpfCnpj: string;
  nomeCliente: string;
  telefoneCliente: string;
  renavam: string;
  valorFipe: number;
  nome_voluntario: string;
}

interface FormData extends VeiculoSGA {
  oficina: string;
  isTerceiro: boolean;
}

const AdicionarVeiculo = () => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preenchimentoManual, setPreenchimentoManual] = useState(false);
  const [oficinas, setOficinas] = useState<Array<{ id: number; nome: string }>>([]);
  
  const [formData, setFormData] = useState<Partial<FormData>>({
    placa: '',
    oficina: '',
    isTerceiro: false,
    modelo: '',
    chassi: '',
    cpfCnpj: '',
    nomeCliente: '',
    telefoneCliente: '',
    renavam: '',
    valorFipe: 0,
    nome_voluntario: ''
  });

  // Carregar oficinas ao montar o componente
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

  const buscarVeiculoSGA = async () => {
    if (!formData.placa) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma placa válida.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setPreenchimentoManual(false);

    try {
      const response = await fetch(
        'https://hook.eu2.make.com/8169vx14djaxcrf2z845db170lx0h68a',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            placa: formData.placa,
            acao: 'buscar'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do veículo');
      }

      const data = await response.json();
      console.log('Dados brutos recebidos:', data);

      // Verifica se os dados vieram na resposta
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Nenhum dado encontrado para esta placa');
      }

      // Pega o primeiro item do array
      const veiculo = data[0];
      console.log('Dados do veículo:', veiculo);

      // Mapeia os dados recebidos para o formato esperado
      const veiculoData = {
        placa: formData.placa,
        modelo: veiculo.modelo || '',
        chassi: veiculo.chassi || '',
        cpfCnpj: veiculo.cpf || '',
        nomeCliente: veiculo.nome || '',
        telefoneCliente: veiculo.telefone ? `(${veiculo.ddd || ''}) ${veiculo.telefone}` : '',
        renavam: veiculo.renavam || '',
        valorFipe: parseFloat(veiculo.valor_fipe || '0'),
        nome_voluntario: veiculo.nome_voluntario || '',
        // Mantém os valores existentes dos campos não preenchidos pela API
        oficina: formData.oficina || '',
        isTerceiro: formData.isTerceiro || false
      };

      console.log('Dados mapeados para o formulário:', veiculoData);

      // Atualiza o estado com os novos dados
      setFormData(veiculoData);
      setPreenchimentoManual(false);
      
      toast({
        title: "Sucesso",
        description: "Dados do veículo encontrados com sucesso!",
      });
    } catch (err) {
      console.error('Erro na busca:', err);
      setError('Erro ao buscar dados do veículo. Você pode preencher os campos manualmente.');
      setPreenchimentoManual(true);
      toast({
        title: "Erro",
        description: "Não foi possível buscar os dados do veículo. Você pode preencher manualmente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!formData.placa || !formData.renavam || !formData.oficina || !formData.nome_voluntario) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Primeiro, buscar o ID da oficina selecionada
      const { data: oficinaData, error: oficinaError } = await supabase
        .from('oficinas')
        .select('id')
        .eq('nome', formData.oficina)
        .single();

      if (oficinaError) {
        throw new Error('Erro ao buscar oficina');
      }

      // Preparar os dados para inserção
      const veiculoData = {
        placa: formData.placa,
        modelo: formData.modelo,
        chassi: formData.chassi,
        renavam: formData.renavam,
        cpf_cnpj_cliente: formData.cpfCnpj,
        nome_cliente: formData.nomeCliente,
        telefone_cliente: formData.telefoneCliente,
        valor_fipe: formData.valorFipe,
        oficina_id: oficinaData.id,
        consultor_id: formData.nome_voluntario, // Usando o nome_voluntario como ID
        nome_consultor: formData.nome_voluntario, // Usando o nome_voluntario como nome
        is_terceiro: formData.isTerceiro,
        status: 'aguardando'
      };

      // Inserir o veículo no banco de dados
      const { error: insertError } = await supabase
        .from('veiculos')
        .insert([veiculoData]);

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Sucesso",
        description: "Veículo adicionado com sucesso!",
      });

      // Limpa o formulário após salvar
      setFormData({
        placa: '',
        oficina: '',
        isTerceiro: false,
        modelo: '',
        chassi: '',
        cpfCnpj: '',
        nomeCliente: '',
        telefoneCliente: '',
        renavam: '',
        valorFipe: 0,
        nome_voluntario: ''
      });

    } catch (err) {
      console.error('Erro ao salvar:', err);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados do veículo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-24 pt-28">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center space-x-2 mb-8">
            <Car className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Adicionar Novo Veículo</h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-6">
              {/* Busca por placa */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="placa" className="flex items-center space-x-1">
                    <span>Placa do Veículo</span>
                    <span className="text-red-500">*</span>
                    <Info className="h-4 w-4 text-gray-400" />
                  </Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="placa"
                      placeholder="Digite a placa"
                      value={formData.placa}
                      onChange={(e) => handleInputChange('placa', e.target.value.toUpperCase())}
                      className="flex-1"
                      required
                    />
                    <Button
                      onClick={buscarVeiculoSGA}
                      disabled={loading}
                    >
                      {loading ? (
                        "Buscando..."
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campos não preenchidos pelo SGA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="oficina" className="flex items-center space-x-1">
                      <span>Oficina</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.oficina}
                      onValueChange={(value) => handleInputChange('oficina', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a oficina" />
                      </SelectTrigger>
                      <SelectContent>
                        {oficinas.map((oficina) => (
                          <SelectItem key={oficina.id} value={oficina.nome}>
                            {oficina.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="consultor" className="flex items-center space-x-1">
                      <span>Consultor</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.nome_voluntario}
                      onChange={(e) => handleInputChange('nome_voluntario', e.target.value)}
                      disabled={!preenchimentoManual && !formData.nome_voluntario}
                      placeholder="Nome do consultor"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="terceiro"
                      checked={formData.isTerceiro}
                      onCheckedChange={(checked) => handleInputChange('isTerceiro', checked)}
                    />
                    <Label htmlFor="terceiro">É Terceiro?</Label>
                  </div>
                </div>

                {/* Campos preenchidos pelo SGA ou manualmente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Modelo</Label>
                    <Input
                      value={formData.modelo}
                      onChange={(e) => handleInputChange('modelo', e.target.value)}
                      disabled={!preenchimentoManual && !formData.modelo}
                    />
                  </div>

                  <div>
                    <Label>Chassi</Label>
                    <Input
                      value={formData.chassi}
                      onChange={(e) => handleInputChange('chassi', e.target.value)}
                      disabled={!preenchimentoManual && !formData.chassi}
                    />
                  </div>

                  <div>
                    <Label>CPF/CNPJ</Label>
                    <Input
                      value={formData.cpfCnpj}
                      onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
                      disabled={!preenchimentoManual && !formData.cpfCnpj}
                    />
                  </div>

                  <div>
                    <Label>Nome do Cliente</Label>
                    <Input
                      value={formData.nomeCliente}
                      onChange={(e) => handleInputChange('nomeCliente', e.target.value)}
                      disabled={!preenchimentoManual && !formData.nomeCliente}
                    />
                  </div>

                  <div>
                    <Label>Telefone do Cliente</Label>
                    <Input
                      value={formData.telefoneCliente}
                      onChange={(e) => handleInputChange('telefoneCliente', e.target.value)}
                      disabled={!preenchimentoManual && !formData.telefoneCliente}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <Label>Valor FIPE</Label>
                    <Input
                      value={formData.valorFipe ? formData.valorFipe.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }) : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleInputChange('valorFipe', Number(value) / 100);
                      }}
                      disabled={!preenchimentoManual && !formData.valorFipe}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center space-x-1">
                      <span>Renavam</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.renavam}
                      onChange={(e) => handleInputChange('renavam', e.target.value)}
                      disabled={!preenchimentoManual && !formData.renavam}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!formData.placa || !formData.renavam || !formData.oficina || !formData.nome_voluntario}
                >
                  Adicionar Veículo
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdicionarVeiculo; 