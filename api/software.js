// api/software.js
const { supabase } = require('./_lib')

module.exports = async (req, res) => {
  // CORS (ok dejarlo)
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('software_inventory').select('*').order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ data })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'POST') {
    try {
      // ---- SIN authenticate/requireAdmin ----

      // Normalización (igual que tu versión)
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

      let payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      payload = normalize(payload)

      // Filtrar columnas desconocidas
      const allowedColumns = ['name', 'version', 'serial_number', 'responsible', 'status', 'expiry_date', 'warranty_expiration', 'notes', 'responsible_user_id']
      const filtered = Object.fromEntries(Object.entries(payload || {}).filter(([k]) => allowedColumns.includes(k)))
      payload = filtered

      // Mapear status a backend
      const statusMap = { active: 'activo', expired: 'expirado', expiring: 'en_revision', inactive: 'inactivo' }
      if (payload.status && typeof payload.status === 'string') {
        const key = payload.status.toLowerCase()
        if (statusMap[key]) payload.status = statusMap[key]
      }

      if (!payload || !payload.name || !payload.serial_number) {
        return res.status(400).json({ error: 'name y serial_number son obligatorios' })
      }

      // Unicidad por nombre
      const { data: existingSoftware, error: checkError } = await supabase
        .from('software_inventory')
        .select('id, name')
        .eq('name', payload.name)
        .maybeSingle()
      if (checkError) return res.status(500).json({ error: 'Error verificando nombre de software' })
      if (existingSoftware) {
        return res.status(409).json({ 
          error: `Ya existe un software con el nombre "${payload.name}". Los nombres de software deben ser únicos.`,
          type: 'duplicate_name'
        })
      }

      // Insert
      try {
        const { data, error } = await supabase.from('software_inventory').insert(payload).select().single()
        if (error) throw error
        return res.status(201).json({ data })
      } catch (errInsert) {
        const msg = (errInsert && errInsert.message) ? errInsert.message : String(errInsert)

        // Mensaje amigable si es duplicado
        if (msg.toLowerCase().includes('duplicate key') && msg.toLowerCase().includes('name')) {
          return res.status(409).json({ 
            error: `Ya existe un software con este nombre. Los nombres de software deben ser únicos.`,
            type: 'duplicate_name'
          })
        }

        // Reintento si cae por responsible_user_id inexistente (por si tu schema no lo tiene)
        if (msg.toLowerCase().includes('responsible_user_id') || msg.toLowerCase().includes('column "responsible_user_id"')) {
          const safePayload = { ...payload }
          delete safePayload.responsible_user_id
          const { data: data2, error: err2 } = await supabase.from('software_inventory').insert(safePayload).select().single()
          if (err2) {
            const m2 = err2.message || String(err2)
            if (m2.toLowerCase().includes('duplicate key') && m2.toLowerCase().includes('name')) {
              return res.status(409).json({ 
                error: `Ya existe un software con este nombre. Los nombres de software deben ser únicos.`,
                type: 'duplicate_name'
              })
            }
            return res.status(500).json({ error: m2 })
          }
          return res.status(201).json({ data: data2 })
        }

        return res.status(500).json({ error: msg })
      }
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // ---- SIN authenticate/requireAdmin ----

      // Extraer id de la URL (cuando llamas a /api/software/:id desde el front)
      const urlParts = req.url.split('?')[0].split('/')
      const softwareId = urlParts[urlParts.length - 1]

      if (!softwareId || softwareId === 'software') {
        return res.status(400).json({ error: 'ID de software requerido' })
      }

      const { error } = await supabase.from('software_inventory').delete().eq('id', softwareId)
      if (error) return res.status(500).json({ error: error.message || error })

      return res.status(200).json({ success: true, message: 'Software eliminado correctamente' })
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
