#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const requiredFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/new/page.tsx',
  'app/trip/[id]/page.tsx',
  'app/trip/[id]/share/page.tsx',
  'components/site-header.tsx',
  'lib/supabase/client.ts',
  'types/supabase.ts',
  'tailwind.config.ts',
  'postcss.config.mjs',
  'tsconfig.json',
  '.env.example',
];

const requiredSnippets = [
  {
    file: 'package.json',
    snippet: '"next":',
    message: 'Next.js dependency is missing',
  },
  {
    file: 'package.json',
    snippet: '"tailwindcss":',
    message: 'Tailwind dependency is missing',
  },
  {
    file: 'package.json',
    snippet: '"@supabase/supabase-js":',
    message: 'Supabase dependency is missing',
  },
  {
    file: 'package.json',
    snippet: '"lucide-react":',
    message: 'Lucide dependency is missing',
  },
  {
    file: 'types/supabase.ts',
    snippet: 'export interface Database',
    message: 'Supabase Database type is missing',
  },
  {
    file: 'types/supabase.ts',
    snippet: 'profiles:',
    message: 'profiles table type is missing',
  },
  {
    file: 'types/supabase.ts',
    snippet: 'trips:',
    message: 'trips table type is missing',
  },
  {
    file: 'types/supabase.ts',
    snippet: 'days:',
    message: 'days table type is missing',
  },
  {
    file: 'types/supabase.ts',
    snippet: 'events:',
    message: 'events table type is missing',
  },
  {
    file: 'types/supabase.ts',
    snippet: 'memories:',
    message: 'memories table type is missing',
  },
  {
    file: 'lib/supabase/client.ts',
    snippet: 'createSupabaseBrowserClient',
    message: 'Supabase client factory is missing',
  },
];

const failures = [];

for (const file of requiredFiles) {
  const absPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(absPath)) {
    failures.push(`Missing required file: ${file}`);
  }
}

for (const { file, snippet, message } of requiredSnippets) {
  const absPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(absPath)) {
    failures.push(`${message} (${file} not found)`);
    continue;
  }

  const content = fs.readFileSync(absPath, 'utf8');
  if (!content.includes(snippet)) {
    failures.push(`${message} (${file})`);
  }
}

if (failures.length > 0) {
  console.error('❌ Scaffold validation failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('✅ Scaffold validation passed.');
