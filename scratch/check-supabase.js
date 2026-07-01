import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkConnection() {
  console.log(`Checking connection to: ${supabaseUrl}`)
  
  // Try to fetch a list of tables or just a simple health check
  // Since we don't know the exact tables yet, we'll try to fetch from a common one or just check the API
  const { data, error } = await supabase.from('messages').select('*').limit(1)

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('✅ Connection successful, but table "messages" is empty or not found (Expected if not set up yet).')
    } else {
      console.error('❌ Connection failed:', error.message)
      console.error('Error Code:', error.code)
    }
  } else {
    console.log('✅ Connection successful! Fetched data from "messages":', data)
  }
}

checkConnection()
