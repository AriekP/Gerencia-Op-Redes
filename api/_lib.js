const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Middleware para verificar Authorization bearer token
async function authenticate(req) {
  const authHeader = req.headers.authorization || ''
  if (!authHeader) return null
  const m = authHeader.match(/^Bearer (.+)$/)
  if (!m) return null
  const token = m[1]
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error) {
      console.warn('Token verification failed', error)
      return null
    }
    return data.user || null
  } catch (err) {
    console.warn('Token verify unexpected', err)
    return null
  }
}

// Middleware para verificar rol admin
async function requireAdmin(user) {
  if (!user) return false
  try {
    const adminRolesEnv = process.env.SUPABASE_ADMIN_ROLES || 'admin'
    const adminRoles = adminRolesEnv.split(',').map(r => r.trim().toLowerCase()).filter(Boolean)

    // revisar role en token primero
    const roleFromToken = user.user_metadata && user.user_metadata.role
    if (roleFromToken && adminRoles.includes(roleFromToken.toString().toLowerCase())) return true

    // comprobar tabla users_profiles (si existe)
    try {
      const { data: profile, error: profErr } = await supabase.from('users_profiles').select('role').eq('user_id', user.id).maybeSingle()
      if (!profErr && profile && profile.role && adminRoles.includes(profile.role.toString().toLowerCase())) return true
    } catch (e) {}

    // comprobar tabla canonical `profiles` (schema principal)
    try {
      const { data: p2, error: p2Err } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (!p2Err && p2 && p2.role && adminRoles.includes(p2.role.toString().toLowerCase())) return true
    } catch (e) {}

    return false
  } catch (err) {
    console.error('requireAdmin check failed', err)
    return false
  }
}

module.exports = { supabase, authenticate, requireAdmin }