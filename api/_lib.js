const { supabase } = require('./_lib')

module.exports = async (_req, res) => {
  try {
    // Ajusta nombre de tabla/columnas si fuera distinto o devuelve [] temporalmente
    const { data, error } = await supabase
      .from('users')
      .select('id,name,email')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
