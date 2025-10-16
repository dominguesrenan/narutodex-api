-- 003_add_unique_constraint.sql

BEGIN;

-- Adicionar constraint única para personagens (nome)
DELETE FROM personagens a USING (
  SELECT MIN(ctid) as ctid, nome
  FROM personagens
  GROUP BY nome HAVING COUNT(*) > 1
) b
WHERE a.nome = b.nome
AND a.ctid <> b.ctid;

-- Agora adicionar a constraint única
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'personagens_nome_unique') THEN
    ALTER TABLE personagens ADD CONSTRAINT personagens_nome_unique UNIQUE (nome);
  END IF;
END $$;

-- Adicionar constraint única para usuários (email) se necessário
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_email_unique') THEN
    DELETE FROM usuarios a USING (
      SELECT MIN(ctid) as ctid, email
      FROM usuarios
      GROUP BY email HAVING COUNT(*) > 1
    ) b
    WHERE a.email = b.email
    AND a.ctid <> b.ctid;

    ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_unique UNIQUE (email);
  END IF;
END $$;

COMMIT;
