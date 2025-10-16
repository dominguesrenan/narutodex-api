import { Router } from 'express';
import { query } from '../db.js';
import type { Village, Clan, Rank, Element, Team, Bijuu, Jutsu } from '../types.js';
import type { Request, Response, NextFunction } from 'express';

export const narutoRoutes = Router();

// ===== ALDEIAS =====

// Listar aldeias
narutoRoutes.get('/aldeias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query<Village>('SELECT * FROM aldeias ORDER BY nome');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Obter aldeia por id
narutoRoutes.get('/aldeias/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    // Buscar dados da aldeia com personagens relacionados
    const aldeiaResult = await query(
      `
      SELECT
        a.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'nome', p.nome,
              'rank_nome', r.nome,
              'cla_nome', c.nome,
              'vivo', p.vivo,
              'ativo', p.ativo
            ) ORDER BY p.nome
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) as personagens
      FROM aldeias a
      LEFT JOIN personagens p ON p.aldeia_id = a.id
      LEFT JOIN ranks r ON r.id = p.rank_id
      LEFT JOIN clas c ON c.id = p.cla_id
      WHERE a.id = $1
      GROUP BY a.id, a.nome, a.simbolo, a.lider, a.descricao, a.created_at
    `,
      [id],
    );

    if (!aldeiaResult.rows[0]) return res.status(404).json({ error: 'Aldeia não encontrada' });

    res.json(aldeiaResult.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ===== CLÃS =====

narutoRoutes.get('/clas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query<Clan>('SELECT * FROM clas ORDER BY nome');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

narutoRoutes.get('/clas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await query<Clan>('SELECT * FROM clas WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Clã não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ===== RANKS =====

narutoRoutes.get('/ranks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query<Rank>('SELECT * FROM ranks ORDER BY nivel ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

narutoRoutes.get('/ranks/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await query<Rank>('SELECT * FROM ranks WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Rank não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ===== ELEMENTOS =====

narutoRoutes.get('/elementos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query<Element>('SELECT * FROM elementos ORDER BY nome');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

narutoRoutes.get('/elementos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await query<Element>('SELECT * FROM elementos WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Elemento não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ===== TIMES =====

narutoRoutes.get('/times', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query<Team>(
      `SELECT t.*, a.nome as aldeia_nome
       FROM times t
       LEFT JOIN aldeias a ON a.id = t.aldeia_id
       ORDER BY t.nome`,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

narutoRoutes.get('/times/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await query<Team>(
      `SELECT t.*, a.nome as aldeia_nome
       FROM times t
       LEFT JOIN aldeias a ON a.id = t.aldeia_id
       WHERE t.id = $1`,
      [id],
    );
    if (!rows[0]) return res.status(404).json({ error: 'Time não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ===== BIJUUS =====

narutoRoutes.get('/bijuus', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query<Bijuu>('SELECT * FROM bijuus ORDER BY numero_caudas');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

narutoRoutes.get('/bijuus/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await query<Bijuu>('SELECT * FROM bijuus WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Bijuu não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ===== JUTSUS =====

narutoRoutes.get('/jutsus', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query<Jutsu>('SELECT * FROM jutsus ORDER BY nome');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ===== ESTATÍSTICAS =====

narutoRoutes.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Contar aldeias
    const aldeiasResult = await query('SELECT COUNT(*) as count FROM aldeias');
    const aldeias_count = aldeiasResult.rows[0].count;

    const clasResult = await query('SELECT COUNT(*) as count FROM clas');
    const clas_count = clasResult.rows[0].count;

    const ranksResult = await query('SELECT COUNT(*) as count FROM ranks');
    const ranks_count = ranksResult.rows[0].count;

    const elementosResult = await query('SELECT COUNT(*) as count FROM elementos');
    const elementos_count = elementosResult.rows[0].count;

    const timesResult = await query('SELECT COUNT(*) as count FROM times');
    const times_count = timesResult.rows[0].count;

    const bijuusResult = await query('SELECT COUNT(*) as count FROM bijuus');
    const bijuus_count = bijuusResult.rows[0].count;

    const jutsusResult = await query('SELECT COUNT(*) as count FROM jutsus');
    const jutsus_count = jutsusResult.rows[0].count;

    const personagensAtivosResult = await query(
      'SELECT COUNT(*) as count FROM personagens WHERE ativo = true',
    );
    const personagens_ativos = personagensAtivosResult.rows[0].count;

    const personagensVivosResult = await query(
      'SELECT COUNT(*) as count FROM personagens WHERE vivo = true',
    );
    const personagens_vivos = personagensVivosResult.rows[0].count;

    const stats = {
      aldeias_count: aldeias_count.toString(),
      clas_count: clas_count.toString(),
      ranks_count: ranks_count.toString(),
      elementos_count: elementos_count.toString(),
      times_count: times_count.toString(),
      bijuus_count: bijuus_count.toString(),
      jutsus_count: jutsus_count.toString(),
      personagens_ativos: personagens_ativos.toString(),
      personagens_vivos: personagens_vivos.toString(),
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
});
