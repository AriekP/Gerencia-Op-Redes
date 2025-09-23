const { supabase, authenticate, requireAdmin } = require('./_lib')

module.exports = async (req, res) => {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    try {
      const user = await authenticate(req)
      if (!user) return res.status(401).json({ error: 'Unauthorized' })

      // Attempt to list user profiles from a `users_profiles` table if exists
      const { data: profiles, error: profilesErr } = await supabase.from('users_profiles').select('id, user_id, full_name, role, department, active, last_login')
      if (!profilesErr && profiles && profiles.length) {
        return res.json({ data: profiles })
      }
      
      // Fallback: list auth users (public fields)
      try {
        const { data, error } = await supabase.auth.admin.listUsers()
        if (error) {
          console.error('admin.listUsers returned error', error)
          return res.status(500).json({ error: error.message || error })
        }
        
        const usersArray = data && Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : [])
        
        const rows = usersArray.map(u => ({
          id: u.id,
          email: u.email,
          name: u.user_metadata?.full_name || u.email,
          role: u.user_metadata?.role || 'user',
          active: !u.disabled,
          lastLogin: u.last_sign_in_at || null
        }))
        
        return res.json({ data: rows })
      } catch (e) {
        console.error('Error calling admin.listUsers', e)
        return res.status(500).json({ error: (e && e.message) ? e.message : 'Error llamando admin.listUsers' })
      }
    } catch (err) {
      console.error('GET /api/users error', err)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else if (req.method === 'POST') {
    try {
      const user = await authenticate(req)
      if (!user) return res.status(401).json({ error: 'Unauthorized' })
      
      const isAdmin = await requireAdmin(user)
      if (!isAdmin) return res.status(403).json({ error: 'Forbidden: requiere rol admin' })

      const { email, password, name, role, department, active } = req.body
      if (!email || !password) return res.status(400).json({ error: 'email y password son obligatorios' })

      // Create auth user via admin API
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { full_name: name, role }
      })
      if (createErr) return res.status(500).json({ error: createErr.message || createErr })

      const userId = created?.user?.id || created?.id || null

      // Try to insert into profiles table if present
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

      res.status(201).json({ 
        data: { 
          id: userId, 
          email, 
          name, 
          role, 
          department, 
          active: active === undefined ? true : active 
        } 
      })
    } catch (err) {
      console.error('POST /api/users error', err)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const user = await authenticate(req)
      if (!user) return res.status(401).json({ error: 'Unauthorized' })
      
      const isAdmin = await requireAdmin(user)
      if (!isAdmin) return res.status(403).json({ error: 'Forbidden: requiere rol admin' })

      // Extract user ID from URL path (e.g., /api/users/123)
      const urlParts = req.url.split('/')
      const userId = urlParts[urlParts.length - 1]
      
      if (!userId || userId === 'users') {
        return res.status(400).json({ error: 'ID de usuario requerido' })
      }

      // Delete from profiles table first (if exists)
      try {
        await supabase.from('users_profiles').delete().eq('user_id', userId)
      } catch (e) {
        console.warn('Profile delete warning', e)
      }

      // Delete auth user via admin API
      const { error: deleteErr } = await supabase.auth.admin.deleteUser(userId)
      if (deleteErr) {
        console.error('Error deleting user:', deleteErr)
        return res.status(500).json({ error: deleteErr.message || deleteErr })
      }

      res.status(200).json({ success: true, message: 'Usuario eliminado correctamente' })
    } catch (err) {
      console.error('DELETE /api/users error', err)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}