import React, { useState, useEffect } from 'react';
import { useHashNavigate } from '@/router/useHashNavigate';
import { useLocation } from 'react-router-dom';
import { Camera, Car, Upload, Plus, Check, X, Info, AlertTriangle, ChevronDown, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSupabase } from '@/contexts/SupabaseContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Tipos e interfaces
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

interface VistoriaEntrada {
  veiculo_id: number;
  fotos_danificadas: string[];
  fotos_seguranca: string[];
  kit_seguranca_presente: boolean;
  kit_seguranca_descricao: string;
  com_chave_ignicao: boolean;
  observacoes: string;
  videos: string[];
  video_descricao: string;
  data_vistoria: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Componente para upload de imagens
const ImageUploader = ({ title, description, images, setImages }) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const newImages = [...images];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        newImages.push({
          id: Date.now() + Math.random().toString(36).substring(2, 15),
          url: event.target?.result,
          name: file.name
        });
        setImages([...newImages]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages(images.filter(image => image.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <label className="cursor-pointer">
          <div className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md transition-colors">
            <Upload className="h-4 w-4" />
            <span>Adicionar</span>
          </div>
          <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
        </label>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map(image => (
            <div key={image.id} className="relative group">
              <img 
                src={image.url} 
                alt={image.name} 
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removeImage(image.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-xs truncate mt-1">{image.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Camera className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Nenhuma imagem adicionada</p>
          <p className="text-sm text-gray-400">Clique em "Adicionar" para selecionar imagens</p>
        </div>
      )}
    </div>
  );
};

// Componente para upload de vídeos
const VideoUploader = ({ title, description, videos, setVideos }) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const newVideos = [...videos];
    
    files.forEach(file => {
      if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = () => {
          newVideos.push({
            id: Date.now() + Math.random().toString(36).substring(2, 15),
            url: URL.createObjectURL(file),
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2)
          });
          setVideos([...newVideos]);
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de vídeo.",
          variant: "destructive",
        });
      }
    });
  };

  const removeVideo = (id) => {
    setVideos(videos.filter(video => video.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <label className="cursor-pointer">
          <div className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-md transition-colors">
            <Video className="h-4 w-4" />
            <span>Adicionar Vídeo</span>
          </div>
          <input type="file" className="hidden" accept="video/*" onChange={handleFileSelect} />
        </label>
      </div>

      {videos.length > 0 ? (
        <div className="space-y-4">
          {videos.map(video => (
            <div key={video.id} className="relative border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  <span className="font-medium">{video.name}</span>
                </div>
                <button
                  onClick={() => removeVideo(video.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                <video 
                  src={video.url} 
                  controls 
                  className="w-full h-full object-contain"
                  preload="metadata"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Tamanho: {video.size} MB
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Video className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Nenhum vídeo adicionado</p>
          <p className="text-sm text-gray-400">Clique em "Adicionar Vídeo" para selecionar um arquivo</p>
        </div>
      )}
    </div>
  );
};

const VistoriaEntrada = () => {
  const { supabase } = useSupabase();
  const navigate = useHashNavigate();
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Obter a placa da URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const placaParam = queryParams.get('placa');

  // Estados para o formulário de vistoria
  const [imagesDanificadas, setImagesDanificadas] = useState([]);
  const [imagesSeguranca, setImagesSeguranca] = useState([]);
  const [kitSegurancaPresente, setKitSegurancaPresente] = useState(true);
  const [kitSegurancaDescricao, setKitSegurancaDescricao] = useState('');
  const [comChaveIgnicao, setComChaveIgnicao] = useState('com');
  const [observacoes, setObservacoes] = useState('');
  const [videos, setVideos] = useState([]);
  const [videoDescricao, setVideoDescricao] = useState('');

  useEffect(() => {
    const buscarVeiculos = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('veiculos')
          .select(`
            *,
            oficina:oficinas (nome)
          `)
          .eq('status', 'aguardando');

        const { data, error } = await query;

        if (error) throw error;
        setVeiculos(data || []);
        
        // Se tiver uma placa na URL, selecionar o veículo automaticamente
        if (placaParam) {
          const veiculoEncontrado = data.find(v => v.placa === placaParam);
          if (veiculoEncontrado) {
            setVeiculoSelecionado(veiculoEncontrado);
          } else {
            toast({
              title: "Veículo não encontrado",
              description: `Não foi possível encontrar um veículo com a placa ${placaParam} que precise de vistoria.`,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar veículos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os veículos sem vistoria.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    buscarVeiculos();
  }, [placaParam, supabase]);

  const handleSelectVeiculo = (placa: string) => {
    const veiculo = veiculos.find(v => v.placa === placa);
    if (veiculo) {
      setVeiculoSelecionado(veiculo);
      // Limpar o formulário de vistoria
      setImagesDanificadas([]);
      setImagesSeguranca([]);
      setKitSegurancaPresente(true);
      setKitSegurancaDescricao('');
      setComChaveIgnicao('com');
      setObservacoes('');
      setVideos([]);
      setVideoDescricao('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!veiculoSelecionado) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um veículo para realizar a vistoria.",
        variant: "destructive",
      });
      return;
    }

    if (imagesDanificadas.length === 0) {
      toast({
        title: "Vistoria Obrigatória",
        description: "A vistoria de entrada é obrigatória. Por favor, adicione pelo menos uma imagem das partes danificadas.",
        variant: "destructive",
      });
      return;
    }

    if (imagesSeguranca.length === 0) {
      toast({
        title: "Vistoria Obrigatória",
        description: "A vistoria de entrada é obrigatória. Por favor, adicione pelo menos uma imagem do kit de segurança.",
        variant: "destructive",
      });
      return;
    }

    setSubmitLoading(true);

    try {
      // Upload das imagens para o Supabase Storage
      const fotosDanificadasUrls = await Promise.all(
        imagesDanificadas.map(async (image) => {
          const file = await fetch(image.url).then(r => r.blob());
          const fileName = `vistoria/${veiculoSelecionado.placa}/danificadas/${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
          const { data, error } = await supabase.storage
            .from('vistorias')
            .upload(fileName, file);
          
          if (error) throw error;
          return data.path;
        })
      );

      const fotosSegurancaUrls = await Promise.all(
        imagesSeguranca.map(async (image) => {
          const file = await fetch(image.url).then(r => r.blob());
          const fileName = `vistoria/${veiculoSelecionado.placa}/seguranca/${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
          const { data, error } = await supabase.storage
            .from('vistorias')
            .upload(fileName, file);
          
          if (error) throw error;
          return data.path;
        })
      );

      // Upload dos vídeos
      const videosUrls = await Promise.all(
        videos.map(async (video) => {
          const file = await fetch(video.url).then(r => r.blob());
          const fileName = `vistoria/${veiculoSelecionado.placa}/videos/${Date.now()}-${Math.random().toString(36).substring(2)}.mp4`;
          const { data, error } = await supabase.storage
            .from('vistorias')
            .upload(fileName, file);
          
          if (error) throw error;
          return data.path;
        })
      );

      // Inserir registro da vistoria
      const { error: vistoriaError } = await supabase
        .from('vistorias_entrada')
        .insert({
          veiculo_id: veiculoSelecionado.id,
          fotos_danificadas: fotosDanificadasUrls,
          fotos_seguranca: fotosSegurancaUrls,
          kit_seguranca_presente: kitSegurancaPresente,
          kit_seguranca_descricao: kitSegurancaDescricao,
          com_chave_ignicao: comChaveIgnicao === 'com',
          observacoes: observacoes,
          videos: videosUrls,
          video_descricao: videoDescricao,
          data_vistoria: new Date().toISOString(),
          status: 'pending'
        });

      if (vistoriaError) throw vistoriaError;

      // Atualizar status do veículo
      const { error: veiculoError } = await supabase
        .from('veiculos')
        .update({ inspection_status: 'pending' })
        .eq('id', veiculoSelecionado.id);

      if (veiculoError) throw veiculoError;

      toast({
        title: "Sucesso",
        description: "Vistoria de entrada registrada com sucesso!",
      });

      navigate('/admin/veiculos');
    } catch (error) {
      console.error('Erro ao salvar vistoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a vistoria. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 pt-28">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                <span className="font-bold">Atenção:</span> A vistoria de entrada é obrigatória para iniciar as atualizações ao veículo.
                Registre todas as condições visuais e mecânicas do veículo no momento da admissão.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <FileText className="h-8 w-8 mr-2" />
            <h1 className="text-3xl font-bold">Vistoria de Entrada</h1>
          </div>

          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/veiculos')}
          >
            Voltar para Veículos
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da esquerda - Seleção de veículo */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Selecione o Veículo
                </CardTitle>
                <CardDescription>
                  Escolha um veículo sem vistoria de entrada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : veiculos.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <AlertTriangle className="h-10 w-10 mx-auto text-amber-500" />
                    <p className="text-gray-700 font-medium">Nenhum veículo encontrado aguardando vistoria.</p>
                    <p className="text-gray-500 text-sm">Cadastre um veículo na área administrativa para realizar a vistoria de entrada.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/admin/adicionar-veiculo')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Novo Veículo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="veiculo">Veículo</Label>
                    <Select onValueChange={handleSelectVeiculo} value={veiculoSelecionado?.placa || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {veiculos.map((veiculo) => (
                          <SelectItem key={veiculo.placa} value={veiculo.placa}>
                            {veiculo.placa} - {veiculo.modelo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {veiculoSelecionado && (
                  <div className="mt-6 space-y-4 border-t pt-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Informações do Veículo
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500">Placa:</Label>
                        <p className="font-medium">{veiculoSelecionado.placa}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Modelo:</Label>
                        <p>{veiculoSelecionado.modelo}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Chassi:</Label>
                        <p>{veiculoSelecionado.chassi}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Renavam:</Label>
                        <p>{veiculoSelecionado.renavam}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Cliente:</Label>
                        <p>{veiculoSelecionado.nome_cliente}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">CPF:</Label>
                        <p>{veiculoSelecionado.cpf_cnpj_cliente}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Telefone:</Label>
                        <p>{veiculoSelecionado.telefone_cliente}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Valor FIPE:</Label>
                        <p>R$ {veiculoSelecionado.valor_fipe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Oficina:</Label>
                        <p>{veiculoSelecionado.oficina.nome}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Consultor:</Label>
                        <p>{veiculoSelecionado.nome_consultor}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Data de Entrada:</Label>
                        <p>{new Date(veiculoSelecionado.data_entrada).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="pt-2">
                        <Badge 
                          className="bg-amber-100 text-amber-800 hover:bg-amber-100 hover:text-amber-800 border-amber-200"
                        >
                          Aguardando Vistoria
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna da direita - Formulário de vistoria */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Vistoria de Entrada
                </CardTitle>
                <CardDescription>
                  Registre as condições iniciais do veículo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!veiculoSelecionado ? (
                  <div className="text-center py-10 space-y-2">
                    <Car className="h-12 w-12 mx-auto text-gray-300" />
                    <p className="text-gray-500">Selecione um veículo para iniciar a vistoria.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <Tabs defaultValue="danificadas" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="danificadas">Partes Danificadas</TabsTrigger>
                        <TabsTrigger value="seguranca">Kit de Segurança</TabsTrigger>
                        <TabsTrigger value="video">Vídeo</TabsTrigger>
                      </TabsList>
                      <TabsContent value="danificadas" className="pt-4">
                        <ImageUploader 
                          title="Partes Danificadas do Veículo" 
                          description="Adicione fotos de todas as partes com danos ou avarias" 
                          images={imagesDanificadas}
                          setImages={setImagesDanificadas}
                        />
                      </TabsContent>
                      <TabsContent value="seguranca" className="pt-4">
                        <ImageUploader 
                          title="Kit de Segurança" 
                          description="Adicione fotos do kit de segurança do veículo" 
                          images={imagesSeguranca}
                          setImages={setImagesSeguranca}
                        />
                        
                        <div className="mt-6 border-t pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="kitPresente" className="text-base font-medium">Kit de Segurança Presente</Label>
                            <Switch 
                              id="kitPresente" 
                              checked={kitSegurancaPresente} 
                              onCheckedChange={setKitSegurancaPresente} 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="kitDescricao">Descrição do Kit de Segurança</Label>
                            <Textarea 
                              id="kitDescricao" 
                              placeholder="Descreva o estado do kit de segurança e os itens presentes ou ausentes..." 
                              value={kitSegurancaDescricao}
                              onChange={(e) => setKitSegurancaDescricao(e.target.value)}
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="video" className="pt-4">
                        <VideoUploader 
                          title="Vídeo do Veículo" 
                          description="Adicione um vídeo mostrando o estado geral do veículo" 
                          videos={videos}
                          setVideos={setVideos}
                        />
                        
                        <div className="mt-6 border-t pt-4 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="videoDescricao">Descrição do Vídeo</Label>
                            <Textarea 
                              id="videoDescricao" 
                              placeholder="Descreva o que está sendo mostrado no vídeo..." 
                              value={videoDescricao}
                              onChange={(e) => setVideoDescricao(e.target.value)}
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-semibold">Admissão do Veículo</h3>
                      
                      <div className="space-y-2">
                        <Label>Veículo admitido:</Label>
                        <RadioGroup 
                          value={comChaveIgnicao} 
                          onValueChange={setComChaveIgnicao}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="com" id="com-chave" />
                            <Label htmlFor="com-chave">Com chave de ignição</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sem" id="sem-chave" />
                            <Label htmlFor="sem-chave">Sem chave de ignição</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações Gerais</Label>
                        <Textarea 
                          id="observacoes" 
                          placeholder="Observações adicionais sobre o estado do veículo..." 
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>
                    </div>

                    <CardFooter className="flex justify-end pt-6 px-0">
                      <Button 
                        type="submit" 
                        disabled={submitLoading}
                        className="w-full md:w-auto"
                      >
                        {submitLoading ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                            Registrando...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Finalizar Vistoria de Entrada
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VistoriaEntrada;