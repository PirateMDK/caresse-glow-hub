import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import {
  createStaffUser,
  listStaffUsers,
  revokeStaffAccess,
  sendStaffPasswordReset,
  STAFF_ROLE_LABELS,
  STAFF_ROLES,
  updateStaffRole,
} from "@/lib/admin-users.functions";
import type { StaffRole } from "@/lib/admin-users.functions";

export function UsersSection() {
  const qc = useQueryClient();
  const list = useServerFn(listStaffUsers);
  const create = useServerFn(createStaffUser);
  const update = useServerFn(updateStaffRole);
  const revoke = useServerFn(revokeStaffAccess);
  const reset = useServerFn(sendStaffPasswordReset);

  const users = useQuery({ queryKey: ["staff_users"], queryFn: () => list({ data: undefined }) });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["staff_users"] });

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("editor");

  const createMutation = useMutation({
    mutationFn: () => create({ data: { email, password, role } }),
    onSuccess: (result) => {
      toast.success(
        result.invited
          ? "Invitation envoyée par email."
          : "Compte créé, le mot de passe peut être communiqué.",
      );
      setOpen(false);
      setEmail("");
      setPassword("");
      setRole("editor");
      invalidate();
    },
    onError: (error: unknown) =>
      toast.error("Création impossible", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  const roleMutation = useMutation({
    mutationFn: (vars: { userId: string; role: StaffRole }) => update({ data: vars }),
    onSuccess: () => {
      toast.success("Rôle mis à jour");
      invalidate();
    },
    onError: (error: unknown) =>
      toast.error("Modification impossible", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  const revokeMutation = useMutation({
    mutationFn: (vars: { userId: string; deleteAccount: boolean }) => revoke({ data: vars }),
    onSuccess: () => {
      toast.success("Accès révoqué");
      invalidate();
    },
    onError: (error: unknown) =>
      toast.error("Révocation impossible", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  const resetMutation = useMutation({
    mutationFn: (targetEmail: string) =>
      reset({
        data: { email: targetEmail, redirectTo: `${window.location.origin}/reset-password` },
      }),
    onSuccess: () => toast.success("Email de réinitialisation envoyé"),
    onError: (error: unknown) =>
      toast.error("Envoi impossible", {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-card-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-primary">Utilisateurs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Comptes ayant accès à l'administration. Seul un super administrateur peut les gérer.
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={() => setOpen(true)}>
          <UserPlus className="h-4 w-4" /> Inviter
        </Button>
      </div>

      {users.isLoading ? (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : users.isError ? (
        <p className="mt-6 text-sm text-destructive">
          Accès réservé aux super administrateurs.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {(users.data ?? []).map((user) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background p-3"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  {user.confirmed ? "Compte actif" : "Invitation en attente"}
                  {user.last_sign_in_at
                    ? ` · dernière connexion le ${new Date(user.last_sign_in_at).toLocaleDateString("fr-FR")}`
                    : ""}
                </p>
              </div>
              {user.role === "super_admin" ? (
                <Badge variant="secondary">{STAFF_ROLE_LABELS.super_admin}</Badge>
              ) : null}
              <Select
                value={user.role ?? "editor"}
                onValueChange={(next) =>
                  roleMutation.mutate({ userId: user.id, role: next as StaffRole })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ROLES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {STAFF_ROLE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Envoyer un email de réinitialisation"
                onClick={() => resetMutation.mutate(user.email)}
              >
                <KeyRound className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Révoquer l'accès"
                onClick={() => {
                  if (window.confirm(`Révoquer l'accès de ${user.email} ?`))
                    revokeMutation.mutate({ userId: user.id, deleteAccount: false });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">Nouvel accès</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              createMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="new-user-email">Email</Label>
              <Input
                id="new-user-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-password">Mot de passe (optionnel)</Label>
              <Input
                id="new-user-password"
                type="text"
                minLength={8}
                placeholder="Laisser vide pour envoyer une invitation par email"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={role} onValueChange={(next) => setRole(next as StaffRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ROLES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {STAFF_ROLE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              variant="gold"
              className="w-full"
              disabled={createMutation.isPending}
            >
              Créer l'accès
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
