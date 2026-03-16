#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const slugIndex = process.argv.indexOf('--slug');
if (slugIndex === -1 || !process.argv[slugIndex + 1]) {
  console.error('Usage: node create-tenant-db.mjs --slug <tenant-slug>');
  process.exit(1);
}
const slug = process.argv[slugIndex + 1];
const dbName = `juris-tenant-${slug}`;

console.log(`Creating D1 database: ${dbName}`);
try {
  const output = execSync(`wrangler d1 create ${dbName}`, { encoding: 'utf-8' });
  console.log(output);
  console.log('Database created. Now applying tenant schema...');
  execSync(`node ${resolve(__dirname, 'migrate-tenant.mjs')} --db ${dbName}`, { stdio: 'inherit' });
  console.log(`Tenant database ${dbName} created and schema applied.`);
} catch (error) {
  console.error('Failed to create tenant database:', error.message);
  process.exit(1);
}
