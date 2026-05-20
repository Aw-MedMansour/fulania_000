import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Connexion | FulanIA" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const goToChat = () => navigate({ to: "/chat", replace: true });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) goToChat();
    });

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) goToChat();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bienvenue !");
    navigate({ to: "/chat", replace: true });
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/chat` },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Vérifiez votre boîte mail pour confirmer votre compte.");
  };

  const onGoogle = async () => {
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/chat",
    });
    if (r.error) toast.error("Échec de la connexion Google");
    else if (!r.redirected) navigate({ to: "/chat", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-semibold text-earth">Connexion à FulanIA</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Connectez-vous pour synchroniser vos favoris et votre historique entre vos appareils.
        </p>

        <Button onClick={onGoogle} variant="outline" className="mt-6 h-11">
          Continuer avec Google
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Créer un compte</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={onSignIn} className="space-y-4 pt-4">
              <Field label="Email" type="email" value={email} onChange={setEmail} />
              <Field label="Mot de passe" type="password" value={password} onChange={setPassword} />
              <Button type="submit" disabled={loading} className="w-full">
                Se connecter
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={onSignUp} className="space-y-4 pt-4">
              <Field label="Email" type="email" value={email} onChange={setEmail} />
              <Field label="Mot de passe" type="password" value={password} onChange={setPassword} />
              <Button type="submit" disabled={loading} className="w-full">
                Créer mon compte
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <Link to="/" className="mt-8 text-center text-sm text-muted-foreground hover:text-foreground">
          ← Retour à l'accueil
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label, type, value, onChange,
}: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, '-')}-${type}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} required value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
