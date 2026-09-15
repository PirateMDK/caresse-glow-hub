import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { siteContentQuery } from "@/lib/queries";

type Draft = Record<string, { value_text: string; value_image: string }>;

export function ContentSection() {
  const qc = useQueryClient();
  const content = useQuery(siteContentQuery());
  const [draft, setDraft] = useState<Draft>({});

  useEffect(() => {
    if (!content.data) return;
    const next: Draft = {};
    for (const row of content.data) {
      next[row.key] = { value_text: row.value_text ?? "", value_image: row.value_image ?? "" };
    }
    setDraft(next);
  }, [content.data]);

  const save = useMutation({
    mutationFn: async () => {
      for (const [key, values] of Object.entries(draft)) {
        const { error } = await supabase
          .from("site_content")
          .update({
            value_text: values.value_text,
            value_image: values.value_image ? values.value_image : null,
          })
          .eq("key", key);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Contenu du site mis à jour");
      qc.invalidateQueries({ queryKey: ["site_content"] });
    },
    onError: (error: unknown) =>
      toast.error("Enregistrement impossible", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  if (content.isLoading) {
    return <Skeleton className="h-64 w-full rounded-3xl" />;
  }

  const groups = new Map<string, typeof content.data>();
  for (const row of content.data ?? []) {
    const list = groups.get(row.group_name) ?? [];
    list.push(row);
    groups.set(row.group_name, list);
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      {[...groups.entries()].map(([group, rows]) => (
        <section
          key={group}
          className="rounded-3xl border border-border bg-card p-5 shadow-card-soft sm:p-6"
        >
          <h2 className="font-display text-xl font-semibold text-primary">{group}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Modifiez les textes et images affichés sur les pages publiques.
          </p>
          <div className="mt-6 space-y-5">
            {(rows ?? []).map((row) => {
              const values = draft[row.key] ?? { value_text: "", value_image: "" };
              const set = (patch: Partial<{ value_text: string; value_image: string }>) =>
                setDraft((prev) => ({ ...prev, [row.key]: { ...values, ...patch } }));
              const isImage = row.key.endsWith(".image");
              return (
                <div key={row.key} className="space-y-2">
                  {isImage ? (
                    <ImageUploadField
                      label={row.label}
                      value={values.value_image}
                      onChange={(url) => set({ value_image: url })}
                      folder="site"
                      accept="image/*"
                    />
                  ) : row.is_long ? (
                    <>
                      <Label htmlFor={row.key}>{row.label}</Label>
                      <Textarea
                        id={row.key}
                        rows={4}
                        value={values.value_text}
                        onChange={(event) => set({ value_text: event.target.value })}
                      />
                    </>
                  ) : (
                    <>
                      <Label htmlFor={row.key}>{row.label}</Label>
                      <Input
                        id={row.key}
                        value={values.value_text}
                        onChange={(event) => set({ value_text: event.target.value })}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <Button type="submit" variant="gold" size="lg" disabled={save.isPending}>
        <Save className="h-4 w-4" /> Enregistrer le contenu
      </Button>
    </form>
  );
}
