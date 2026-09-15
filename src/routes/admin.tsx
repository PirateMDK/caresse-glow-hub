import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Package, ShoppingCart, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { ContentSection } from "@/components/admin/ContentSection";
import { CrudSection } from "@/components/admin/CrudSection";
import type { CrudField } from "@/components/admin/CrudSection";
import { SettingsSection } from "@/components/admin/SettingsSection";
import { UsersSection } from "@/components/admin/UsersSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  bookingsQuery,
  mediaQuery,
  navItemsQuery,
  ordersQuery,
  postsQuery,
  productsQuery,
  programsQuery,
  servicesQuery,
} from "@/lib/queries";
import type {
  Booking,
  MediaItem,
  NavItem,
  Order,
  Post,
  Product,
  Program,
  Service,
} from "@/lib/queries";
import { useMyRoles } from "@/lib/use-my-role";
import { formatPrice, PRODUCT_CATEGORIES } from "@/lib/site";

const ORDER_STATUSES = ["en attente", "nouvelle", "confirmée", "livrée", "annulée"] as const;
const BOOKING_STATUSES = ["en attente", "confirmée", "annulée"] as const;
const CONTENT_CATEGORIES = ["Conseils", "Routines", "Avant / Après", "Coulisses", "Formations"];

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Tableau de bord — Caresse Care" },
      { name: "description", content: "Administration du site Caresse Care." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Tableau de bord — Caresse Care" },
      { property: "og:description", content: "Administration du site Caresse Care." },
    ],
  }),
  component: Admin,
});

const productFields: CrudField[] = [
  { name: "name", label: "Nom du produit", type: "text" },
  { name: "brand", label: "Marque", type: "text", half: true },
  {
    name: "category",
    label: "Catégorie",
    type: "select",
    options: PRODUCT_CATEGORIES,
    half: true,
  },
  { name: "description", label: "Description", type: "textarea" },
  { name: "price", label: "Prix (FCFA)", type: "number", half: true },
  { name: "sort_order", label: "Ordre d'affichage", type: "number", half: true },
  { name: "image_url", label: "Photo du produit", type: "image", folder: "products" },
  { name: "is_new", label: "Nouveauté", type: "switch", half: true },
  { name: "is_active", label: "Visible sur le site", type: "switch", half: true },
];

const serviceFields: CrudField[] = [
  { name: "title", label: "Titre du soin", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "price_label", label: "Prix affiché", type: "text", half: true },
  { name: "duration", label: "Durée", type: "text", half: true },
  { name: "image_url", label: "Photo", type: "image", folder: "services" },
  { name: "sort_order", label: "Ordre d'affichage", type: "number", half: true },
  { name: "is_active", label: "Visible sur le site", type: "switch", half: true },
];

const programFields: CrudField[] = [
  { name: "title", label: "Titre", type: "text" },
  {
    name: "kind",
    label: "Type",
    type: "select",
    options: ["formation", "coaching"],
    half: true,
  },
  { name: "audience", label: "Public visé", type: "text", half: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "duration", label: "Durée", type: "text", half: true },
  { name: "price_label", label: "Tarif affiché", type: "text", half: true },
  { name: "image_url", label: "Visuel (photo)", type: "image", folder: "programs" },
  {
    name: "video_url",
    label: "Vidéo de présentation (optionnelle)",
    type: "image",
    folder: "programs",
    accept: "video/mp4,video/webm,video/quicktime",
  },
  { name: "sort_order", label: "Ordre d'affichage", type: "number", half: true },
  { name: "is_active", label: "Visible sur le site", type: "switch", half: true },
];

const postFields: CrudField[] = [
  { name: "title", label: "Titre de l'article", type: "text" },
  { name: "slug", label: "Lien (slug)", type: "text", placeholder: "routine-anti-taches", half: true },
  { name: "category", label: "Catégorie", type: "select", options: CONTENT_CATEGORIES, half: true },
  { name: "excerpt", label: "Accroche", type: "textarea" },
  { name: "content", label: "Contenu (un paragraphe par ligne vide)", type: "textarea" },
  { name: "cover_url", label: "Image de couverture", type: "image", folder: "posts" },
  { name: "published_at", label: "Date de publication (AAAA-MM-JJ)", type: "text", half: true },
  { name: "is_published", label: "Publié", type: "switch", half: true },
];

const mediaFields: CrudField[] = [
  { name: "title", label: "Titre", type: "text" },
  { name: "category", label: "Catégorie", type: "select", options: CONTENT_CATEGORIES, half: true },
  { name: "media_type", label: "Type", type: "select", options: ["photo", "video"], half: true },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "url",
    label: "Fichier",
    type: "image",
    folder: "gallery",
    accept: "image/*,video/mp4,video/webm",
  },
  { name: "is_published", label: "Visible sur le site", type: "switch" },
];

