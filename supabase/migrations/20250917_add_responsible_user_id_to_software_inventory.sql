-- Migration: add responsible_user_id to software_inventory
-- Date: 2025-09-17

-- 1) Add column (nullable) to store the user's id
ALTER TABLE public.software_inventory
ADD COLUMN IF NOT EXISTS responsible_user_id uuid;

-- 2) If there is a users_profiles table, attempt best-effort backfill by matching names or emails
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users_profiles') THEN
    -- Try to match by full_name -> user_id
    -- This is best-effort and may not match all rows; run in transaction per DB's capabilities
    UPDATE public.software_inventory s
    SET responsible_user_id = p.user_id
    FROM public.users_profiles p
    WHERE p.full_name IS NOT NULL
      AND (s.responsible = p.full_name OR s.responsible ILIKE p.full_name || '%');

    -- If still null, try matching by email if responsible column contains an email-like string
    UPDATE public.software_inventory s
    SET responsible_user_id = p.user_id
    FROM public.users_profiles p
    WHERE s.responsible ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$' -- looks like email (case-insensitive regex)
      AND lower(s.responsible) = lower(p.email);
  END IF;
END$$;

-- 3) Create index to make lookups faster
CREATE INDEX IF NOT EXISTS idx_software_inventory_responsible_user_id ON public.software_inventory (responsible_user_id);

-- 4) (Optional) Add FK constraint if you know the users table name and want referential integrity.
-- Note: many Supabase setups keep auth.users in the "auth" schema, which cannot be referenced by standard FK.
-- If your users table is "users_profiles" in public and user_id is uuid, you could create a FK like below. Disable if not applicable.
-- ALTER TABLE public.software_inventory
-- ADD CONSTRAINT fk_software_responsible_user
-- FOREIGN KEY (responsible_user_id) REFERENCES public.users_profiles (user_id) ON DELETE SET NULL;

-- Rollback (manual):
-- ALTER TABLE public.software_inventory DROP COLUMN IF EXISTS responsible_user_id;
