import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Section, Slide, SlideKind } from "./types";
import { addCopyButtons } from "./copy";
import { CartePreview } from "./Carte";

export const TOOL_LABELS = { claude: "Claude Code", opencode: "Open Code" };

// Slides d'impact : une ou deux lignes centrées verticalement. Les autres types
// ancrent leur contenu en haut, sous un en-tête compact, et exploitent toute la hauteur.
const IMPACT = new Set<SlideKind>(["title", "module-title", "statement", "figure", "quote", "end"]);
const DARK = new Set<SlideKind>(["module-title", "statement", "end"]);
const CONTENT_WIDTH = 1920 - 2 * 120;

const pad = (n: number) => String(n).padStart(2, "0");
const Html = ({ html, className }: { html: string; className?: string }) => (
  <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
);
const InlineHtml = ({ html, className }: { html: string; className?: string }) => (
  <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
);

type Props = { slide: Slide; index: number; total: number; section: Section };

// Rend la slide sur un canevas fixe de 1920×1080 mis à l'échelle de son conteneur.
export function ScaledSlide(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(Math.min(el.clientWidth / 1920, el.clientHeight / 1080));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: 1920, height: 1080, marginLeft: -960, marginTop: -540, transform: `scale(${scale})` }}
      >
        <SlideContent {...props} />
      </div>
    </div>
  );
}

function SlideContent({ slide, index, total, section }: Props) {
  const impact = IMPACT.has(slide.kind);
  const body = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);

  // En développement, signale le contenu coupé par le canevas fixe.
  useLayoutEffect(() => {
    if (!import.meta.env.DEV || !body.current) return;
    const el = body.current;
    const over = el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
    setOverflow(over);
    if (over) console.warn(`Contenu qui déborde : ${slide.origin}`);
  }, [slide]);

  useEffect(() => {
    if (body.current) addCopyButtons(body.current);
  }, [slide]);

  return (
    <div
      className={`slide-content flex flex-col ${impact ? "px-[160px] pt-[120px] pb-[64px]" : "px-[120px] pt-[72px] pb-[56px]"} ${DARK.has(slide.kind) ? "bg-slide-ink text-slide-paper" : "bg-slide-paper text-slide-ink"}`}
      style={overflow ? { outline: "12px solid red", outlineOffset: -12 } : undefined}
    >
      {impact ? (
        <div ref={body} className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden">
          {slide.kicker && <p className="slide-kicker mb-10 text-slide-accent">{slide.kicker}</p>}
          <ImpactBody slide={slide} />
        </div>
      ) : (
        <>
          <header className="flex items-end justify-between gap-16 border-b-2 border-slide-ink/10 pb-8">
            <div>
              {slide.kicker && <p className="slide-kicker mb-4 text-slide-accent">{slide.kicker}</p>}
              <h2 className="slide-heading font-display" dangerouslySetInnerHTML={{ __html: slide.titleHtml }} />
            </div>
            {slide.kind === "tp" && slide.duration && (
              <div className="slide-body shrink-0 rounded-full bg-slide-accent px-10 py-4 text-slide-paper">{slide.duration}</div>
            )}
          </header>
          <div ref={body} className="mt-12 flex min-h-0 flex-1 flex-col overflow-hidden">
            <ContentBody slide={slide} />
          </div>
        </>
      )}
      {slide.sourcesHtml.length > 0 && (
        <p className="slide-caption mt-8 italic opacity-55">
          {slide.sourcesHtml.length > 1 ? "Sources : " : "Source : "}
          {slide.sourcesHtml.map((s, i) => (
            <span key={i}>
              {i > 0 && " · "}
              <InlineHtml html={s} />
            </span>
          ))}
        </p>
      )}
      <div className="slide-footer mt-8 flex items-center justify-between opacity-50">
        <span>{section.number ? `${section.number} · ${section.title}` : section.title}</span>
        <span className="slide-page tabular-nums">{pad(index + 1)} / {pad(total)}</span>
      </div>
    </div>
  );
}

function ImpactBody({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case "title":
    case "module-title":
      return (
        <>
          <h1 className="slide-title-lg font-display max-w-[1400px]" dangerouslySetInnerHTML={{ __html: slide.titleHtml }} />
          {slide.subtitleHtml && <InlineHtml html={slide.subtitleHtml} className="slide-subtitle mt-10 block opacity-60" />}
          <div className="mt-16 h-2 w-40 bg-slide-accent" />
        </>
      );
    case "statement":
      // Une idée clé d'une dizaine de mots tient sur deux lignes : corps plus petit que slide-title, lignes équilibrées.
      return <h2 className="slide-statement font-display max-w-[1600px]" dangerouslySetInnerHTML={{ __html: slide.titleHtml }} />;
    case "figure":
      return (
        <>
          <p className="font-display text-slide-accent" style={{ fontSize: 280, lineHeight: 1 }}>{slide.value}</p>
          <p className="slide-subtitle mt-10 max-w-[1100px]">{slide.title}</p>
        </>
      );
    case "quote":
      return (
        <>
          <blockquote className="slide-title font-display italic max-w-[1500px]">
            « <InlineHtml html={slide.quoteHtml} /> »
          </blockquote>
          {slide.author && <p className="slide-body mt-12 opacity-60">{slide.author}</p>}
        </>
      );
    case "end":
      return (
        <>
          <h2 className="slide-title-lg font-display" style={{ fontSize: 180 }} dangerouslySetInnerHTML={{ __html: slide.titleHtml }} />
          {slide.subtitleHtml && <InlineHtml html={slide.subtitleHtml} className="slide-body-lg mt-10 block opacity-60" />}
        </>
      );
    default:
      return null;
  }
}

