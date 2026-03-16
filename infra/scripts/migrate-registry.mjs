#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(__dirname, '../migrations/master-registry');
const env = process.argv.includes('--env') ? process.argv[process.argv.indexOf('--env') + 1] : undefined;

const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`Found ${files.length} migration(s) for master registry`);

for (const file of files) {
  const filePath = resolve(migrationsDir, file);
  console.log(`Applying: ${file}`);
  const envFlag = env ? `--env ${env}` : '';
  try {
    execSync(
      `wrangler d1 execute juris-master-registry ${envFlag} --file="${filePath}"`,
      { stdio: 'inherit' }
    );
    console.log(`  ✓ ${file} applied`);
  } catch (error) {
    console.error(`  ✗ ${file} failed`);
    process.exit(1);
  }
}

console.log('All master registry migrations applied successfully');
