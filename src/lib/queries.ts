import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Program = Database["public"]["Tables"]["programs"]["Row"];
export type MediaItem = Database["public"]["Tables"]["media_items"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

export const productsQuery = (options?: { onlyNew?: boolean }) =>
  queryOptions({
    queryKey: ["products", options?.onlyNew ?? false],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (options?.onlyNew) query = query.eq("is_new", true);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

export const servicesQuery = () =>
  queryOptions({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const programsQuery = () =>
  queryOptions({
    queryKey: ["programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const mediaQuery = () =>
  queryOptions({
    queryKey: ["media_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const postsQuery = () =>
  queryOptions({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["posts", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const settingsQuery = () =>
  queryOptions({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const ordersQuery = () =>
  queryOptions({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export type SiteContent = Database["public"]["Tables"]["site_content"]["Row"];
export type NavItem = Database["public"]["Tables"]["nav_items"]["Row"];

export const siteContentQuery = () =>
  queryOptions({
    queryKey: ["site_content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("group_name", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const navItemsQuery = () =>
  queryOptions({
    queryKey: ["nav_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nav_items")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export const bookingsQuery = () =>
  queryOptions({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("booking_date", { ascending: false })
        .order("time_slot", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const bookedSlotsQuery = (date: string) =>
  queryOptions({
    queryKey: ["booked_slots", date],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("booked_slots", { _date: date });
      if (error) throw error;
      return (data ?? []) as string[];
    },
  });
