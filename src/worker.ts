// Declarações básicas para Cloudflare Workers
declare const Response: any;
declare const URL: any;
declare const URLSearchParams: any;
declare const console: any;
declare const crypto: any;
declare const TextEncoder: any;
declare const btoa: any;
declare const atob: any;

// Funções auxiliares simples para autenticação
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

function generateToken(userId: number): string {
  return btoa(JSON.stringify({ userId, exp: Date.now() + 24 * 60 * 60 * 1000 }));
}

function verifyToken(token: string): number | null {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp > Date.now()) {
      return decoded.userId;
    }
    return null;
  } catch {
    return null;
  }
}

var worker_default = {
  async fetch(request: any, env: any, ctx: any) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || 'https://narutodex.pages.dev',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    };
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }
    const url = new URL(request.url);
    try {
      if (url.pathname === '/health') {
        try {
          await env.DB.prepare('SELECT 1').first();
          return Response.json({ ok: true }, { headers: corsHeaders });
        } catch (err) {
          return Response.json(
            { ok: false, error: 'Database connection failed' },
            {
              status: 500,
              headers: corsHeaders,
            },
          );
        }
      }
      if (url.pathname === '/' || url.pathname === '') {
        return Response.json(
          {
            name: 'Narutodex API',
            version: '2.0.0',
            description: 'API para personagens do universo Naruto',
            endpoints: {
              health: 'GET /health',
              personagens: 'GET /api/personagens',
              personagens_id: 'GET /api/personagens/{id}',
              aldeias: 'GET /api/naruto/aldeias',
              clas: 'GET /api/naruto/clas',
              ranks: 'GET /api/naruto/ranks',
              elementos: 'GET /api/naruto/elementos',
              times: 'GET /api/naruto/times',
              stats: 'GET /api/naruto/stats',
            },
            status: 'online',
          },
          { headers: corsHeaders },
        );
      }

      // Rotas de Naruto (aldeias, clãs, ranks, elementos, times, estatísticas)
      if (url.pathname.startsWith('/api/naruto/aldeias')) {
        const pathParts = url.pathname.split('/');
        const id = pathParts[4];
        if (request.method === 'GET') {
          try {
            let query,
              params = [];
            if (id) {
              query = `SELECT * FROM aldeias WHERE id = ?`;
              params = [id];
            } else {
              query = `SELECT * FROM aldeias ORDER BY nome`;
            }
            const aldeias = await env.DB.prepare(query)
              .bind(...params)
              .all();
            return Response.json(
              {
                success: true,
                data: aldeias.results || [],
                count: aldeias.results?.length || 0,
              },
              { headers: corsHeaders },
            );
          } catch (error) {
            return Response.json(
              {
                success: false,
                error: 'Erro ao buscar aldeias',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
              },
              {
                status: 500,
                headers: corsHeaders,
              },
            );
          }
        }
      }

      if (url.pathname.startsWith('/api/naruto/clas')) {
        const pathParts = url.pathname.split('/');
        const id = pathParts[4];
        if (request.method === 'GET') {
          try {
            let query,
              params = [];
            if (id) {
              query = `SELECT * FROM clas WHERE id = ?`;
              params = [id];
            } else {
              query = `SELECT * FROM clas ORDER BY nome`;
            }
            const clas = await env.DB.prepare(query)
              .bind(...params)
              .all();
            return Response.json(
              {
                success: true,
                data: clas.results || [],
                count: clas.results?.length || 0,
              },
              { headers: corsHeaders },
            );
          } catch (error) {
            return Response.json(
              {
                success: false,
                error: 'Erro ao buscar clãs',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
              },
              {
                status: 500,
                headers: corsHeaders,
              },
            );
          }
        }
      }

      if (url.pathname.startsWith('/api/naruto/ranks')) {
        const pathParts = url.pathname.split('/');
        const id = pathParts[4];
        if (request.method === 'GET') {
          try {
            let query,
              params = [];
            if (id) {
              query = `SELECT * FROM ranks WHERE id = ?`;
              params = [id];
            } else {
              query = `SELECT * FROM ranks ORDER BY nivel ASC`;
            }
            const ranks = await env.DB.prepare(query)
              .bind(...params)
              .all();
            return Response.json(
              {
                success: true,
                data: ranks.results || [],
                count: ranks.results?.length || 0,
              },
              { headers: corsHeaders },
            );
          } catch (error) {
            return Response.json(
              {
                success: false,
                error: 'Erro ao buscar ranks',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
              },
              {
                status: 500,
                headers: corsHeaders,
              },
            );
          }
        }
      }

      if (url.pathname.startsWith('/api/naruto/elementos')) {
        const pathParts = url.pathname.split('/');
        const id = pathParts[4];
        if (request.method === 'GET') {
          try {
            let query,
              params = [];
            if (id) {
              query = `SELECT * FROM elementos WHERE id = ?`;
              params = [id];
            } else {
              query = `SELECT * FROM elementos ORDER BY nome`;
            }
            const elementos = await env.DB.prepare(query)
              .bind(...params)
              .all();
            return Response.json(
              {
                success: true,
                data: elementos.results || [],
                count: elementos.results?.length || 0,
              },
              { headers: corsHeaders },
            );
          } catch (error) {
            return Response.json(
              {
                success: false,
                error: 'Erro ao buscar elementos',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
              },
              {
                status: 500,
                headers: corsHeaders,
              },
            );
          }
        }
      }

      if (url.pathname.startsWith('/api/naruto/times')) {
        const pathParts = url.pathname.split('/');
        const id = pathParts[4];
        if (request.method === 'GET') {
          try {
            let query,
              params = [];
            if (id) {
              query = `SELECT t.*, a.nome as aldeia_nome FROM times t LEFT JOIN aldeias a ON a.id = t.aldeia_id WHERE t.id = ?`;
              params = [id];
            } else {
              query = `SELECT t.*, a.nome as aldeia_nome FROM times t LEFT JOIN aldeias a ON a.id = t.aldeia_id ORDER BY t.nome`;
            }
            const times = await env.DB.prepare(query)
              .bind(...params)
              .all();
            return Response.json(
              {
                success: true,
                data: times.results || [],
                count: times.results?.length || 0,
              },
              { headers: corsHeaders },
            );
          } catch (error) {
            return Response.json(
              {
                success: false,
                error: 'Erro ao buscar times',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
              },
              {
                status: 500,
                headers: corsHeaders,
              },
            );
          }
        }
      }

      if (url.pathname.startsWith('/api/naruto/stats')) {
        if (request.method === 'GET') {
          try {
            const stats = await env.DB.prepare(
              `SELECT
                (SELECT COUNT(*) FROM aldeias) as aldeias_count,
                (SELECT COUNT(*) FROM clas) as clas_count,
                (SELECT COUNT(*) FROM ranks) as ranks_count,
                (SELECT COUNT(*) FROM elementos) as elementos_count,
                (SELECT COUNT(*) FROM times) as times_count,
                (SELECT COUNT(*) FROM personagens WHERE ativo = true) as personagens_ativos,
                (SELECT COUNT(*) FROM personagens WHERE vivo = true) as personagens_vivos
              `,
            ).first();
            return Response.json(
              {
                success: true,
                data: stats,
              },
              { headers: corsHeaders },
            );
          } catch (error) {
            return Response.json(
              {
                success: false,
                error: 'Erro ao buscar estatísticas',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
              },
              {
                status: 500,
                headers: corsHeaders,
              },
            );
          }
        }
      }

      // Personagens com filtros avançados
      if (url.pathname.startsWith('/api/personagens')) {
        const pathParts = url.pathname.split('/');
        const idParam = pathParts[3];

        if (request.method === 'GET') {
          try {
            let query,
              params = [],
              where = [];

            if (idParam) {
              const id = parseInt(idParam);
              if (isNaN(id)) {
                return Response.json(
                  {
                    success: false,
                    error: 'ID inválido',
                  },
                  {
                    status: 400,
                    headers: corsHeaders,
                  },
                );
              }

              // Detalhes de personagem específico
              query = `
                SELECT
                  p.*,
                  a.nome AS aldeia_nome,
                  c.nome AS cla_nome,
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
                WHERE p.id = ?
              `;
              params = [id];
            } else {
              // Listagem com filtros e paginação
              const urlParams = new URLSearchParams(url.search);

              // Filtros básicos
              const q = urlParams.get('q');
              const aldeia_id = urlParams.get('aldeia_id');
              const cla_id = urlParams.get('cla_id');
              const rank_id = urlParams.get('rank_id');
              const time_id = urlParams.get('time_id');
              const elementos = urlParams.get('elementos');
              const vivo = urlParams.get('vivo');
              const ativo = urlParams.get('ativo');

              // Paginação
              const page = parseInt(urlParams.get('page') || '1');
              const limit = parseInt(urlParams.get('limit') || '20');
              const offset = (page - 1) * limit;

              // Construir WHERE clause
              if (q) {
                const normalizedQuery = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                params.push(`%${normalizedQuery.toLowerCase()}%`);
                where.push(
                  `(LOWER(TRANSLATE(p.nome, 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')) LIKE ? OR LOWER(TRANSLATE(p.descricao, 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')) LIKE ? OR LOWER(TRANSLATE(p.jutsu_principal, 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')) LIKE ?)`,
                );
              }

              if (aldeia_id) {
                params.push(parseInt(aldeia_id));
                where.push('p.aldeia_id = ?');
              }

              if (cla_id) {
                params.push(parseInt(cla_id));
                where.push('p.cla_id = ?');
              }

              if (rank_id) {
                params.push(parseInt(rank_id));
                where.push('p.rank_id = ?');
              }

              if (time_id) {
                params.push(parseInt(time_id));
                where.push('p.time_id = ?');
              }

              if (elementos) {
                const elementosArray = elementos.split(',').map((id) => parseInt(id.trim()));
                params.push(elementosArray);
                where.push('p.elementos && ?');
              }

              if (vivo !== null) {
                params.push(vivo === 'true');
                where.push('p.vivo = ?');
              }

              if (ativo !== null) {
                params.push(ativo === 'true');
                where.push('p.ativo = ?');
              }

              // Query principal com joins
              query = `
                SELECT
                  p.*,
                  a.nome AS aldeia_nome,
                  c.nome AS cla_nome,
                  r.nome AS rank_nome,
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
                LIMIT ? OFFSET ?
              `;
              params.push(limit, offset);

              // Query para contar total
              const countParams = params.slice(0, -2);
              const countQuery = `
                SELECT COUNT(*) as total
                FROM personagens p
                ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
              `;

              const [personagensResult, countResult] = await Promise.all([
                env.DB.prepare(query)
                  .bind(...params)
                  .all(),
                env.DB.prepare(countQuery)
                  .bind(...countParams)
                  .first(),
              ]);

              const total = countResult?.total || 0;
              const totalPages = Math.ceil(total / limit);

              return Response.json(
                {
                  success: true,
                  data: personagensResult.results || [],
                  pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                  },
                },
                { headers: corsHeaders },
              );
            }

            const personagens = await env.DB.prepare(query)
              .bind(...params)
              .all();
            return Response.json(
              {
                success: true,
                data: personagens.results || [],
                count: personagens.results?.length || 0,
              },
              { headers: corsHeaders },
            );
          } catch (error) {
            return Response.json(
              {
                success: false,
                error: 'Erro ao buscar personagens',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
              },
              {
                status: 500,
                headers: corsHeaders,
              },
            );
          }
        }
      }

      if (url.pathname.startsWith('/api/naruto/aldeias/autocomplete')) {
        if (request.method === 'GET') {
          try {
            const urlParams = new URLSearchParams(url.search);
            const q = urlParams.get('q');
            const where = [],
              params = [];

            if (q) {
              const normalizedQuery = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              params.push(`%${normalizedQuery.toLowerCase()}%`);
              where.push(
                `LOWER(TRANSLATE(nome, 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')) LIKE ?`,
              );
            }

            const query = `
              SELECT nome, COUNT(*) as count
              FROM aldeias
              WHERE nome IS NOT NULL
              ${where.length ? 'AND ' + where.join(' AND ') : ''}
              GROUP BY nome
              HAVING COUNT(*) > 0
              ORDER BY count DESC, nome
              LIMIT 10
            `;

            const aldeias = await env.DB.prepare(query)
              .bind(...params)
              .all();
            return Response.json(
              {
                success: true,
                data: aldeias.results || [],
              },
              { headers: corsHeaders },
            );
          } catch (error) {
            return Response.json(
              {
                success: false,
                error: 'Erro ao buscar autocomplete de aldeias',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
              },
              {
                status: 500,
                headers: corsHeaders,
              },
            );
          }
        }
      }

      if (url.pathname.startsWith('/api/naruto/clas/autocomplete')) {
        if (request.method === 'GET') {
          try {
            const urlParams = new URLSearchParams(url.search);
            const q = urlParams.get('q');
            const where = [],
              params = [];

            if (q) {
              const normalizedQuery = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              params.push(`%${normalizedQuery.toLowerCase()}%`);
              where.push(
                `LOWER(TRANSLATE(nome, 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')) LIKE ?`,
              );
            }

            const query = `
              SELECT nome, COUNT(*) as count
              FROM clas
              WHERE nome IS NOT NULL
              ${where.length ? 'AND ' + where.join(' AND ') : ''}
              GROUP BY nome
              HAVING COUNT(*) > 0
              ORDER BY count DESC, nome
              LIMIT 10
            `;

            const clas = await env.DB.prepare(query)
              .bind(...params)
              .all();
            return Response.json(
              {
                success: true,
                data: clas.results || [],
              },
              { headers: corsHeaders },
            );
          } catch (error) {
            return Response.json(
              {
                success: false,
                error: 'Erro ao buscar autocomplete de clãs',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
              },
              {
                status: 500,
                headers: corsHeaders,
              },
            );
          }
        }
      }

      if (url.pathname.startsWith('/api/naruto/ranks/autocomplete')) {
        if (request.method === 'GET') {
          try {
            const urlParams = new URLSearchParams(url.search);
            const q = urlParams.get('q');
            const where = [],
              params = [];

            if (q) {
              const normalizedQuery = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              params.push(`%${normalizedQuery.toLowerCase()}%`);
              where.push(
                `LOWER(TRANSLATE(nome, 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')) LIKE ?`,
              );
            }

            const query = `
              SELECT nome, nivel, COUNT(*) as count
              FROM ranks
              WHERE nome IS NOT NULL
              ${where.length ? 'AND ' + where.join(' AND ') : ''}
              GROUP BY nome, nivel
              HAVING COUNT(*) > 0
              ORDER BY nivel ASC, count DESC, nome
              LIMIT 10
            `;

            const ranks = await env.DB.prepare(query)
              .bind(...params)
              .all();
            return Response.json(
              {
                success: true,
                data: ranks.results || [],
              },
              { headers: corsHeaders },
            );
          } catch (error) {
            return Response.json(
              {
                success: false,
                error: 'Erro ao buscar autocomplete de ranks',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
              },
              {
                status: 500,
                headers: corsHeaders,
              },
            );
          }
        }
      }
      return Response.json(
        {
          error: 'Rota não encontrada',
          path: url.pathname,
          method: request.method,
        },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    } catch (error) {
      console.error('Worker Error:', error);
      return Response.json(
        {
          error: 'Erro interno do servidor',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }
  },
};

export default worker_default;
