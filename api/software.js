// api/software.js
const { supabase } = require('./_lib')

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // helpers
  const toSnake = (s) => s.replace(/([A-Z])/g, '_$1').toLowerCase()
  const normalizeKeys = (obj) => {
    const out = {}
    Object.entries(obj || {}).forEach(([k, v]) => {
      let nk = k
      if (k === 'serial') nk = 'serial_number'
      else nk = toSnake(k)
      // convierte "" a null para columnas date/number/text que no aceptan vacío
      const vv = (v === '') ? null : v
      out[nk] = vv
    })
    return out
  }

  // convierte strings numéricas a number y deja null cuando toca
  const coerceTypes = (obj) => {
    const numericFields = new Set(['total_length_m', 'used_length_m'])
    const out = { ...obj }
    for (const k of Object.keys(out)) {
      if (out[k] === '') out[k] = null
      if (out[k] != null && numericFields.has(k)) {
        const n = Number(out[k])
        out[k] = Number.isFinite(n) ? n : null
      }
    }
    return out
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('software_inventory')
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
      let payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      if (!payload || typeof payload !== 'object') payload = {}

      // normaliza y sanea
      payload = normalizeKeys(payload)

      // campos que existen en tu tabla
      const allowed = [
        'device_type', 'manufacturer', 'model', 'serial_number',
        'location', 'status',
        'purchase_date', 'warranty_end_date',
        'last_checked_by', 'last_checked_at',
        'total_length_m', 'used_length_m',
        'observations', 'responsible', 'responsible_user_id',
        // si tu tabla tiene estas, déjalas; si no, no importan porque están filtradas
        'version', 'expiry_date', 'warranty_expiration', 'notes', 'created_at'
      ]
      payload = Object.fromEntries(Object.entries(payload).filter(([k]) => allowed.includes(k)))

      // coerciones simples ("" -> null, números)
      payload = coerceTypes(payload)

      // validación mínima acorde al formulario
      if (!payload.model || !payload.serial_number) {
        return res.status(400).json({ error: 'model y serial_number son obligatorios' })
      }

      // inserta
      const { data, error } = await supabase
        .from('software_inventory')
        .insert(payload)
        .select()
        .single()

      if (error) {
        // refleja el error real para depurar (p.ej. violación de unique en serial_number)
        return res.status(500).json({ error: error.message || String(error) })
      }

      return res.status(201).json({ data })
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Error interno del servidor' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // id de /api/software/:id
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
      return res.status(500).json({ error: err.message || 'Error interno del servidor' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
