-- Primeiro, vamos fazer backup dos dados dos consultores que estão sendo referenciados
CREATE TABLE IF NOT EXISTS backup_consultores AS
SELECT DISTINCT c.*
FROM consultores c
JOIN veiculos v ON v.consultor_id = c.id
JOIN atualizacoes a ON a.consultor_id = c.id
JOIN vistorias vis ON vis.consultor_id = c.id;

-- Agora vamos atualizar a tabela de veículos
ALTER TABLE veiculos
  DROP CONSTRAINT IF EXISTS veiculos_consultor_id_fkey,
  ALTER COLUMN consultor_id TYPE TEXT,
  ADD COLUMN nome_consultor TEXT;

-- Atualizar os dados dos consultores na tabela de veículos
UPDATE veiculos v
SET 
  nome_consultor = c.nome
FROM backup_consultores c
WHERE v.consultor_id = c.id::TEXT;

-- Preencher valores nulos com valores padrão
UPDATE veiculos
SET nome_consultor = 'Consultor não identificado'
WHERE nome_consultor IS NULL;

-- Atualizar a tabela de atualizações
ALTER TABLE atualizacoes
  DROP CONSTRAINT IF EXISTS atualizacoes_consultor_id_fkey,
  ALTER COLUMN consultor_id TYPE TEXT,
  ADD COLUMN nome_consultor TEXT;

-- Atualizar os dados dos consultores na tabela de atualizações
UPDATE atualizacoes a
SET 
  nome_consultor = c.nome
FROM backup_consultores c
WHERE a.consultor_id = c.id::TEXT;

-- Preencher valores nulos com valores padrão
UPDATE atualizacoes
SET nome_consultor = 'Consultor não identificado'
WHERE nome_consultor IS NULL;

-- Atualizar a tabela de vistorias
ALTER TABLE vistorias
  DROP CONSTRAINT IF EXISTS vistorias_consultor_id_fkey,
  ALTER COLUMN consultor_id TYPE TEXT,
  ADD COLUMN nome_consultor TEXT;

-- Atualizar os dados dos consultores na tabela de vistorias
UPDATE vistorias v
SET 
  nome_consultor = c.nome
FROM backup_consultores c
WHERE v.consultor_id = c.id::TEXT;

-- Preencher valores nulos com valores padrão
UPDATE vistorias
SET nome_consultor = 'Consultor não identificado'
WHERE nome_consultor IS NULL;

-- Remover a tabela de consultores
DROP TABLE IF EXISTS consultores;

-- Remover a tabela de backup após confirmar que tudo está correto
-- DROP TABLE IF EXISTS backup_consultores;

-- Adicionar NOT NULL constraints após a migração dos dados
ALTER TABLE veiculos
  ALTER COLUMN consultor_id SET NOT NULL,
  ALTER COLUMN nome_consultor SET NOT NULL;

ALTER TABLE atualizacoes
  ALTER COLUMN consultor_id SET NOT NULL,
  ALTER COLUMN nome_consultor SET NOT NULL;

ALTER TABLE vistorias
  ALTER COLUMN consultor_id SET NOT NULL,
  ALTER COLUMN nome_consultor SET NOT NULL; 