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

async function checkConnection() {
  console.log(`Checking connection to: ${supabaseUrl}`)
  
  try {
    // Try to fetch from the 'messages' table as seen in the code
    const { data, error } = await supabase.from('messages').select('id').limit(1)

    if (error) {
      console.error('❌ Supabase Error:', error.message)
      console.error('Code:', error.code)
      if (error.code === 'PGRST116') {
        console.log('💡 Tip: This code often means the table exists but is empty.')
      } else if (error.code === '42P01') {
        console.log('💡 Tip: This code means the table "messages" does not exist in your database.')
      }
    } else {
      console.log('✅ Connection successful! Supabase is responding correctly.')
      console.log('Data sample:', data)
    }
  } catch (err) {
    console.error('❌ System Error:', err.message)
  }
}

checkConnection()
