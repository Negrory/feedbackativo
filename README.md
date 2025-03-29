# 🔔 Feedback Ativo

Sistema de gestão e comunicação de atualizações de veículos em reparo da ABN Protege.

## 📌 Sobre o Projeto

O Feedback Ativo é um sistema desenvolvido para manter associados e consultores sempre informados sobre o status de veículos em reparo. O sistema garante transparência e comunicação eficiente entre oficinas, associados e equipe interna da ABN Protege.

## 🎯 Objetivo

O sistema permite que as oficinas postem atualizações semanais sobre os veículos em manutenção. Essas atualizações são enviadas para aprovação da equipe interna antes de serem disparadas automaticamente para o WhatsApp do associado e consultor. O associado pode visualizar todas as informações em uma página exclusiva.

## 🔧 Estrutura do Sistema

### 📊 Dashboard
- Visão geral do sistema
- Gráficos de desempenho
- Métricas principais
  - Total de veículos em reparo
  - Feedbacks pendentes
  - Atualizações da semana

### ✅ Página de Feedbacks para Aprovação
- Lista de feedbacks enviados pelas oficinas
- Sistema de aprovação/rejeição
- Visualização detalhada de cada feedback
- Edição de informações quando necessário

### ⏳ Atualizações Pendentes
- Status por oficina:
  - Veículos sem feedback
  - Feedbacks aguardando aprovação
  - Feedbacks atrasados
  - Última atualização registrada

### 🚗 Página de Veículos
- Dados gerais dos veículos:
  - Em serviço: 532
  - Concluídos: 845
  - Total cadastrados: 1377
- Filtros avançados
- Histórico de serviços

### 🔧 Página das Oficinas
- Gestão de oficinas cadastradas
- Monitoramento de desempenho
- Histórico de serviços

### 📈 Página de Relatórios
- Métricas detalhadas
- Relatórios personalizados
- Exportação de dados

## 📋 Regras de Negócio

### 🔄 Regras Gerais
- Sistema acessível apenas para usuários autenticados
- Todas as ações são registradas com data, hora e usuário
- Navegação através de hash routing para compatibilidade com GitHub Pages
- Interface adaptativa para desktop e dispositivos móveis
- Sistema de notificações:
  - Popup automático ao acessar o sistema
  - Exibe veículos com atualizações atrasadas
  - Destaque para veículos mais críticos
  - Necessário confirmar visualização do alerta

### 📊 Dashboard
- Gráficos atualizados em tempo real
- Métricas calculadas com base nos últimos 30 dias
- Distribuição de status:
  - Em andamento (laranja)
  - Atrasados (vermelho)
  - Concluídos (verde)
- Feedbacks por oficina exibidos em gráfico de barras

### ✅ Feedbacks para Aprovação
- Feedbacks devem ser aprovados em até 24 horas
- Campos obrigatórios:
  - Placa do veículo
  - Descrição da atualização
  - Oficina responsável
- Fotos são opcionais mas recomendadas
- Operadores podem:
  - Aprovar feedback (dispara mensagem WhatsApp)
  - Rejeitar feedback (retorna para oficina)
  - Editar informações antes da aprovação
- Após aprovação, feedback não pode ser editado

### ⚠️ Atualizações Pendentes
- Feedbacks são considerados atrasados após 7 dias sem atualização
- Sistema destaca em vermelho veículos sem atualização há mais de 5 dias
- Alertas automáticos são enviados para:
  - Oficinas com feedbacks atrasados
  - Gestores sobre veículos sem atualização
- Ordenação padrão: mais atrasados primeiro
- Restrições de postagem:
  - Vistoria de entrada é pré-requisito
  - Sistema bloqueia atualizações se vistoria não realizada
  - Notificação automática para oficina sobre necessidade de vistoria
- Regras de atualização obrigatória:
  - Prazo máximo de 7 dias entre atualizações
  - Contagem inicia após vistoria de entrada
  - Sistema exibe contador regressivo
  - Notificações progressivas:
    - 2 dias antes do prazo: Alerta amarelo
    - 1 dia antes: Alerta laranja
    - Prazo vencido: Alerta vermelho e popup
- Sistema de cobrança automática:
  - Email diário para oficina
  - Notificação para gestores
  - Registro no histórico da oficina
  - Impacto na classificação de desempenho

