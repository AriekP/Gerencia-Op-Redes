const { supabase, authenticate } = require('../_lib')

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

  if (req.method === 'DELETE') {
    try {
      const user = await authenticate(req)
      if (!user) return res.status(401).json({ error: 'Unauthorized' })

      // Get software ID from query parameters
      const { id: softwareId } = req.query
      
      if (!softwareId) {
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
      console.error('DELETE /api/software/[id] error', err)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}