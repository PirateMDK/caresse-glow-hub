import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export type FieldType = "text" | "textarea" | "number" | "switch" | "select" | "image";

export type CrudField = {
  name: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  placeholder?: string;
  folder?: string;
  accept?: string;
  half?: boolean;
};

type Row = Record<string, unknown> & { id: string };

export function CrudSection<T extends Row>({
  table,
  title,
  description,
  queryKey,
  queryFn,
  fields,
  emptyRow,
  primaryLabel,
  secondaryLabel,
  imageKey,
}: {
  table: string;
  title: string;
  description: string;
  queryKey: QueryKey;
  queryFn: () => Promise<T[]>;
  fields: CrudField[];
  emptyRow: Record<string, unknown>;
  primaryLabel: (row: T) => string;
  secondaryLabel?: (row: T) => string;
  imageKey?: string;
}) {
  const qc = useQueryClient();
  const list = useQuery({ queryKey, queryFn });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>(emptyRow);
  const [editingId, setEditingId] = useState<string | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: [queryKey[0]] });

  const save = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const payload: Record<string, unknown> = {};
      for (const field of fields) {
        let value = values[field.name];
        if (field.type === "number") value = value === "" || value === null ? null : Number(value);
        if (field.type === "image" || field.type === "text" || field.type === "textarea") {
          if (typeof value === "string") value = value.trim();
        }
        payload[field.name] = value;
      }
      const query = supabase.from(table as never);
      const { error } = editingId
        ? await (query as never as { update: (v: unknown) => { eq: (c: string, v: string) => Promise<{ error: unknown }> } })
            .update(payload)
            .eq("id", editingId)
        : await (query as never as { insert: (v: unknown) => Promise<{ error: unknown }> }).insert(
            payload,
          );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editingId ? "Modifications enregistrées" : "Élément ajouté");
      setOpen(false);
      setEditingId(null);
      invalidate();
    },
    onError: (error: unknown) =>
      toast.error("Enregistrement impossible", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Élément supprimé");
      invalidate();
    },
    onError: (error: unknown) =>
      toast.error("Suppression impossible", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  function openCreate() {
    setDraft(emptyRow);
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(row: T) {
    const values: Record<string, unknown> = {};
    for (const field of fields) values[field.name] = row[field.name] ?? emptyRow[field.name] ?? "";
    setDraft(values);
    setEditingId(row.id);
    setOpen(true);
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-primary">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={openCreate} variant="gold" size="sm">
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      {list.isLoading ? (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : (list.data ?? []).length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Aucun élément pour le moment.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {(list.data ?? []).map((row) => {
            const image = imageKey ? (row[imageKey] as string | null) : null;
            return (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background p-3"
              >
                {imageKey ? (
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary/50">
                    {image ? (
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-display text-primary/40">CC</span>
                    )}
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{primaryLabel(row)}</p>
                  {secondaryLabel ? (
                    <p className="truncate text-sm text-muted-foreground">{secondaryLabel(row)}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => openEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Supprimer"
                    onClick={() => {
                      if (window.confirm("Supprimer définitivement cet élément ?"))
                        remove.mutate(row.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">
              {editingId ? "Modifier" : "Ajouter"} — {title}
            </DialogTitle>
          </DialogHeader>

          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate(draft);
            }}
          >
            {fields.map((field) => {
              const value = draft[field.name];
              const set = (next: unknown) => setDraft((prev) => ({ ...prev, [field.name]: next }));
              return (
                <div
                  key={field.name}
                  className={field.half ? "space-y-2" : "space-y-2 sm:col-span-2"}
                >
                  {field.type === "switch" ? (
                    <div className="flex items-center justify-between rounded-xl border border-border p-3">
                      <Label>{field.label}</Label>
                      <Switch checked={Boolean(value)} onCheckedChange={set} />
                    </div>
                  ) : field.type === "image" ? (
                    <ImageUploadField
                      label={field.label}
                      value={typeof value === "string" ? value : ""}
                      onChange={set}
                      folder={field.folder}
                      accept={field.accept}
                    />
                  ) : field.type === "select" ? (
                    <>
                      <Label>{field.label}</Label>
                      <Select value={String(value ?? "")} onValueChange={set}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir" />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options ?? []).map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : field.type === "textarea" ? (
                    <>
                      <Label>{field.label}</Label>
                      <Textarea
                        rows={5}
                        value={String(value ?? "")}
                        placeholder={field.placeholder}
                        onChange={(event) => set(event.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <Label>{field.label}</Label>
                      <Input
                        type={field.type === "number" ? "number" : "text"}
                        value={value === null || value === undefined ? "" : String(value)}
                        placeholder={field.placeholder}
                        onChange={(event) => set(event.target.value)}
                      />
                    </>
                  )}
                </div>
              );
            })}

            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="gold" disabled={save.isPending}>
                {save.isPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
