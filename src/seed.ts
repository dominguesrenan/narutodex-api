import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

async function seed() {
  const seedDir = resolve(__dirname, 'seed');

  // Seed de personagens Naruto
  try {
    const seedPath = resolve(seedDir, 'naruto_seed.json');
    if (!existsSync(seedPath)) {
      console.log('No Naruto seed file found at src/seed/naruto_seed.json. Skipping.');
      console.log('You can create it based on the example in the docs.');
      return;
    }

    const raw = readFileSync(seedPath, 'utf-8');
    const characters = JSON.parse(raw) as Array<any>;

    if (!Array.isArray(characters) || characters.length === 0) {
      console.log('Naruto seed file is empty. Nothing to seed.');
      return;
    }

    console.log(`Seeding ${characters.length} personagens Naruto...`);

    for (const char of characters) {
      // IDs de relacionamentos
      let aldeiaId: number | null = null;
      let claId: number | null = null;
      let rankId: number | null = null;
      let timeId: number | null = null;
      let mestreId: number | null = null;

      // Aldeia por nome
      if (char.aldeia && typeof char.aldeia === 'string') {
        const aldeiaResult = await query<{ id: number }>(
          'SELECT id FROM aldeias WHERE nome = $1 LIMIT 1',
          [char.aldeia],
        );
        aldeiaId = aldeiaResult.rows[0]?.id ?? null;
      }

      // Clã por nome
      if (char.cla && typeof char.cla === 'string') {
        const claResult = await query<{ id: number }>(
          'SELECT id FROM clas WHERE nome = $1 LIMIT 1',
          [char.cla],
        );
        claId = claResult.rows[0]?.id ?? null;
      }

      // Rank por nome
      if (char.rank && typeof char.rank === 'string') {
        const rankResult = await query<{ id: number }>(
          'SELECT id FROM ranks WHERE nome = $1 LIMIT 1',
          [char.rank],
        );
        rankId = rankResult.rows[0]?.id ?? null;
      }

      // Time por nome
      if (char.time_id && typeof char.time_id === 'string') {
        const timeResult = await query<{ id: number }>(
          'SELECT id FROM times WHERE nome = $1 LIMIT 1',
          [char.time_id],
        );
        timeId = timeResult.rows[0]?.id ?? null;
      }

      // Mestre por nome
      if (char.mestre_id && typeof char.mestre_id === 'string') {
        const mestreResult = await query<{ id: number }>(
          'SELECT id FROM personagens WHERE nome = $1 LIMIT 1',
          [char.mestre_id],
        );
        mestreId = mestreResult.rows[0]?.id ?? null;
      }

      // Inserir personagem
      await query(
        `INSERT INTO personagens (
          nome, nome_alternativo, descricao, historia,
          aldeia_id, cla_id, rank_id, time_id, mestre_id,
          idade, altura_cm, peso_kg, aniversario,
          elementos, jutsu_principal, jutsu_secundario, kekkei_genkai,
          ativo, vivo, foto_url, wiki_url
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,
          $10,$11,$12,$13,$14,$15,$16,$17,
          COALESCE($18,true),COALESCE($19,true),$20,$21
        ) ON CONFLICT (nome) DO NOTHING`,
        [
          char.nome,
          char.nome_alternativo ?? null,
          char.descricao ?? null,
          char.historia ?? null,
          aldeiaId,
          claId,
          rankId,
          timeId,
          mestreId,
          char.idade ?? null,
          char.altura_cm ?? null,
          char.peso_kg ?? null,
          char.aniversario ?? null,
          char.elementos ?? null,
          char.jutsu_principal ?? null,
          char.jutsu_secundario ?? null,
          char.kekkei_genkai ?? null,
          char.ativo ?? true,
          char.vivo ?? true,
          char.foto_url ?? null,
          char.wiki_url ?? null,
        ],
      );
    }
    console.log('✅ Seed de personagens Naruto concluído');
  } catch (err) {
    console.warn('⚠️  Seed de personagens Naruto falhou:', err);
  }
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
