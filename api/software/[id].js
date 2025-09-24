// api/software/[id].js
const { supabase } = require('../_lib')

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'ID de software requerido' })

  const toSnake = (s) => s.replace(/([A-Z])/g, '_$1').toLowerCase()
  const normalizeKeys = (obj) => {
    const out = {}
    Object.entries(obj || {}).forEach(([k, v]) => {
      let nk = k
      if (k === 'serial') nk = 'serial_number'
      else nk = toSnake(k)
      out[nk] = (v === '') ? null : v
    })
    return out
  }
  const coerceTypes = (obj) => {
    const numericFields = new Set(['total_length_m', 'used_length_m'])
    const out = { ...obj }
    for (const k of Object.keys(out)) {
      if (out[k] === '') out[k] = null
      if (out[k] != null && numericFields.has(k)) {
        const n = Number(out[k]); out[k] = Number.isFinite(n) ? n : null
      }
    }
    return out
  }

  if (req.method === 'PUT') {
    try {
      let body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      body = normalizeKeys(body)
      const allowed = [
        'device_type', 'manufacturer', 'model', 'serial_number',
        'location', 'status',
        'purchase_date', 'warranty_end_date',
        'last_checked_by', 'last_checked_at',
        'total_length_m', 'used_length_m',
        'observations', 'responsible', 'responsible_user_id',
        'version', 'expiry_date', 'warranty_expiration', 'notes', 'created_at'
      ]
      body = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
      body = coerceTypes(body)

      if (!body.model || !body.serial_number) {
        return res.status(400).json({ error: 'model y serial_number son obligatorios' })
      }

      const { data, error } = await supabase
        .from('software_inventory')
        .update(body)
        .eq('id', id)
        .select()

      if (error) return res.status(500).json({ error: error.message || String(error) })
      return res.status(200).json({ data })
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Error interno del servidor' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('software_inventory')
        .delete()
        .eq('id', id)
      if (error) return res.status(500).json({ error: error.message || String(error) })
      return res.status(200).json({ success: true })
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Error interno del servidor' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
