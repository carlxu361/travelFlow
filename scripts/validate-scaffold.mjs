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
  'app/actions/trip-actions.ts',
  'app/actions/ai-actions.ts',
  'lib/domain/trip.ts',
  'lib/dify/schema.ts',
  'components/trip/timeline-card.tsx',
  'components/trip/next-action-card.tsx',
  'db/schema.sql',
  'app/api/ai/generate/route.ts',
  'components/new-trip/generate-form.tsx',
  'lib/ai/openai-itinerary.ts',
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
  {
    file: 'app/actions/trip-actions.ts',
    snippet: 'export async function getTripDetails',
    message: 'Trip server actions are missing',
  },
  {
    file: 'app/actions/ai-actions.ts',
    snippet: 'export async function generateItineraryAction',
    message: 'AI server action is missing',
  },
  {
    file: 'db/schema.sql',
    snippet: 'create table if not exists public.trips',
    message: 'Database schema file is missing trip table',
  },
  {
    file: '.env.example',
    snippet: 'OPENAI_BASE_URL',
    message: 'OpenAI-compatible API base URL env is missing',
  },
  {
    file: 'lib/ai/openai-itinerary.ts',
    snippet: '固定输出 JSON Schema',
    message: 'AI prompt is missing fixed output schema requirement',
  },
  {
    file: 'components/new-trip/generate-form.tsx',
    snippet: '二次完善行程',
    message: 'Refinement UI is missing',
  },
  {
    file: 'components/new-trip/generate-form.tsx',
    snippet: 'localStorage.setItem',
    message: 'Local save capability is missing',
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
