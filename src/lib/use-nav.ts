import { useQuery } from "@tanstack/react-query";
import { navItemsQuery } from "./queries";
import { NAV_LINKS } from "./site";

export type NavLink = { to: string; label: string };

/** Navigation gérée depuis l'admin, avec repli sur les liens par défaut. */
export function useNavLinks(): NavLink[] {
  const { data } = useQuery(navItemsQuery());
  const items = (data ?? []).filter((item) => item.is_active);
  if (items.length === 0) return NAV_LINKS.map((link) => ({ to: link.to, label: link.label }));
  return items.map((item) => ({ to: item.href, label: item.label }));
}
