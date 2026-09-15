import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { waLink } from "@/lib/site";
import { useNavLinks } from "@/lib/use-nav";
import { useSiteSettings } from "@/lib/use-site-settings";

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const settings = useSiteSettings();
  const navLinks = useNavLinks();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="Logo Caresse Care" className="h-11 w-auto shrink-0" />
          <span className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate font-display text-lg font-semibold text-primary">
              Caresse Care
            </span>
            <span className="truncate text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
              Dermo-cosmétique
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 xl:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to as "/"}
                activeOptions={{ exact: link.to === "/" }}
                activeProps={{ className: "text-primary bg-secondary/70" }}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link to="/panier" className="relative">
            <Button variant="outline" size="icon" aria-label="Voir le panier">
              <ShoppingBag className="h-4 w-4" />
            </Button>
            {count > 0 ? (
              <span className="pointer-events-none absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-gold px-1 text-[0.65rem] font-semibold text-accent-foreground">
                {count}
              </span>
            ) : null}
          </Link>

          <Button asChild variant="whatsapp" className="hidden sm:inline-flex">
            <a
              href={waLink(
                "Bonjour Caresse Care 👋 Je souhaite des informations.",
                settings.phonePrimary,
              )}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="xl:hidden"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background px-4 pb-4 xl:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to as "/"}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: link.to === "/" }}
                activeProps={{ className: "text-primary bg-secondary/70" }}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild variant="whatsapp" className="mt-2 w-full">
              <a
                href={waLink("Bonjour Caresse Care 👋", settings.phonePrimary)}
                target="_blank"
                rel="noreferrer"
              >
                Commander sur WhatsApp
              </a>
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