### 🚗 Gestão de Veículos
- Busca de veículos via API do SGA por:
  - Placa
  - Chassi
  - Nome do associado
- Integração automática de dados:
  - Informações do veículo
  - Dados do associado
  - Nome do consultor responsável
- Status possíveis:
  - Em reparo
  - Concluído
  - Aguardando peças
  - Em análise
- Vistoria de entrada:
  - Obrigatória antes de qualquer atualização
  - Deve incluir fotos do veículo
  - Checklist de itens verificados
  - Registro de avarias existentes
- Fluxo de vinculação com oficina:
  1. Cadastro do veículo
  2. Vinculação com oficina
  3. Vistoria de entrada obrigatória
  4. Liberação para postagem de atualizações

### 🔧 Gestão de Oficinas
- Cadastro requer:
  - CNPJ válido
  - Endereço completo
  - Responsável técnico
  - Telefone de contato
- Monitoramento de performance:
  - Tempo médio de reparo
  - Taxa de feedbacks no prazo
  - Satisfação dos associados
  - Índice de atualizações em dia
- Classificação automática:
  - ⭐⭐⭐ (Excelente) - Mais de 90% no prazo
  - ⭐⭐ (Regular) - Entre 70% e 90% no prazo
  - ⭐ (Atenção) - Menos de 70% no prazo
- Penalizações por atrasos:
  - Redução na classificação
  - Notificação aos gestores
  - Possível suspensão de novos serviços

### 📈 Relatórios
- Geração automática semanal
- Exportação em formatos:
  - PDF
  - Excel
  - CSV
- Métricas disponíveis:
  - Tempo médio de reparo
  - Taxa de aprovação de feedbacks
  - Desempenho por oficina
  - Satisfação dos associados
- Filtros personalizáveis por:
  - Período
  - Oficina
  - Status
  - Região

### 👤 Página do Associado
- Link único por veículo/associado
- Acesso sem necessidade de login
- Exibe:
  - Dados do veículo
  - Histórico de atualizações
  - Fotos do reparo
  - Status atual
- Atualizações ordenadas por data (mais recentes primeiro)

## 📱 Modelo da Mensagem Enviada ao Associado

```
Associado(a) XXXXX, temos novidades para você!
Seu veículo XXXXX de placa XXXXX teve uma nova atualização 🤩.

Acompanhe todos os detalhes no link abaixo 🔗:
LINK DA PÁGINA CONTENDO A ATUALIZAÇÃO XXXXX

ABN Protege – Transparência e excelência a cada etapa 🚀.
```

## 🚀 Tecnologias Utilizadas

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Vite
- React Router DOM
- Axios
- Lucide React (ícones)
- React Hot Toast

### Backend
- Make (Integromat) para automações
- Webhook para integrações
- API do WhatsApp para envio de mensagens

### Integração SGA
O sistema integra-se com a API do SGA (Sistema de Gestão ABN) para:

- Busca de veículos por placa
- Obtenção de dados do associado
- Informações do consultor responsável
- Status do veículo no sistema

#### Endpoints Principais do SGA

```typescript
interface VeiculoSGA {
  placa: string;
  modelo: string;
  marca: string;
  ano: string;
  chassi: string;
  nome_associado: string;
  telefone_associado: string;
  nome_voluntario: string; // Consultor responsável
}
```

- `GET /api/veiculos/{placa}`: Retorna dados do veículo e associado
- `POST /api/feedbacks`: Envia novo feedback para aprovação
- `GET /api/oficinas`: Lista oficinas cadastradas

## 🔐 Variáveis de Ambiente

```env
VITE_API_URL=https://api.abnprotege.com.br
VITE_WEBHOOK_URL=https://hook.make.com/...
VITE_SGA_TOKEN= Authorization:Bearer 71c143340e5bb7277336e386c75acd4d82d211404a322ff48266846c9eaaba6bfb253c3fbfae65223e9d90a28f098155d417d85c5ff11a026b37eadccc1f4511aa6e5c9864ba98e3fc4d4d6a440e92b0cfce52806d7e39af8cbc3091d1f95fcbd3c66ce897b1c306e69a283ccbcfdae88ffdb874b6128ac30cf064720e2b65d259c8a61ced9daf2e77b384a1f49e88f6
```