export interface Village {
  id: number;
  nome: string;
  simbolo?: string;
  lider?: string;
  descricao?: string;
  created_at: string;
}

export interface Clan {
  id: number;
  nome: string;
  simbolo?: string;
  elemento_principal?: string;
  descricao?: string;
  created_at: string;
}

export interface Rank {
  id: number;
  nome: string;
  nivel: number;
  descricao?: string;
  created_at: string;
}

export interface Element {
  id: number;
  nome: string;
  simbolo?: string;
  descricao?: string;
  created_at: string;
}

export interface Bijuu {
  id: number;
  nome: string;
  numero_caudas: number;
  jinchuriki_atual?: string;
  elemento_principal: string;
  descricao: string;
  created_at: string;
}

export interface Jutsu {
  id: number;
  nome: string;
  nome_alternativo?: string;
  descricao: string;
  tipo: string;
  natureza?: string;
  classificacao: string;
  alcance: string;
  usuario_principal: string;
  created_at: string;
}

export interface Character {
  id: number;
  nome: string;
  nome_alternativo?: string;
  descricao?: string;
  historia?: string;

  aldeia_id?: number;
  cla_id?: number;
  rank_id?: number;
  time_id?: number;
  mestre_id?: number;

  idade?: number;
  altura_cm?: number;
  peso_kg?: number;
  aniversario?: string;

  elementos?: number[];

  jutsu_principal?: string;
  jutsu_secundario?: string;
  kekkei_genkai?: string;

  ativo: boolean;
  vivo: boolean;

  foto_url?: string;
  wiki_url?: string;

  created_at: string;
  updated_at: string;

  aldeia?: Village;
  cla?: Clan;
  rank?: Rank;
  time?: Team;
  mestre?: Character;
  elementos_detalhes?: Element[];
}

export interface CharacterFilters {
  aldeia_id?: number;
  cla_id?: number;
  rank_id?: number;
  time_id?: number;
  elementos?: number[];
  vivo?: boolean;
  ativo?: boolean;
  q?: string;
}

export interface CharacterQuery extends CharacterFilters {
  limit?: number;
  offset?: number;
  order_by?: 'nome' | 'aldeia' | 'rank' | 'created_at';
  order_dir?: 'asc' | 'desc';
}
