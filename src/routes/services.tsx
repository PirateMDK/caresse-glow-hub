import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import soin from "@/assets/soin.jpg";
import { Reveal } from "@/components/Reveal";
import { PageHero, SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { servicesQuery } from "@/lib/queries";
import { waLink } from "@/lib/site";
import { useSiteSettings } from "@/lib/use-site-settings";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Soins visage & corps, hommes et femmes — Caresse Care" },
      {
        name: "description",
        content:
          "Soin du visage personnalisé, kératothérapie, massage relaxant : des protocoles pour hommes et femmes à Cotonou, Vodjè.",
      },
      { property: "og:title", content: "Nos services — Caresse Care" },
      {
        property: "og:description",
        content: "Soins visage et corps personnalisés pour hommes et femmes à Cotonou.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  const { data, isLoading } = useQuery(servicesQuery());
  const settings = useSiteSettings();

  return (
    <SiteShell>
      <PageHero
        eyebrow="Services"
        title="Des soins pensés pour chaque peau"
        description="Nos protocoles commencent toujours par un diagnostic. Hommes et femmes sont accueillis avec la même attention."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-56 rounded-3xl" />
              ))
            : data?.map((service, index) => (
                <Reveal key={service.id} delay={index * 70}>
                  <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card-soft sm:flex-row">
                    <img
                      src={service.image_url ?? soin}
                      alt={service.title}
                      loading="lazy"
                      className="h-48 w-full object-cover sm:h-auto sm:w-44"
                    />
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="text-xl font-semibold text-foreground">{service.title}</h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {service.description}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                        {service.duration ? (
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-4 w-4 text-accent" /> {service.duration}
                          </span>
                        ) : null}
                        <span className="font-display text-lg font-semibold text-primary">
                          {service.price_label ?? "Sur devis"}
                        </span>
                      </div>
                      <Button asChild variant="whatsapp" className="mt-5 w-full sm:w-auto">
                        <a
                          href={waLink(
                            `Bonjour Caresse Care 👋 Je souhaite réserver : ${service.title}.`,
                            settings.phonePrimary,
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Réserver sur WhatsApp
                        </a>
                      </Button>
                    </div>
                  </article>
                </Reveal>
              ))}
        </div>
      </section>
    </SiteShell>
  );
}
