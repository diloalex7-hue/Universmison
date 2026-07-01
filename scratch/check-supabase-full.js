import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manually parse .env
const envPath = path.join(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    env[key.trim()] = value.trim().replace(/^"|"$/g, '')
  }
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runDiagnostics() {
  console.log(`--- Supabase Diagnostics ---`)
  console.log(`URL: ${supabaseUrl}`)
  
  // 1. Basic Connection & Auth check
  console.log(`\n1. Checking connection...`)
  const { data: authData, error: authError } = await supabase.auth.getSession()
  if (authError) {
    console.error('❌ Auth Check Failed:', authError.message)
  } else {
    console.log('✅ Connection to Auth API works.')
  }

  // 2. Check specific tables used in code
  const tablesToCheck = ['products', 'categories', 'contact_messages', 'orders', 'profiles']
  console.log(`\n2. Checking tables...`)
  
  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true })
    if (error) {
      console.log(`❌ Table "${table}": ${error.message} (${error.code})`)
    } else {
      console.log(`✅ Table "${table}": OK (Count: ${data === null ? 0 : '?'})`)
      // Note: count head only returns null for data, actual count is in metadata if requested properly
    }
  }

  // 3. Try to fetch one product to be sure
  console.log(`\n3. Fetching sample data from "products"...`)
  const { data: prodData, error: prodError } = await supabase.from('products').select('id, name_fr').limit(1)
  if (prodError) {
    console.error('❌ Failed to fetch products:', prodError.message)
  } else if (prodData && prodData.length > 0) {
    console.log('✅ Success! Sample product:', prodData[0])
  } else {
    console.log('⚠️ Products table is empty.')
  }
}

runDiagnostics()
