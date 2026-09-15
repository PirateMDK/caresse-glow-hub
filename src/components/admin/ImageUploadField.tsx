import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMedia } from "@/lib/upload";

export function ImageUploadField({
  label,
  value,
  onChange,
  folder,
  accept = "image/*",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string | undefined;
  accept?: string | undefined;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
      toast.success("Fichier téléversé");
    } catch (error) {
      toast.error("Téléversement impossible", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  const isVideo = /\.(mp4|webm|mov)$/i.test(value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-3">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-secondary/40">
          {value ? (
            isVideo ? (
              <video src={value} className="h-full w-full object-cover" muted />
            ) : (
              <img src={value} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
          {busy ? (
            <span className="absolute inset-0 grid place-items-center bg-background/70">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            value={value}
            placeholder="URL du fichier ou téléversement"
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="flex gap-2">
            <Button type="button" variant="soft" size="sm" onClick={() => inputRef.current?.click()}>
              <ImagePlus className="h-4 w-4" /> Téléverser
            </Button>
            {value ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
                <X className="h-4 w-4" /> Retirer
              </Button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </div>
      </div>
    </div>
  );
}
