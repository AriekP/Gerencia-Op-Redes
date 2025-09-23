Instrucciones para ejecutar el proyecto (Windows PowerShell)

1) Frontend (Vite + Vue)

- Instalar dependencias:

```powershell
cd c:\Users\usuario\Documents\GitHub\v0-vue-3-inventory-app
npm install
```

- Añadir variables de Supabase para el cliente en un archivo `.env` en la raíz:

```
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

- Ejecutar en modo desarrollo:

```powershell
npm run dev
```

El frontend correrá por defecto en `http://localhost:5173`.

2) Backend (Node.js - Express)

- Instalar dependencias y correr:

```powershell
cd server
npm install
cp .env.example .env   # en PowerShell: Copy-Item .env.example .env
# Edita server/.env con tus credenciales de Supabase (SERVICE KEY)
npm run dev
```

El backend escuchará en `http://localhost:3000` por defecto.

Notas:
- El frontend usa `@supabase/supabase-js` con las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- El backend usa la `SUPABASE_SERVICE_KEY` desde `server/.env` para consultas seguras al lado servidor.
- Si quieres soporte para Tailwind, podemos añadirlo después.
