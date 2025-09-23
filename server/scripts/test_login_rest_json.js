const https = require('https')
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env')
if (!fs.existsSync(envPath)) {
  console.error('server/.env no encontrado')
  process.exit(1)
}
const env = fs.readFileSync(envPath, 'utf8')
const anonLine = env.split(/\r?\n/).find(l => l.startsWith('SUPABASE_ANON_KEY='))
if (!anonLine) {
  console.error('SUPABASE_ANON_KEY no encontrado en server/.env')
  process.exit(1)
}
const anon = anonLine.split('=')[1].trim()

const email = process.argv[2]
const password = process.argv[3]
if (!email || !password) {
  console.error('Uso: node test_login_rest_json.js email password')
  process.exit(1)
}

const postData = JSON.stringify({ grant_type: 'password', email, password })

const options = {
  hostname: 'dnobjbhlpdyjdkqzvtqm.supabase.co',
  path: '/auth/v1/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'apikey': anon,
    'Accept': 'application/json'
  }
}

const req = https.request(options, res => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    try {
      const json = JSON.parse(data)
      console.log(JSON.stringify(json, null, 2))
    } catch (err) {
      console.error('Respuesta no JSON:', data)
      process.exit(1)
    }
  })
})

req.on('error', err => {
  console.error('Request error', err)
  process.exit(1)
})

req.write(postData)
req.end()
