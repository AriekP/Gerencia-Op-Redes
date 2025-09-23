const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Faltan VITE_SUPABASE variables en server/.env para la prueba')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

(async () => {
  try {
    const email = process.argv[2]
    const password = process.argv[3]
    if (!email || !password) {
      console.error('Usage: node test_login.js email password')
      process.exit(1)
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Login error', error)
      process.exit(1)
    }

    console.log('Login success, session:', data.session ? 'present' : 'no session')
    console.log(JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Unexpected', err)
    process.exit(1)
  }
})()
