import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/queries";
import { formatPrice, waLink, waProductMessage } from "@/lib/site";
import { useSiteSettings } from "@/lib/use-site-settings";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const settings = useSiteSettings();

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card-soft transition-shadow hover:shadow-soft">
      <div className="relative aspect-4/3 overflow-hidden bg-secondary/50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center font-display text-3xl text-primary/30">
            Caresse
          </div>
        )}
        {product.is_new ? (
          <Badge className="absolute top-3 left-3 bg-gradient-gold text-accent-foreground">
            Nouveauté
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow text-muted-foreground">{product.brand ?? product.category}</p>
        <h3 className="mt-2 text-lg leading-snug font-semibold text-foreground">{product.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{product.description}</p>
        <p className="mt-4 font-display text-xl font-semibold text-primary">
          {formatPrice(product.price, product.currency)}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="soft"
            className="flex-1"
            onClick={() => {
              add({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
              });
              toast.success("Ajouté au panier", { description: product.name });
            }}
          >
            <ShoppingBag className="h-4 w-4" /> Ajouter
          </Button>
          <Button asChild variant="whatsapp" className="flex-1">
            <a
              href={waLink(waProductMessage(product.name, product.price), settings.phonePrimary)}
              target="_blank"
              rel="noreferrer"
            >
              Commander
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
