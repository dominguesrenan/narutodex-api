-- 002_jutsus_and_enhancements.sql

BEGIN;

-- Tabela de Jutsus (Técnicas Ninja)
CREATE TABLE IF NOT EXISTS jutsus (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  nome_alternativo TEXT,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('Ninjutsu', 'Taijutsu', 'Genjutsu', 'KekkeiGenkai', 'Kinjutsu', 'Senjutsu')),
  natureza TEXT,
  classificacao TEXT,
  alcance TEXT,
  usuario_principal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de relacionamento Personagem-Jutsu (muitos-para-muitos)
CREATE TABLE IF NOT EXISTS personagem_jutsus (
  id SERIAL PRIMARY KEY,
  personagem_id INTEGER NOT NULL REFERENCES personagens(id) ON DELETE CASCADE,
  jutsu_id INTEGER NOT NULL REFERENCES jutsus(id) ON DELETE CASCADE,
  proficiencia TEXT CHECK (proficiencia IN ('Iniciante', 'Intermediario', 'Avancado', 'Mestre')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(personagem_id, jutsu_id)
);

-- Tabela de Bijuu (Bestas com Cauda)
CREATE TABLE IF NOT EXISTS bijuus (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  numero_caudas INTEGER NOT NULL UNIQUE CHECK (numero_caudas >= 1 AND numero_caudas <= 9),
  jinchuriki_atual TEXT,
  jinchuriki_anterior TEXT,
  elemento_principal TEXT,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar coluna bijuu_id na tabela personagens
ALTER TABLE personagens ADD COLUMN IF NOT EXISTS bijuu_id INTEGER REFERENCES bijuus(id) ON DELETE SET NULL;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_jutsus_nome ON jutsus(nome);
CREATE INDEX IF NOT EXISTS idx_jutsus_tipo ON jutsus(tipo);
CREATE INDEX IF NOT EXISTS idx_jutsus_natureza ON jutsus(natureza);
CREATE INDEX IF NOT EXISTS idx_jutsus_classificacao ON jutsus(classificacao);

CREATE INDEX IF NOT EXISTS idx_personagem_jutsus_personagem_id ON personagem_jutsus(personagem_id);
CREATE INDEX IF NOT EXISTS idx_personagem_jutsus_jutsu_id ON personagem_jutsus(jutsu_id);

CREATE INDEX IF NOT EXISTS idx_bijuus_numero_caudas ON bijuus(numero_caudas);

COMMIT;
