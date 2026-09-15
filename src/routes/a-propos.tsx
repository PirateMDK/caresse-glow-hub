import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MapPin, Sparkles } from "lucide-react";
import facade from "@/assets/facade.jpg";
import interior from "@/assets/interior.jpg";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { PageHero, SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/lib/use-site-content";
import { useSiteSettings } from "@/lib/use-site-settings";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — Caresse Care, institut de beauté à Cotonou" },
      {
        name: "description",
        content:
          "Caresse Care, institut de beauté et boutique dermo-cosmétique à Cotonou Vodjè, avec une présence à Ouagadougou. Notre histoire et nos valeurs.",
      },
      { property: "og:title", content: "À propos — Caresse Care" },
      {
        property: "og:description",
        content: "Notre mission : rendre les soins dermo-cosmétiques accessibles et authentiques.",
      },
    ],
  }),
  component: APropos,
});

function APropos() {
  const settings = useSiteSettings();
  const content = useSiteContent();

  return (
    <SiteShell>
      <PageHero
        eyebrow="À propos"
        title={content.text("about.hero_title", "Caresse Care, votre dermo-cosméticienne")}
        description={content.text(
          "about.hero_text",
          "Un institut, une boutique et un accompagnement : nous aidons chaque personne à comprendre sa peau et à choisir des produits sûrs.",
        )}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <img
              src={interior}
              alt="Intérieur de la boutique Caresse Care"
              loading="lazy"
              className="aspect-4/5 w-full rounded-3xl object-cover shadow-soft"
            />
          </Reveal>
          <Reveal delay={90}>
            <SectionHeading
              align="left"
              eyebrow="Notre histoire"
              title={content.text("about.story_title", "Née d'une conviction simple")}
              description={content.text(
                "about.story_text",
                "Trop de personnes abîment leur peau avec des produits inadaptés ou contrefaits. Caresse Care est née pour proposer une autre voie : le conseil avant la vente, la pédagogie avant la promesse.",
              )}
            />
            <ul className="mt-8 space-y-5">
              {[
                {
                  icon: Sparkles,
                  title: "Authenticité",
                  text: "Des marques dermo-cosmétiques traçables et des formulations reconnues.",
                },
                {
                  icon: Heart,
                  title: "Bienveillance",
                  text: "Aucun jugement : chaque peau et chaque budget trouvent une solution.",
                },
                {
                  icon: MapPin,
                  title: "Proximité",
                  text: "Cotonou (Vodjè, en face de la SONAR) et Ouagadougou.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="relative isolate overflow-hidden">
        <img
          src={facade}
          alt="Façade de l'institut Caresse Care"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-primary-foreground sm:text-4xl">
            Venez nous rencontrer
          </h2>
          <p className="mt-4 text-sm text-primary-foreground/85 sm:text-base">
            {settings.address}
          </p>
          <Button asChild variant="gold" size="xl" className="mt-8">
            <Link to="/contact">Nous contacter</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
