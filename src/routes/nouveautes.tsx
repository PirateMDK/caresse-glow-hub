import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { PageHero, SiteShell } from "@/components/SiteShell";
import { Skeleton } from "@/components/ui/skeleton";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/nouveautes")({
  head: () => ({
    meta: [
      { title: "Nouveautés — Caresse Care" },
      {
        name: "description",
        content:
          "Découvrez les derniers arrivages dermo-cosmétiques de Caresse Care à Cotonou : sérums, nettoyants et soins ciblés.",
      },
      { property: "og:title", content: "Nouveautés — Caresse Care" },
      {
        property: "og:description",
        content: "Les derniers arrivages de la boutique Caresse Care, Cotonou Vodjè.",
      },
    ],
  }),
  component: Nouveautes,
});

function Nouveautes() {
  const { data, isLoading } = useQuery(productsQuery({ onlyNew: true }));

  return (
    <SiteShell>
      <PageHero
        eyebrow="Nouveautés"
        title="Fraîchement arrivés en boutique"
        description="Les références les plus récentes, disponibles en quantités limitées."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-80 rounded-2xl" />
              ))
            : data?.map((product, index) => (
                <Reveal key={product.id} delay={index * 60}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
        </div>
        {!isLoading && (data ?? []).length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Aucune nouveauté pour le moment, revenez très bientôt.
          </p>
        ) : null}
      </section>
    </SiteShell>
  );
}
