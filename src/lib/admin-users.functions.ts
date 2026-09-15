import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const STAFF_ROLES = ["super_admin", "admin", "editor"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: "Super administrateur",
  admin: "Administrateur",
  editor: "Éditeur",
};

export type StaffUser = {
  id: string;
  email: string;
  role: StaffRole | null;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed: boolean;
};

async function assertSuperAdmin(context: { supabase: { rpc: (fn: never, args: never) => Promise<{ data: unknown }> }; userId: string }) {
  const { data } = await (
    context.supabase as unknown as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }>;
    }
  ).rpc("is_super_admin", { _user_id: context.userId });
  if (data !== true) throw new Error("Accès réservé aux super administrateurs.");
}

export const listStaffUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StaffUser[]> => {
    await assertSuperAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (error) throw error;
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");

    const rank: Record<string, number> = { super_admin: 3, admin: 2, editor: 1 };
    const roleByUser = new Map<string, StaffRole>();
    for (const row of roles ?? []) {
      if (!STAFF_ROLES.includes(row.role as StaffRole)) continue;
      const current = roleByUser.get(row.user_id);
      if (!current || (rank[row.role] ?? 0) > (rank[current] ?? 0)) {
        roleByUser.set(row.user_id, row.role as StaffRole);
      }
    }

    return list.users
      .map((user) => ({
        id: user.id,
        email: user.email ?? "",
        role: roleByUser.get(user.id) ?? null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at ?? null,
        confirmed: Boolean(user.email_confirmed_at),
      }))
      .filter((user) => user.role !== null)
      .sort((a, b) => a.email.localeCompare(b.email));
  });

export const createStaffUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(8).optional().or(z.literal("")),
        role: z.enum(STAFF_ROLES),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();

    let userId: string | undefined;
    if (data.password) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: data.password,
        email_confirm: true,
      });
      if (error) throw error;
      userId = created.user?.id;
    } else {
      const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
      if (error) throw error;
      userId = invited.user?.id;
    }
    if (!userId) throw new Error("Compte non créé.");

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: data.role });
    if (roleError) throw roleError;

    return { ok: true, invited: !data.password };
  });

export const updateStaffRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ userId: z.string().uuid(), role: z.enum(STAFF_ROLES) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context as never);
    if (data.userId === context.userId) {
      throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error) throw error;
    return { ok: true };
  });

export const revokeStaffAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ userId: z.string().uuid(), deleteAccount: z.boolean().default(false) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context as never);
    if (data.userId === context.userId) {
      throw new Error("Vous ne pouvez pas révoquer votre propre accès.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    if (error) throw error;
    if (data.deleteAccount) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
      if (deleteError) throw deleteError;
    }
    return { ok: true };
  });

export const sendStaffPasswordReset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ email: z.string().email(), redirectTo: z.string().url() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(data.email, {
      redirectTo: data.redirectTo,
    });
    if (error) throw error;
    return { ok: true };
  });
