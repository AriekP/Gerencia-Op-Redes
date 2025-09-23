const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const { createClient } = require('@supabase/supabase-js')

const sup = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

(async () => {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node ensure_profile.js email@example.com')
    process.exit(1)
  }

  try {
    const { data, error } = await sup.auth.admin.listUsers()
    if (error) {
      console.error('Error listUsers', error)
      process.exit(1)
    }

    const found = data.users.find(u => u.email === email)
    if (!found) {
      console.log('No se encontró usuario con ese email:', email)
      process.exit(0)
    }

    console.log('Encontrado user id=', found.id)

    const { data: profile, error: perr } = await sup.from('profiles').select('*').eq('id', found.id)
    if (perr) {
      console.error('Error checking profiles', perr)
      process.exit(1)
    }

    if (profile.length) {
      console.log('Profile ya existe:', profile[0])
      process.exit(0)
    }

    const { data: ins, error: ierr } = await sup.from('profiles').insert({ id: found.id, username: 'software', role: 'admin' }).select().single()
    if (ierr) {
      console.error('Error insert profile', ierr)
      process.exit(1)
    }

    console.log('Profile creado', ins)
    process.exit(0)
  } catch (err) {
    console.error('Error inesperado:', err)
    process.exit(1)
  }
})()
