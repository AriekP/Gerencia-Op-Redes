// api/software/[id].js
const { supabase } = require('../_lib')

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // id desde la ruta dinámica /api/software/[id]
  const { id: softwareId } = req.query
  if (!softwareId) return res.status(400).json({ error: 'ID de software requerido' })

  try {
    if (req.method === 'PUT') {
      // actualizar por id
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

      // (opcional) normalizar claves si tu front envía camelCase:
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
      const payload = normalize(body)

      // mapa de estado opcional (si tu BD guarda estos valores)
      const statusMap = { active: 'activo', expired: 'expirado', expiring: 'en_revision', inactive: 'inactivo' }
      if (payload.status && typeof payload.status === 'string') {
        const key = payload.status.toLowerCase()
        if (statusMap[key]) payload.status = statusMap[key]
      }

      const { data, error } = await supabase
        .from('software_inventory')       // <-- tu tabla
        .update(payload)
        .eq('id', softwareId)
        .select()

      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ data })
    }

    if (req.method === 'DELETE') {
      // eliminar por id
      const { error } = await supabase
        .from('software_inventory')       // <-- tu tabla
        .delete()
        .eq('id', softwareId)

      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ success: true, message: 'Software eliminado correctamente' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
