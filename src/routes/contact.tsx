import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Send,
  User,
} from "lucide-react";
import { motion } from "framer-motion";

import { SiteHeader, SiteFooter } from "@/components/layout";
import { Eyebrow } from "@/components/eyebrow";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/reveal";
import { SocialLinks } from "@/components/social-links";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import awMansourPhoto from "@/assets/aw-mansour.jpeg.asset.json";

export const Route = createFileRoute("/contact")({
  ssr: false,
  head: () => {
    const l = getCurrentLang();
    return {
      meta: [
        { title: tFor(l, "seo./contact.title") },
        { name: "description", content: tFor(l, "seo./contact.desc") },
        { property: "og:title", content: tFor(l, "seo./contact.title") },
        { property: "og:description", content: tFor(l, "seo./contact.desc") },
        { property: "og:url", content: "https://fulania.com/contact" },
      ],
      links: [
        { rel: "canonical", href: "https://fulania.com/contact" },
      ],
    };
  },
  component: ContactPage,
});

function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = encodeURIComponent(
      `Nom: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    window.open(
      `mailto:awmedmansour@outlook.com?subject=${encodeURIComponent(form.subject)}&body=${body}`,
      "_blank"
    );
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero contact */}
      <section className="relative overflow-hidden bg-earth py-20 text-cream sm:py-24">
        <div className="absolute inset-0 bg-dot-gold opacity-[0.06] mix-blend-screen" aria-hidden />
        <div className="pointer-events-none absolute -right-24 top-1/4 h-[24rem] w-[24rem] rounded-full bg-[var(--gold)]/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-primary/25 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-cream/70 transition hover:text-[var(--gold)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("contact.backHome")}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-3xl"
          >
            <Eyebrow tone="gold">{t("contact.porter")}</Eyebrow>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-balance sm:text-5xl lg:text-6xl">
              {t("contact.callTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream/80">
              {t("contact.callBody")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Fiche de contact */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Colonne infos / fondateur */}
            <div className="lg:col-span-5">
              <Reveal>
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-earth/90 to-earth">
                    <img
                      src={awMansourPhoto.url}
                      alt={t("author.name")}
                      loading="lazy"
                      className="h-full w-full object-cover object-top [filter:grayscale(0.45)_sepia(0.15)_contrast(1.02)]"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-earth/90 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h2 className="font-display text-2xl font-semibold text-foreground">
                      {t("author.name")}
                    </h2>
                    <p className="mt-1 text-sm font-medium uppercase tracking-wider text-primary">
                      {t("contact.founderRole")}
                    </p>
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {t("contact.bio")}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <StaggerGroup className="mt-6 space-y-3">
                  <StaggerItem>
                    <a
                      href="mailto:awmedmansour@outlook.com"
                      className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("contact.email")}</p>
                        <p className="font-medium text-foreground">awmedmansour@outlook.com</p>
                      </div>
                    </a>
                  </StaggerItem>

                  <StaggerItem>
                    <a
                      href="tel:+22232256718"
                      className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("contact.phone")}</p>
                        <p className="font-medium text-foreground">+222 32 25 67 18</p>
                      </div>
                    </a>
                  </StaggerItem>

                  <StaggerItem>
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("contact.address")}</p>
                        <p className="font-medium text-foreground">{t("contact.location")}</p>
                      </div>
                    </div>
                  </StaggerItem>
                </StaggerGroup>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="mt-8">
                  <p className="mb-3 text-sm font-medium text-foreground">{t("contact.follow")}</p>
                  <SocialLinks variant="light" />
                </div>
              </Reveal>
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-7">
              <Reveal>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                  <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                    {t("contact.formTitle")}
                  </h2>
                  <p className="mt-2 text-muted-foreground">{t("contact.formBody")}</p>

                  {submitted ? (
                    <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
                      <p className="font-medium text-foreground">{t("contact.sentThanks")}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t("contact.sentOpen")}</p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        {t("contact.sendAgain")}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium text-foreground">
                            {t("contact.name")}
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                              id="name"
                              type="text"
                              required
                              value={form.name}
                              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pl-10 text-sm text-foreground outline-none ring-ring transition focus:border-primary focus:ring-2"
                              placeholder={t("contact.namePlaceholder")}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium text-foreground">
                            {t("contact.email")}
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                              id="email"
                              type="email"
                              required
                              value={form.email}
                              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pl-10 text-sm text-foreground outline-none ring-ring transition focus:border-primary focus:ring-2"
                              placeholder={t("contact.emailPlaceholder")}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium text-foreground">
                          {t("contact.subject")}
                        </label>
                        <input
                          id="subject"
                          type="text"
                          required
                          value={form.subject}
                          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition focus:border-primary focus:ring-2"
                          placeholder={t("contact.subjectPlaceholder")}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-foreground">
                          {t("contact.message")}
                        </label>
                        <textarea
                          id="message"
                          required
                          rows={5}
                          value={form.message}
                          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition focus:border-primary focus:ring-2"
                          placeholder={t("contact.messagePlaceholder")}
                        />
                      </div>

                      <button
                        type="submit"
                        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md sm:w-auto"
                      >
                        {t("contact.send")}
                        <Send className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </button>
                    </form>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* CTA assistant */}
      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
              {t("contact.tryAi")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t("contact.ctaBody")}</p>
            <Link
              to="/chat"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-earth px-8 py-4 text-sm font-semibold text-cream shadow-sm transition hover:-translate-y-0.5 hover:bg-earth/90"
            >
              {t("btn.chat")}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
