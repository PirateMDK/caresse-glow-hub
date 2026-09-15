import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHero, SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { formatPrice, waLink } from "@/lib/site";
import { useSiteSettings } from "@/lib/use-site-settings";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Mon panier — Commande WhatsApp Caresse Care" },
      {
        name: "description",
        content:
          "Récapitulez votre sélection de produits dermo-cosmétiques et envoyez votre commande directement sur WhatsApp.",
      },
      { property: "og:title", content: "Mon panier — Caresse Care" },
      {
        property: "og:description",
        content: "Validez votre commande en un message WhatsApp.",
      },
    ],
  }),
  component: Panier,
});

function Panier() {
  const { items, total, setQuantity, remove, clear } = useCart();
  const settings = useSiteSettings();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  async function handleOrder() {
    if (items.length === 0) return;
    if (name.trim().length < 2 || phone.trim().length < 6) {
      toast.error("Merci d'indiquer votre nom et votre numéro.");
      return;
    }

    setSending(true);
    const lines = items
      .map(
        (item) =>
          `• ${item.name} x${item.quantity} — ${formatPrice((item.price ?? 0) * item.quantity)}`,
      )
      .join("\n");
    const message = `Bonjour Caresse Care 👋\nNouvelle commande :\n${lines}\n\nTotal estimé : ${formatPrice(
      total,
    )}\nNom : ${name.trim()}\nTéléphone : ${phone.trim()}${
      note.trim() ? `\nNote : ${note.trim()}` : ""
    }`;

    const { error } = await supabase.from("orders").insert({
      customer_name: name.trim().slice(0, 120),
      customer_phone: phone.trim().slice(0, 40),
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total,
      note: note.trim().slice(0, 500) || null,
      status: "en attente",
    });

    setSending(false);
    if (error) {
      toast.error("Commande non enregistrée, mais vous pouvez continuer sur WhatsApp.");
    } else {
      toast.success("Commande enregistrée, ouverture de WhatsApp…");
    }

    window.open(waLink(message, settings.phonePrimary), "_blank", "noopener");
    clear();
    setName("");
    setPhone("");
    setNote("");
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="Panier"
        title="Votre récapitulatif"
        description="Vérifiez votre sélection, laissez vos coordonnées et envoyez la commande sur WhatsApp."
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-card-soft">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">Votre panier est vide</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Parcourez la boutique pour ajouter vos produits.
            </p>
            <Button asChild variant="gold" className="mt-6">
              <Link to="/boutique">Découvrir la boutique</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card-soft sm:flex"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded-xl bg-secondary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{item.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:justify-end">
                    <div className="flex items-center gap-1 rounded-full border border-border p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        aria-label="Retirer une unité"
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        aria-label="Ajouter une unité"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Supprimer"
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="h-fit rounded-3xl border border-border bg-card p-6 shadow-card-soft">
              <h2 className="font-display text-xl font-semibold text-primary">Vos coordonnées</h2>
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={name}
                    maxLength={120}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex. Dorcas A."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone / WhatsApp</Label>
                  <Input
                    id="phone"
                    value={phone}
                    maxLength={40}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+229 …"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note (facultatif)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    maxLength={500}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Type de peau, quartier de livraison…"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Total estimé</span>
                <span className="font-display text-xl font-semibold text-primary">
                  {formatPrice(total)}
                </span>
              </div>

              <Button
                variant="whatsapp"
                size="lg"
                className="mt-5 w-full"
                disabled={sending}
                onClick={handleOrder}
              >
                Envoyer la commande sur WhatsApp
              </Button>
              <Button variant="ghost" className="mt-2 w-full" onClick={clear}>
                Vider le panier
              </Button>
            </div>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
