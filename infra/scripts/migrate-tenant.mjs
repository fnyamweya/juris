#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(__dirname, '../migrations/tenant');

const dbIndex = process.argv.indexOf('--db');
if (dbIndex === -1 || !process.argv[dbIndex + 1]) {
  console.error('Usage: node migrate-tenant.mjs --db <database-name> [--env staging|production]');
  process.exit(1);
}
const dbName = process.argv[dbIndex + 1];
const envIndex = process.argv.indexOf('--env');
const env = envIndex !== -1 ? process.argv[envIndex + 1] : undefined;

const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`Found ${files.length} migration(s) for tenant DB: ${dbName}`);

for (const file of files) {
  const filePath = resolve(migrationsDir, file);
  console.log(`Applying: ${file}`);
  const envFlag = env ? `--env ${env}` : '';
  try {
    execSync(
      `wrangler d1 execute ${dbName} ${envFlag} --file="${filePath}"`,
      { stdio: 'inherit' }
    );
    console.log(`  ✓ ${file} applied`);
  } catch (error) {
    console.error(`  ✗ ${file} failed`);
    process.exit(1);
  }
}

console.log(`All tenant migrations applied to ${dbName}`);
