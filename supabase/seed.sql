-- Caresse Care — donnees actuelles (seed)
-- A executer APRES schema.sql dans un nouveau projet Supabase.

-- site_settings (1 lignes)
INSERT INTO public.site_settings (id, address, phone_primary, phone_secondary, phone_ouaga, instagram_url, tiktok_url, facebook_url, maps_query, updated_at) VALUES
  (1, 'Cotonou, Vodjè, en face de la SONAR', '+2290152146060', '+2290198073307', '+22671120240', 'https://instagram.com/caressecare', 'https://tiktok.com/@caressecare', 'https://facebook.com/caressebydd', 'Vodjè, Cotonou, Bénin', '2026-08-27T08:50:29.112476+00:00')
ON CONFLICT (id) DO UPDATE SET address = EXCLUDED.address, phone_primary = EXCLUDED.phone_primary, phone_secondary = EXCLUDED.phone_secondary, phone_ouaga = EXCLUDED.phone_ouaga, instagram_url = EXCLUDED.instagram_url, tiktok_url = EXCLUDED.tiktok_url, facebook_url = EXCLUDED.facebook_url, maps_query = EXCLUDED.maps_query, updated_at = EXCLUDED.updated_at;

-- products (6 lignes)
INSERT INTO public.products (id, name, description, price, currency, category, brand, image_url, is_new, is_active, sort_order, created_at, updated_at) VALUES
  ('c7f67401-4498-4bed-8b01-aabfe33433d5', 'Azelaic Serum A-Control', 'Sérum hydratant, unifiant et éclatant pour une peau parfaite. Idéal contre les imperfections.', 15000.0, 'FCFA', 'Anti-taches / Hyperpigmentation', 'A-Control', NULL, true, true, 1, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('d608c33d-e756-41d6-aac7-ad3f043d8130', 'Good Molecules - Discoloration Correcting Serum', 'Sérum correcteur de taches brunes et d''hyperpigmentation, formule légère et efficace.', 18000.0, 'FCFA', 'Anti-taches / Hyperpigmentation', 'Good Molecules', NULL, true, true, 2, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('af19533f-82cc-419f-930b-a4a5db229854', 'Sedulis 1988 - Sérum réparateur', 'Sérum coréen authentique pour réparer et renforcer la barrière cutanée.', 22000.0, 'FCFA', 'Soin visage', 'Sedulis', NULL, true, true, 3, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('8e074f7b-7454-41c9-9e17-2f1ff4e08dd9', 'Nine Less A-Control DHA Cleanser', 'Nettoyant visage doux purifiant, régule le sébum et affine le grain de peau.', 12000.0, 'FCFA', 'Hygiène & bien-être', 'Nine Less', NULL, false, true, 4, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('2328cc04-cdd2-4623-a995-4dbad17cba8e', 'Crème hydratante intense', 'Hydratation profonde 24h, texture fondante adaptée aux peaux normales à sèches.', 14000.0, 'FCFA', 'Hydratation', 'Caresse Care', NULL, false, true, 5, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('a7023c82-2570-4b15-992b-a21a0af8e38b', 'Lait corporel éclat naturel', 'Lait pour le corps aux actifs naturels, nourrit et illumine la peau au quotidien.', 11000.0, 'FCFA', 'Soin corps', 'Caresse Care', NULL, false, true, 6, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00')
ON CONFLICT (id) DO NOTHING;

-- services (3 lignes)
INSERT INTO public.services (id, title, description, price_label, duration, image_url, is_active, sort_order, created_at, updated_at) VALUES
  ('b6f4bf68-9271-4d0c-bd33-7907da124674', 'Soin du visage personnalisé', 'Diagnostic de peau, nettoyage profond, gommage, masque et soin ciblé selon vos besoins. Hommes et femmes.', 'À partir de 15 000 FCFA', '1h', NULL, true, 1, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('579c436d-979a-4fef-a142-4fdeb8998b5e', 'Kératothérapie', 'Cosmétique corrective professionnelle : traitement des taches, de l''acné et des irrégularités du grain de peau.', 'Sur devis', '1h30', NULL, true, 2, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('285e91a2-3880-4157-a888-6e1724b1626b', 'Massage relaxant & bien-être', 'Massage corps complet aux huiles naturelles pour relâcher les tensions et retrouver votre énergie.', 'À partir de 12 000 FCFA', '1h', NULL, true, 3, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00')
ON CONFLICT (id) DO NOTHING;

-- programs (4 lignes)
INSERT INTO public.programs (id, kind, title, description, duration, audience, price_label, image_url, is_active, sort_order, created_at, updated_at) VALUES
  ('079599c0-10a7-40b7-b75e-8cfff45d27aa', 'coaching', 'Coaching skincare personnalisé', 'Analyse de votre peau, routine sur mesure et suivi personnalisé par votre dermo-cosméticienne.', '1 mois de suivi', 'Tous types de peau, hommes et femmes', 'Sur devis', NULL, true, 1, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('250e0ed3-48b1-486d-b520-f2779f55a57e', 'coaching', 'Consultation express', 'Une consultation ciblée pour corriger votre routine et choisir les bons produits authentiques.', '45 min', 'Débutants en skincare', '5 000 FCFA', NULL, true, 2, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('47cc5bc1-3317-4dd6-a9f4-08da660f436a', 'formation', 'Formation soins du visage professionnels', 'Apprenez les protocoles de soins en cabine : diagnostic, nettoyage, extraction, masques et finitions.', '5 jours', 'Esthéticiennes et futurs professionnels', 'Sur devis', NULL, true, 3, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('7986f059-d8c3-4dee-b32b-8826ff67b759', 'formation', 'Formation dermo-cosmétique & produits', 'Comprendre les actifs, les routines correctives et le conseil produit authentique.', '3 jours', 'Vendeurs, esthéticiennes, coachs beauté', 'Sur devis', NULL, true, 4, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00')
ON CONFLICT (id) DO NOTHING;

-- media_items (3 lignes)
INSERT INTO public.media_items (id, title, description, media_type, url, category, is_published, created_at, updated_at) VALUES
  ('5010197c-8b72-4a82-aa64-a9e863825dff', 'Avant / après soin du visage', 'Résultat après un protocole de kératothérapie en 4 séances.', 'photo', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80', 'Avant / Après', true, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('39b3e948-cd9b-4993-ba19-c790f52a04e7', 'Le bon geste pour appliquer un sérum', 'Tutoriel : quantité, ordre d''application et zones à ne pas oublier.', 'photo', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200&q=80', 'Tutoriels', true, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('b0917885-e931-4263-9be2-0dbf7f2c29ab', 'Témoignage cliente', 'Retour d''expérience après un coaching skincare d''un mois.', 'photo', 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=1200&q=80', 'Témoignages', true, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00')
ON CONFLICT (id) DO NOTHING;

-- posts (3 lignes)
INSERT INTO public.posts (id, slug, title, excerpt, content, cover_url, category, is_published, published_at, created_at, updated_at) VALUES
  ('3891551a-e692-41ab-841b-b07f85668e92', 'routine-anti-taches', 'La routine idéale contre les taches', 'Trois étapes simples et des actifs sûrs pour retrouver un teint uniforme.', 'Les taches et l''hyperpigmentation sont l''une des préoccupations les plus fréquentes de nos clientes et clients à Cotonou.

La base : un nettoyant doux, un actif ciblé (acide azélaïque, niacinamide ou vitamine C) et une protection solaire quotidienne.

En institut, la kératothérapie accélère les résultats en travaillant la correction en profondeur. Prenez rendez-vous pour un diagnostic personnalisé.', NULL, 'Conseils', true, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('e13db374-3285-4679-83f3-e4548824be92', 'hommes-skincare', 'Messieurs, le soin aussi c''est pour vous', 'Il n''y a pas que les femmes qui y ont droit : profitez de votre moment avec Caresse Care.', 'Peau grasse, poils incarnés, feu du rasoir : la peau masculine a ses propres besoins.

Nos protocoles hommes combinent nettoyage profond, gommage doux et hydratation non grasse, avec un massage pour finir.

Passez à l''institut à Vodjè, en face de la SONAR.', NULL, 'Institut', true, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00'),
  ('fff01cf0-6bc3-44f1-a440-c6d262c609d7', 'produits-authentiques', 'Comment reconnaître un produit authentique ?', 'Nos produits viennent de Corée, des USA et d''Europe. Voici comment éviter les contrefaçons.', 'Vérifiez le numéro de lot, la date de péremption, la qualité de l''emballage et surtout la provenance de votre revendeur.

Chez Caresse Care, chaque référence est importée et sélectionnée avec soin.', NULL, 'Marque', true, '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00', '2026-08-27T08:50:29.112476+00:00')
ON CONFLICT (slug) DO NOTHING;

-- orders (0 lignes)
-- (aucune donnee)

