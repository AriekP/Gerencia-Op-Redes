/*
  Script para crear un usuario admin en Supabase y añadir su perfil.
  Uso:
    - Crear `server/.env` con SUPABASE_URL y SUPABASE_SERVICE_KEY
    - Ejecutar: node create_admin.js --email=correo@example.com --username=admin --password=Secreto123

  Nota: este script usa la service_role key. Protégela y no la subas al repo.
*/
const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en server/.env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function parseArgs() {
  const args = {}
  process.argv.slice(2).forEach(arg => {
    const m = arg.match(/^--([^=]+)=(.*)$/)
    if (m) args[m[1]] = m[2]
  })
  return args
}

;(async () => {
  const args = parseArgs()
  const email = args.email
  const password = args.password
  const username = args.username || email.split('@')[0]

  if (!email || !password) {
    console.error('Usage: node create_admin.js --email=you@example.com --password=Secret123 [--username=admin]')
    process.exit(1)
  }

  try {
    // Crear usuario vía admin API
    const res = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (res.error) {
      // Si el email ya existe, intentamos recuperar el usuario y crear sólo el profile
      if (res.error.code === 'email_exists' || (res.error.name && res.error.name === 'AuthApiError' && res.error.status === 422)) {
        console.warn('El email ya existe. Buscando usuario existente...')
        const list = await supabase.auth.admin.listUsers()
        const found = (list.data && list.data.users) ? list.data.users.find(u => u.email === email) : null
        if (!found) {
          console.error('No se pudo localizar el usuario existente por email.')
          process.exit(1)
        }

        const userId = found.id
        console.log('Usuario existente id=', userId)

        // Insertar profile si no existe
        const { data: existingProfile, error: pe } = await supabase.from('profiles').select('*').eq('id', userId)
        if (pe) {
          console.error('Error comprobando profiles:', pe)
          process.exit(1)
        }
        if (existingProfile && existingProfile.length) {
          console.log('El profile ya existe:', existingProfile[0])
          process.exit(0)
        }

        const { data: newProfile, error: perr } = await supabase.from('profiles').insert({ id: userId, username, role: 'admin' }).select().single()
        if (perr) {
          console.error('Error insertando profile para usuario existente:', perr)
          process.exit(1)
        }

        console.log('Perfil admin creado para usuario existente:', newProfile)
        process.exit(0)
      }

      console.error('Error creando usuario:', res.error)
      console.error('Respuesta completa:', JSON.stringify(res, null, 2))
      process.exit(1)
    }

    const user = res.user
    console.log('Usuario creado, id=', user.id)

    // Insertar perfil en tabla profiles
    const { data, error } = await supabase.from('profiles').insert({ id: user.id, username, role: 'admin' }).select().single()
    if (error) {
      console.error('Error insertando profile:', error)
      process.exit(1)
    }

    console.log('Perfil admin creado:', data)
    process.exit(0)
  } catch (err) {
    console.error('Error inesperado:', err)
    process.exit(1)
  }
})()
