import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Espace administration — Caresse Care" },
      {
        name: "description",
        content: "Connexion réservée à l'équipe Caresse Care pour gérer la boutique et le contenu.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Espace administration — Caresse Care" },
      { property: "og:description", content: "Connexion réservée à l'équipe Caresse Care." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoading(false);
      toast.error("Identifiants incorrects.");
      return;
    }

    await supabase.rpc("claim_admin_access");
    setLoading(false);
    navigate({ to: "/admin", replace: true });
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      toast.error("Entrez d'abord votre email.");
      return;
    }
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetting(false);
    if (error) {
      toast.error("Envoi impossible", { description: error.message });
      return;
    }
    toast.success("Email envoyé. Consultez votre boîte de réception.");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-soft">
        <img src={logo} alt="Caresse Care" className="mx-auto h-14 w-auto" />
        <div className="mt-6 text-center">
          <p className="eyebrow text-accent">Administration</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-primary">Connexion</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Accès réservé à l'équipe Caresse Care.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                minLength={8}
                className="pr-11"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-primary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
            <Lock className="h-4 w-4" />
            Se connecter
          </Button>
        </form>

        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={resetting}
          className="mt-5 w-full text-center text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Mot de passe oublié ?
        </button>
      </div>
    </div>
  );
}
