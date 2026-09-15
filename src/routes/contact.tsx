import { createFileRoute } from "@tanstack/react-router";
import { Clock, Facebook, Instagram, MapPin, Phone } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { PageHero, SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/site";
import { useSiteSettings } from "@/lib/use-site-settings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & adresse — Caresse Care Cotonou Vodjè" },
      {
        name: "description",
        content:
          "Adresse, téléphones Cotonou et Ouagadougou, réseaux sociaux et itinéraire vers Caresse Care, Vodjè en face de la SONAR.",
      },
      { property: "og:title", content: "Contact — Caresse Care" },
      {
        property: "og:description",
        content: "Écrivez-nous sur WhatsApp ou passez à l'institut, Vodjè en face de la SONAR.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const settings = useSiteSettings();

  const phones = [
    { label: "Cotonou", value: settings.phonePrimary },
    { label: "Cotonou (2)", value: settings.phoneSecondary },
    { label: "Ouagadougou", value: settings.phoneOuaga },
  ].filter((item) => Boolean(item.value));

  return (
    <SiteShell>
      <PageHero
        eyebrow="Contact"
        title="Parlons de votre peau"
        description="Une question sur un produit, un rendez-vous ou une formation ? Nous répondons rapidement sur WhatsApp."
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-3xl border border-border bg-card p-7 shadow-card-soft">
              <h2 className="font-display text-2xl font-semibold text-primary">Nos coordonnées</h2>

              <div className="mt-6 space-y-5 text-sm">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="min-w-0 text-muted-foreground">{settings.address}</p>
                </div>

                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <ul className="min-w-0 space-y-1">
                    {phones.map((phone) => (
                      <li key={phone.value}>
                        <a
                          href={`tel:${phone.value}`}
                          className="text-muted-foreground transition-colors hover:text-primary"
                        >
                          <span className="font-medium text-foreground">{phone.label} :</span>{" "}
                          {phone.value}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="min-w-0 text-muted-foreground">
                    Du lundi au samedi, 9h – 19h. Dimanche sur rendez-vous.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild variant="whatsapp">
                  <a
                    href={waLink(
                      "Bonjour Caresse Care 👋 J'aimerais avoir des informations.",
                      settings.phonePrimary,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Écrire sur WhatsApp
                  </a>
                </Button>
                <Button asChild variant="soft" size="icon" aria-label="Instagram">
                  <a href={settings.instagram} target="_blank" rel="noreferrer">
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="soft" size="icon" aria-label="Facebook">
                  <a href={settings.facebook} target="_blank" rel="noreferrer">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="soft">
                  <a href={settings.tiktok} target="_blank" rel="noreferrer">
                    TikTok
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="h-full overflow-hidden rounded-3xl border border-border shadow-card-soft">
              <iframe
                title="Carte Caresse Care"
                src={`https://www.google.com/maps?q=${encodeURIComponent(settings.mapsQuery)}&output=embed`}
                loading="lazy"
                className="h-full min-h-[380px] w-full border-0"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