const navFields: CrudField[] = [
  { name: "label", label: "Libellé du menu", type: "text", half: true },
  { name: "href", label: "Lien (ex : /boutique)", type: "text", half: true },
  { name: "sort_order", label: "Ordre d'affichage", type: "number", half: true },
  { name: "is_active", label: "Visible dans le menu", type: "switch", half: true },
];

function Admin() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const { isSuperAdmin } = useMyRoles(ready);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate({ to: "/auth", replace: true });
      else setReady(true);
    });
  }, [navigate]);

  const orders = useQuery({ ...ordersQuery(), enabled: ready });
  const products = useQuery({ ...productsQuery(), enabled: ready });
  const posts = useQuery({ ...postsQuery(), enabled: ready });

  if (!ready) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-8">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    );
  }

  const revenue = (orders.data ?? []).reduce((sum, order) => sum + Number(order.total ?? 0), 0);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img src={logo} alt="Caresse Care" className="h-10 w-auto shrink-0" />
            <span className="truncate font-display text-lg font-semibold text-primary">
              Administration
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Voir le site</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/auth", replace: true });
              }}
            >
              <LogOut className="h-4 w-4" /> Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={ShoppingCart}
            label="Commandes"
            value={String((orders.data ?? []).length)}
          />
          <StatCard icon={Sparkles} label="Total commandes" value={formatPrice(revenue)} />
          <StatCard icon={Package} label="Produits" value={String((products.data ?? []).length)} />
          <StatCard
            icon={Sparkles}
            label="Articles blog"
            value={String((posts.data ?? []).length)}
          />
        </div>

        <Tabs defaultValue="orders" className="mt-8">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="bookings">Réservations</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="programs">Coaching & formations</TabsTrigger>
            <TabsTrigger value="posts">Blog</TabsTrigger>
            <TabsTrigger value="media">Galerie</TabsTrigger>
            <TabsTrigger value="content">Contenu du site</TabsTrigger>
            <TabsTrigger value="nav">Navigation</TabsTrigger>
            <TabsTrigger value="settings">Coordonnées</TabsTrigger>
            {isSuperAdmin ? <TabsTrigger value="users">Utilisateurs</TabsTrigger> : null}
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <OrdersSection />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <BookingsSection />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <CrudSection<Product & { id: string }>
              table="products"
              title="Produits de la boutique"
              description="Ajoute, modifie ou retire les produits du catalogue."
              queryKey={productsQuery().queryKey}
              queryFn={() => productsQuery().queryFn?.({} as never) as Promise<Product[]>}
              fields={productFields}
              imageKey="image_url"
              emptyRow={{
                name: "",
                brand: "",
                category: PRODUCT_CATEGORIES[0],
                description: "",
                price: "",
                sort_order: 0,
                image_url: "",
                is_new: false,
                is_active: true,
              }}
              primaryLabel={(row) => row.name}
              secondaryLabel={(row) =>
                `${row.category} · ${formatPrice(row.price, row.currency)}${row.is_active ? "" : " · masqué"}`
              }
            />
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <CrudSection<Service & { id: string }>
              table="services"
              title="Soins & services"
              description="Prestations proposées à l'institut (femmes et hommes)."
              queryKey={servicesQuery().queryKey}
              queryFn={() => servicesQuery().queryFn?.({} as never) as Promise<Service[]>}
              fields={serviceFields}
              imageKey="image_url"
              emptyRow={{
                title: "",
                description: "",
                price_label: "",
                duration: "",
                image_url: "",
                sort_order: 0,
                is_active: true,
              }}
              primaryLabel={(row) => row.title}
              secondaryLabel={(row) =>
                [row.price_label, row.duration].filter(Boolean).join(" · ") || "—"
              }
            />
          </TabsContent>

          <TabsContent value="programs" className="mt-6">
            <CrudSection<Program & { id: string }>
              table="programs"
              title="Coaching & formations"
              description="Programmes de coaching beauté et formations professionnelles."
              queryKey={programsQuery().queryKey}
              queryFn={() => programsQuery().queryFn?.({} as never) as Promise<Program[]>}
              fields={programFields}
              imageKey="image_url"
              emptyRow={{
                title: "",
                kind: "formation",
                audience: "",
                description: "",
                duration: "",
                price_label: "",
                image_url: "",
                video_url: "",
                sort_order: 0,
                is_active: true,
              }}
              primaryLabel={(row) => row.title}
              secondaryLabel={(row) => `${row.kind} · ${row.price_label ?? "tarif sur demande"}`}
            />
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            <CrudSection<Post & { id: string }>
              table="posts"
              title="Articles du blog"
              description="Conseils beauté, routines et actualités de l'institut."
              queryKey={postsQuery().queryKey}
              queryFn={() => postsQuery().queryFn?.({} as never) as Promise<Post[]>}
              fields={postFields}
              imageKey="cover_url"
              emptyRow={{
                title: "",
                slug: "",
                category: CONTENT_CATEGORIES[0],
                excerpt: "",
                content: "",
                cover_url: "",
                published_at: new Date().toISOString().slice(0, 10),
                is_published: true,
              }}
              primaryLabel={(row) => row.title}
              secondaryLabel={(row) =>
                `${row.category} · ${row.is_published ? "publié" : "brouillon"}`
              }
            />
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <CrudSection<MediaItem & { id: string }>
              table="media_items"
              title="Galerie de contenus"
              description="Photos et vidéos affichées dans la galerie du blog."
              queryKey={mediaQuery().queryKey}
              queryFn={() => mediaQuery().queryFn?.({} as never) as Promise<MediaItem[]>}
              fields={mediaFields}
              imageKey="url"
              emptyRow={{
                title: "",
                category: CONTENT_CATEGORIES[0],
                media_type: "photo",
                description: "",
                url: "",
                is_published: true,
              }}
              primaryLabel={(row) => row.title}
              secondaryLabel={(row) => `${row.media_type} · ${row.category}`}
            />
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <ContentSection />
          </TabsContent>

          <TabsContent value="nav" className="mt-6">
            <CrudSection<NavItem & { id: string }>
              table="nav_items"
              title="Navigation du site"
              description="Ajoute ou réorganise les liens affichés dans le menu principal et le pied de page."
              queryKey={navItemsQuery().queryKey}
              queryFn={() => navItemsQuery().queryFn?.({} as never) as Promise<NavItem[]>}
              fields={navFields}
              emptyRow={{ label: "", href: "/", sort_order: 0, is_active: true }}
              primaryLabel={(row) => row.label}
              secondaryLabel={(row) => `${row.href}${row.is_active ? "" : " · masqué"}`}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsSection />
          </TabsContent>

          {isSuperAdmin ? (
            <TabsContent value="users" className="mt-6">
              <UsersSection />
            </TabsContent>
          ) : null}
        </Tabs>
      </main>
    </div>
  );
}

