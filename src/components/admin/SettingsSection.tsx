import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery } from "@/lib/queries";

const FIELDS: { name: string; label: string }[] = [
  { name: "address", label: "Adresse" },
  { name: "phone_primary", label: "Téléphone principal (WhatsApp)" },
  { name: "phone_secondary", label: "Téléphone secondaire" },
  { name: "phone_ouaga", label: "Téléphone Ouagadougou" },
  { name: "instagram_url", label: "Instagram" },
  { name: "tiktok_url", label: "TikTok" },
  { name: "facebook_url", label: "Facebook" },
  { name: "maps_query", label: "Localisation Google Maps" },
];

export function SettingsSection() {
  const qc = useQueryClient();
  const settings = useQuery(settingsQuery());
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!settings.data) return;
    const next: Record<string, string> = {};
    for (const field of FIELDS) {
      next[field.name] = String(
        (settings.data as Record<string, unknown>)[field.name] ?? "",
      );
    }
    setForm(next);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("site_settings")
        .update({
          address: form["address"] ?? "",
          phone_primary: form["phone_primary"] ?? "",
          phone_secondary: form["phone_secondary"] ?? "",
          phone_ouaga: form["phone_ouaga"] ?? "",
          instagram_url: form["instagram_url"] ?? "",
          tiktok_url: form["tiktok_url"] ?? "",
          facebook_url: form["facebook_url"] ?? "",
          maps_query: form["maps_query"] ?? "",
        })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Coordonnées mises à jour");
      qc.invalidateQueries({ queryKey: ["site_settings"] });
    },
    onError: (error: unknown) =>
      toast.error("Enregistrement impossible", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
      <h2 className="font-display text-xl font-semibold text-primary">
        Coordonnées & réseaux sociaux
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ces informations alimentent le header, le footer, la page contact et les liens WhatsApp.
      </p>

      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        {FIELDS.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              value={form[field.name] ?? ""}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, [field.name]: event.target.value }))
              }
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <Button type="submit" variant="gold" disabled={save.isPending}>
            {save.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </section>
  );
}
