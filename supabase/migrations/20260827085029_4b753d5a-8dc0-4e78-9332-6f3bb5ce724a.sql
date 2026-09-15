CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PRODUITS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(12,2),
  currency text NOT NULL DEFAULT 'FCFA',
  category text NOT NULL DEFAULT 'Soin visage',
  brand text,
  image_url text,
  is_new boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SERVICES
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_label text,
  duration text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- COACHING & FORMATIONS
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'formation',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  duration text,
  audience text,
  price_label text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active programs" ON public.programs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage programs" ON public.programs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MEDIAS CONSEILS
CREATE TABLE public.media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  media_type text NOT NULL DEFAULT 'photo',
  url text NOT NULL,
  category text NOT NULL DEFAULT 'Conseils',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_items TO authenticated;
GRANT ALL ON public.media_items TO service_role;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published media" ON public.media_items FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage media" ON public.media_items FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER media_updated_at BEFORE UPDATE ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BLOG
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_url text,
  category text NOT NULL DEFAULT 'Conseils',
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published posts" ON public.posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage posts" ON public.posts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- COMMANDES WHATSAPP
CREATE TABLE public.orders (
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
GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create an order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PARAMETRES
CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  address text NOT NULL DEFAULT 'Cotonou, Vodjè, en face de la SONAR',
  phone_primary text NOT NULL DEFAULT '+2290152146060',
  phone_secondary text NOT NULL DEFAULT '+2290198073307',
  phone_ouaga text NOT NULL DEFAULT '+22671120240',
  instagram_url text NOT NULL DEFAULT 'https://instagram.com/caressecare',
  tiktok_url text NOT NULL DEFAULT 'https://tiktok.com/@caressecare',
  facebook_url text NOT NULL DEFAULT 'https://facebook.com/caressebydd',
  maps_query text NOT NULL DEFAULT 'Vodjè, Cotonou, Bénin',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.site_settings (id) VALUES (1);

-- DONNEES DE DEMARRAGE
INSERT INTO public.products (name, description, price, category, brand, is_new, sort_order) VALUES
('Azelaic Serum A-Control', 'Sérum hydratant, unifiant et éclatant pour une peau parfaite. Idéal contre les imperfections.', 15000, 'Anti-taches / Hyperpigmentation', 'A-Control', true, 1),
('Good Molecules - Discoloration Correcting Serum', 'Sérum correcteur de taches brunes et d''hyperpigmentation, formule légère et efficace.', 18000, 'Anti-taches / Hyperpigmentation', 'Good Molecules', true, 2),
('Sedulis 1988 - Sérum réparateur', 'Sérum coréen authentique pour réparer et renforcer la barrière cutanée.', 22000, 'Soin visage', 'Sedulis', true, 3),
('Nine Less A-Control DHA Cleanser', 'Nettoyant visage doux purifiant, régule le sébum et affine le grain de peau.', 12000, 'Hygiène & bien-être', 'Nine Less', false, 4),
('Crème hydratante intense', 'Hydratation profonde 24h, texture fondante adaptée aux peaux normales à sèches.', 14000, 'Hydratation', 'Caresse Care', false, 5),
('Lait corporel éclat naturel', 'Lait pour le corps aux actifs naturels, nourrit et illumine la peau au quotidien.', 11000, 'Soin corps', 'Caresse Care', false, 6);

INSERT INTO public.services (title, description, price_label, duration, sort_order) VALUES
('Soin du visage personnalisé', 'Diagnostic de peau, nettoyage profond, gommage, masque et soin ciblé selon vos besoins. Hommes et femmes.', 'À partir de 15 000 FCFA', '1h', 1),
('Kératothérapie', 'Cosmétique corrective professionnelle : traitement des taches, de l''acné et des irrégularités du grain de peau.', 'Sur devis', '1h30', 2),
('Massage relaxant & bien-être', 'Massage corps complet aux huiles naturelles pour relâcher les tensions et retrouver votre énergie.', 'À partir de 12 000 FCFA', '1h', 3);

INSERT INTO public.programs (kind, title, description, duration, audience, price_label, sort_order) VALUES
('coaching', 'Coaching skincare personnalisé', 'Analyse de votre peau, routine sur mesure et suivi personnalisé par votre dermo-cosméticienne.', '1 mois de suivi', 'Tous types de peau, hommes et femmes', 'Sur devis', 1),
('coaching', 'Consultation express', 'Une consultation ciblée pour corriger votre routine et choisir les bons produits authentiques.', '45 min', 'Débutants en skincare', '5 000 FCFA', 2),
('formation', 'Formation soins du visage professionnels', 'Apprenez les protocoles de soins en cabine : diagnostic, nettoyage, extraction, masques et finitions.', '5 jours', 'Esthéticiennes et futurs professionnels', 'Sur devis', 3),
('formation', 'Formation dermo-cosmétique & produits', 'Comprendre les actifs, les routines correctives et le conseil produit authentique.', '3 jours', 'Vendeurs, esthéticiennes, coachs beauté', 'Sur devis', 4);

INSERT INTO public.posts (slug, title, excerpt, content, category, is_published, published_at) VALUES
('routine-anti-taches', 'La routine idéale contre les taches', 'Trois étapes simples et des actifs sûrs pour retrouver un teint uniforme.', E'Les taches et l''hyperpigmentation sont l''une des préoccupations les plus fréquentes de nos clientes et clients à Cotonou.\n\nLa base : un nettoyant doux, un actif ciblé (acide azélaïque, niacinamide ou vitamine C) et une protection solaire quotidienne.\n\nEn institut, la kératothérapie accélère les résultats en travaillant la correction en profondeur. Prenez rendez-vous pour un diagnostic personnalisé.', 'Conseils', true, now()),
('hommes-skincare', 'Messieurs, le soin aussi c''est pour vous', 'Il n''y a pas que les femmes qui y ont droit : profitez de votre moment avec Caresse Care.', E'Peau grasse, poils incarnés, feu du rasoir : la peau masculine a ses propres besoins.\n\nNos protocoles hommes combinent nettoyage profond, gommage doux et hydratation non grasse, avec un massage pour finir.\n\nPassez à l''institut à Vodjè, en face de la SONAR.', 'Institut', true, now()),
('produits-authentiques', 'Comment reconnaître un produit authentique ?', 'Nos produits viennent de Corée, des USA et d''Europe. Voici comment éviter les contrefaçons.', E'Vérifiez le numéro de lot, la date de péremption, la qualité de l''emballage et surtout la provenance de votre revendeur.\n\nChez Caresse Care, chaque référence est importée et sélectionnée avec soin.', 'Marque', true, now());

INSERT INTO public.media_items (title, description, media_type, url, category) VALUES
('Avant / après soin du visage', 'Résultat après un protocole de kératothérapie en 4 séances.', 'photo', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80', 'Avant / Après'),
('Le bon geste pour appliquer un sérum', 'Tutoriel : quantité, ordre d''application et zones à ne pas oublier.', 'photo', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200&q=80', 'Tutoriels'),
('Témoignage cliente', 'Retour d''expérience après un coaching skincare d''un mois.', 'photo', 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=1200&q=80', 'Témoignages');