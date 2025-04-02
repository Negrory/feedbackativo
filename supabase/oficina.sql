-- Adicionar campos na tabela oficinas
ALTER TABLE oficinas
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('ativa', 'ociosa', 'analise')) DEFAULT 'ativa',
ADD COLUMN IF NOT EXISTS servicos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS veiculos_ativos INTEGER DEFAULT 0;

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

-- Criar índice para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_oficinas_status ON oficinas(status); 