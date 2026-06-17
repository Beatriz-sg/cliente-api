-- ============================================================
-- MIGRATION: Perfil completo do cliente — Docelivery
-- Banco: SQL Server
-- Todos os ALTER TABLE são seguros (IF NOT EXISTS)
-- ============================================================

-- ATENÇÃO P2: Se cpf e data_nascimento existem mas não aparecem no perfil,
-- o problema está no DTO do backend — verificar mapeamento Entity → DTO.

-- 1. apelido
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'apelido'
)
  ALTER TABLE usuarios ADD apelido NVARCHAR(100) NULL;

-- 2. data_nascimento (confirmar nome exato da coluna no seu banco)
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'data_nascimento'
)
  ALTER TABLE usuarios ADD data_nascimento DATE NULL;

-- 3. telefone
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'telefone'
)
  ALTER TABLE usuarios ADD telefone NVARCHAR(20) NULL;

-- 4. cep
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'cep'
)
  ALTER TABLE usuarios ADD cep NVARCHAR(10) NULL;

-- 5. logradouro
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'logradouro'
)
  ALTER TABLE usuarios ADD logradouro NVARCHAR(255) NULL;

-- 6. numero
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'numero'
)
  ALTER TABLE usuarios ADD numero NVARCHAR(20) NULL;

-- 7. complemento
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'complemento'
)
  ALTER TABLE usuarios ADD complemento NVARCHAR(100) NULL;

-- 8. bairro
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'bairro'
)
  ALTER TABLE usuarios ADD bairro NVARCHAR(100) NULL;

-- 9. cidade
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'cidade'
)
  ALTER TABLE usuarios ADD cidade NVARCHAR(100) NULL;

-- 10. estado (UF — 2 chars)
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'estado'
)
  ALTER TABLE usuarios ADD estado NVARCHAR(2) NULL;

-- 11. foto_perfil
-- ATENÇÃO P3: este campo DEVE existir para o upload funcionar
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'foto_perfil'
)
  ALTER TABLE usuarios ADD foto_perfil NVARCHAR(500) NULL;

-- 12. preferencias (JSON array como texto)
-- Exemplo: '["Bolos","Cupcakes"]'
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'preferencias'
)
  ALTER TABLE usuarios ADD preferencias NVARCHAR(MAX) NULL;

-- 13. restricoes (JSON array como texto)
-- Exemplo: '["Sem Glúten","Vegano"]'
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'restricoes'
)
  ALTER TABLE usuarios ADD restricoes NVARCHAR(MAX) NULL;

-- ============================================================
-- VERIFICAÇÃO: consultar campos do cliente para diagnóstico P2
-- ============================================================
-- SELECT id, nome, cpf, data_nascimento, apelido, telefone,
--        foto_perfil, preferencias, restricoes
-- FROM usuarios
-- WHERE tipo_usuario = 'CLIENTE'
-- ORDER BY id DESC;

-- ============================================================
-- Se sua tabela se chama 'clientes' em vez de 'usuarios',
-- substitua todas as ocorrências acima.
-- ============================================================
