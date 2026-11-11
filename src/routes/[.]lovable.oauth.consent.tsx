import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { oauth } from "@/lib/oauth-consent";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    authorization_id: typeof search.authorization_id === "string" ? search.authorization_id : "",
  }),
  head: () => ({ meta: [
    { title: "Connecter une application — Fulania" },
    { name: "description", content: "Autorisez ou refusez l’accès d’une application aux outils Fulania avec votre compte." },
    { property: "og:title", content: "Connexion d’une application — Fulania" },
    { property: "og:description", content: "Décidez quelles applications peuvent utiliser les outils Fulania avec votre compte." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Demande de connexion manquante. Relancez la connexion depuis votre application.");
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { next: location.href } });
    return { account: data.user.user_metadata?.username ?? data.user.email?.split("@")[0] ?? "Votre compte" };
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.searchStr).get("authorization_id");
    if (!id) throw new Error("Demande de connexion manquante.");
    const { data, error } = await oauth.getAuthorizationDetails(id);
    if (error || !data) throw new Error("Cette demande est expirée ou indisponible. Relancez la connexion depuis votre application.");
    const immediate = data.redirect_url ?? data.redirect_to;
    if (immediate && !data.client) throw redirect({ href: immediate });
    return data;
  },
  pendingComponent: () => <ConsentFrame><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /><p className="mt-4 text-center">Chargement de la demande…</p></ConsentFrame>,
  errorComponent: ({ error }) => <ConsentFrame><h1 className="font-display text-2xl text-foreground">Connexion indisponible</h1><p role="alert" className="mt-4 text-muted-foreground">{error instanceof Error ? error.message : "Impossible de charger cette demande."}</p></ConsentFrame>,
  component: Consent,
});

function ConsentFrame({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-background px-5 py-16"><div className="mx-auto max-w-lg"><p className="mb-8 font-display text-2xl text-primary">FulanIA</p>{children}</div></main>;
}

function Consent() {
  const details = Route.useLoaderData();
  const { account } = Route.useRouteContext();
  const { authorization_id } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { queryClient } = Route.useRouteContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = details.client?.name ?? details.client?.client_name ?? "cette application";
  const scopes = details.scopes ?? (details.scope ?? "").split(/\s+/).filter(Boolean);

  async function decide(approve: boolean) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = approve ? await oauth.approveAuthorization(authorization_id) : await oauth.denyAuthorization(authorization_id);
      if (result.error) throw new Error(result.error.message);
      const target = result.data?.redirect_url ?? result.data?.redirect_to;
      if (!target) throw new Error("Aucune adresse de retour reçue. Réessayez.");
      window.location.assign(target);
    } catch {
      setError("Votre choix n’a pas pu être enregistré. Réessayez ou relancez la connexion.");
      setBusy(false);
    }
  }

  async function switchAccount() {
    setBusy(true);
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      const result = await supabase.auth.signOut();
      if (result.error) throw result.error;
      await navigate({ to: "/auth", search: { next: window.location.pathname + window.location.search }, replace: true });
    } catch {
      setError("Impossible de changer de compte. Réessayez.");
      setBusy(false);
    }
  }

  return <ConsentFrame>
    <ShieldCheck className="mb-5 h-9 w-9 text-primary" />
    <h1 className="font-display text-3xl text-foreground">Connecter {client} à FulanIA</h1>
    <div className="my-6 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4"><span className="text-sm text-foreground">Compte : {String(account)}</span><Button variant="ghost" size="sm" disabled={busy} onClick={switchAccount}>Changer de compte</Button></div>
    <p className="text-foreground">{client} pourra utiliser les outils FulanIA en votre nom.</p>
    {details.redirect_uri && <p className="mt-3 break-all text-sm text-muted-foreground">Adresse de retour : {details.redirect_uri}</p>}
    <ul className="my-5 list-disc space-y-2 pl-5 text-sm text-foreground">
      <li>Traduction, dictionnaire, grammaire, vocabulaire et exercices.</li>
      <li>Correction de textes, culture, ressources et conversation avec Janngude.</li>
      {scopes.map(scope => <li key={scope}>{({ openid: "Vérifier votre identité", email: "Partager l’adresse associée au compte", profile: "Partager votre profil de base" } as Record<string, string>)[scope] ?? `Permission supplémentaire demandée : ${scope}`}</li>)}
    </ul>
    <p className="text-sm text-muted-foreground">Vos conversations enregistrées, favoris, dons et progression ne sont pas exposés par ces outils. Les permissions de votre compte restent applicables.</p>
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    <div className="mt-8 flex flex-wrap gap-3"><Button disabled={busy} onClick={() => decide(true)}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Autoriser la connexion</Button><Button variant="outline" disabled={busy} onClick={() => decide(false)}>Refuser la connexion</Button></div>
  </ConsentFrame>;
}