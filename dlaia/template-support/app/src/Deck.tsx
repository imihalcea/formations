import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Maximize, Minimize, Presentation, StickyNote, Timer } from "lucide-react";
import deck from "virtual:deck";
import { ScaledSlide } from "./SlideView";
import { TpPage } from "./TpPage";
import { CartePage } from "./Carte";

const { slides, sections, tps } = deck;
const total = slides.length;
const clamp = (k: number) => Math.min(Math.max(0, k), total - 1);
const indexFromHash = () => clamp((parseInt(location.hash.slice(1), 10) || 1) - 1);
// L'URL désigne une slide (#12), une page de TP (#tp-03) ou la carte mentale (#carte).
const tpFromHash = () => tps.find((t) => `#${t.id}` === location.hash);
const carteIndex = slides.findIndex((s) => s.kind === "carte");
const carteSlide = slides[carteIndex];
const carteFromHash = () => carteIndex >= 0 && location.hash === "#carte";
const label = (k: number) => slides[k]!.title || slides[k]!.kicker || sections[slides[k]!.section]!.title;

// La vue présentateur est la même page ouverte avec ?vue=presentateur. Les deux fenêtres
// se synchronisent par postMessage, qui fonctionne aussi quand le support est ouvert en file://.
const presenter = new URLSearchParams(location.search).get("vue") === "presentateur";
type Msg = { type: "deck-goto"; index: number };

