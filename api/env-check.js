// api/env-check.js
module.exports = (_req, res) => {
  res.status(200).json({
    has_SUPABASE_URL: !!process.env.SUPABASE_URL,
    has_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
    url_start: process.env.SUPABASE_URL?.slice(0, 35) + '...',
    service_key_start: process.env.SUPABASE_SERVICE_KEY?.slice(0, 8) + '...'
  })
}
