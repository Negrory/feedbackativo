-- Criar tabela de oficinas
CREATE TABLE IF NOT EXISTS oficinas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  endereco TEXT NOT NULL,
  cidade TEXT,
  estado TEXT,
  status TEXT CHECK (status IN ('ativa', 'ociosa', 'analise')) DEFAULT 'ativa',
  servicos TEXT[] DEFAULT '{}',
  veiculos_ativos INTEGER DEFAULT 0,
  responsavel TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de veículos
CREATE TABLE IF NOT EXISTS veiculos (
  id SERIAL PRIMARY KEY,
  placa TEXT NOT NULL UNIQUE,
  modelo TEXT NOT NULL,
  chassi TEXT NOT NULL,
  renavam TEXT NOT NULL,
  cpf_cnpj_cliente TEXT NOT NULL,
  nome_cliente TEXT NOT NULL,
  telefone_cliente TEXT NOT NULL,
  valor_fipe NUMERIC(10,2) NOT NULL,
  oficina_id INTEGER REFERENCES oficinas(id),
  consultor_id TEXT NOT NULL,
  nome_consultor TEXT NOT NULL,
  email_consultor TEXT,
  is_terceiro BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('aguardando', 'em_andamento', 'finalizado', 'atrasado')) DEFAULT 'aguardando',
  inspection_status TEXT CHECK (inspection_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  data_entrada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  data_saida TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de atualizações
CREATE TABLE IF NOT EXISTS atualizacoes (
  id SERIAL PRIMARY KEY,
  veiculo_id INTEGER REFERENCES veiculos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  status TEXT CHECK (status IN ('aguardando', 'em_andamento', 'finalizado', 'atrasado')) DEFAULT 'em_andamento',
  data_prevista TIMESTAMP WITH TIME ZONE,
  consultor_id TEXT NOT NULL,
  nome_consultor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de vistorias
CREATE TABLE IF NOT EXISTS vistorias (
  id SERIAL PRIMARY KEY,
  veiculo_id INTEGER REFERENCES veiculos(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('entrada', 'saida')) NOT NULL,
  fotos_danificadas TEXT[] DEFAULT '{}',
  fotos_seguranca TEXT[] DEFAULT '{}',
  kit_seguranca_presente BOOLEAN DEFAULT true,
  kit_seguranca_descricao TEXT,
  com_chave_ignicao BOOLEAN DEFAULT true,
  observacoes TEXT,
  videos TEXT[] DEFAULT '{}',
  video_descricao TEXT,
  data_vistoria TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  consultor_id TEXT NOT NULL,
  nome_consultor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de feedbacks
CREATE TABLE IF NOT EXISTS feedbacks (
  id SERIAL PRIMARY KEY,
  veiculo_id INTEGER REFERENCES veiculos(id) ON DELETE CASCADE,
  avaliacao INTEGER CHECK (avaliacao BETWEEN 1 AND 5) NOT NULL,
  comentario TEXT,
  autoriza_publicacao BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('pendente', 'aprovado', 'rejeitado')) DEFAULT 'pendente',
  data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para todas as tabelas
CREATE TRIGGER update_oficinas_updated_at
BEFORE UPDATE ON oficinas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_veiculos_updated_at
BEFORE UPDATE ON veiculos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_atualizacoes_updated_at
BEFORE UPDATE ON atualizacoes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vistorias_updated_at
BEFORE UPDATE ON vistorias
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedbacks_updated_at
BEFORE UPDATE ON feedbacks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Criar algumas oficinas iniciais para teste
INSERT INTO oficinas (nome, cnpj, telefone, email, endereco, cidade, estado, status, servicos, veiculos_ativos, responsavel)
VALUES
  ('Oficina Central', '12.345.678/0001-90', '(11) 98765-4321', 'contato@oficinacentral.com.br', 'Av. Central, 123', 'São Paulo', 'SP', 'ativa', ARRAY['Funilaria', 'Pintura', 'Mecânica'], 42, 'João Silva'),
  ('Oficina Norte', '23.456.789/0001-01', '(11) 91234-5678', 'contato@oficinanorte.com.br', 'Rua Norte, 456', 'São Paulo', 'SP', 'ativa', ARRAY['Funilaria', 'Pintura', 'Elétrica'], 28, 'Maria Souza'),
  ('Oficina Sul', '34.567.890/0001-12', '(11) 95555-7777', 'contato@oficinasul.com.br', 'Rua Sul, 789', 'São Paulo', 'SP', 'ociosa', ARRAY['Funilaria', 'Pintura'], 0, 'Pedro Santos')
ON CONFLICT (id) DO NOTHING;

-- Adicionar campos na tabela oficinas
ALTER TABLE oficinas
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('ativa', 'ociosa', 'analise')) DEFAULT 'ativa',
ADD COLUMN IF NOT EXISTS servicos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS veiculos_ativos INTEGER DEFAULT 0;

-- Adicionar campos na tabela veiculos
ALTER TABLE veiculos
ADD COLUMN IF NOT EXISTS inspection_status TEXT CHECK (inspection_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending';

-- Adicionar campos na tabela vistorias
ALTER TABLE vistorias
ADD COLUMN IF NOT EXISTS fotos_danificadas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS fotos_seguranca TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS kit_seguranca_presente BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS kit_seguranca_descricao TEXT,
ADD COLUMN IF NOT EXISTS com_chave_ignicao BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_descricao TEXT,
ADD COLUMN IF NOT EXISTS data_vistoria TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending';

-- Atualizar dados existentes na tabela oficinas
UPDATE oficinas
SET 
  cnpj = '12.345.678/0001-90',
  email = 'contato@oficinacentral.com.br',
  cidade = 'São Paulo',
  estado = 'SP',
  status = 'ativa',
  servicos = ARRAY['Funilaria', 'Pintura', 'Mecânica'],
  veiculos_ativos = 42
WHERE nome = 'Oficina Central';

UPDATE oficinas
SET 
  cnpj = '23.456.789/0001-01',
  email = 'contato@oficinanorte.com.br',
  cidade = 'São Paulo',
  estado = 'SP',
  status = 'ativa',
  servicos = ARRAY['Funilaria', 'Pintura', 'Elétrica'],
  veiculos_ativos = 28
WHERE nome = 'Oficina Norte';

UPDATE oficinas
SET 
  cnpj = '34.567.890/0001-12',
  email = 'contato@oficinasul.com.br',
  cidade = 'São Paulo',
  estado = 'SP',
  status = 'ociosa',
  servicos = ARRAY['Funilaria', 'Pintura'],
  veiculos_ativos = 0
WHERE nome = 'Oficina Sul';

-- Criar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_oficinas_status ON oficinas(status);
CREATE INDEX IF NOT EXISTS idx_veiculos_status ON veiculos(status);
CREATE INDEX IF NOT EXISTS idx_veiculos_inspection_status ON veiculos(inspection_status);
CREATE INDEX IF NOT EXISTS idx_vistorias_tipo ON vistorias(tipo);
CREATE INDEX IF NOT EXISTS idx_vistorias_status ON vistorias(status); 