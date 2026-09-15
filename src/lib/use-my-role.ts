import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MyRoles = {
  roles: string[];
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isStaff: boolean;
};

export function useMyRoles(enabled = true) {
  const query = useQuery({
    queryKey: ["my_roles"],
    enabled,
    queryFn: async (): Promise<MyRoles> => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return { roles: [], isSuperAdmin: false, isAdmin: false, isStaff: false };
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      if (error) throw error;
      const roles = (data ?? []).map((row) => String(row.role));
      const isSuperAdmin = roles.includes("super_admin");
      const isAdmin = isSuperAdmin || roles.includes("admin");
      return { roles, isSuperAdmin, isAdmin, isStaff: isAdmin || roles.includes("editor") };
    },
  });

  return (
    query.data ?? { roles: [], isSuperAdmin: false, isAdmin: false, isStaff: false }
  );
}
