require('dotenv').config()
const express = require('express')
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(express.json())

// CORS: allow requests from frontend dev server.
const cors = require('cors')
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }))
app.options('*', cors({ origin: (origin, callback) => callback(null, true), credentials: true }))

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

// Nota: Para un backend sin autenticación, podrías usar la API key pública en el cliente, 
// pero el uso de la service key aquí es para las operaciones de escritura/borrado.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

app.get('/health', (req, res) => res.json({ ok: true }))

// Endpoints CRUD para `software_inventory` (Acceso público)

// GET: Listar todo el software
app.get('/api/software', async (req, res) => {
  try {
    const { data, error } = await supabase.from('software_inventory').select('*')
    if (error) return res.status(500).json({ error: error.message })
    res.json({ data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST: Crear nuevo software
app.post('/api/software', async (req, res) => {
  try {
    let payload = req.body
    
    // Validar campos obligatorios
    if (!payload.model || !payload.manufacturer || !payload.serial_number) {
      return res.status(400).json({ error: 'model, manufacturer y serial_number son obligatorios' })
    }

    const insertPayload = {
      device_type: payload.device_type || '',
      manufacturer: payload.manufacturer || '',
      model: payload.model || '',
      serial_number: payload.serial_number || '',
      location: payload.location || '',
      status: payload.status || 'active',
      purchase_date: payload.purchase_date || null,
      warranty_end_date: payload.warranty_end_date || null,
      responsible_person: payload.responsible_person || '',
      last_checked_by: payload.last_checked_by || '',
      last_checked_at: payload.last_checked_at || null,
      observations: payload.observations || '',
      total_length_m: payload.total_length_m || null,
      used_length_m: payload.used_length_m || null
    }

    Object.keys(insertPayload).forEach(key => {
      if (insertPayload[key] === undefined || insertPayload[key] === '') {
        insertPayload[key] = null;
      }
    });

    const { data, error } = await supabase
      .from('software_inventory')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      if (error.code === '23505') {
        return res.status(400).json({ 
          error: 'Número de serie duplicado',
          type: 'duplicate_serial_number' 
        });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ data });
  } catch (err) {
    console.error('Unexpected POST /api/software error', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
})

// PUT: Actualizar software por ID
app.put('/api/software/:id', async (req, res) => {
  try {
    const id = req.params.id
    let payload = req.body
    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'Payload vacío' })
    }

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

    const allowedColumns = ['name', 'version', 'serial_number', 'responsible', 'status', 'expiry_date', 'warranty_expiration', 'notes']
    const incomingKeys = Object.keys(payload || {})
    const filtered = Object.fromEntries(Object.entries(payload || {}).filter(([k]) => allowedColumns.includes(k)))
    const removed = incomingKeys.filter(k => !Object.keys(filtered).includes(k))
    if (removed.length) console.warn('Filtered unknown columns from PUT payload:', removed)
    payload = filtered

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

    try {
      const { data, error } = await supabase.from('software_inventory').update(payload).eq('id', id).select().single()
      if (error) throw error
      return res.json({ data })
    } catch (errUpd) {
      console.error('Supabase update error', errUpd)
      return res.status(500).json({ error: errUpd.message || errUpd })
    }
  } catch (err) {
    console.error('Unexpected PUT /api/software/:id error', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// DELETE: Eliminar software por ID
app.delete('/api/software/:id', async (req, res) => {
  try {
    const id = req.params.id
    const { data, error } = await supabase.from('software_inventory').delete().eq('id', id).select().single()
    if (error) {
      console.error('Supabase delete error', error)
      return res.status(500).json({ error: error.message || error })
    }
    res.json({ data })
  } catch (err) {
    console.error('Unexpected DELETE /api/software/:id error', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server listening on ${port}`))