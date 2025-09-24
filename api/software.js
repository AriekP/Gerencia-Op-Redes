// api/software.js
const { supabase } = require('./_lib')

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // Helpers
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

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('software_inventory') // <-- tu tabla
        .select('*')
        .order('created_at', { ascending: false })

      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ data })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'POST') {
    try {
      // body
      let payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      if (!payload || typeof payload !== 'object') payload = {}

      // normaliza claves camelCase -> snake_case (y serial -> serial_number)
      payload = normalize(payload)

      // permite TODOS los campos que usa tu Inventario + genéricos
      const allowedColumns = [
        // genéricos “software”
        'name', 'version', 'serial_number', 'responsible', 'status',
        'expiry_date', 'warranty_expiration', 'notes', 'responsible_user_id',
        // Inventario de red
        'device_type', 'manufacturer', 'model', 'location',
        'purchase_date', 'warranty_end_date',
        'last_checked_by', 'last_checked_at',
        'total_length_m', 'used_length_m',
        'observations', 'created_at'
      ]
      payload = Object.fromEntries(
        Object.entries(payload).filter(([k]) => allowedColumns.includes(k))
      )

      // fallback: si no hay name pero sí model, usamos model como name
      if (!payload.name && payload.model) {
        payload.name = payload.model
      }

      // validación mínima
      if (!payload.name || !payload.serial_number) {
        return res.status(400).json({ error: 'name y serial_number son obligatorios' })
      }

      // NOTA: NO convertir status a español; el inventario usa:
      // active | maintenance | inactive | retired

      // unicidad por nombre (si la quieres mantener)
      const { data: existing, error: checkErr } = await supabase
        .from('software_inventory')
        .select('id, name')
        .eq('name', payload.name)
        .maybeSingle()
      if (checkErr) return res.status(500).json({ error: 'Error verificando nombre de software' })
      if (existing) {
        return res.status(409).json({
          error: `Ya existe un software con el nombre "${payload.name}". Los nombres de software deben ser únicos.`,
          type: 'duplicate_name'
        })
      }

      // inserta
      const { data, error } = await supabase
        .from('software_inventory')
        .insert(payload)
        .select()
        .single()

      if (error) {
        const msg = (error.message || String(error)).toLowerCase()
        if (msg.includes('duplicate key') && msg.includes('name')) {
          return res.status(409).json({
            error: 'Ya existe un software con este nombre. Los nombres de software deben ser únicos.',
            type: 'duplicate_name'
          })
        }
        return res.status(500).json({ error: error.message || String(error) })
      }

      return res.status(201).json({ data })
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Extraer id de la URL (cuando llamas a /api/software/:id)
      const urlParts = req.url.split('?')[0].split('/')
      const softwareId = urlParts[urlParts.length - 1]
      if (!softwareId || softwareId === 'software') {
        return res.status(400).json({ error: 'ID de software requerido' })
      }

      const { error } = await supabase
        .from('software_inventory')
        .delete()
        .eq('id', softwareId)

      if (error) return res.status(500).json({ error: error.message || String(error) })
      return res.status(200).json({ success: true, message: 'Software eliminado correctamente' })
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
