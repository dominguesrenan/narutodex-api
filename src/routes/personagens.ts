import { Router } from 'express';
import { query } from '../db.js';
import type { Character } from '../types.js';
import type { Request, Response, NextFunction } from 'express';

export const personagens = Router();

// Autocomplete de aldeias
personagens.get(
  '/aldeias/autocomplete',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query as { q?: string };
      const where: string[] = [];
      const params: any[] = [];

      if (q) {
        // Remove acentos do termo de busca
        const normalizedQuery = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        params.push(`%${normalizedQuery.toLowerCase()}%`);
        where.push(
          `LOWER(TRANSLATE(nome, 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')) LIKE $${params.length}`,
        );
      }

      const sql = `
      SELECT nome, COUNT(*) as count
      FROM aldeias
      WHERE nome IS NOT NULL
      ${where.length ? 'AND ' + where.join(' AND ') : ''}
      GROUP BY nome
      HAVING COUNT(*) > 0
      ORDER BY count DESC, nome
      LIMIT 10
    `;
      const { rows } = await query(sql, params);
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },
);

personagens.get('/clas/autocomplete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query as { q?: string };
    const where: string[] = [];
    const params: any[] = [];

    if (q) {
      const normalizedQuery = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      params.push(`%${normalizedQuery.toLowerCase()}%`);
      where.push(
        `LOWER(TRANSLATE(nome, 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')) LIKE $${params.length}`,
      );
    }

    const sql = `
      SELECT nome, COUNT(*) as count
      FROM clas
      WHERE nome IS NOT NULL
      ${where.length ? 'AND ' + where.join(' AND ') : ''}
      GROUP BY nome
      HAVING COUNT(*) > 0
      ORDER BY count DESC, nome
      LIMIT 10
    `;
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

personagens.get('/ranks/autocomplete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query as { q?: string };
    const where: string[] = [];
    const params: any[] = [];

    if (q) {
      const normalizedQuery = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      params.push(`%${normalizedQuery.toLowerCase()}%`);
      where.push(
        `LOWER(TRANSLATE(nome, 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')) LIKE $${params.length}`,
      );
    }

    const sql = `
      SELECT nome, nivel, COUNT(*) as count
      FROM ranks
      WHERE nome IS NOT NULL
      ${where.length ? 'AND ' + where.join(' AND ') : ''}
      GROUP BY nome, nivel
      HAVING COUNT(*) > 0
      ORDER BY nivel ASC, count DESC, nome
      LIMIT 10
    `;
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

personagens.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, aldeia_id, cla_id, rank_id, time_id, vivo, ativo, elementos } = req.query as {
      q?: string;
      aldeia_id?: string;
      cla_id?: string;
      rank_id?: string;
      time_id?: string;
      vivo?: string;
      ativo?: string;
      elementos?: string;
    };

    const params: any[] = [];
    const where: string[] = [];

    if (q) {
      const normalizedQuery = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      params.push(`%${normalizedQuery.toLowerCase()}%`);
      where.push(
        "(LOWER(TRANSLATE(p.nome, 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')) LIKE $" +
          params.length +
          " OR LOWER(TRANSLATE(p.descricao, 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')) LIKE $" +
          params.length +
          " OR LOWER(TRANSLATE(p.jutsu_principal, 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')) LIKE $" +
          params.length +
          ')',
      );
    }

    if (aldeia_id) {
      params.push(Number(aldeia_id));
      where.push('p.aldeia_id = $' + params.length);
    }

    if (cla_id) {
      params.push(Number(cla_id));
      where.push('p.cla_id = $' + params.length);
    }

    if (rank_id) {
      params.push(Number(rank_id));
      where.push('p.rank_id = $' + params.length);
    }

    if (time_id) {
      params.push(Number(time_id));
      where.push('p.time_id = $' + params.length);
    }

    if (vivo !== undefined) {
      params.push(vivo === 'true');
      where.push('p.vivo = $' + params.length);
    }

    if (ativo !== undefined) {
      params.push(ativo === 'true');
      where.push('p.ativo = $' + params.length);
    }

    if (elementos) {
      const elementosArray = elementos.split(',').map((id) => parseInt(id.trim()));
      params.push(elementosArray);
      where.push('p.elementos && $' + params.length);
    }

    const sql = `
      SELECT
        p.*,
        a.nome AS aldeia_nome,
        a.simbolo AS aldeia_simbolo,
        c.nome AS cla_nome,
        c.simbolo AS cla_simbolo,
        r.nome AS rank_nome,
        r.nivel AS rank_nivel,
        t.nome AS time_nome,
        m.nome AS mestre_nome
      FROM personagens p
      LEFT JOIN aldeias a ON a.id = p.aldeia_id
      LEFT JOIN clas c ON c.id = p.cla_id
      LEFT JOIN ranks r ON r.id = p.rank_id
      LEFT JOIN times t ON t.id = p.time_id
      LEFT JOIN personagens m ON m.id = p.mestre_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY p.nome ASC
    `;

    const { rows } = await query<Character>(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

personagens.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await query<Character>(
      `SELECT
        p.*,
        a.nome AS aldeia_nome,
        a.simbolo AS aldeia_simbolo,
        c.nome AS cla_nome,
        c.simbolo AS cla_simbolo,
        r.nome AS rank_nome,
        r.nivel AS rank_nivel,
        t.nome AS time_nome,
        m.nome AS mestre_nome
       FROM personagens p
       LEFT JOIN aldeias a ON a.id = p.aldeia_id
       LEFT JOIN clas c ON c.id = p.cla_id
       LEFT JOIN ranks r ON r.id = p.rank_id
       LEFT JOIN times t ON t.id = p.time_id
       LEFT JOIN personagens m ON m.id = p.mestre_id
       WHERE p.id = $1`,
      [id],
    );

    if (!rows[0]) return res.status(404).json({ error: 'Personagem não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Criar personagem
personagens.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      nome,
      nome_alternativo,
      descricao,
      historia,
      aldeia_id,
      cla_id,
      rank_id,
      time_id,
      mestre_id,
      idade,
      altura_cm,
      peso_kg,
      aniversario,
      elementos,
      jutsu_principal,
      jutsu_secundario,
      kekkei_genkai,
      ativo,
      vivo,
      foto_url,
      wiki_url,
    } = req.body as Partial<Character> & {
      aldeia_id?: number | null;
      cla_id?: number | null;
      rank_id?: number | null;
      time_id?: number | null;
      mestre_id?: number | null;
    };

    if (!nome || !aldeia_id || !cla_id || !rank_id) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome, aldeia_id, cla_id, rank_id',
      });
    }

    const { rows } = await query<Character>(
      `INSERT INTO personagens (
        nome, nome_alternativo, descricao, historia,
        aldeia_id, cla_id, rank_id, time_id, mestre_id,
        idade, altura_cm, peso_kg, aniversario,
        elementos, jutsu_principal, jutsu_secundario, kekkei_genkai,
        ativo, vivo, foto_url, wiki_url
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,$11,$12,$13,$14,$15,$16,$17,
        COALESCE($18,true),COALESCE($19,true),$20,$21
      ) RETURNING *`,
      [
        nome,
        nome_alternativo ?? null,
        descricao ?? null,
        historia ?? null,
        aldeia_id ?? null,
        cla_id ?? null,
        rank_id ?? null,
        time_id ?? null,
        mestre_id ?? null,
        idade ?? null,
        altura_cm ?? null,
        peso_kg ?? null,
        aniversario ?? null,
        elementos ?? null,
        jutsu_principal ?? null,
        jutsu_secundario ?? null,
        kekkei_genkai ?? null,
        ativo ?? true,
        vivo ?? true,
        foto_url ?? null,
        wiki_url ?? null,
      ],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Atualizar personagem
personagens.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const {
      nome,
      nome_alternativo,
      descricao,
      historia,
      aldeia_id,
      cla_id,
      rank_id,
      time_id,
      mestre_id,
      idade,
      altura_cm,
      peso_kg,
      aniversario,
      elementos,
      jutsu_principal,
      jutsu_secundario,
      kekkei_genkai,
      ativo,
      vivo,
      foto_url,
      wiki_url,
    } = req.body as Partial<Character> & {
      aldeia_id?: number | null;
      cla_id?: number | null;
      rank_id?: number | null;
      time_id?: number | null;
      mestre_id?: number | null;
    };

    const { rows } = await query<Character>(
      `UPDATE personagens SET
        nome = COALESCE($1, nome),
        nome_alternativo = COALESCE($2, nome_alternativo),
        descricao = COALESCE($3, descricao),
        historia = COALESCE($4, historia),
        aldeia_id = COALESCE($5, aldeia_id),
        cla_id = COALESCE($6, cla_id),
        rank_id = COALESCE($7, rank_id),
        time_id = COALESCE($8, time_id),
        mestre_id = COALESCE($9, mestre_id),
        idade = COALESCE($10, idade),
        altura_cm = COALESCE($11, altura_cm),
        peso_kg = COALESCE($12, peso_kg),
        aniversario = COALESCE($13, aniversario),
        elementos = COALESCE($14, elementos),
        jutsu_principal = COALESCE($15, jutsu_principal),
        jutsu_secundario = COALESCE($16, jutsu_secundario),
        kekkei_genkai = COALESCE($17, kekkei_genkai),
        ativo = COALESCE($18, ativo),
        vivo = COALESCE($19, vivo),
        foto_url = COALESCE($20, foto_url),
        wiki_url = COALESCE($21, wiki_url)
       WHERE id = $22 RETURNING *`,
      [
        nome ?? null,
        nome_alternativo ?? null,
        descricao ?? null,
        historia ?? null,
        aldeia_id ?? null,
        cla_id ?? null,
        rank_id ?? null,
        time_id ?? null,
        mestre_id ?? null,
        idade ?? null,
        altura_cm ?? null,
        peso_kg ?? null,
        aniversario ?? null,
        elementos ?? null,
        jutsu_principal ?? null,
        jutsu_secundario ?? null,
        kekkei_genkai ?? null,
        ativo ?? null,
        vivo ?? null,
        foto_url ?? null,
        wiki_url ?? null,
        id,
      ],
    );

    if (!rows[0]) return res.status(404).json({ error: 'Personagem não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Deletar personagem
personagens.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { rowCount } = await query('DELETE FROM personagens WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Personagem não encontrado' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
