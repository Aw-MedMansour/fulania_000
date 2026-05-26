import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, MessageSquare, Trash2, PanelLeftOpen, PanelLeftClose, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

export function ChatSidebar({
  user,
  open,
  onOpenChange,
  activeId,
  onSelect,
  onNew,
  refreshKey,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  refreshKey: number;
}) {
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("chat_conversations")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setItems((data as Conversation[]) ?? []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user, refreshKey]);

  async function remove(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Supprimer cette discussion ?")) return;
    await supabase.from("chat_conversations").delete().eq("id", id);
    setItems((arr) => arr.filter((c) => c.id !== id));
    if (activeId === id) onNew();
  }

  return (
    <>
      {/* Backdrop (mobile) */}
      {open && (
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-14 flex-none items-center justify-between border-b border-border px-3">
          <span className="font-display text-sm font-semibold">Discussions</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Fermer la barre latérale"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <button
            type="button"
            onClick={() => { onNew(); onOpenChange(false); }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nouvelle discussion
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {!user ? (
            <div className="m-2 rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              <p className="mb-3">Connectez-vous pour conserver votre historique de discussions.</p>
              <Link
                to="/auth"
                search={{ next: "/chat" }}
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
              >
                <LogIn className="h-3.5 w-3.5" /> Se connecter
              </Link>
            </div>
          ) : loading ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Aucune discussion pour le moment.</p>
          ) : (
            <ul className="space-y-1">
              {items.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => { onSelect(c.id); onOpenChange(false); }}
                    className={`group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                      activeId === c.id
                        ? "bg-primary/10 text-foreground"
                        : "text-foreground/80 hover:bg-accent"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5 flex-none text-muted-foreground" />
                    <span className="flex-1 truncate">{c.title}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => remove(c.id, e)}
                      className="rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ouvrir l'historique"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/80 text-foreground/80 backdrop-blur hover:bg-accent hover:text-foreground"
    >
      <PanelLeftOpen className="h-4 w-4" />
    </button>
  );
}
