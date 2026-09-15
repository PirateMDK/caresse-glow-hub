import { useQuery } from "@tanstack/react-query";
import { siteContentQuery } from "./queries";

/** Textes et images éditables depuis l'admin, avec repli sur le texte d'origine. */
export function useSiteContent() {
  const { data } = useQuery(siteContentQuery());

  const map = new Map((data ?? []).map((row) => [row.key, row]));

  return {
    text(key: string, fallback = "") {
      const value = map.get(key)?.value_text;
      return value && value.trim() ? value : fallback;
    },
    image(key: string, fallback?: string) {
      const value = map.get(key)?.value_image;
      return value && value.trim() ? value : fallback;
    },
  };
}
