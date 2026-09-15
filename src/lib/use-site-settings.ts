import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "./queries";
import { SITE } from "./site";

export function useSiteSettings() {
  const { data } = useQuery(settingsQuery());
  return {
    address: data?.address ?? SITE.address,
    phonePrimary: data?.phone_primary ?? SITE.phonePrimary,
    phoneSecondary: data?.phone_secondary ?? SITE.phoneSecondary,
    phoneOuaga: data?.phone_ouaga ?? SITE.phoneOuaga,
    instagram: data?.instagram_url ?? SITE.instagram,
    tiktok: data?.tiktok_url ?? SITE.tiktok,
    facebook: data?.facebook_url ?? SITE.facebook,
    mapsQuery: data?.maps_query ?? SITE.mapsQuery,
  };
}