function BookingsSection() {
  const qc = useQueryClient();
  const bookings = useQuery(bookingsQuery());

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Statut mis à jour");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: unknown) =>
      toast.error("Mise à jour impossible", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Réservation supprimée");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: unknown) =>
      toast.error("Suppression impossible", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
      <h2 className="font-display text-xl font-semibold text-primary">Réservations</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Demandes de rendez-vous pour les soins et les formations. Un créneau confirmé ou en attente
        n'est plus proposé sur le site.
      </p>

      {bookings.isLoading ? (
        <Skeleton className="mt-6 h-32 w-full rounded-2xl" />
      ) : (bookings.data ?? []).length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Aucune réservation pour l'instant.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {(bookings.data ?? []).map((booking: Booking) => (
            <li key={booking.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {booking.item_title || (booking.kind === "soin" ? "Soin" : "Formation")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(`${booking.booking_date}T00:00:00`).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    à {booking.time_slot}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {booking.customer_name || "Client"} · {booking.customer_phone}
                    {booking.customer_email ? ` · ${booking.customer_email}` : ""}
                  </p>
                </div>
                <Badge variant="secondary">{booking.kind}</Badge>
                <Select
                  value={booking.status}
                  onValueChange={(status) => update.mutate({ id: booking.id, status })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Supprimer la réservation"
                  onClick={() => {
                    if (window.confirm("Supprimer cette réservation ?")) remove.mutate(booking.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {booking.note ? (
                <p className="mt-2 text-sm text-muted-foreground italic">Note : {booking.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OrdersSection() {
  const qc = useQueryClient();
  const orders = useQuery(ordersQuery());

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Statut mis à jour");
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: unknown) =>
      toast.error("Mise à jour impossible", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Commande supprimée");
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
      <h2 className="font-display text-xl font-semibold text-primary">Commandes WhatsApp</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Chaque panier envoyé via WhatsApp est enregistré ici.
      </p>

      {orders.isLoading ? (
        <Skeleton className="mt-6 h-32 w-full rounded-2xl" />
      ) : (orders.data ?? []).length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Aucune commande pour l'instant.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {(orders.data ?? []).map((order) => (
            <li key={order.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {order.customer_name || "Client"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer_phone} ·{" "}
                    {new Date(order.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="font-display font-semibold text-primary">
                  {formatPrice(order.total)}
                </span>
                <Select
                  value={order.status}
                  onValueChange={(status) => update.mutate({ id: order.id, status })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Supprimer la commande"
                  onClick={() => {
                    if (window.confirm("Supprimer cette commande ?")) remove.mutate(order.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <OrderItems order={order} />
              {order.note ? (
                <p className="mt-2 text-sm text-muted-foreground italic">Note : {order.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OrderItems({ order }: { order: Order }) {
  const items = Array.isArray(order.items)
    ? (order.items as { name?: string; quantity?: number; price?: number }[])
    : [];
  if (items.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {items.map((item, index) => (
        <li key={`${item.name}-${index}`}>
          <Badge variant="secondary">
            {item.quantity ?? 1} × {item.name ?? "Produit"}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-card-soft">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-primary">{value}</p>
    </div>
  );
}
