import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { postQuery } from "@/lib/queries";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [
      { title: "Article — Blog Caresse Care" },
      {
        name: "description",
        content: "Conseils beauté et skincare par Caresse Care, Cotonou Vodjè.",
      },
      { property: "og:title", content: "Article — Blog Caresse Care" },
      {
        property: "og:description",
        content: "Conseils beauté et skincare par Caresse Care, Cotonou Vodjè.",
      },
    ],
  }),
  component: Article,
});

function Article() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery(postQuery(slug));

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="mb-8">
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4" /> Retour au blog
          </Link>
        </Button>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : data ? (
          <>
            <Badge variant="secondary">{data.category}</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-primary sm:text-4xl">{data.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {data.published_at
                ? new Date(data.published_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : null}
            </p>
            {data.cover_url ? (
              <img
                src={data.cover_url}
                alt={data.title}
                className="mt-8 aspect-16/9 w-full rounded-3xl object-cover shadow-soft"
              />
            ) : null}
            <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground/90">
              {data.content
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Cet article n'est pas disponible.</p>
        )}
      </article>
    </SiteShell>
  );
}
