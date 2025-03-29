import React from 'react';
import { Clock3, FileText, CheckCircle, AlertCircle, Eye, Image as ImageIcon, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { toast } from "@/components/ui/use-toast";

interface Feedback {
  id: string;
  data: string;
  descricao: string;
  oficina: string;
  fotos: string[];
  placa: string;
  modelo: string;
  eventos: Array<{
    data: string;
    tipo: string;
    descricao: string;
    responsavel: string;
  }>;
}

// Mock data para feedbacks pendentes com eventos
const mockFeedbacksPendentes: Feedback[] = [
  {
    id: '1',
    data: '2024-03-28',
    descricao: 'Reparo na suspensão finalizado, aguardando aprovação.',
    oficina: 'Oficina Norte',
    fotos: ['foto1.jpg', 'foto2.jpg'],
    placa: 'ABC1234',
    modelo: 'Toyota Corolla',
    eventos: [
      {
        data: '2024-03-26',
        tipo: 'Início do Reparo',
        descricao: 'Início do serviço de reparo na suspensão dianteira',
        responsavel: 'João Silva'
      },
      {
        data: '2024-03-27',
        tipo: 'Andamento',
        descricao: 'Substituição dos amortecedores dianteiros',
        responsavel: 'Pedro Santos'
      },
      {
        data: '2024-03-28',
        tipo: 'Conclusão',
        descricao: 'Finalização do serviço e testes realizados',
        responsavel: 'João Silva'
      }
    ]
  },
  {
    id: '2',
    data: '2024-03-27',
    descricao: 'Troca de óleo e filtros realizada.',
    oficina: 'Oficina Central',
    fotos: ['foto3.jpg'],
    placa: 'DEF5678',
    modelo: 'Honda Civic',
    eventos: [
      {
        data: '2024-03-27',
        tipo: 'Manutenção',
        descricao: 'Realizada troca de óleo e filtros conforme especificação',
        responsavel: 'Maria Oliveira'
      }
    ]
  }
];

const AguardandoAprovacao = () => {
  const [feedbacksPendentes, setFeedbacksPendentes] = React.useState<Feedback[]>(mockFeedbacksPendentes);
  const [modalAberto, setModalAberto] = React.useState(false);
  const [feedbackSelecionado, setFeedbackSelecionado] = React.useState<Feedback | null>(null);
  const [modoEdicao, setModoEdicao] = React.useState(false);
  const [feedbackEditado, setFeedbackEditado] = React.useState<Feedback | null>(null);

  const handleAprovarFeedback = (id: string) => {
    setFeedbacksPendentes(feedbacksPendentes.filter(f => f.id !== id));
    toast({
      title: "Feedback aprovado",
      description: "O feedback foi aprovado e está disponível para consulta.",
    });
  };

  const handleRejeitarFeedback = (id: string) => {
    setFeedbacksPendentes(feedbacksPendentes.filter(f => f.id !== id));
    toast({
      title: "Feedback rejeitado",
      description: "O feedback foi rejeitado e será removido da lista.",
      variant: "destructive"
    });
  };

  const handleVerDetalhes = (feedback: Feedback) => {
    setFeedbackSelecionado(feedback);
    setModalAberto(true);
  };

  const handleEditarFeedback = () => {
    setFeedbackEditado(feedbackSelecionado);
    setModoEdicao(true);
  };

  const handleSalvarEdicao = () => {
    if (!feedbackEditado) return;

    setFeedbacksPendentes(feedbacks =>
      feedbacks.map(f =>
        f.id === feedbackEditado.id ? feedbackEditado : f
      )
    );
    setFeedbackSelecionado(feedbackEditado);
    setModoEdicao(false);
    
    toast({
      title: "Feedback atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleCancelarEdicao = () => {
    setFeedbackEditado(feedbackSelecionado);
    setModoEdicao(false);
  };

  const handleInputChange = (campo: keyof Feedback, valor: string) => {
    if (!feedbackEditado) return;
    
    setFeedbackEditado({
      ...feedbackEditado,
      [campo]: valor
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
                Feedbacks Aguardando Aprovação
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Gerencie os feedbacks pendentes de aprovação
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4">
              {feedbacksPendentes.length > 0 ? (
                feedbacksPendentes.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock3 className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">
                          {new Date(feedback.data).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant="outline">{feedback.oficina}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-sm text-gray-500">Placa</p>
                        <p className="font-medium">{feedback.placa}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Modelo</p>
                        <p className="font-medium">{feedback.modelo}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {feedback.descricao}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-500 flex items-center">
                        <ImageIcon className="h-4 w-4 mr-1" />
                        {feedback.fotos.length} foto(s) anexada(s)
                      </div>
                      <div className="text-sm text-gray-500">
                        {feedback.eventos.length} evento(s) registrado(s)
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerDetalhes(feedback)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </Button>
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
          </div>
        </div>
      </main>

      {/* Modal de Detalhes */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6" />
                <span>
                  Detalhes do Feedback - {feedbackSelecionado?.placa}
                </span>
              </div>
              {!modoEdicao && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditarFeedback}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Modelo</p>
                  {modoEdicao ? (
                    <Input
                      value={feedbackEditado?.modelo || ''}
                      onChange={(e) => handleInputChange('modelo', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium">{feedbackSelecionado?.modelo}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Oficina</p>
                  {modoEdicao ? (
                    <Input
                      value={feedbackEditado?.oficina || ''}
                      onChange={(e) => handleInputChange('oficina', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium">{feedbackSelecionado?.oficina}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Descrição</h4>
                {modoEdicao ? (
                  <Textarea
                    value={feedbackEditado?.descricao || ''}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">
                    {feedbackSelecionado?.descricao}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Fotos Anexadas</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {feedbackSelecionado?.fotos.map((foto, index) => (
                    <div key={index} className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center relative group">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                      {modoEdicao && (
                        <button
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            if (feedbackEditado) {
                              setFeedbackEditado({
                                ...feedbackEditado,
                                fotos: feedbackEditado.fotos.filter((_, i) => i !== index)
                              });
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Histórico de Eventos</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Responsável</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feedbackSelecionado?.eventos.map((evento, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(evento.data).toLocaleDateString()}</TableCell>
                          <TableCell>{evento.tipo}</TableCell>
                          <TableCell>{evento.descricao}</TableCell>
                          <TableCell>{evento.responsavel}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 mt-6 border-t pt-4">
            <div className="flex space-x-2">
              {modoEdicao ? (
                <>
                  <Button onClick={handleSalvarEdicao} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Salvar Alterações
                  </Button>
                  <Button variant="outline" onClick={handleCancelarEdicao}>
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => {
                      handleAprovarFeedback(feedbackSelecionado?.id || '');
                      setModalAberto(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprovar Feedback
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      handleRejeitarFeedback(feedbackSelecionado?.id || '');
                      setModalAberto(false);
                    }}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Rejeitar Feedback
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AguardandoAprovacao; 