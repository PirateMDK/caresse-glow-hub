import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { PageHero, SiteShell } from "@/components/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { mediaQuery, postsQuery } from "@/lib/queries";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog & conseils beauté — Caresse Care" },
      {
        name: "description",
        content:
          "Conseils skincare, routines anti-taches, soins pour homme et astuces pour reconnaître un produit authentique.",
      },
      { property: "og:title", content: "Blog & conseils beauté — Caresse Care" },
      {
        property: "og:description",
        content: "Nos articles et contenus pour prendre soin de votre peau au quotidien.",
      },
    ],
  }),
  component: Blog,
});

function Blog() {
  const posts = useQuery(postsQuery());
  const media = useQuery(mediaQuery());

  return (
    <SiteShell>
      <PageHero
        eyebrow="Blog & contenus"
        title="Conseils, routines et coulisses"
        description="Nous partageons ce que nous expliquons en boutique : des conseils simples, testés et adaptés à nos climats."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-72 rounded-3xl" />
              ))
            : posts.data?.map((post, index) => (
                <Reveal key={post.id} delay={index * 70}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card-soft transition-shadow hover:shadow-soft"
                  >
                    {post.cover_url ? (
                      <img
                        src={post.cover_url}
                        alt={post.title}
                        loading="lazy"
                        className="aspect-16/9 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid aspect-16/9 place-items-center bg-secondary/60 font-display text-2xl text-primary/40">
                        Caresse Care
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <Badge variant="secondary" className="w-fit">
                        {post.category}
                      </Badge>
                      <h2 className="mt-3 text-lg leading-snug font-semibold text-foreground">
                        {post.title}
                      </h2>
                      <p className="mt-2 flex-1 line-clamp-3 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Lire l'article <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
        </div>

        {!posts.isLoading && (posts.data ?? []).length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Les premiers articles arrivent bientôt.
          </p>
        ) : null}
      </section>

      <section className="bg-cream">
        <div className="section-y mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Galerie"
            title="Nos contenus en images"
            description="Astuces, avant/après et coulisses de l'institut."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(media.data ?? []).map((item, index) => (
              <Reveal key={item.id} delay={index * 60}>
                <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-card-soft">
                  {item.media_type === "video" ? (
                    <video
                      src={item.url}
                      controls
                      playsInline
                      preload="metadata"
                      className="aspect-4/3 w-full bg-primary/5 object-cover"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      loading="lazy"
                      className="aspect-4/3 w-full object-cover"
                    />
                  )}

                  <figcaption className="p-4">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
