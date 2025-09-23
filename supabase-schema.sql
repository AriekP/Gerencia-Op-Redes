-- Supabase schema for Software Inventory
-- Bloque A: tipos y tabla de perfiles (extiende Supabase Auth)
CREATE TYPE user_role AS ENUM ('admin','user','viewer');

-- Tabla de perfiles: enlazada a auth.users (gestión de Auth en Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  role user_role DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Bloque B: Inventario del Area del Redes
CREATE TYPE software_status AS ENUM ('activo','expirado','en_revision','inactivo');

CREATE TABLE IF NOT EXISTS software_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number text UNIQUE,
  name text NOT NULL,
  version text,
  license_key text,
  installation_date date,
  last_review date,
  status software_status DEFAULT 'activo',
  responsible_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  location text,
  warranty_expiration date,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_software_name ON software_inventory (name);
CREATE INDEX IF NOT EXISTS idx_software_status ON software_inventory (status);

-- Bloque C: Auditoría / reportes
CREATE TYPE audit_action AS ENUM ('create','update','delete','revision');

CREATE TABLE IF NOT EXISTS software_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id uuid REFERENCES software_inventory(id) ON DELETE CASCADE,
  action audit_action NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  occurred_at timestamptz DEFAULT now(),
  details text
);

CREATE INDEX IF NOT EXISTS idx_audit_inventory ON software_audit (inventory_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON software_audit (user_id);

-- Datos de ejemplo (opcional)
-- INSERT INTO profiles (id, username, role) VALUES ('00000000-0000-0000-0000-000000000001', 'admin', 'admin');
-- INSERT INTO software_inventory (serial_number, name, version, status, responsible_id) VALUES ('SN-0001', 'Example Software', '1.0', 'activo', '00000000-0000-0000-0000-000000000001');

-- Recomendaciones RLS (ejecutar manualmente tras revisar):
-- 1) ENABLE RLS on tables with sensitive data
-- ALTER TABLE software_inventory ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE software_audit ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2) Ejemplo de policy: permitir SELECT público sobre software_inventory (si quieres catálogo público)
-- CREATE POLICY "Public read software" ON software_inventory FOR SELECT USING (true);

-- 3) Ejemplo de policy: sólo admin puede INSERT/UPDATE/DELETE
-- CREATE POLICY "Admins full access" ON software_inventory FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- NOTA: Para operaciones administrativas desde backend, usa la `service_role` key y no la `anon` key.
