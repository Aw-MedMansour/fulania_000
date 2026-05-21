import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  Languages,
  AlertCircle,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import portraitImg from "@/assets/culture-portrait.jpg";
import patternImg from "@/assets/pattern.jpg";

/* ───────── Validation ─────────
 * Strict email validation + disposable / invalid domain blocklist
 * to ensure only real, deliverable addresses can register.
 */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "yopmail.com", "guerrillamail.com", "10minutemail.com",
  "tempmail.com", "temp-mail.org", "trashmail.com", "throwawaymail.com",
  "fakeinbox.com", "getnada.com", "dispostable.com", "maildrop.cc",
  "sharklasers.com", "spam4.me", "mintemail.com", "mohmal.com",
  "tempr.email", "fake-mail.net", "moakt.com", "emailondeck.com",
  "tempmailo.com", "1secmail.com", "inboxbear.com", "harakirimail.com",
  "test.com", "example.com", "exemple.com", "exemple.fr",
]);

const emailSchema = z
  .string()
  .trim()
  .min(5, "Email trop court")
  .max(254, "Email trop long")
  .regex(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Format d'email invalide",
  )
  .refine((v) => {
    const domain = v.split("@")[1]?.toLowerCase() ?? "";
    return !DISPOSABLE_DOMAINS.has(domain);
  }, "Les adresses jetables ne sont pas acceptées")
  .refine((v) => {
    const local = v.split("@")[0] ?? "";
    return !/^(test|fake|admin|noreply|no-reply)$/i.test(local);
  }, "Veuillez utiliser une adresse email réelle");

const passwordSchema = z
  .string()
  .min(8, "Au moins 8 caractères")
  .max(72, "Mot de passe trop long")
  .regex(/[A-Za-z]/, "Doit contenir une lettre")
  .regex(/[0-9]/, "Doit contenir un chiffre");

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion à FulanIA — Assistant IA Peul" },
      {
        name: "description",
        content:
          "Connectez-vous à FulanIA pour discuter avec l'assistant Peul, explorer le dictionnaire Pulaar et synchroniser vos favoris.",
      },
    ],
  }),
  component: AuthPage,
});

type Provider = "google" | "apple";

function AuthPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<Provider | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

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

  // Live email validation hint (only after the user has typed @ + something)
  const emailHint = useMemo(() => {
    if (!email || !email.includes("@") || email.endsWith("@")) return null;
    const r = emailSchema.safeParse(email);
    return r.success ? null : r.error.issues[0]?.message ?? "Email invalide";
  }, [email]);

  const validateForm = (mode: "signin" | "signup"): boolean => {
    const e = emailSchema.safeParse(email);
    setEmailError(e.success ? null : e.error.issues[0]?.message ?? "Email invalide");
    if (mode === "signup") {
      const p = passwordSchema.safeParse(password);
      setPwdError(p.success ? null : p.error.issues[0]?.message ?? "Mot de passe invalide");
      return e.success && p.success;
    }
    setPwdError(password.length === 0 ? "Mot de passe requis" : null);
    return e.success && password.length > 0;
  };

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm("signin")) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(t("auth.welcomeToast"));
    navigate({ to: "/chat", replace: true });
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm("signup")) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/chat` },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(t("auth.verifyMail"));
  };

  const onOAuth = async (provider: Provider) => {
    setOauthLoading(provider);
    const r = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin + "/chat",
    });
    setOauthLoading(null);
    if (r.error) toast.error(`${t("auth.oauthErr")} ${provider === "google" ? "Google" : "Apple"}`);
    else if (!r.redirected) navigate({ to: "/chat", replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Subtle background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "420px" }}
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_1fr]">
        {/* ============= LEFT — Brand panel ============= */}
        <aside className="relative hidden overflow-hidden bg-earth text-cream lg:flex lg:flex-col lg:justify-between">
          <img
            src={portraitImg}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-earth via-earth/90 to-earth/60" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "300px" }}
            aria-hidden
          />

          <div className="relative z-10 flex items-center gap-2.5 p-10">
            <Link to="/" className="group flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--gold)] text-earth shadow-lg transition group-hover:scale-105">
                <span className="font-display text-xl font-bold">F</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-xl font-semibold tracking-tight">FulanIA</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-cream/60">
                  Pulaagu &amp; IA
                </span>
              </div>
            </Link>
          </div>

          <div className="relative z-10 px-10 pb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-earth/40 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--gold)] backdrop-blur">
              <Sparkles className="h-3 w-3" />
              {t("auth.welcome")}
            </div>
            <h2 className="mt-6 max-w-md font-display text-4xl font-semibold leading-[1.1] tracking-tight text-balance xl:text-5xl">
              {t("auth.heroTitle")}
            </h2>
            <p className="mt-5 max-w-md text-cream/75">
              {t("auth.heroBody")}
            </p>

            <ul className="mt-8 space-y-3 text-sm">
              {[
                { icon: Sparkles, label: t("auth.benefit1") },
                { icon: BookOpen, label: t("auth.benefit2") },
                { icon: Languages, label: t("auth.benefit3") },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-cream/85">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gold)]/15 text-[var(--gold)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            <figure className="mt-10 max-w-md border-l-2 border-[var(--gold)] pl-5">
              <blockquote className="font-display text-lg italic text-cream/90">
                « Pulaagu ko ngallu mawngu. »
              </blockquote>
              <figcaption className="mt-1.5 text-xs uppercase tracking-widest text-cream/55">
                {t("sol.quoteCaption")}
              </figcaption>
            </figure>
          </div>
        </aside>

        {/* ============= RIGHT — Form panel ============= */}
        <main className="relative flex min-h-screen flex-col justify-between px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
          {/* Mobile brand bar */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2.5" aria-label={t("auth.backHome")}>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-earth text-cream">
                <span className="font-display text-lg font-bold text-[var(--gold)]">F</span>
              </div>
              <span className="font-display text-lg font-semibold text-earth">FulanIA</span>
            </Link>
            <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> {t("auth.home")}
            </Link>
          </div>

          <div className="mx-auto w-full max-w-md flex-1">
            <div className="text-center lg:text-left">
              <span className="text-xs uppercase tracking-[0.2em] text-primary">
                {tab === "signin" ? t("auth.tab.signin") : t("auth.tab.signup")}
              </span>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-earth sm:text-4xl">
                {tab === "signin" ? t("auth.signinTitle") : t("auth.signupTitle")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {tab === "signin" ? t("auth.signinSub") : t("auth.signupSub")}
              </p>
            </div>

            <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
              <Button
                onClick={() => onOAuth("google")}
                variant="outline"
                disabled={oauthLoading !== null}
                className="h-11 gap-2.5 border-border/80 bg-card text-sm font-medium shadow-sm hover:bg-accent"
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="h-[18px] w-[18px]" />
                )}
                Google
              </Button>
              <Button
                onClick={() => onOAuth("apple")}
                disabled={oauthLoading !== null}
                className="h-11 gap-2.5 bg-earth text-sm font-medium text-cream shadow-sm hover:bg-earth/90"
              >
                {oauthLoading === "apple" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AppleIcon className="h-[18px] w-[18px]" />
                )}
                Apple
              </Button>
            </div>

            <div className="my-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              {t("auth.orEmail")}
              <div className="h-px flex-1 bg-border" />
            </div>

            <Tabs value={tab} onValueChange={(v) => { setTab(v as "signin" | "signup"); setEmailError(null); setPwdError(null); }}>
              <TabsList className="grid w-full grid-cols-2 bg-secondary/60">
                <TabsTrigger value="signin">{t("auth.tab.signin")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.tab.signup")}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={onSignIn} noValidate className="space-y-4 pt-5">
                  <EmailField label={t("auth.email")} value={email} onChange={(v) => { setEmail(v); setEmailError(null); }} error={emailError} hint={emailHint} />
                  <PasswordField
                    label={t("auth.password")}
                    value={password}
                    onChange={(v) => { setPassword(v); setPwdError(null); }}
                    show={showPwd}
                    onToggle={() => setShowPwd((s) => !s)}
                    autoComplete="current-password"
                    error={pwdError}
                  />
                  <Button type="submit" disabled={loading} className="h-11 w-full gap-2 text-sm font-semibold">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("auth.signinBtn")} <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={onSignUp} noValidate className="space-y-4 pt-5">
                  <EmailField label={t("auth.email")} value={email} onChange={(v) => { setEmail(v); setEmailError(null); }} error={emailError} hint={emailHint} />
                  <PasswordField
                    label={t("auth.password")}
                    value={password}
                    onChange={(v) => { setPassword(v); setPwdError(null); }}
                    show={showPwd}
                    onToggle={() => setShowPwd((s) => !s)}
                    autoComplete="new-password"
                    error={pwdError}
                    hint={t("auth.hintPwd")}
                  />
                  <Button type="submit" disabled={loading} className="h-11 w-full gap-2 text-sm font-semibold">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("auth.signupBtn")} <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    {t("auth.terms")}
                  </p>
                </form>
              </TabsContent>
            </Tabs>


            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              {t("auth.privacy")}
            </div>
          </div>

          <footer className="mt-10 hidden text-center text-xs text-muted-foreground lg:block">
            <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> {t("auth.backHome")}
            </Link>
            <span className="mx-2 opacity-50">·</span>
            © 2026 FulanIA
          </footer>
        </main>
      </div>
    </div>
  );
}

/* ───────── Sub-components ───────── */

function EmailField({
  label = "Email", value, onChange, error, hint,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  hint?: string | null;
}) {
  const { t } = useLanguage();
  const msg = error ?? hint ?? null;
  const invalid = Boolean(error);
  return (
    <div className="space-y-1.5">
      <Label htmlFor="auth-email">{label}</Label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="auth-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder={t("auth.emailPh")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={msg ? "auth-email-msg" : undefined}
          className={`h-11 pl-9 ${invalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />
      </div>
      {msg && (
        <p
          id="auth-email-msg"
          className={`flex items-center gap-1.5 text-xs ${invalid ? "text-destructive" : "text-muted-foreground"}`}
        >
          {invalid ? <AlertCircle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
          {msg}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  label = "Mot de passe", value, onChange, show, onToggle, autoComplete, hint, error,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete: string;
  hint?: string;
  error?: string | null;
}) {
  const invalid = Boolean(error);
  return (
    <div className="space-y-1.5">
      <Label htmlFor="auth-password">{label}</Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="auth-password"
          type={show ? "text" : "password"}
          required
          minLength={8}
          autoComplete={autoComplete}
          placeholder="••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={error || hint ? "auth-password-msg" : undefined}
          className={`h-11 pl-9 pr-10 ${invalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {(error || hint) && (
        <p
          id="auth-password-msg"
          className={`flex items-center gap-1.5 text-xs ${invalid ? "text-destructive" : "text-muted-foreground"}`}
        >
          {invalid && <AlertCircle className="h-3.5 w-3.5" />}
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.997 10.997 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 12.04c-.02-2.05 1.68-3.04 1.76-3.09-.96-1.4-2.45-1.6-2.98-1.62-1.27-.13-2.48.75-3.12.75-.65 0-1.64-.73-2.7-.71-1.39.02-2.68.81-3.4 2.06-1.45 2.51-.37 6.22 1.04 8.26.69.99 1.51 2.11 2.59 2.07 1.04-.04 1.43-.67 2.69-.67 1.26 0 1.6.67 2.7.65 1.12-.02 1.83-1.01 2.51-2.01.79-1.16 1.12-2.28 1.14-2.34-.02-.01-2.19-.84-2.21-3.34zM15.04 5.92c.57-.69.95-1.65.85-2.6-.82.03-1.81.54-2.4 1.23-.53.61-.99 1.59-.87 2.52.91.07 1.85-.46 2.42-1.15z"/>
    </svg>
  );
}

