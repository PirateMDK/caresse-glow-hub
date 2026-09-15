import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import interior from "@/assets/interior.jpg";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { PageHero, SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/boutique")({
  head: () => ({
    meta: [
      { title: "Boutique dermo-cosmétique — Caresse Care Cotonou" },
      {
        name: "description",
        content:
          "Sérums, soins visage et corps, produits anti-taches et hydratants authentiques. Commandez directement sur WhatsApp.",
      },
      { property: "og:title", content: "Boutique dermo-cosmétique — Caresse Care" },
      {
        property: "og:description",
        content: "Catalogue de produits dermo-cosmétiques authentiques à Cotonou, Vodjè.",
      },
    ],
  }),
  component: Boutique,
});

function Boutique() {
  const { data, isLoading } = useQuery(productsQuery());
  const [category, setCategory] = useState<string>("Tous");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const set = new Set((data ?? []).map((product) => product.category));
    return ["Tous", ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter((product) => {
      const matchCategory = category === "Tous" || product.category === category;
      const matchSearch =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        (product.brand ?? "").toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);
      return matchCategory && matchSearch;
    });
  }, [data, category, search]);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Boutique"
        title="Des produits sélectionnés pour votre peau"
        description="Chaque référence est choisie pour sa formulation et son efficacité. Commandez en ligne, récupérez en boutique ou faites-vous livrer."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un produit, une marque…"
                maxLength={80}
                className="sm:max-w-xs"
              />
              <p className="text-sm text-muted-foreground">
                {filtered.length} produit{filtered.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((item) => (
                <Button
                  key={item}
                  size="sm"
                  variant={category === item ? "default" : "soft"}
                  className="rounded-full"
                  onClick={() => setCategory(item)}
                >
                  {item}
                </Button>
              ))}
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-80 rounded-2xl" />
                  ))
                : filtered.map((product, index) => (
                    <Reveal key={product.id} delay={index * 60}>
                      <ProductCard product={product} />
                    </Reveal>
                  ))}
            </div>

            {!isLoading && filtered.length === 0 ? (
              <p className="mt-10 text-center text-sm text-muted-foreground">
                Aucun produit ne correspond à votre recherche.
              </p>
            ) : null}
          </div>

          <aside className="h-fit overflow-hidden rounded-3xl border border-border bg-card shadow-card-soft lg:sticky lg:top-24">
            <img
              src={interior}
              alt="Rayons de la boutique Caresse Care"
              loading="lazy"
              className="aspect-3/4 w-full object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold text-foreground">Passez nous voir</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Notre boutique de Vodjè, en face de la SONAR, vous accueille pour un diagnostic de
                peau gratuit avant tout achat.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
