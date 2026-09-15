import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MapPin, Music2, Phone } from "lucide-react";
import logo from "@/assets/logo.png";
import { prettyPhone } from "@/lib/site";
import { useNavLinks } from "@/lib/use-nav";
import { useSiteContent } from "@/lib/use-site-content";
import { useSiteSettings } from "@/lib/use-site-settings";

export function Footer() {
  const settings = useSiteSettings();
  const navLinks = useNavLinks();
  const content = useSiteContent();

  return (
    <footer className="mt-20 bg-gradient-sage text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <img
            src={logo}
            alt="Logo Caresse Care"
            className="h-14 w-auto brightness-0 invert"
          />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-primary-foreground/80">
            {content.text(
              "footer.text",
              "Institut de beauté et boutique dermo-cosmétique. Des produits authentiques et des soins personnalisés pour une peau saine, à Cotonou et à Ouagadougou.",
            )}
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={settings.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid h-10 w-10 place-items-center rounded-full border border-primary-foreground/25 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={settings.tiktok}
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="grid h-10 w-10 place-items-center rounded-full border border-primary-foreground/25 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Music2 className="h-4 w-4" />
            </a>
            <a
              href={settings.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="grid h-10 w-10 place-items-center rounded-full border border-primary-foreground/25 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="eyebrow text-accent">Navigation</h3>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to as "/"} className="transition-colors hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-accent">Nous trouver</h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{settings.address}</span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                {prettyPhone(settings.phonePrimary)}
                <br />
                {prettyPhone(settings.phoneSecondary)}
                <br />
                Ouagadougou : {prettyPhone(settings.phoneOuaga)}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15 py-5 text-center text-xs text-primary-foreground/70">
        © {new Date().getFullYear()} Caresse Care - Tous droits réservés ·{" "}
      </div>
    </footer>
  );
}
