import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart, Check, Copy, Sparkles, Users, Code2, Megaphone, Database, LifeBuoy, Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import { SiteHeader, SiteFooter } from "@/components/layout";
import { Eyebrow } from "@/components/eyebrow";

export const Route = createFileRoute("/support")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Soutenez FulanIA — Faire un don" },
      {
        name: "description",
        content:
          "Aidez FulanIA à préserver et diffuser la langue pulaar. Bankily, Wave, Masrivi, Sedad, IBAN, PayPal.",
      },
      { property: "og:title", content: "Soutenez FulanIA" },
      { property: "og:description", content: "Faites un don pour soutenir la plateforme FulanIA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SupportPage,
});

type Method = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  href?: string;
};

const METHODS: Method[] = [
  { key: "bankily", label: "Bankily", value: "48524983", hint: "Mauritanie" },
  { key: "wave", label: "Wave", value: "+221 78 380 52 71", hint: "Sénégal", href: "https://wave.com" },
  { key: "masrivi", label: "Masrivi & Sedad", value: "42815162", hint: "Mauritanie" },
  { key: "iban", label: "IBAN", value: "RO81REVO0000174020020066", hint: "Revolut EUR" },
  { key: "paypal", label: "PayPal", value: "Awmedmansour@outlook.com", href: "https://paypal.me/awmedmansour" },
];

const IMPACT = [
  { icon: LifeBuoy, text: "Assurer la survie et la continuité du projet" },
  { icon: Code2, text: "Poursuivre le développement de la plateforme" },
  { icon: Users, text: "Recruter des professionnels en linguistique et informatique" },
  { icon: Megaphone, text: "Promouvoir et étendre le projet à toute la diaspora" },
  { icon: Database, text: "Financer les données et abonnements techniques" },
];

function CopyRow({ m }: { m: Method }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(m.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  return (
    <div className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-display text-sm font-semibold text-foreground">{m.label}</p>
          {m.hint && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              {m.hint}
            </span>
          )}
        </div>
        {m.href ? (
          <a
            href={m.href}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block truncate font-mono text-sm text-foreground/90 hover:text-primary"
          >
            {m.value}
          </a>
        ) : (
          <p className="mt-1 truncate font-mono text-sm text-foreground/90">{m.value}</p>
        )}
      </div>
      <button
        onClick={onCopy}
        className="inline-flex flex-none items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground/80 transition hover:bg-accent"
        aria-label={`Copier ${m.label}`}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        <span>{copied ? "Copié" : "Copier"}</span>
      </button>
    </div>
  );
}

function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-earth text-cream">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--gold) 0, transparent 40%), radial-gradient(circle at 80% 60%, var(--gold) 0, transparent 45%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-[var(--gold)]"
          >
            <Heart className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">Appel à soutien</span>
          </motion.div>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl">
            Soutenez FulanIA
          </h1>
          <p className="mt-5 max-w-2xl text-base text-cream/85 sm:text-lg">
            Notre équipe est essentiellement composée de jeunes étudiants engagés. Jusqu'à présent,
            nous n'avons compté que sur nos propres ressources. Le projet a atteint un stade où un
            soutien extérieur est devenu indispensable pour assurer sa pérennité et son
            développement.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#dons"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-earth shadow-sm transition hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" />
              Faire un don
            </a>
            <a
              href="mailto:contact.fulania@gmail.com"
              className="inline-flex items-center gap-2 rounded-xl border border-cream/30 px-5 py-3 text-sm font-semibold text-cream transition hover:bg-cream/10"
            >
              <Mail className="h-4 w-4" />
              Nous écrire
            </a>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Eyebrow>Votre impact</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-semibold text-balance sm:text-4xl">
          Ce que votre soutien permettra
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {IMPACT.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm leading-relaxed text-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Dons */}
      <section id="dons" className="bg-secondary/30 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Eyebrow>Coordonnées bancaires</Eyebrow>
              <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                Choisissez votre mode de contribution
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                Tous les moyens de paiement ci-dessous sont vérifiés et opérés par l'équipe FulanIA.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {METHODS.map((m) => (
              <CopyRow key={m.key} m={m} />
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            <p>
              Pour tout justificatif, reçu, ou question relative à un don :{" "}
              <a
                href="mailto:contact.fulania@gmail.com"
                className="font-medium text-primary hover:underline"
              >
                contact.fulania@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
