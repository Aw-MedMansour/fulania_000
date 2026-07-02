import { useState } from "react";
import { Mail, MapPin, Phone, Send, User } from "lucide-react";

import { Eyebrow } from "@/components/eyebrow";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/reveal";
import { SocialLinks } from "@/components/social-links";
import { useLanguage } from "@/hooks/use-language";

export function ContactSection() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
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
    <section id="contact" className="bg-secondary/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Colonne informations */}
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>{t("contact.callTag")}</Eyebrow>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
                {t("contact.callTitle")}
              </h2>
              <p className="mt-5 text-muted-foreground">
                {t("contact.callBody")}
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <StaggerGroup className="mt-8 space-y-3">
                <StaggerItem>
                  <a
                    href="mailto:awmedmansour@outlook.com"
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {t("contact.email")}
                      </p>
                      <p className="font-medium text-foreground">
                        awmedmansour@outlook.com
                      </p>
                    </div>
                  </a>
                </StaggerItem>

                <StaggerItem>
                  <a
                    href="tel:+213780306486"
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {t("contact.phone")}
                      </p>
                      <p className="font-medium text-foreground">
                        +213 780 30 64 86
                      </p>
                    </div>
                  </a>
                </StaggerItem>

                <StaggerItem>
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {t("contact.address")}
                      </p>
                      <p className="font-medium text-foreground">
                        {t("contact.location")}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              </StaggerGroup>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8">
                <p className="mb-3 text-sm font-medium text-foreground">
                  {t("contact.follow")}
                </p>
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
                <p className="mt-2 text-muted-foreground">
                  {t("contact.formBody")}
                </p>

                {submitted ? (
                  <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
                    <p className="font-medium text-foreground">
                      {t("contact.sentThanks")}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("contact.sentOpen")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      {t("contact.sendAgain")}
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-5"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="contact-name"
                          className="text-sm font-medium text-foreground"
                        >
                          {t("contact.name")}
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <input
                            id="contact-name"
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pl-10 text-sm text-foreground outline-none ring-ring transition focus:border-primary focus:ring-2"
                            placeholder={t("contact.namePlaceholder")}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="contact-email"
                          className="text-sm font-medium text-foreground"
                        >
                          {t("contact.email")}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <input
                            id="contact-email"
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, email: e.target.value }))
                            }
                            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pl-10 text-sm text-foreground outline-none ring-ring transition focus:border-primary focus:ring-2"
                            placeholder={t("contact.emailPlaceholder")}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="contact-subject"
                        className="text-sm font-medium text-foreground"
                      >
                        {t("contact.subject")}
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        required
                        value={form.subject}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, subject: e.target.value }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition focus:border-primary focus:ring-2"
                        placeholder={t("contact.subjectPlaceholder")}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="contact-message"
                        className="text-sm font-medium text-foreground"
                      >
                        {t("contact.message")}
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, message: e.target.value }))
                        }
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
  );
}
