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
      const { data, error } = await supabase.from('software_inventory').select('*')
      if (error) return res.status(500).json({ error: error.message })
      res.json({ data })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  } else if (req.method === 'POST') {
    try {
      const user = await authenticate(req)
      if (!user) return res.status(401).json({ error: 'Unauthorized' })

      let payload = req.body
      
      // Normalize keys: convert camelCase to snake_case and map common aliases
      const toSnake = (s) => s.replace(/([A-Z])/g, '_$1').toLowerCase()
      const normalize = (obj) => {
        const out = {}
        Object.entries(obj || {}).forEach(([k, v]) => {
          let nk = k
          if (k === 'serial') nk = 'serial_number'
          else nk = toSnake(k)
          out[nk] = v
        })
        return out
      }

      payload = normalize(payload)

      // Filtrar columnas desconocidas
      const allowedColumns = ['name', 'version', 'serial_number', 'responsible', 'status', 'expiry_date', 'warranty_expiration', 'notes']
      const allowedColumnsWithUserId = [...allowedColumns, 'responsible_user_id']
      const incomingKeys = Object.keys(payload || {})
      const filtered = Object.fromEntries(Object.entries(payload || {}).filter(([k]) => allowedColumnsWithUserId.includes(k)))
      const removed = incomingKeys.filter(k => !Object.keys(filtered).includes(k))
      if (removed.length) console.warn('Filtered unknown columns from POST payload:', removed)
      payload = filtered

      // Mapear valores de status
      const statusMap = {
        active: 'activo',
        expired: 'expirado',
        expiring: 'en_revision',
        inactive: 'inactivo'
      }
      if (payload.status && typeof payload.status === 'string') {
        const key = payload.status.toLowerCase()
        if (statusMap[key]) payload.status = statusMap[key]
      }

      // If a responsible_user_id was provided, try to resolve a display name
      if (payload.responsible_user_id) {
        try {
          let displayName = null
          
          try {
            const { data: profile } = await supabase.from('users_profiles').select('full_name').eq('user_id', payload.responsible_user_id).maybeSingle()
            if (profile && profile.full_name) displayName = profile.full_name
          } catch (e) {}

          if (!displayName) {
            try {
              const { data } = await supabase.auth.admin.listUsers()
              const usersArr = data && data.users ? data.users : (Array.isArray(data) ? data : [])
              const found = usersArr.find(u => u.id === payload.responsible_user_id)
              if (found) displayName = found.user_metadata?.full_name || found.email
            } catch (e) {}
          }

          if (displayName) payload.responsible = displayName
        } catch (e) {
          console.warn('Could not resolve responsible_user_id to name', e)
        }
      }

      if (!payload || !payload.name || !payload.serial_number) {
        return res.status(400).json({ error: 'name y serial_number son obligatorios' })
      }

      // Check if name already exists (names must be unique, but serial numbers can repeat)
      const { data: existingSoftware, error: checkError } = await supabase
        .from('software_inventory')
        .select('id, name')
        .eq('name', payload.name)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking existing software name:', checkError)
        return res.status(500).json({ error: 'Error verificando nombre de software' })
      }

      if (existingSoftware) {
        return res.status(409).json({ 
          error: `Ya existe un software con el nombre "${payload.name}". Los nombres de software deben ser únicos.`,
          type: 'duplicate_name'
        })
      }

      // Try inserting with responsible_user_id, fallback without it
      let insertPayload = payload
      try {
        const { data, error } = await supabase.from('software_inventory').insert(insertPayload).select().single()
        if (error) throw error
        return res.status(201).json({ data })
      } catch (errInsert) {
        const msg = (errInsert && errInsert.message) ? errInsert.message : String(errInsert)
        
        // Handle duplicate name error with user-friendly message
        if (msg.toLowerCase().includes('duplicate key') && msg.toLowerCase().includes('name')) {
          return res.status(409).json({ 
            error: `Ya existe un software con este nombre. Los nombres de software deben ser únicos.`,
            type: 'duplicate_name'
          })
        }
        
        if (msg.toLowerCase().includes('responsible_user_id') || msg.toLowerCase().includes('column "responsible_user_id"')) {
          const safePayload = { ...payload }
          delete safePayload.responsible_user_id
          try {
            const { data: data2, error: err2 } = await supabase.from('software_inventory').insert(safePayload).select().single()
            if (err2) {
              console.error('Supabase insert error (retry)', err2)
              // Check for duplicate name in retry as well
              if (err2.message && err2.message.toLowerCase().includes('duplicate key') && err2.message.toLowerCase().includes('name')) {
                return res.status(409).json({ 
                  error: `Ya existe un software con este nombre. Los nombres de software deben ser únicos.`,
                  type: 'duplicate_name'
                })
              }
              return res.status(500).json({ error: err2.message || err2 })
            }
            return res.status(201).json({ data: data2 })
          } catch (e) {
            console.error('Unexpected insert retry error', e)
            return res.status(500).json({ error: e.message || e })
          }
        }
        console.error('Supabase insert error', errInsert)
        return res.status(500).json({ error: errInsert.message || errInsert })
      }
    } catch (err) {
      console.error('Unexpected POST /api/software error', err)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const user = await authenticate(req)
      if (!user) return res.status(401).json({ error: 'Unauthorized' })

      // Extract software ID from URL path (e.g., /api/software/123)
      const urlParts = req.url.split('/')
      const softwareId = urlParts[urlParts.length - 1]
      
      if (!softwareId || softwareId === 'software') {
        return res.status(400).json({ error: 'ID de software requerido' })
      }

      // Delete software from database
      const { error } = await supabase
        .from('software_inventory')
        .delete()
        .eq('id', softwareId)

      if (error) {
        console.error('Error deleting software:', error)
        return res.status(500).json({ error: error.message || error })
      }

      res.status(200).json({ success: true, message: 'Software eliminado correctamente' })
    } catch (err) {
      console.error('DELETE /api/software error', err)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}