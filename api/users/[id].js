const { supabase, authenticate, requireAdmin } = require('../_lib')

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

  if (req.method === 'DELETE') {
    try {
      const user = await authenticate(req)
      if (!user) return res.status(401).json({ error: 'Unauthorized' })
      
      const isAdmin = await requireAdmin(user)
      if (!isAdmin) return res.status(403).json({ error: 'Forbidden: requiere rol admin' })

      // Get user ID from query parameters
      const { id: userId } = req.query
      
      if (!userId) {
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
      console.error('DELETE /api/users/[id] error', err)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}