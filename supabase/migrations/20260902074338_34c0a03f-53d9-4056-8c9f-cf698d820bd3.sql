-- ============ FONCTIONS DE ROLES ============
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

-- Les comptes admin existants deviennent super_admin
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT user_id, 'super_admin'::public.app_role FROM public.user_roles WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

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

-- ============ POLITIQUES user_roles ============
DROP POLICY IF EXISTS "Staff can read all roles" ON public.user_roles;
CREATE POLICY "Staff can read all roles" ON public.user_roles
FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Super admins manage roles" ON public.user_roles;
CREATE POLICY "Super admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- ============ CONTENU : editeurs autorises ============
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Staff manage products" ON public.products FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins manage services" ON public.services;
CREATE POLICY "Staff manage services" ON public.services FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins manage programs" ON public.programs;
CREATE POLICY "Staff manage programs" ON public.programs FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins manage media" ON public.media_items;
CREATE POLICY "Staff manage media" ON public.media_items FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins manage posts" ON public.posts;
CREATE POLICY "Staff manage posts" ON public.posts FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Commandes et parametres : administrateurs uniquement
DROP POLICY IF EXISTS "Admins read orders" ON public.orders;
CREATE POLICY "Admins read orders" ON public.orders FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins delete orders" ON public.orders;
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins update settings" ON public.site_settings;
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins insert settings" ON public.site_settings;
CREATE POLICY "Admins insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- ============ VIDEO POUR LES PROGRAMMES ============
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS video_url text;

-- ============ CONTENU EDITABLE DU SITE ============
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
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Staff manage site content" ON public.site_content FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_content (key, label, group_name, value_text, is_long, sort_order) VALUES
('hero.eyebrow', 'Hero — surtitre', 'Accueil', 'Cotonou · Vodjè · Ouagadougou', false, 1),
('hero.title', 'Hero — titre', 'Accueil', 'Votre peau mérite des soins', false, 2),
('hero.title_highlight', 'Hero — mot en doré', 'Accueil', 'authentiques', false, 3),
('hero.subtitle', 'Hero — sous-titre', 'Accueil', 'Institut de beauté et boutique dermo-cosmétique : produits certifiés, soins visage et corps personnalisés, coaching et formations professionnelles.', true, 4),
('home.services_title', 'Accueil — titre services', 'Accueil', 'Des soins pour elle et pour lui', false, 5),
('home.services_text', 'Accueil — texte services', 'Accueil', 'Soin du visage personnalisé, kératothérapie, massages relaxants : chaque protocole commence par un diagnostic de peau.', true, 6),
('home.about_title', 'Accueil — titre à propos', 'Accueil', 'Une boutique pensée comme un cocon', false, 7),
('home.about_text', 'Accueil — texte à propos', 'Accueil', 'Chez Caresse Care, nous conseillons chaque cliente et chaque client avec pédagogie : comprendre sa peau avant d''acheter, puis suivre une routine réaliste.', true, 8),
('about.hero_title', 'À propos — titre', 'À propos', 'Caresse Care, votre dermo-cosméticienne', false, 1),
('about.hero_text', 'À propos — introduction', 'À propos', 'Un institut, une boutique et un accompagnement : nous aidons chaque personne à comprendre sa peau et à choisir des produits sûrs.', true, 2),
('about.story_title', 'À propos — titre histoire', 'À propos', 'Née d''une conviction simple', false, 3),
('about.story_text', 'À propos — texte histoire', 'À propos', 'Trop de personnes abîment leur peau avec des produits inadaptés ou contrefaits. Caresse Care est née pour proposer une autre voie : le conseil avant la vente, la pédagogie avant la promesse.', true, 4),
('footer.text', 'Footer — texte de présentation', 'Footer', 'Institut de beauté et boutique dermo-cosmétique. Des produits authentiques et des soins personnalisés pour une peau saine, à Cotonou et à Ouagadougou.', true, 1)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_content (key, label, group_name, value_text, value_image, is_long, sort_order) VALUES
('hero.image', 'Hero — image de fond', 'Accueil', '', NULL, false, 0)
ON CONFLICT (key) DO NOTHING;

-- ============ NAVIGATION ============
CREATE TABLE IF NOT EXISTS public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nav_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nav_items TO authenticated;
GRANT ALL ON public.nav_items TO service_role;
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active nav items" ON public.nav_items FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage nav items" ON public.nav_items FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER nav_items_updated_at BEFORE UPDATE ON public.nav_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.nav_items (label, href, sort_order) VALUES
('Accueil', '/', 1),
('Boutique', '/boutique', 2),
('Nouveautés', '/nouveautes', 3),
('Services', '/services', 4),
('Coaching & Formations', '/coaching', 5),
('Blog', '/blog', 6),
('À propos', '/a-propos', 7),
('Contact', '/contact', 8);

-- ============ STORAGE : editeurs autorises ============
DROP POLICY IF EXISTS "Admins read media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins update media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete media files" ON storage.objects;
CREATE POLICY "Staff read media files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff upload media files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff update media files" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff delete media files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'media' AND public.is_staff(auth.uid()));