import { createClient } from '@supabase/supabase-js';

// Substitua essas variáveis pelas suas credenciais do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Credenciais do Supabase não configuradas. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para as tabelas do Supabase
export type Veiculo = {
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
  consultor_id: number;
  is_terceiro: boolean;
  status: 'aguardando' | 'em_andamento' | 'finalizado' | 'atrasado';
  data_entrada: string;
  data_saida?: string | null;
  created_at: string;
  updated_at: string;
};

export type Oficina = {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  responsavel: string;
  created_at: string;
  updated_at: string;
};

export type Consultor = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  oficina_id: number;
  created_at: string;
  updated_at: string;
};

export type Atualizacao = {
  id: number;
  veiculo_id: number;
  descricao: string;
  status: 'aguardando' | 'em_andamento' | 'finalizado' | 'atrasado';
  data_prevista?: string | null;
  consultor_id: number;
  created_at: string;
  updated_at: string;
};

export type Vistoria = {
  id: number;
  veiculo_id: number;
  tipo: 'entrada' | 'saida';
  data: string;
  observacoes: string;
  fotos: string[];
  consultor_id: number;
  created_at: string;
  updated_at: string;
};

export type Feedback = {
  id: number;
  veiculo_id: number;
  avaliacao: 1 | 2 | 3 | 4 | 5;
  comentario: string;
  autoriza_publicacao: boolean;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  data: string;
  created_at: string;
  updated_at: string;
};

// Helper functions para cada tabela
export const veiculosDB = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('veiculos')
      .select('*');
    
    if (error) throw error;
    return data as Veiculo[];
  },
  
  getById: async (id: number) => {
    const { data, error } = await supabase
      .from('veiculos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Veiculo;
  },
  
  getByPlaca: async (placa: string) => {
    const { data, error } = await supabase
      .from('veiculos')
      .select('*')
      .eq('placa', placa)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as Veiculo;
  },
  
  create: async (veiculo: Omit<Veiculo, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('veiculos')
      .insert(veiculo)
      .select()
      .single();
    
    if (error) throw error;
    return data as Veiculo;
  },
  
  update: async (id: number, veiculo: Partial<Veiculo>) => {
    const { data, error } = await supabase
      .from('veiculos')
      .update(veiculo)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Veiculo;
  },
  
  delete: async (id: number) => {
    const { error } = await supabase
      .from('veiculos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

export const oficinasDB = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('oficinas')
      .select('*');
    
    if (error) throw error;
    return data as Oficina[];
  },
  
  getById: async (id: number) => {
    const { data, error } = await supabase
      .from('oficinas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Oficina;
  },
  
  create: async (oficina: Omit<Oficina, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('oficinas')
      .insert(oficina)
      .select()
      .single();
    
    if (error) throw error;
    return data as Oficina;
  },
  
  update: async (id: number, oficina: Partial<Oficina>) => {
    const { data, error } = await supabase
      .from('oficinas')
      .update(oficina)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Oficina;
  },
  
  delete: async (id: number) => {
    const { error } = await supabase
      .from('oficinas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Adicione funções semelhantes para as outras tabelas conforme necessário 