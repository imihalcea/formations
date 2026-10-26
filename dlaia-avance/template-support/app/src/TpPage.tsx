import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import type { Section, Tp, TpSegment } from "./types";
import { TOOL_LABELS } from "./SlideView";
import { addCopyButtons } from "./copy";

type Tool = "claude-code" | "opencode";
const TOOLS: { id: Tool; label: string }[] = [
  { id: "claude-code", label: TOOL_LABELS.claude },
  { id: "opencode", label: TOOL_LABELS.opencode },
];

// Préférences du stagiaire (outil, étapes faites), propres à son navigateur. La page est
// remontée pour chaque TP (key={tp.id}), la clé de stockage ne change donc pas en cours de vie.
// Le stockage peut être indisponible : la page fonctionne alors sans mémoire.
function useStored<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  const set = (v: T) => {
    setValue(v);
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* stockage indisponible */
    }
  };
  return [value, set];
}

export function TpPage({ tp, section, onBack }: { tp: Tp; section: Section; onBack: () => void }) {
  const [tool, setTool] = useStored<Tool>("tp-outil", "claude-code");
  const [done, setDone] = useStored<number[]>(`tp-fait-${tp.id}`, []);
  const page = useRef<HTMLDivElement>(null);

  // Ajoute un bouton de copie à chaque bloc de code affiché.
  useEffect(() => {
    if (page.current) addCopyButtons(page.current);
  });

  const toggle = (k: number) => setDone(done.includes(k) ? done.filter((d) => d !== k) : [...done, k]);
  const visible = (s: TpSegment) => s.kind !== "claude-code" && s.kind !== "opencode" ? true : s.kind === tool;

  return (
    <div ref={page} className="flex-1 overflow-auto bg-slide-paper text-slide-ink">
      <div className="sticky top-0 z-10 border-b border-deck-muted bg-slide-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
          <button onClick={onBack} className="flex items-center gap-1.5 opacity-70 hover:opacity-100">
            <ArrowLeft className="h-4 w-4" /> Slides
          </button>
          <span className="font-mono text-xs tabular-nums opacity-60">
            {done.length} / {tp.steps.length} étapes
          </span>
          <div className="ml-auto flex rounded-full border border-deck-muted p-0.5" role="radiogroup" aria-label="Outil">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                role="radio"
                aria-checked={tool === t.id}
                onClick={() => setTool(t.id)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${tool === t.id ? "bg-slide-accent text-slide-paper" : "hover:bg-deck"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 pb-24 pt-10">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-slide-accent">
          {section.number ? `Module ${section.number} · ` : ""}Démonstration
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-display text-4xl leading-tight tracking-tight">{tp.title}</h1>
          {tp.duration && <span className="shrink-0 rounded-full bg-slide-accent px-4 py-1.5 text-sm text-slide-paper">{tp.duration}</span>}
        </div>
        <div className="tp-md mt-6" dangerouslySetInnerHTML={{ __html: tp.introHtml }} />

        <ol className="mt-12 space-y-14">
          {tp.steps.map((step, k) => (
            <li key={k} className={`border-t-4 pt-6 ${done.includes(k) ? "border-deck-muted" : "border-slide-accent"}`}>
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-sm font-semibold text-slide-accent tabular-nums">{String(tp.optionalFirst ? k : k + 1).padStart(2, "0")}</span>
                <h2 className="tp-step-title font-display text-2xl leading-snug" dangerouslySetInnerHTML={{ __html: step.titleHtml }} />
                {tp.optionalFirst && k === 0 && <span className="shrink-0 rounded-full border border-slide-accent px-3 py-0.5 text-sm text-slide-accent">Optionnel</span>}
              </div>
              <div className="mt-4 space-y-5">
                {step.segments.filter(visible).map((s, i) => <Segment key={`${tool}-${i}`} segment={s} />)}
              </div>
              <label className="mt-6 flex w-fit cursor-pointer items-center gap-2 text-sm opacity-80">
                <input type="checkbox" checked={done.includes(k)} onChange={() => toggle(k)} className="h-4 w-4 accent-[var(--slide-accent)]" />
                Étape terminée
                {done.includes(k) && <Check className="h-4 w-4 text-slide-accent" />}
              </label>
            </li>
          ))}
        </ol>

        {tp.corrigeHtml && (
          <details className="tp-details mt-16 border-t-4 border-slide-ink pt-6">
            <summary className="font-display text-2xl">Corrigé</summary>
            <div className="tp-md mt-4" dangerouslySetInnerHTML={{ __html: tp.corrigeHtml }} />
          </details>
        )}
      </article>
    </div>
  );
}

function Segment({ segment }: { segment: TpSegment }) {
  const html = <div className="tp-md" dangerouslySetInnerHTML={{ __html: segment.html }} />;
  switch (segment.kind) {
    case "attendu":
      return (
        <div className="border-l-4 border-slide-accent bg-deck px-5 py-4">
          <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slide-accent">Résultat attendu</p>
          {html}
        </div>
      );
    case "indice":
      return (
        <details className="tp-details rounded-md border border-deck-muted px-5 py-3">
          <summary className="text-sm font-medium">Indice</summary>
          <div className="mt-3">{html}</div>
        </details>
      );
    default:
      return html;
  }
}
