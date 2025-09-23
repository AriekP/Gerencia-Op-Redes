(async () => {
  const fs = require('fs')
  const path = require('path')
  const repo = path.join(__dirname, '..')
  const envPath = path.join(repo, '.env')
  if (!fs.existsSync(envPath)) {
    console.error('server/.env not found')
    process.exit(1)
  }
  const env = fs.readFileSync(envPath, 'utf8')
  const anonLine = env.split(/\r?\n/).find(l => l.startsWith('SUPABASE_ANON_KEY='))
  if (!anonLine) {
    console.error('SUPABASE_ANON_KEY not found in server/.env')
    process.exit(1)
  }
  const anon = anonLine.split('=')[1].trim()

  const email = process.argv[2]
  const password = process.argv[3]
  if (!email || !password) {
    console.error('Usage: node test_login_fetch.js email password')
    process.exit(1)
  }

  try {
    const params = new URLSearchParams()
    params.append('grant_type', 'password')
    params.append('email', email)
    params.append('password', password)

    const resp = await fetch('https://dnobjbhlpdyjdkqzvtqm.supabase.co/auth/v1/token', {
      method: 'POST',
      headers: {
        'apikey': anon,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })
    const json = await resp.json()
    console.log('Auth response:', JSON.stringify(json, null, 2))

    if (json.access_token) {
      // call backend
      const apiResp = await fetch('http://localhost:3000/api/software', {
        headers: { 'Authorization': `Bearer ${json.access_token}` }
      })
      const apiJson = await apiResp.json()
      console.log('Backend /api/software response:', JSON.stringify(apiJson, null, 2))
    } else {
      console.error('No access_token returned from supabase auth')
    }
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
})()
