import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

async function migrate() {
  const sqlDir = resolve(__dirname, 'sql');
  const files = readdirSync(sqlDir)
    .filter((f) => f.match(/^\d+_.*\.sql$/))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found. Skipping.');
    return;
  }

  for (const f of files) {
    const sqlPath = resolve(sqlDir, f);
    const sql = readFileSync(sqlPath, 'utf-8');
    console.log(`Running migration ${f}...`);
    try {
      await query(sql);
      console.log('✅ Migration completed');
    } catch (error: any) {
      if (error.code === '42710' && error.message?.includes('already exists')) {
        console.log('⚠️  Migration partially completed (trigger already exists)');
      } else {
        throw error;
      }
    }
  }

  await seedBasicData();
  await seedNarutoCharacters();
}

async function seedBasicData() {
  const seedDir = resolve(__dirname, 'seed');
  const basicDataFiles = [
    'aldeias.json',
    'clas.json',
    'ranks.json',
    'elementos.json',
    'times.json',
    'bijuus.json',
    'jutsus.json',
  ];

  for (const file of basicDataFiles) {
    try {
      const filePath = resolve(seedDir, file);
      if (!existsSync(filePath)) {
        console.log(`No ${file} seed file found. Skipping.`);
        continue;
      }

      const raw = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw) as Array<any>;

      if (!Array.isArray(data) || data.length === 0) {
        console.log(`${file} is empty. Nothing to seed.`);
        continue;
      }

      console.log(`Seeding ${data.length} items from ${file}...`);

      const tableName = file.replace('.json', '');

      for (const item of data) {
        await insertBasicData(tableName, item);
      }

      console.log(`✅ Seed de ${file} concluído`);
    } catch (err) {
      console.warn(`⚠️  Seed de ${file} falhou:`, err);
    }
  }
}

async function insertBasicData(tableName: string, item: any) {
  if (tableName === 'times') {
    let aldeiaId = null;
    if (item.aldeia) {
      const aldeiaResult = await query<{ id: number }>(
        'SELECT id FROM aldeias WHERE nome = $1 LIMIT 1',
        [item.aldeia],
      );
      if (aldeiaResult.rows.length > 0) {
        aldeiaId = aldeiaResult.rows[0].id;
      }
    }

    const timeData = {
      nome: item.nome,
      aldeia_id: aldeiaId,
      lider: item.lider,
      descricao: item.descricao,
    };

    const columns = Object.keys(timeData);
    const values = Object.values(timeData);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    await query(
      `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT (nome, aldeia_id) DO NOTHING`,
      values,
    );
  } else {
    const columns = Object.keys(item);
    const values = Object.values(item);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    await query(
      `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT (nome) DO NOTHING`,
      values,
    );
  }
}

async function seedNarutoCharacters() {
  try {
    const seedPath = resolve(__dirname, 'seed', 'naruto_seed.json');
    if (existsSync(seedPath)) {
      const raw = readFileSync(seedPath, 'utf-8');
      const characters = JSON.parse(raw) as Array<any>;

      if (Array.isArray(characters) && characters.length > 0) {
        console.log(`Seeding ${characters.length} personagens Naruto (auto)...`);

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
        console.log('✅ Auto-seed de personagens Naruto concluído');

        console.log('Relacionando personagens com jutsus...');

        for (const char of characters) {
          const personagemResult = await query<{ id: number }>(
            'SELECT id FROM personagens WHERE nome = $1 LIMIT 1',
            [char.nome],
          );

          if (personagemResult.rows.length === 0) continue;

          const personagemId = personagemResult.rows[0].id;

          // Relacionar jutsu principal
          if (char.jutsu_principal) {
            const jutsuResult = await query<{ id: number }>(
              'SELECT id FROM jutsus WHERE nome = $1 LIMIT 1',
              [char.jutsu_principal],
            );

            if (jutsuResult.rows.length > 0) {
              await query(
                'INSERT INTO personagem_jutsus (personagem_id, jutsu_id, proficiencia) VALUES ($1, $2, $3) ON CONFLICT (personagem_id, jutsu_id) DO NOTHING',
                [personagemId, jutsuResult.rows[0].id, 'Mestre'],
              );
            }
          }

          // Relacionar jutsu secundário
          if (char.jutsu_secundario) {
            const jutsuResult = await query<{ id: number }>(
              'SELECT id FROM jutsus WHERE nome = $1 LIMIT 1',
              [char.jutsu_secundario],
            );

            if (jutsuResult.rows.length > 0) {
              await query(
                'INSERT INTO personagem_jutsus (personagem_id, jutsu_id, proficiencia) VALUES ($1, $2, $3) ON CONFLICT (personagem_id, jutsu_id) DO NOTHING',
                [personagemId, jutsuResult.rows[0].id, 'Avancado'],
              );
            }
          }

          // Relacionar kekkei genkai como jutsus
          if (char.kekkei_genkai) {
            const kekkeiParts = char.kekkei_genkai.split(', ');
            for (const kekkei of kekkeiParts) {
              const jutsuResult = await query<{ id: number }>(
                'SELECT id FROM jutsus WHERE nome = $1 LIMIT 1',
                [kekkei.trim()],
              );

              if (jutsuResult.rows.length > 0) {
                await query(
                  'INSERT INTO personagem_jutsus (personagem_id, jutsu_id, proficiencia) VALUES ($1, $2, $3) ON CONFLICT (personagem_id, jutsu_id) DO NOTHING',
                  [personagemId, jutsuResult.rows[0].id, 'Mestre'],
                );
              }
            }
          }
        }

        console.log('✅ Relacionamentos personagem-jutsu concluídos');
      } else {
        console.log('Seed file is empty. Skipping auto-seed.');
      }
    } else {
      console.log('No Naruto seed file (src/seed/naruto_seed.json). Skipping Naruto auto-seed.');
    }
  } catch (err) {
    console.warn('⚠️  Naruto auto-seed failed (continuing):', err);
  }
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
