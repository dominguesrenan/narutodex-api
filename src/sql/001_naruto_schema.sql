-- 001_naruto_schema.sql

BEGIN;

-- Tabela de Aldeias (Konoha, Suna, Kiri, Iwa, Kumo, etc.)
CREATE TABLE IF NOT EXISTS aldeias (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  simbolo TEXT,
  lider TEXT,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Clãs (Uchiha, Uzumaki, Hyuga, Nara, etc.)
CREATE TABLE IF NOT EXISTS clas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  simbolo TEXT,
  elemento_principal TEXT,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Ranks (Genin, Chunin, Jonin, Kage, etc.)
CREATE TABLE IF NOT EXISTS ranks (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  nivel INTEGER NOT NULL, -- 1=Genin, 2=Chunin, 3=Jonin, 4=Kage, etc.
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Elementos (Fogo, Água, Terra, Ar, Raio)
CREATE TABLE IF NOT EXISTS elementos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  simbolo TEXT,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Times (Time 7, Akatsuki, etc.)
CREATE TABLE IF NOT EXISTS times (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  aldeia_id INTEGER REFERENCES aldeias(id) ON DELETE SET NULL,
  lider TEXT,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(nome, aldeia_id)
);

-- Tabela principal de Personagens
CREATE TABLE IF NOT EXISTS personagens (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  nome_alternativo TEXT,
  descricao TEXT,
  historia TEXT,

  -- Relacionamentos
  aldeia_id INTEGER REFERENCES aldeias(id) ON DELETE SET NULL,
  cla_id INTEGER REFERENCES clas(id) ON DELETE SET NULL,
  rank_id INTEGER REFERENCES ranks(id) ON DELETE SET NULL,
  time_id INTEGER REFERENCES times(id) ON DELETE SET NULL,
  mestre_id INTEGER REFERENCES personagens(id) ON DELETE SET NULL,

  -- Atributos físicos e poderes
  idade INTEGER,
  altura_cm INTEGER,
  peso_kg INTEGER,
  aniversario DATE,

  -- Elementos (array de IDs)
  elementos INTEGER[],

  -- Jutsus e habilidades
  jutsu_principal TEXT,
  jutsu_secundario TEXT,
  kekkei_genkai TEXT,

  -- Status
  ativo BOOLEAN NOT NULL DEFAULT true,
  vivo BOOLEAN NOT NULL DEFAULT true,

  -- Mídia
  foto_url TEXT,
  wiki_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_aldeias_nome ON aldeias(nome);
CREATE INDEX IF NOT EXISTS idx_clas_nome ON clas(nome);
CREATE INDEX IF NOT EXISTS idx_ranks_nome ON ranks(nome);
CREATE INDEX IF NOT EXISTS idx_ranks_nivel ON ranks(nivel);
CREATE INDEX IF NOT EXISTS idx_elementos_nome ON elementos(nome);
CREATE INDEX IF NOT EXISTS idx_times_nome ON times(nome);
CREATE INDEX IF NOT EXISTS idx_times_aldeia_id ON times(aldeia_id);

CREATE INDEX IF NOT EXISTS idx_personagens_nome ON personagens(nome);
CREATE INDEX IF NOT EXISTS idx_personagens_aldeia_id ON personagens(aldeia_id);
CREATE INDEX IF NOT EXISTS idx_personagens_cla_id ON personagens(cla_id);
CREATE INDEX IF NOT EXISTS idx_personagens_rank_id ON personagens(rank_id);
CREATE INDEX IF NOT EXISTS idx_personagens_time_id ON personagens(time_id);
CREATE INDEX IF NOT EXISTS idx_personagens_mestre_id ON personagens(mestre_id);
CREATE INDEX IF NOT EXISTS idx_personagens_ativo ON personagens(ativo);
CREATE INDEX IF NOT EXISTS idx_personagens_vivo ON personagens(vivo);

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_personagens_updated_at') THEN
    CREATE TRIGGER update_personagens_updated_at
    BEFORE UPDATE ON personagens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Dados básicos serão inseridos via arquivos JSON no processo de migração

COMMIT;
