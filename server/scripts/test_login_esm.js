'use strict';
(async () => {
  try {
    const fs = require('fs')
    const path = require('path')
    const envPath = path.join(__dirname, '..', '.env')
    if (!fs.existsSync(envPath)) {
      console.error('server/.env no encontrado')
      process.exit(1)
    }
    const env = fs.readFileSync(envPath, 'utf8')
    const urlLine = env.split(/\r?\n/).find(l => l.startsWith('SUPABASE_URL='))
    const anonLine = env.split(/\r?\n/).find(l => l.startsWith('SUPABASE_ANON_KEY='))
    if (!urlLine || !anonLine) {
      console.error('Faltan variables SUPABASE_URL o SUPABASE_ANON_KEY en server/.env')
      process.exit(1)
    }
    const SUPABASE_URL = urlLine.split('=')[1].trim()
    const SUPABASE_ANON_KEY = anonLine.split('=')[1].trim()

    const email = process.argv[2]
    const password = process.argv[3]
    if (!email || !password) {
      console.error('Uso: node test_login_esm.js email password')
      process.exit(1)
    }

    const mod = await import('@supabase/supabase-js')
    const { createClient } = mod
    if (!createClient) {
      console.error('createClient no disponible en módulo importado')
      process.exit(1)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Login error', error)
      process.exit(1)
    }
    console.log('Login success')
    console.log(JSON.stringify(data, null, 2))

    if (data && data.session && data.session.access_token) {
      const token = data.session.access_token
      console.log('Calling backend /api/software with token...')
      const fetch = (await import('node-fetch')).default
      const res = await fetch('http://localhost:3000/api/software', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      console.log('Backend response:', JSON.stringify(json, null, 2))
    } else {
      console.log('No access_token present in session')
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
})()
