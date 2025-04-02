-- Remover a coluna email_consultor da tabela veiculos
ALTER TABLE veiculos
  DROP COLUMN IF EXISTS email_consultor;

-- Garantir que as constraints NOT NULL estejam corretas
ALTER TABLE veiculos
  ALTER COLUMN consultor_id SET NOT NULL,
  ALTER COLUMN nome_consultor SET NOT NULL;

ALTER TABLE atualizacoes
  ALTER COLUMN consultor_id SET NOT NULL,
  ALTER COLUMN nome_consultor SET NOT NULL;

ALTER TABLE vistorias
  ALTER COLUMN consultor_id SET NOT NULL,
  ALTER COLUMN nome_consultor SET NOT NULL; 