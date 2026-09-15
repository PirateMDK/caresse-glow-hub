import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/site";
import { useSiteSettings } from "@/lib/use-site-settings";

export function WhatsAppFloating() {
  const settings = useSiteSettings();

  return (
    <a
      href={waLink(
        "Bonjour Caresse Care 👋 J'aimerais des informations sur vos produits et soins.",
        settings.phonePrimary,
      )}
      target="_blank"
      rel="noreferrer"
      aria-label="Écrire sur WhatsApp"
      className="fixed right-4 bottom-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-sage text-primary-foreground shadow-soft transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
