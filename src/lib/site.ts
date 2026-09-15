export const SITE = {
  name: "Caresse Care",
  tagline: "Beauté • Bien-être • Authenticité",
  baseline: "Votre dermo-cosméticienne",
  address: "Cotonou, Vodjè — en face de la SONAR",
  phonePrimary: "+2290152146060",
  phoneSecondary: "+2290198073307",
  phoneOuaga: "+22671120240",
  instagram: "https://www.instagram.com/caressecare",
  tiktok: "https://www.tiktok.com/@caressecare",
  facebook: "https://www.facebook.com/caressebydd",
  mapsQuery: "Vodjè, Cotonou, Bénin",
};

export const PRODUCT_CATEGORIES = [
  "Soin visage",
  "Soin corps",
  "Anti-taches / Hyperpigmentation",
  "Hydratation",
  "Hygiène & bien-être",
] as const;

export const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/boutique", label: "Boutique" },
  { to: "/nouveautes", label: "Nouveautés" },
  { to: "/services", label: "Services" },
  { to: "/coaching", label: "Coaching & Formations" },
  { to: "/reservation", label: "Réservation" },
  { to: "/blog", label: "Blog" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
] as const;

export function formatPrice(price?: number | null, currency = "FCFA") {
  if (price === null || price === undefined) return "Prix sur demande";
  return `${new Intl.NumberFormat("fr-FR").format(Number(price))} ${currency}`;
}

export function waLink(message: string, phone: string = SITE.phonePrimary) {
  const clean = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function waProductMessage(name: string, price?: number | null) {
  return `Bonjour Caresse Care 👋\nJe souhaite commander : ${name}${
    price ? ` (${formatPrice(price)})` : ""
  }.\nPouvez-vous me confirmer la disponibilité ?`;
}

export function prettyPhone(phone: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("229")) return `(+229) ${digits.slice(3)}`;
  if (digits.startsWith("226")) return `(+226) ${digits.slice(3)}`;
  return `+${digits}`;
}
