// api/_lib.js
const { createClient } = require('@supabase/supabase-js')

// Verifica variables (se verá en logs si faltan)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
}

// Cliente ADMIN (service role) — solo en servidor
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

module.exports = { supabase }