export function Deck() {
  const [i, setI] = useState(() => tpFromHash()?.slideIndex ?? (carteFromHash() ? carteIndex : indexFromHash()));
  const [tpId, setTpId] = useState(() => tpFromHash()?.id ?? null);
  const [carteOpen, setCarteOpen] = useState(carteFromHash);
  const [notes, setNotes] = useState(false);
  const [grid, setGrid] = useState(false);
  const [fs, setFs] = useState(false);
  const peer = useRef<Window | null>(presenter ? window.opener : null);
  const touchX = useRef<number | null>(null);
  const elapsed = useElapsed();

  const show = useCallback((k: number) => {
    setI(k);
    setTpId(null);
    setCarteOpen(false);
    history.replaceState(null, "", `#${k + 1}`);
  }, []);

  const go = useCallback(
    (k: number) => {
      const next = clamp(k);
      show(next);
      const p = peer.current;
      if (p && !p.closed) p.postMessage({ type: "deck-goto", index: next } satisfies Msg, "*");
    },
    [show],
  );

  const openPresenter = () => {
    const url = `${location.href.split(/[?#]/)[0]}?vue=presentateur#${i + 1}`;
    peer.current = window.open(url, "presentateur");
  };

  useEffect(() => {
    const onMessage = (e: MessageEvent<Msg>) => {
      if (e.data?.type === "deck-goto") show(clamp(e.data.index));
    };
    const onHash = () => {
      if (carteFromHash()) {
        setCarteOpen(true);
        setTpId(null);
        setI(carteIndex);
        setGrid(false);
        return;
      }
      const tp = tpFromHash();
      if (!tp) return show(indexFromHash());
      setTpId(tp.id);
      setCarteOpen(false);
      setI(tp.slideIndex);
      setGrid(false);
    };
    const onFs = () => setFs(!!document.fullscreenElement);
    window.addEventListener("message", onMessage);
    window.addEventListener("hashchange", onHash);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [show]);

  const tp = presenter ? undefined : tps.find((t) => t.id === tpId);
  const carte = !presenter && carteOpen && carteSlide?.kind === "carte" ? carteSlide.carte : undefined;
  const openTp = (id: string) => (location.hash = id);
  const closeTp = () => (location.hash = String(i + 1));

  useEffect(() => {
    document.title = tp ? tp.title : carte ? "Carte mentale" : `${i + 1}/${total} · ${label(i)}`;
  }, [i, tp, carte]);

  const toggleFs = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();
      // Sur une page de TP, les flèches et l'espace font défiler la page ; sur la carte, elles la parcourent.
      if (tp || carte) {
        if (key === "escape") closeTp();
        return;
      }
      if (["arrowright", "pagedown", " "].includes(key)) { e.preventDefault(); go(i + 1); }
      else if (["arrowleft", "pageup"].includes(key)) go(i - 1);
      else if (key === "home") go(0);
      else if (key === "end") go(total - 1);
      else if (key === "n" && !presenter) setNotes((v) => !v);
      else if (key === "g" && !presenter) setGrid((v) => !v);
      else if (key === "p" && !presenter) openPresenter();
      else if (key === "f") toggleFs();
      else if (key === "escape") setGrid(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const s = slides[i]!;
  const sectionOf = (k: number) => sections[slides[k]!.section]!;
  const slide = (k: number) => <ScaledSlide slide={slides[k]!} index={k} total={total} section={sectionOf(k)} />;

  if (presenter) {
    return (
      <div className="flex h-screen flex-col gap-4 bg-deck p-4 text-deck-foreground font-sans">
        <div className="flex min-h-0 flex-[3] gap-4">
          <div className="min-w-0 flex-[2] overflow-hidden rounded-xl shadow-deck">{slide(i)}</div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <p className="text-[11px] uppercase tracking-widest opacity-50">Ensuite</p>
            <div className="aspect-video overflow-hidden rounded-md opacity-80">
              {i < total - 1 ? slide(i + 1) : <div className="h-full bg-deck-muted" />}
            </div>
            <p className="font-mono text-5xl tabular-nums">{elapsed.text}</p>
            <p className="font-mono text-xl tabular-nums opacity-70">{i + 1} / {total}</p>
            <button onClick={elapsed.reset} className="self-start text-sm underline opacity-60 hover:opacity-100">
              Remettre le chronomètre à zéro
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-[2] overflow-auto border-t border-deck-muted pt-4">
          <p className="mb-2 text-[11px] uppercase tracking-widest text-slide-accent">Notes d'animation</p>
          <div className="notes-md max-w-5xl text-2xl leading-relaxed" dangerouslySetInnerHTML={{ __html: s.notesHtml }} />
        </div>
      </div>
    );
  }

  // Slides de débrief d'une section : de la première à la dernière slide de kicker « Débrief ».
  const debrief = (k: number): [number, number] | undefined => {
    const marked = slides.flatMap((x, n) => (x.section === k && x.kicker === "Débrief" ? [n] : []));
    return marked.length ? [marked[0]!, marked.at(-1)!] : undefined;
  };
  const progress = ((i + 1) / total) * 100;
  return (
    <div className="flex h-screen flex-col bg-deck text-deck-foreground font-sans">
      <div className="h-1 w-full bg-deck-muted">
        <div className="h-full bg-slide-accent transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-6 py-3 text-xs">
        {sections.map((sec, k) => (
          <Fragment key={k}>
            <button
              title={sec.title}
              onClick={() => go(slides.findIndex((x) => x.section === k))}
              className={`flex items-center gap-2 whitespace-nowrap transition-opacity ${k === s.section ? "opacity-100" : k < s.section ? "opacity-60" : "opacity-30"} hover:opacity-100`}
            >
              <span className={`h-2 w-2 rounded-full ${k <= s.section ? "bg-slide-accent" : "bg-deck-muted"}`} />
              {sec.number ? (k === s.section ? `${sec.number} ${sec.title}` : sec.number) : sec.title}
            </button>
            {k === s.section &&
              tps.filter((t) => t.section === k).map((t, n, all) => (
                <button
                  key={t.id}
                  title={t.title}
                  onClick={() => openTp(t.id)}
                  className={`rounded-full border px-2.5 py-0.5 font-mono transition-colors ${tpId === t.id ? "border-slide-accent bg-slide-accent text-slide-paper" : "border-slide-accent text-slide-accent hover:bg-slide-accent/10"}`}
                >
                  {all.length > 1 ? (/^TP \S+(?= :)/.exec(t.title)?.[0] ?? `TP ${n + 1}`) : "TP"}
                </button>
              ))}
            {k === s.section && k === carteSlide?.section && (
              <button
                title="Carte mentale"
                onClick={() => (location.hash = "carte")}
                className={`rounded-full border px-2.5 py-0.5 font-mono transition-colors ${carte ? "border-slide-accent bg-slide-accent text-slide-paper" : "border-slide-accent text-slide-accent hover:bg-slide-accent/10"}`}
              >
                Carte
              </button>
            )}
            {k === s.section && debrief(k) && (
              <button
                title="Débrief"
                onClick={() => go(debrief(k)![0])}
                className={`rounded-full border px-2.5 py-0.5 font-mono transition-colors ${!tp && i >= debrief(k)![0] && i <= debrief(k)![1] ? "border-slide-accent bg-slide-accent text-slide-paper" : "border-slide-accent text-slide-accent hover:bg-slide-accent/10"}`}
              >
                Débrief
              </button>
            )}
          </Fragment>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <button title="Remettre à zéro" onClick={elapsed.reset} className="mr-3 flex items-center gap-1.5 tabular-nums opacity-70">
            <Timer className="h-3.5 w-3.5" />{elapsed.text}
          </button>
          <IconBtn label="Précédent (←)" onClick={() => go(i - 1)}><ChevronLeft className="h-4 w-4" /></IconBtn>
          <IconBtn label="Suivant (→)" onClick={() => go(i + 1)}><ChevronRight className="h-4 w-4" /></IconBtn>
          <IconBtn label="Vue d'ensemble (G)" active={grid} onClick={() => setGrid((v) => !v)}><LayoutGrid className="h-4 w-4" /></IconBtn>
          <IconBtn label="Notes (N)" active={notes} onClick={() => setNotes((v) => !v)}><StickyNote className="h-4 w-4" /></IconBtn>
          <IconBtn label="Vue présentateur (P)" onClick={openPresenter}><Presentation className="h-4 w-4" /></IconBtn>
          <IconBtn label="Plein écran (F)" onClick={toggleFs}>{fs ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}</IconBtn>
        </div>
      </div>

      {tp ? (
        <TpPage key={tp.id} tp={tp} section={sections[tp.section]!} onBack={closeTp} />
      ) : carte ? (
        <CartePage carte={carte} onBack={closeTp} />
      ) : grid ? (
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {slides.map((_, k) => (
              <button
                key={k}
                onClick={() => { go(k); setGrid(false); }}
                className={`rounded-lg p-1 text-left ${k === i ? "ring-2 ring-slide-accent" : "hover:ring-1 hover:ring-deck-muted"}`}
              >
                <div className="aspect-video overflow-hidden rounded-md">{slide(k)}</div>
                <p className="mt-2 px-1 text-xs opacity-70">{k + 1}. {label(k)}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="flex-1 px-6 pb-4"
          onTouchStart={(e) => (touchX.current = e.touches[0]!.clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0]!.clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1);
            touchX.current = null;
          }}
        >
          <div className="h-full overflow-hidden rounded-xl shadow-deck">{slide(i)}</div>
        </div>
      )}

      {notes && !grid && !tp && !carte && (
        <div className="flex gap-6 border-t border-deck-muted px-6 py-4">
          <div className="flex-1">
            <p className="mb-1 text-[11px] uppercase tracking-widest text-slide-accent">Notes d'animation</p>
            <div className="notes-md max-w-4xl text-sm leading-relaxed opacity-85" dangerouslySetInnerHTML={{ __html: s.notesHtml }} />
          </div>
          {i < total - 1 && (
            <div className="hidden w-56 shrink-0 md:block">
              <p className="mb-1 text-[11px] uppercase tracking-widest opacity-50">Ensuite</p>
              <div className="aspect-video overflow-hidden rounded-md opacity-80">{slide(i + 1)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Chronomètre de séance, conservé au rechargement de la page tant que l'onglet reste ouvert.
function useElapsed() {
  const [start, setStart] = useState(() => {
    try {
      return Number(sessionStorage.getItem("deck-start")) || Date.now();
    } catch {
      return Date.now();
    }
  });
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    try {
      sessionStorage.setItem("deck-start", String(start));
    } catch {
      /* stockage indisponible : le chronomètre repart à zéro au rechargement */
    }
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [start]);
  const s = Math.max(0, Math.floor((now - start) / 1000));
  const hh = Math.floor(s / 3600);
  const mm = String(Math.floor(s / 60) % 60).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return { text: hh ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`, reset: () => setStart(Date.now()) };
}

function IconBtn({ children, label, onClick, active }: { children: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`rounded-md p-2 transition-colors hover:bg-deck-muted ${active ? "text-slide-accent" : ""}`}
    >
      {children}
    </button>
  );
}
