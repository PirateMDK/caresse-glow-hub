-- =====================================================================
-- Caresse Care — script de migration INCREMENTAL (idempotent)
-- A executer sur une base contenant DEJA une partie de l'ancien schema.
-- Peut etre relance plusieurs fois sans risque.
-- (Sur une base totalement vide, utiliser plutot schema.sql + seed.sql.)
-- =====================================================================

-- ------------------------------------------------------- 1. TYPE app_role
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'super_admin', 'editor');
  END IF;
END $$;

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';

-- ------------------------------------------------------ 2. FONCTIONS
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin')
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin', 'editor')
  )
$$;

CREATE OR REPLACE FUNCTION public.claim_admin_access()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  SELECT lower(coalesce(current_setting('request.jwt.claims', true)::json->>'email', '')) INTO _email;
  IF _email NOT IN ('piratemkdingue@gmail.com') THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_admin_access() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_admin_access() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO service_role;

-- ------------------------------------------------ 3. COLONNES MANQUANTES
ALTER TABLE public.programs   ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.media_items ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'photo';
ALTER TABLE public.media_items ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;
ALTER TABLE public.products   ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE public.products   ADD COLUMN IF NOT EXISTS is_new boolean NOT NULL DEFAULT false;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS phone_ouaga text NOT NULL DEFAULT '+22671120240';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS maps_query text NOT NULL DEFAULT 'Vodjè, Cotonou, Bénin';

-- ------------------------------------------------- 4. TABLES MANQUANTES
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.site_content (
  key text PRIMARY KEY,
  label text NOT NULL,
  group_name text NOT NULL DEFAULT 'Général',
  value_text text NOT NULL DEFAULT '',
  value_image text,
  is_long boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(12,2) NOT NULL DEFAULT 0,
  note text,
  status text NOT NULL DEFAULT 'nouvelle',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- --------------------------------------------------------- 5. TRIGGERS
DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS services_updated_at ON public.services;
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS programs_updated_at ON public.programs;
CREATE TRIGGER programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS media_updated_at ON public.media_items;
CREATE TRIGGER media_updated_at BEFORE UPDATE ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS site_content_updated_at ON public.site_content;
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS nav_items_updated_at ON public.nav_items;
CREATE TRIGGER nav_items_updated_at BEFORE UPDATE ON public.nav_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------- 6. GRANTS
GRANT SELECT ON public.products, public.services, public.programs,
  public.media_items, public.posts, public.site_settings,
  public.site_content, public.nav_items TO anon;
GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products, public.services,
  public.programs, public.media_items, public.posts, public.orders,
  public.site_content, public.nav_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.products, public.services, public.programs,
  public.media_items, public.posts, public.orders, public.site_settings,
  public.site_content, public.nav_items, public.user_roles TO service_role;

-- -------------------------------------------------------------- 7. RLS
ALTER TABLE public.products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nav_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles    ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------- 8. POLITIQUES
-- (DROP puis CREATE : garantit l'etat final sans dependre de l'existant)
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Staff can read all roles" ON public.user_roles;
CREATE POLICY "Staff can read all roles" ON public.user_roles
FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Super admins manage roles" ON public.user_roles;
CREATE POLICY "Super admins manage roles" ON public.user_roles
FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Staff manage products" ON public.products;
CREATE POLICY "Staff manage products" ON public.products FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services" ON public.services FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Staff manage services" ON public.services;
CREATE POLICY "Staff manage services" ON public.services FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Public can view active programs" ON public.programs;
CREATE POLICY "Public can view active programs" ON public.programs FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Staff manage programs" ON public.programs;
CREATE POLICY "Staff manage programs" ON public.programs FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Public can view published media" ON public.media_items;
CREATE POLICY "Public can view published media" ON public.media_items FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Staff manage media" ON public.media_items;
CREATE POLICY "Staff manage media" ON public.media_items FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
CREATE POLICY "Public can view published posts" ON public.posts FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Staff manage posts" ON public.posts;
CREATE POLICY "Staff manage posts" ON public.posts FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
CREATE POLICY "Anyone can create an order" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins read orders" ON public.orders;
CREATE POLICY "Admins read orders" ON public.orders FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins delete orders" ON public.orders;
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can view settings" ON public.site_settings;
CREATE POLICY "Public can view settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins update settings" ON public.site_settings;
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins insert settings" ON public.site_settings;
CREATE POLICY "Admins insert settings" ON public.site_settings FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
CREATE POLICY "Public can view site content" ON public.site_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage site content" ON public.site_content;
CREATE POLICY "Staff manage site content" ON public.site_content FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Public can view active nav items" ON public.nav_items;
CREATE POLICY "Public can view active nav items" ON public.nav_items FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins manage nav items" ON public.nav_items;
CREATE POLICY "Admins manage nav items" ON public.nav_items FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------- 9. STOCKAGE (bucket "media")
-- Creer d'abord le bucket PRIVE nomme "media" depuis l'interface Storage.
DROP POLICY IF EXISTS "Staff read media files" ON storage.objects;
CREATE POLICY "Staff read media files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff upload media files" ON storage.objects;
CREATE POLICY "Staff upload media files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff update media files" ON storage.objects;
CREATE POLICY "Staff update media files" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff delete media files" ON storage.objects;
CREATE POLICY "Staff delete media files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'media' AND public.is_staff(auth.uid()));

-- --------------------------------------------------- 10. LIGNE PAR DEFAUT
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
