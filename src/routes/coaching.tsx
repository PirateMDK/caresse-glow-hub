import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Users } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { PageHero, SiteShell } from "@/components/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { programsQuery, type Program } from "@/lib/queries";
import { waLink } from "@/lib/site";
import { useSiteSettings } from "@/lib/use-site-settings";

export const Route = createFileRoute("/coaching")({
  head: () => ({
    meta: [
      { title: "Coaching skincare & formations dermo-cosmétique — Caresse Care" },
      {
        name: "description",
        content:
          "Coaching skincare personnalisé et formations professionnelles en soins du visage et dermo-cosmétique à Cotonou et Ouagadougou.",
      },
      { property: "og:title", content: "Coaching & Formations — Caresse Care" },
      {
        property: "og:description",
        content: "Apprenez à comprendre votre peau ou formez-vous au métier de la beauté.",
      },
    ],
  }),
  component: Coaching,
});

function Coaching() {
  const { data, isLoading } = useQuery(programsQuery());
  const settings = useSiteSettings();

  const coaching = (data ?? []).filter((item) => item.kind === "coaching");
  const formations = (data ?? []).filter((item) => item.kind !== "coaching");

  return (
    <SiteShell>
      <PageHero
        eyebrow="Coaching & Formations"
        title="Apprendre sa peau, apprendre le métier"
        description="Un accompagnement individuel pour votre routine, et des formations professionnelles pour se lancer dans la dermo-cosmétique."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-52 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Accompagnement"
                title="Coaching skincare"
                description="Un suivi personnalisé pour construire une routine réaliste et efficace."
              />
              <ProgramGrid items={coaching} phone={settings.phonePrimary} icon="coaching" />
            </div>
            <div>
              <SectionHeading
                align="left"
                eyebrow="Se former"
                title="Formations professionnelles"
                description="Des formations pratiques encadrées, adaptées aux débutantes comme aux professionnelles."
              />
              <ProgramGrid items={formations} phone={settings.phonePrimary} icon="formation" />
            </div>
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function ProgramGrid({
  items,
  phone,
  icon,
}: {
  items: Program[];
  phone: string;
  icon: "coaching" | "formation";
}) {
  const Icon = icon === "coaching" ? Users : GraduationCap;

  if (items.length === 0) {
    return <p className="mt-8 text-sm text-muted-foreground">Programmes bientôt disponibles.</p>;
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {items.map((item, index) => (
        <Reveal key={item.id} delay={index * 70}>
          <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card-soft">
            {item.video_url ? (
              <video
                src={item.video_url}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full bg-primary/5 object-contain"
              />
            ) : item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                className="aspect-video w-full object-contain"
              />
            ) : null}
            <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="min-w-0 text-lg font-semibold text-foreground">{item.title}</h3>
            </div>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.duration ? <Badge variant="secondary">{item.duration}</Badge> : null}
              {item.audience ? <Badge variant="secondary">{item.audience}</Badge> : null}
              {item.price_label ? (
                <Badge className="bg-gradient-gold text-accent-foreground">
                  {item.price_label}
                </Badge>
              ) : null}
            </div>
            <Button asChild variant="whatsapp" className="mt-6">
              <a
                href={waLink(
                  `Bonjour Caresse Care 👋 Je souhaite m'inscrire : ${item.title}.`,
                  phone,
                )}
                target="_blank"
                rel="noreferrer"
              >
                S'inscrire
              </a>
            </Button>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
