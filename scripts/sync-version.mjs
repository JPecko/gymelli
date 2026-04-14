#!/usr/bin/env node
/**
 * Syncs the app version from package.json to the app_config table in Supabase.
 * Run after every deploy: node scripts/sync-version.mjs
 *
 * Requires env vars: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))

const url = process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

const { error } = await supabase
  .from('app_config')
  .upsert({ key: 'app_version', value: version })

if (error) {
  console.error('Failed to sync version:', error.message)
  process.exit(1)
}

console.log(`✓ app_version synced to ${version}`)
