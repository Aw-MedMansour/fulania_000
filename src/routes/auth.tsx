import { BrandLogo } from "@/components/brand-logo";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  Loader2,
  User,
  Lock,
  Sparkles,
  ShieldCheck,
  Languages,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import portraitImg from "@/assets/culture-portrait.jpg";
import patternImg from "@/assets/pattern.jpg";

/* ───────── Validation ─────────
 * Identifier: 3–32 chars, letters/digits/._-, no spaces.
 * Maps to a synthetic email behind the scenes (Supabase requires email).
 */
const ID_DOMAIN = "id.fulania.local";

const idSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Au moins 3 caractères")
  .max(32, "Au plus 32 caractères")
  .regex(/^[a-z0-9._-]+$/, "Lettres, chiffres, . _ - uniquement");

const passwordSchema = z
  .string()
  .min(8, "Au moins 8 caractères")
  .max(72, "Mot de passe trop long")
  .regex(/[A-Za-z]/, "Doit contenir une lettre")
  .regex(/[0-9]/, "Doit contenir un chiffre");

const idToEmail = (id: string) => `${id.trim().toLowerCase()}@${ID_DOMAIN}`;

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { next?: string } => ({
    next:
      typeof s.next === "string" && s.next.startsWith("/") && !s.next.startsWith("//")
        ? s.next
        : undefined,
  }),
  head: () => {
    const l = getCurrentLang();
    return {
      meta: [
        { title: tFor(l, "seo./auth.title") },
        { name: "description", content: tFor(l, "seo./auth.desc") },
        { property: "og:title", content: tFor(l, "seo./auth.title") },
        { property: "og:description", content: tFor(l, "seo./auth.desc") },
        { property: "og:url", content: "https://fulania.com/auth" },
      ],
    };
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const { t } = useLanguage();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // After successful auth (or "continue without account"), go to `next` if
  // provided (the tool the user was trying to reach), else /hub. We use
  // `replace: true` so the auth page is not kept on the back stack.
  const destination = next ?? "/hub";
  const goNext = () => navigate({ to: destination as "/hub", replace: true });

  useEffect(() => {
    let active = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) goNext();
    });

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) goNext();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);

  const validate = (mode: "signin" | "signup"): boolean => {
    const i = idSchema.safeParse(identifier);
    setIdError(i.success ? null : i.error.issues[0]?.message ?? t("auth.err.idInvalid"));
    if (mode === "signup") {
      const p = passwordSchema.safeParse(password);
      setPwdError(p.success ? null : p.error.issues[0]?.message ?? t("auth.err.pwdInvalid"));
      const matches = password.length > 0 && password === confirmPwd;
      setConfirmError(matches ? null : t("auth.err.pwdMismatch"));
      return i.success && p.success && matches;
    }
    setPwdError(password.length === 0 ? t("auth.err.pwdRequired") : null);
    return i.success && password.length > 0;
  };

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate("signin")) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: idToEmail(identifier),
      password,
    });
    setLoading(false);
    if (error) {
      return toast.error(t("auth.err.badCreds"));
    }
    toast.success(t("auth.welcomeToast"));
    goNext();
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate("signup")) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: idToEmail(identifier),
      password,
      options: {
        // No email confirmation: accounts are username+password only.
        // auto_confirm_email is enabled on the backend so no email is sent.
        data: { username: identifier.trim().toLowerCase() },
      },
    });
    setLoading(false);
    if (error) {
      const msg = /registered|exists/i.test(error.message)
        ? t("auth.err.idTaken")
        : error.message;
      return toast.error(msg);
    }
    // Auto sign-in (auto_confirm is enabled)
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: idToEmail(identifier),
      password,
    });
    if (signInErr) return toast.error(signInErr.message);
    toast.success(t("auth.welcomeToast"));
    goNext();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "420px" }}
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT — Brand panel */}
        <aside className="relative hidden overflow-hidden bg-earth text-cream lg:flex lg:flex-col lg:justify-between">
          <img src={portraitImg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-br from-earth via-earth/90 to-earth/60" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "300px" }}
            aria-hidden
          />

          <div className="relative z-10 flex items-center gap-2.5 p-10">
            <Link to="/" className="group flex items-center gap-2.5">
              <BrandLogo size={40} withName={false} />
              <div className="flex flex-col leading-none">
                <span className="font-display text-xl font-semibold tracking-tight">FulanIA</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-cream/60">Pulaagu &amp; IA</span>
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
            <p className="mt-5 max-w-md text-cream/75">{t("auth.heroBody")}</p>

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

        {/* RIGHT — Form panel */}
        <main className="relative flex min-h-screen flex-col justify-between px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2.5" aria-label={t("auth.backHome")}>
              <BrandLogo size={36} />
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

            <Tabs
              value={tab}
              onValueChange={(v) => {
                setTab(v as "signin" | "signup");
                setIdError(null);
                setPwdError(null);
                setConfirmError(null);
              }}
            >
              <TabsList className="grid w-full grid-cols-2 bg-secondary/60">
                <TabsTrigger value="signin">{t("auth.tab.signin")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.tab.signup")}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={onSignIn} noValidate className="space-y-4 pt-5">
                  <IdField value={identifier} onChange={(v) => { setIdentifier(v); setIdError(null); }} error={idError} />
                  <PasswordField
                    id="auth-password"
                    label={t("auth.pwd.label")}
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
                  <IdField value={identifier} onChange={(v) => { setIdentifier(v); setIdError(null); }} error={idError} />
                  <PasswordField
                    id="auth-password"
                    label={t("auth.pwd.label")}
                    value={password}
                    onChange={(v) => { setPassword(v); setPwdError(null); }}
                    show={showPwd}
                    onToggle={() => setShowPwd((s) => !s)}
                    autoComplete="new-password"
                    error={pwdError}
                    hint={t("auth.pwd.hint")}
                  />
                  <PasswordField
                    id="auth-password-confirm"
                    label={t("auth.pwdConfirm.label")}
                    value={confirmPwd}
                    onChange={(v) => { setConfirmPwd(v); setConfirmError(null); }}
                    show={showPwd}
                    onToggle={() => setShowPwd((s) => !s)}
                    autoComplete="new-password"
                    error={confirmError}
                  />
                  <Button type="submit" disabled={loading} className="h-11 w-full gap-2 text-sm font-semibold">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("auth.signupBtn")} <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">{t("auth.terms")}</p>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t("auth.or")}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="h-11 w-full gap-2 text-sm font-medium"
              onClick={() => navigate({ to: destination as "/hub", replace: true })}
            >
              {t("auth.continueGuest")} <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {t("auth.guestHint")}
            </p>

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

function IdField({
  value, onChange, error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
}) {
  const { t } = useLanguage();
  const invalid = Boolean(error);
  return (
    <div className="space-y-1.5">
      <Label htmlFor="auth-id">{t("auth.id.label")}</Label>
      <div className="relative">
        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="auth-id"
          type="text"
          required
          autoComplete="username"
          inputMode="text"
          placeholder={t("auth.id.placeholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={error ? "auth-id-msg" : undefined}
          className={`h-11 pl-9 ${invalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />
      </div>
      {error ? (
        <p id="auth-id-msg" className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">{t("auth.id.hint")}</p>
      )}
    </div>
  );
}

function PasswordField({
  id, label, value, onChange, show, onToggle, autoComplete, hint, error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete: string;
  hint?: string;
  error?: string | null;
}) {
  const { t } = useLanguage();
  const invalid = Boolean(error);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          required
          minLength={8}
          autoComplete={autoComplete}
          placeholder="••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={`h-11 pl-9 pr-10 ${invalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? t("auth.pwdHide") : t("auth.pwdShow")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {(error || hint) && (
        <p
          id={`${id}-msg`}
          className={`flex items-center gap-1.5 text-xs ${invalid ? "text-destructive" : "text-muted-foreground"}`}
        >
          {invalid && <AlertCircle className="h-3.5 w-3.5" />}
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
