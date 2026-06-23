import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Check, AlertTriangle, Trash2, Copy, ChevronDown } from "lucide-react";
import {
  listProposedEntries,
  listDomains,
  findDuplicates,
  updateEntry,
  setEntryStatus,
  deleteEntry,
  type DictEntry,
  type DuplicateCandidate,
} from "@/lib/dict-review.functions";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dictionary-review")({
  head: () => ({
    meta: [
      { title: "Revue du dictionnaire — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const listFn = useServerFn(listProposedEntries);
  const domainsFn = useServerFn(listDomains);

  const [items, setItems] = useState<DictEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [domains, setDomains] = useState<{ domain: string; count: number }[]>([]);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 25;

  async function refresh() {
    setLoading(true);
    try {
      const [res, ds] = await Promise.all([
        listFn({ data: { search, domain, limit, offset } }),
        domainsFn(),
      ]);
      setItems(res.items);
      setTotal(res.total);
      setDomains(ds);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, offset, domain]);

  if (adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Accès refusé</h1>
        <p className="mt-2 text-muted-foreground">
          Cette page est réservée aux administrateurs.
        </p>
        <Link to="/dictionary" className="mt-6 inline-block underline">
          Retour au dictionnaire
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold">Revue du dictionnaire</h1>
        <p className="text-sm text-muted-foreground">
          <strong>{total}</strong> entrées proposées à valider, corriger ou marquer comme doublons.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setOffset(0);
            void refresh();
          }}
          className="flex flex-1 gap-2"
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (pulaar ou français)…"
            maxLength={80}
          />
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rechercher"}
          </Button>
        </form>
        <select
          value={domain}
          onChange={(e) => {
            setDomain(e.target.value);
            setOffset(0);
          }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Tous domaines</option>
          {domains.map((d) => (
            <option key={d.domain} value={d.domain}>
              {d.domain} ({d.count})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {items.map((entry) => (
          <EntryReviewCard key={entry.id} entry={entry} onChanged={refresh} />
        ))}
        {items.length === 0 && !loading && (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Aucune entrée à relire avec ces filtres.
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Button
          variant="outline"
          disabled={offset === 0 || loading}
          onClick={() => setOffset(Math.max(0, offset - limit))}
        >
          ← Précédent
        </Button>
        <span className="text-muted-foreground">
          {offset + 1}–{Math.min(offset + limit, total)} sur {total}
        </span>
        <Button
          variant="outline"
          disabled={offset + limit >= total || loading}
          onClick={() => setOffset(offset + limit)}
        >
          Suivant →
        </Button>
      </div>
    </div>
  );
}

function EntryReviewCard({ entry, onChanged }: { entry: DictEntry; onChanged: () => void }) {
  const updateFn = useServerFn(updateEntry);
  const statusFn = useServerFn(setEntryStatus);
  const deleteFn = useServerFn(deleteEntry);
  const dupesFn = useServerFn(findDuplicates);

  const [form, setForm] = useState(entry);
  const [busy, setBusy] = useState(false);
  const [dupes, setDupes] = useState<DuplicateCandidate[] | null>(null);
  const [showDupes, setShowDupes] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(entry),
    [form, entry],
  );

  function set<K extends keyof DictEntry>(k: K, v: DictEntry[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(thenStatus?: "valide" | "incertain") {
    setBusy(true);
    try {
      if (dirty) {
        await updateFn({
          data: {
            id: form.id,
            headword: form.headword,
            pos: form.pos as never,
            domain: form.domain,
            french: form.french,
            english: form.english,
            arabic: form.arabic,
            pronunciation_ipa: form.pronunciation_ipa,
            variant_fouta_tooro: form.variant_fouta_tooro,
            variant_maasina: form.variant_maasina,
            variant_fouta_jallon: form.variant_fouta_jallon,
            variant_adamaawa: form.variant_adamaawa,
            example_pulaar: form.example_pulaar,
            example_french: form.example_french,
            notes: form.notes,
          },
        });
      }
      if (thenStatus) {
        await statusFn({ data: { id: form.id, status: thenStatus } });
        toast.success(thenStatus === "valide" ? "Validée ✓" : "Marquée incertaine");
      } else {
        toast.success("Enregistré");
      }
      onChanged();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Supprimer définitivement « ${form.headword} » ?`)) return;
    setBusy(true);
    try {
      await deleteFn({ data: { id: form.id } });
      toast.success("Supprimée");
      onChanged();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function toggleDupes() {
    if (dupes === null) {
      try {
        const res = await dupesFn({ data: { entryId: entry.id } });
        setDupes(res);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Erreur");
        return;
      }
    }
    setShowDupes((v) => !v);
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-mono">{form.pos}</Badge>
        <Badge variant="secondary">{form.domain}</Badge>
        <Badge variant="outline">{form.origin}</Badge>
        {form.sources?.map((s) => (
          <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground">{form.id.slice(0, 8)}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Pulaar (lemme)">
          <Input value={form.headword} onChange={(e) => set("headword", e.target.value)} />
        </Field>
        <Field label="Français">
          <Input value={form.french} onChange={(e) => set("french", e.target.value)} />
        </Field>
        <Field label="Anglais">
          <Input
            value={form.english ?? ""}
            onChange={(e) => set("english", e.target.value)}
            placeholder="—"
          />
        </Field>
        <Field label="Arabe">
          <Input
            value={form.arabic ?? ""}
            onChange={(e) => set("arabic", e.target.value)}
            placeholder="—"
            dir="rtl"
          />
        </Field>
        <Field label="Domaine / catégorie">
          <Input value={form.domain} onChange={(e) => set("domain", e.target.value)} />
        </Field>
        <Field label="Partie du discours">
          <select
            value={form.pos}
            onChange={(e) => set("pos", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {[
              "nom","verbe","adjectif","adverbe","pronom","interjection",
              "expression","proverbe","conjonction","preposition","determinant","numeral",
            ].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Variante Fouta Tooro">
          <Input value={form.variant_fouta_tooro ?? ""} onChange={(e) => set("variant_fouta_tooro", e.target.value)} />
        </Field>
        <Field label="Variante Maasina">
          <Input value={form.variant_maasina ?? ""} onChange={(e) => set("variant_maasina", e.target.value)} />
        </Field>
        <Field label="Variante Fouta Jallon">
          <Input value={form.variant_fouta_jallon ?? ""} onChange={(e) => set("variant_fouta_jallon", e.target.value)} />
        </Field>
        <Field label="Variante Adamaawa">
          <Input value={form.variant_adamaawa ?? ""} onChange={(e) => set("variant_adamaawa", e.target.value)} />
        </Field>
        <Field label="Exemple Pulaar" className="sm:col-span-2">
          <Textarea
            value={form.example_pulaar ?? ""}
            onChange={(e) => set("example_pulaar", e.target.value)}
            rows={2}
          />
        </Field>
        <Field label="Exemple français" className="sm:col-span-2">
          <Textarea
            value={form.example_french ?? ""}
            onChange={(e) => set("example_french", e.target.value)}
            rows={2}
          />
        </Field>
        <Field label="Notes (relecteur)" className="sm:col-span-2">
          <Textarea
            value={form.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            placeholder="Doute, source, observation…"
          />
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={() => save("valide")} disabled={busy} className="gap-1.5">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Valider
        </Button>
        <Button variant="outline" onClick={() => save()} disabled={busy || !dirty}>
          Enregistrer
        </Button>
        <Button variant="outline" onClick={() => save("incertain")} disabled={busy} className="gap-1.5">
          <AlertTriangle className="h-4 w-4" /> Incertain
        </Button>
        <Button variant="ghost" onClick={toggleDupes} disabled={busy} className="gap-1.5">
          <Copy className="h-4 w-4" /> Doublons
          <ChevronDown className={`h-3.5 w-3.5 transition ${showDupes ? "rotate-180" : ""}`} />
        </Button>
        <Button variant="ghost" onClick={remove} disabled={busy} className="ml-auto gap-1.5 text-destructive">
          <Trash2 className="h-4 w-4" /> Supprimer
        </Button>
      </div>

      {showDupes && (
        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
          {dupes && dupes.length > 0 ? (
            <>
              <p className="mb-2 font-medium">
                {dupes.length} entrée(s) avec le même lemme :
              </p>
              <ul className="space-y-1.5">
                {dupes.map((d) => (
                  <li key={d.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{d.status}</Badge>
                    <span className="font-display italic">{d.headword}</span>
                    <span className="text-muted-foreground">— {d.french}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{d.domain}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Si l'entrée courante est redondante, supprime-la. Sinon, garde-la et précise la différence dans les notes.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Aucun doublon détecté pour ce lemme.</p>
          )}
        </div>
      )}
    </article>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