// Une slide dont le corps est un schéma seul (une image, aucun autre paragraphe) le centre verticalement.
const figureOnly = (html: string) => /^\s*<p>\s*<(svg|img)\b/.test(html) && (html.match(/<p\b/g) ?? []).length === 1;

function Columns({ columns, after }: { columns: string[]; after: string | undefined }) {
  if (columns.length === 1) return <Html html={columns[0]!} className={figureOnly(columns[0]!) ? "slide-md my-auto" : "slide-md"} />;
  return (
    <>
      <div className="grid grid-cols-2 gap-20">
        {columns.map((c, i) => <Html key={i} html={c} className="slide-md min-w-0" />)}
      </div>
      {after && <Html html={after} className="slide-md mt-12" />}
    </>
  );
}

function ContentBody({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case "content":
      return <Columns columns={slide.columns} after={slide.afterHtml} />;
    case "tp":
      return (
        <div className="grid grid-cols-2 gap-20">
          <div className="min-w-0">
            <Html html={slide.introHtml} className="slide-md" />
            <a
              href={`#${slide.tpId}`}
              className="slide-body mt-14 inline-flex items-center gap-6 rounded-full bg-slide-accent px-12 py-5 text-slide-paper no-underline!"
            >
              Ouvrir l'énoncé →
            </a>
          </div>
          <ol className="min-w-0 border-t-4 border-slide-accent pt-7">
            {slide.stepTitles.map((t, i) => (
              // Au-delà de sept étapes, des lignes plus serrées gardent la liste dans la slide.
              <li key={i} className={`slide-body flex items-baseline gap-8 ${slide.stepTitles.length > 7 ? "py-1.5" : "py-4"}`}>
                <span className="slide-caption font-mono font-semibold text-slide-accent tabular-nums">{pad(slide.optionalFirst ? i : i + 1)}</span>
                <InlineHtml html={t} />
                {slide.optionalFirst && i === 0 && <span className="slide-caption text-slide-accent">(optionnel)</span>}
              </li>
            ))}
          </ol>
        </div>
      );
    case "agenda":
      return (
        // Remplit la colonne de gauche, puis celle de droite, pour une lecture dans l'ordre des modules.
        <div
          className="grid grid-flow-col grid-cols-2 gap-x-24 gap-y-10"
          style={{ gridTemplateRows: `repeat(${Math.ceil(slide.modules.length / 2)}, auto)` }}
        >
          {slide.modules.map((m) => (
            <div key={m.number} className="flex items-baseline gap-8 border-t-4 border-slide-ink pt-5">
              <span className="slide-caption font-mono font-semibold text-slide-accent tabular-nums">{m.number}</span>
              <span className="slide-body">{m.title}</span>
            </div>
          ))}
        </div>
      );
    case "facts":
      return (
        <div className="grid grid-cols-2 gap-x-24 gap-y-14">
          {slide.facts.map((f, i) => (
            <div key={i} className="border-t-4 border-slide-accent pt-7">
              {f.termHtml && <InlineHtml html={f.termHtml} className="slide-heading font-display block text-slide-accent" />}
              <InlineHtml html={f.textHtml} className={f.termHtml ? "slide-body mt-5 block opacity-80" : "slide-body"} />
            </div>
          ))}
        </div>
      );
    case "figures": {
      const cols = slide.stats.length;
      const gap = 64;
      const width = (CONTENT_WIDTH - gap * (cols - 1)) / cols;
      const base = cols === 5 ? 150 : cols === 4 ? 210 : 280;
      // Réduit la taille d'une valeur longue pour qu'elle tienne dans sa colonne, avec une marge (≈ 0,6 em par chiffre, compté 0,7).
      const size = (v: string) => Math.min(base, Math.floor(width / (v.length * 0.7)));
      return (
        <>
          <div className={`grid ${cols === 3 ? "grid-cols-3" : cols === 4 ? "grid-cols-4" : "grid-cols-5"}`} style={{ gap }}>
            {slide.stats.map((st, i) => (
              <div key={i} className="border-t-4 border-slide-accent pt-8">
                <p className="font-display text-slide-accent" style={{ fontSize: size(st.value), lineHeight: 1 }}>{st.value}</p>
                <InlineHtml html={st.labelHtml} className="slide-body mt-8 block" />
              </div>
            ))}
          </div>
          {slide.remarkHtml && <InlineHtml html={slide.remarkHtml} className="slide-body mt-16 block border-l-8 border-slide-accent pl-10" />}
        </>
      );
    }
    case "compare":
      return (
        <div className="grid grid-cols-2 gap-20">
          {([["claude", slide.claudeHtml], ["opencode", slide.opencodeHtml]] as const).map(([tool, html]) => (
            <div key={tool} className="min-w-0 border-t-4 border-slide-accent pt-7">
              <p className="slide-kicker mb-8 text-slide-accent">{TOOL_LABELS[tool]}</p>
              <Html html={html} className="slide-md" />
            </div>
          ))}
        </div>
      );
    case "carte":
      return <CartePreview carte={slide.carte} />;
    default:
      return null;
  }
}
