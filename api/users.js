// api/users.js
const { supabase } = require('./_lib')

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      // 1) intenta leer perfiles de tu tabla (si existe)
      const { data: profiles, error: profilesErr } = await supabase
        .from('users_profiles') // <-- cambia si tu tabla tiene otro nombre
        .select('id, user_id, full_name, role, department, active, last_login')

      if (!profilesErr && Array.isArray(profiles) && profiles.length > 0) {
        return res.status(200).json({ data: profiles })
      }

      // 2) fallback: listar usuarios de Auth con admin API
      const { data, error } = await supabase.auth.admin.listUsers()
      if (error) return res.status(500).json({ error: error.message || String(error) })

      const usersArray = data && Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : [])
      const rows = usersArray.map(u => ({
        id: u.id,
        email: u.email,
        name: u.user_metadata?.full_name || u.email,
        role: u.user_metadata?.role || 'user',
        active: !u.disabled,
        lastLogin: u.last_sign_in_at || null
      }))
      return res.status(200).json({ data: rows })
    }

    if (req.method === 'POST') {
      // crear usuario (no pedimos token del cliente)
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const { email, password, name, role, department, active } = body || {}
      if (!email || !password) return res.status(400).json({ error: 'email y password son obligatorios' })

      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { full_name: name, role }
      })
      if (createErr) return res.status(500).json({ error: createErr.message || String(createErr) })

      const userId = created?.user?.id || created?.id || null

      // opcional: guarda perfil si tienes la tabla
      if (userId) {
        try {
          await supabase.from('users_profiles').insert({
            user_id: userId,
            full_name: name,
            role,
            department,
            active: active === undefined ? true : active
          })
        } catch (e) {
          console.warn('Profile insert warning', e)
        }
      }

      return res.status(201).json({
        data: {
          id: userId,
          email,
          name,
          role,
          department,
          active: active === undefined ? true : active
        }
      })
    }

    if (req.method === 'DELETE') {
      // eliminar usuario por id (de la ruta) sin pedir token del cliente
      // soporta /api/users/:id y también /api/users?id=:id
      const { id: queryId } = req.query
      const pathId = req.url.split('?')[0].split('/').pop()
      const userId = queryId || (pathId !== 'users' ? pathId : null)

      if (!userId) return res.status(400).json({ error: 'ID de usuario requerido' })

      // borra perfil si existe
      try {
        await supabase.from('users_profiles').delete().eq('user_id', userId)
      } catch (e) {
        console.warn('Profile delete warning', e)
      }

      const { error: delErr } = await supabase.auth.admin.deleteUser(userId)
      if (delErr) return res.status(500).json({ error: delErr.message || String(delErr) })

      return res.status(200).json({ success: true, message: 'Usuario eliminado correctamente' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) })
  }
}
