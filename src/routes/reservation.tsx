import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHero, SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { bookedSlotsQuery, programsQuery, servicesQuery } from "@/lib/queries";
import { TIME_SLOTS, waLink } from "@/lib/site";
import { useSiteSettings } from "@/lib/use-site-settings";

export const Route = createFileRoute("/reservation")({
  head: () => ({
    meta: [
      { title: "Réserver un soin ou une formation — Caresse Care" },
      {
        name: "description",
        content:
          "Choisissez votre soin ou votre formation, votre date et votre créneau horaire, puis envoyez votre demande de réservation à Caresse Care à Cotonou.",
      },
      { property: "og:title", content: "Réservation en ligne — Caresse Care" },
      {
        property: "og:description",
        content: "Réservez votre soin ou votre formation en quelques clics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reservation,
});

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function Reservation() {
  const qc = useQueryClient();
  const settings = useSiteSettings();
  const services = useQuery(servicesQuery());
  const programs = useQuery(programsQuery());

  const [kind, setKind] = useState<"soin" | "formation">("soin");
  const [itemId, setItemId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const booked = useQuery({ ...bookedSlotsQuery(date), enabled: Boolean(date) });
  const takenSlots = booked.data ?? [];

  const options = useMemo(() => {
    if (kind === "soin") {
      return (services.data ?? []).map((service) => ({ id: service.id, title: service.title }));
    }
    return (programs.data ?? []).map((program) => ({ id: program.id, title: program.title }));
  }, [kind, services.data, programs.data]);

  const selected = options.find((option) => option.id === itemId);

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("bookings").insert({
        kind,
        item_id: selected?.id ?? null,
        item_title: selected?.title ?? "",
        booking_date: date,
        time_slot: slot,
        customer_name: name.trim().slice(0, 120),
        customer_phone: phone.trim().slice(0, 40),
        customer_email: email.trim().slice(0, 160) || null,
        note: note.trim().slice(0, 500) || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Réservation envoyée", {
        description: "Nous vous confirmons votre créneau très rapidement.",
      });
      const message = `Bonjour Caresse Care 👋\nNouvelle réservation :\n• ${
        selected?.title ?? (kind === "soin" ? "Soin" : "Formation")
      }\n• Date : ${date} à ${slot}\nNom : ${name.trim()}\nTéléphone : ${phone.trim()}${
        note.trim() ? `\nNote : ${note.trim()}` : ""
      }`;
      window.open(waLink(message, settings.phonePrimary), "_blank", "noopener");
      qc.invalidateQueries({ queryKey: ["booked_slots", date] });
      setSlot("");
      setName("");
      setPhone("");
      setEmail("");
      setNote("");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("bookings_unique_slot") || message.includes("duplicate key")) {
        qc.invalidateQueries({ queryKey: ["booked_slots", date] });
        toast.error("Ce créneau vient d'être réservé", {
          description: "Merci de choisir un autre horaire.",
        });
        setSlot("");
        return;
      }
      toast.error("Réservation impossible", { description: message || undefined });
    },
  });

  function handleSubmit() {
    if (!selected) {
      toast.error("Choisissez un soin ou une formation.");
      return;
    }
    if (!date || !slot) {
      toast.error("Choisissez une date et un créneau.");
      return;
    }
    if (name.trim().length < 2 || phone.trim().length < 6) {
      toast.error("Merci d'indiquer votre nom et votre numéro.");
      return;
    }
    submit.mutate();
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="Réservation"
        title="Réservez votre soin ou votre formation"
        description="Choisissez la prestation, la date et l'horaire qui vous conviennent. Les créneaux déjà pris apparaissent grisés."
      />

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card-soft sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type de prestation</Label>
              <Select
                value={kind}
                onValueChange={(value) => {
                  setKind(value as "soin" | "formation");
                  setItemId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soin">Soin</SelectItem>
                  <SelectItem value="formation">Coaching / Formation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{kind === "soin" ? "Soin souhaité" : "Formation souhaitée"}</Label>
              <Select value={itemId} onValueChange={setItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner…" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date souhaitée</Label>
              <Input
                id="date"
                type="date"
                value={date}
                min={todayISO()}
                onChange={(event) => {
                  setDate(event.target.value);
                  setSlot("");
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-name">Nom complet</Label>
              <Input
                id="booking-name"
                value={name}
                maxLength={120}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex. Dorcas A."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-phone">Téléphone / WhatsApp</Label>
              <Input
                id="booking-phone"
                value={phone}
                maxLength={40}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+229 …"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-email">Email (facultatif)</Label>
              <Input
                id="booking-email"
                type="email"
                value={email}
                maxLength={160}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vous@exemple.com"
              />
            </div>
          </div>

          <div className="mt-6">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" /> Créneau horaire
            </Label>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {TIME_SLOTS.map((value) => {
                const taken = takenSlots.includes(value);
                return (
                  <Button
                    key={value}
                    type="button"
                    variant={slot === value ? "gold" : "soft"}
                    disabled={taken}
                    className="w-full"
                    onClick={() => setSlot(value)}
                  >
                    {value}
                  </Button>
                );
              })}
            </div>
            {takenSlots.length > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Créneaux déjà réservés pour cette date : {takenSlots.join(", ")}.
              </p>
            ) : null}
          </div>

          <div className="mt-6 space-y-2">
            <Label htmlFor="booking-note">Message (facultatif)</Label>
            <Textarea
              id="booking-note"
              value={note}
              maxLength={500}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Type de peau, préférences, questions…"
            />
          </div>

          <Button
            variant="whatsapp"
            size="lg"
            className="mt-6 w-full"
            disabled={submit.isPending}
            onClick={handleSubmit}
          >
            <CalendarCheck className="h-5 w-5" /> Envoyer ma demande de réservation
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Votre demande est enregistrée puis confirmée par notre équipe.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
