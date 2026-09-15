import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import facade from "@/assets/facade.jpg";
import interior from "@/assets/interior.jpg";
import soin from "@/assets/soin.jpg";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { productsQuery, servicesQuery } from "@/lib/queries";
import { waLink } from "@/lib/site";
import { useSiteContent } from "@/lib/use-site-content";
import { useSiteSettings } from "@/lib/use-site-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Caresse Care — Institut de beauté & dermo-cosmétique à Cotonou" },
      {
        name: "description",
        content:
          "Institut de beauté et boutique dermo-cosmétique à Cotonou, Vodjè (en face de la SONAR). Soins visage, produits authentiques, coaching et formations.",
      },
      { property: "og:title", content: "Caresse Care — Beauté & dermo-cosmétique à Cotonou" },
      {
        property: "og:description",
        content:
          "Produits authentiques, soins personnalisés et accompagnement skincare à Cotonou et Ouagadougou.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const settings = useSiteSettings();
  const content = useSiteContent();
  const products = useQuery(productsQuery({ onlyNew: true }));
  const services = useQuery(servicesQuery());

  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden">
        <img
          src={content.image("hero.image", facade)}
          alt="Façade de l'institut Caresse Care à Cotonou, Vodjè"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow text-accent">
              {content.text("hero.eyebrow", "Cotonou · Vodjè · Ouagadougou")}
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] font-semibold text-primary-foreground sm:text-6xl">
              {content.text("hero.title", "Votre peau mérite des soins")}{" "}
              <span className="text-gradient-gold">
                {content.text("hero.title_highlight", "authentiques")}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
              {content.text(
                "hero.subtitle",
                "Institut de beauté et boutique dermo-cosmétique : produits certifiés, soins visage et corps personnalisés, coaching et formations professionnelles.",
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="xl">
                <Link to="/boutique">
                  Découvrir la boutique <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="hero" size="xl">
                <a
                  href={waLink(
                    "Bonjour Caresse Care 👋 Je souhaite réserver un soin.",
                    settings.phonePrimary,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Réserver un soin
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            {
              icon: ShieldCheck,
              title: "Produits authentiques",
              text: "Des marques dermo-cosmétiques sélectionnées et traçables.",
            },
            {
              icon: Sparkles,
              title: "Soins personnalisés",
              text: "Diagnostic de peau et protocoles adaptés, hommes et femmes.",
            },
            {
              icon: Leaf,
              title: "Approche naturelle",
              text: "Des routines simples, efficaces et respectueuses de votre peau.",
            },
          ].map((item, index) => (
            <Reveal key={item.title} delay={index * 90}>
              <div className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                  <item.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-y mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Nouveautés"
          title="Les arrivages du moment"
          description="Nos dernières références dermo-cosmétiques disponibles en boutique."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-80 rounded-2xl" />
              ))
            : products.data?.slice(0, 6).map((product, index) => (
                <Reveal key={product.id} delay={index * 70}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/nouveautes">Voir toutes les nouveautés</Link>
          </Button>
        </div>
      </section>

      <section className="bg-cream">
        <div className="section-y mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <img
                src={soin}
                alt="Soin du visage à l'institut Caresse Care"
                loading="lazy"
                className="aspect-4/3 w-full rounded-3xl object-cover shadow-soft"
              />
            </Reveal>
            <Reveal delay={100}>
              <SectionHeading
                align="left"
                eyebrow="Nos services"
                title={content.text("home.services_title", "Des soins pour elle et pour lui")}
                description={content.text(
                  "home.services_text",
                  "Soin du visage personnalisé, kératothérapie, massages relaxants : chaque protocole commence par un diagnostic de peau.",
                )}
              />
              <ul className="mt-8 space-y-4">
                {(services.data ?? []).slice(0, 4).map((service) => (
                  <li key={service.id} className="border-b border-border/70 pb-4">
                    <p className="font-medium text-foreground">{service.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                  </li>
                ))}
              </ul>
              <Button asChild variant="default" size="lg" className="mt-8">
                <Link to="/services">Découvrir les services</Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-y mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="À propos"
              title={content.text("home.about_title", "Une boutique pensée comme un cocon")}
              description={content.text(
                "home.about_text",
                "Chez Caresse Care, nous conseillons chaque cliente et chaque client avec pédagogie : comprendre sa peau avant d'acheter, puis suivre une routine réaliste.",
              )}
            />
            <Button asChild variant="outline" size="lg" className="mt-8">
              <Link to="/a-propos">Notre histoire</Link>
            </Button>
          </Reveal>
          <Reveal delay={100}>
            <img
              src={interior}
              alt="Intérieur de la boutique Caresse Care"
              loading="lazy"
              className="aspect-4/5 w-full rounded-3xl object-cover shadow-soft"
            />
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
