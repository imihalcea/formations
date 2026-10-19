import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronsDownUp, ChevronsUpDown, Minus, Plus, Scan, Search } from "lucide-react";
import type { Carte, CarteConcept } from "./types";
import { TOOL_LABELS } from "./SlideView";

// Arbre de la carte : formation (0), modules (1), sections (2), concepts (3).
type TreeNode = {
  id: string;
  depth: 0 | 1 | 2 | 3;
  label: string;
  number?: string;
  children: TreeNode[];
  parent?: TreeNode;
  concept?: CarteConcept;
};

type Tree = { root: TreeNode; byId: Map<string, TreeNode>; all: TreeNode[] };

function buildTree(carte: Carte): Tree {
  const root: TreeNode = { id: "root", depth: 0, label: carte.title, children: [] };
  for (const m of carte.modules) {
    const mod: TreeNode = { id: m.id, depth: 1, label: m.title, number: m.number, children: [], parent: root };
    root.children.push(mod);
    for (const s of m.sections) {
      const sec: TreeNode = { id: s.id, depth: 2, label: s.title, children: [], parent: mod };
      mod.children.push(sec);
      for (const c of s.concepts) sec.children.push({ id: c.id, depth: 3, label: c.name, children: [], parent: sec, concept: c });
    }
  }
  const all: TreeNode[] = [];
  const walk = (n: TreeNode) => {
    all.push(n);
    n.children.forEach(walk);
  };
  walk(root);
  return { root, byId: new Map(all.map((n) => [n.id, n])), all };
}

const ancestors = (n: TreeNode | undefined) => {
  const out: TreeNode[] = [];
  for (let p = n; p; p = p.parent) out.push(p);
  return out;
};
const conceptCount = (n: TreeNode): number => (n.concept ? 1 : n.children.reduce((sum, c) => sum + conceptCount(c), 0));
const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// Typographie par niveau, en unités du SVG : polices et graisses de la charte.
const FONT = [
  { size: 22, weight: 500, family: "Space Grotesk" },
  { size: 18, weight: 500, family: "Space Grotesk" },
  { size: 15, weight: 600, family: "Inter" },
  { size: 14, weight: 400, family: "Inter" },
] as const;
const NUMBER_FONT = { size: 14, weight: 600, family: "IBM Plex Mono" };
const ROW = 30;
const ROOT_PAD = 16;
const HANDLE = 14;
const COL_GAP = 64;
// Espace ajouté après le groupe d'enfants d'un nœud, selon la profondeur de ce nœud.
const GROUP_GAP = [0, 16, 8, 0];

let canvas: HTMLCanvasElement | undefined;
function textWidth(text: string, font: { size: number; weight: number; family: string }) {
  canvas ??= document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `${font.weight} ${font.size}px "${font.family}"`;
  return ctx.measureText(text).width;
}

function labelWidth(n: TreeNode) {
  const w = textWidth(n.label, FONT[n.depth]);
  if (n.depth === 0) return w + 2 * ROOT_PAD;
  if (n.number) return textWidth(n.number, NUMBER_FONT) + 10 + w;
  return w;
}

type Pos = { x: number; y: number };
type Layout = { pos: Map<string, Pos>; visible: TreeNode[]; height: number };

// Arbre horizontal : une colonne par niveau, chaque feuille visible sur sa ligne,
// chaque parent centré sur ses enfants visibles.
function layout(tree: Tree, expanded: Set<string>, widths: Map<string, number>, maxDepth = 3): Layout {
  const colX = [0];
  for (let d = 0; d < 3; d++) {
    const max = Math.max(...tree.all.filter((n) => n.depth === d).map((n) => widths.get(n.id)!));
    colX.push(colX[d]! + max + HANDLE + COL_GAP);
  }
  const pos = new Map<string, Pos>();
  const visible: TreeNode[] = [];
  let cursor = 0;
  const place = (n: TreeNode): number => {
    visible.push(n);
    const kids = n.depth < maxDepth && expanded.has(n.id) ? n.children : [];
    let y: number;
    if (kids.length === 0) {
      y = cursor;
      cursor += ROW;
    } else {
      const ys = kids.map(place);
      y = (ys[0]! + ys.at(-1)!) / 2;
      cursor += GROUP_GAP[n.depth]!;
    }
    pos.set(n.id, { x: colX[n.depth]!, y });
    return y;
  };
  place(tree.root);
  return { pos, visible, height: cursor };
}

function useWidths(tree: Tree) {
  // Les polices viennent de Google Fonts : les largeurs sont remesurées une fois chargées.
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => live && setFontsReady(true));
    return () => {
      live = false;
    };
  }, []);
  return useMemo(() => new Map(tree.all.map((n) => [n.id, labelWidth(n)])), [tree, fontsReady]);
}

const edgePath = (a: Pos, b: Pos) => {
  const mx = (a.x + b.x) / 2;
  return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
};

type MapProps = {
  tree: Tree;
  lay: Layout;
  widths: Map<string, number>;
  expanded: Set<string>;
  selected?: TreeNode;
  matches?: Set<string>;
  showCounts?: boolean;
  onNode?: (n: TreeNode) => void;
};

// Dessin de l'arbre : liens parent-enfant, liens transverses en pointillés, puis les nœuds.
function MapSvg({ tree, lay, widths, expanded, selected, matches, showCounts, onNode }: MapProps) {
  const path = new Set(ancestors(selected).map((n) => n.id));
  const right = (n: TreeNode) => {
    const p = lay.pos.get(n.id)!;
    return { x: p.x + widths.get(n.id)! + HANDLE, y: p.y };
  };
  const voir: { a: TreeNode; b: TreeNode }[] = [];
  const seen = new Set<string>();
  for (const n of lay.visible) {
    for (const id of n.concept?.voir ?? []) {
      const key = [n.id, id].sort().join("|");
      if (lay.pos.has(id) && !seen.has(key)) {
        seen.add(key);
        voir.push({ a: n, b: tree.byId.get(id)! });
      }
    }
  }
  return (
    <>
      {lay.visible.slice(1).map((n) => {
        const p = lay.pos.get(n.id)!;
        return <path key={n.id} className={`edge ${path.has(n.id) ? "on" : ""}`} d={edgePath(right(n.parent!), { x: p.x - 8, y: p.y })} />;
      })}
      {voir.map(({ a, b }) => {
        const pa = lay.pos.get(a.id)!;
        const pb = lay.pos.get(b.id)!;
        const xa = pa.x + widths.get(a.id)! + 6;
        const xb = pb.x + widths.get(b.id)! + 6;
        const bulge = Math.max(xa, xb) + 40 + Math.min(160, Math.abs(pa.y - pb.y) / 4);
        const on = selected && (selected.id === a.id || selected.id === b.id);
        return <path key={`${a.id}-${b.id}`} className={`voir ${on ? "on" : ""}`} d={`M${xa},${pa.y} C${bulge},${pa.y} ${bulge},${pb.y} ${xb},${pb.y}`} />;
      })}
      {lay.visible.map((n) => {
        const p = lay.pos.get(n.id)!;
        const w = widths.get(n.id)!;
        const font = FONT[n.depth];
        const open = expanded.has(n.id);
        const cls = `node ${path.has(n.id) && n.depth > 0 ? "on" : ""} ${matches?.has(n.id) ? "match" : ""}`;
        return (
          <g
            key={n.id}
            className={cls}
            onClick={onNode && (() => onNode(n))}
            role={onNode ? "treeitem" : undefined}
            aria-label={n.label}
            aria-selected={onNode ? selected?.id === n.id : undefined}
            aria-expanded={onNode && n.children.length ? open : undefined}
          >
            <rect className="hit" x={p.x - 8} y={p.y - ROW / 2} width={w + 16 + (n.children.length ? HANDLE : 0)} height={ROW} />
            {selected?.id === n.id && n.depth > 0 && <rect className="sel" x={p.x - 8} y={p.y - 13} width={w + 16} height={26} rx={5} />}
            {n.depth === 0 ? (
              <>
                <rect className="root-box" x={p.x} y={p.y - 21} width={w} height={42} rx={6} />
                <text className="root-label display" x={p.x + ROOT_PAD} y={p.y} dominantBaseline="central" fontSize={font.size} fontWeight={font.weight}>
                  {n.label}
                </text>
              </>
            ) : (
              <text className={`label ${n.depth === 1 ? "display" : ""}`} x={p.x} y={p.y} dominantBaseline="central" fontSize={font.size} fontWeight={font.weight}>
                {n.number && <tspan className="num" fontSize={NUMBER_FONT.size}>{n.number}</tspan>}
                <tspan dx={n.number ? 10 : 0}>{n.label}</tspan>
              </text>
            )}
            {showCounts && n.depth === 1 && (
              <text className="count" x={p.x + w + 2 * HANDLE} y={p.y} dominantBaseline="central" fontSize={13}>
                {conceptCount(n)} concepts
              </text>
            )}
            {n.children.length > 0 && !showCounts && (
              <circle className={`handle ${open ? "" : "closed"}`} cx={p.x + w + HANDLE} cy={p.y} r={5} />
            )}
          </g>
        );
      })}
    </>
  );
}

// Aperçu de la slide : la formation et ses modules, repliés, avec le nombre de concepts.
export function CartePreview({ carte }: { carte: Carte }) {
  const tree = useMemo(() => buildTree(carte), [carte]);
  const widths = useWidths(tree);
  const expanded = useMemo(() => new Set(["root"]), []);
  const lay = layout(tree, expanded, widths, 1);
  const width = Math.max(...lay.visible.map((n) => lay.pos.get(n.id)!.x + widths.get(n.id)!)) + 140;
  return (
    <a href="#carte" className="flex min-h-0 flex-1 flex-col no-underline!" aria-label="Ouvrir la carte mentale">
      <svg className="carte-svg min-h-0 w-full flex-1" viewBox={`-4 -24 ${width} ${lay.height + 18}`} preserveAspectRatio="xMinYMid meet">
        <MapSvg tree={tree} lay={lay} widths={widths} expanded={expanded} showCounts />
      </svg>
      <span className="slide-body mt-10 inline-flex w-fit items-center gap-6 rounded-full bg-slide-accent px-12 py-5 text-slide-paper">
        Ouvrir la carte →
      </span>
    </a>
  );
}

type View = { x: number; y: number; k: number };
type Saved = { expanded: string[]; selected: string };
const STORE = "carte-etat";
const PANEL = 400;

function loadSaved(tree: Tree): Saved | undefined {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE) ?? "null") as Saved | null;
    return saved && tree.byId.has(saved.selected) ? saved : undefined;
  } catch {
    return undefined;
  }
}

// Page de la carte, hors du canevas des slides : déplier, zoomer, chercher, parcourir au clavier.
export function CartePage({ carte, onBack }: { carte: Carte; onBack: () => void }) {
  const tree = useMemo(() => buildTree(carte), [carte]);
  const widths = useWidths(tree);
  const saved = useMemo(() => loadSaved(tree), [tree]);
  const [expanded, setExpanded] = useState(() => new Set(saved?.expanded ?? ["root"]));
  const [selectedId, setSelectedId] = useState(saved?.selected ?? "root");
  const [view, setView] = useState<View>({ x: 40, y: 300, k: 1 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const drag = useRef<{ x: number; y: number; view: View; moved: boolean } | null>(null);
  const moved = useRef(false);

  const selected = tree.byId.get(selectedId) ?? tree.root;
  const lay = layout(tree, expanded, widths);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify({ expanded: [...expanded], selected: selectedId } satisfies Saved));
    } catch {
      /* stockage indisponible : la carte repart repliée */
    }
  }, [expanded, selectedId]);

  const mapWidth = () => Math.max(200, size.w - (size.w > 900 ? PANEL + 32 : 0));
  const fit = (l: Layout) => {
    const right = Math.max(...l.visible.map((n) => l.pos.get(n.id)!.x + widths.get(n.id)!)) + 60;
    const w = mapWidth();
    const k = Math.min(1.4, Math.max(0.15, Math.min((w - 80) / right, (size.h - 80) / (l.height + 20))));
    setView({ k, x: (w - right * k) / 2, y: (size.h - (l.height - ROW) * k) / 2 });
  };
  const centerOn = (l: Layout, id: string, k = view.k) => {
    const p = l.pos.get(id)!;
    setView({ k, x: mapWidth() / 2 - (p.x + widths.get(id)! / 2) * k, y: size.h / 2 - p.y * k });
  };
  // Garde un nœud à l'écran : recentre seulement s'il sort de la zone visible.
  const keepVisible = (l: Layout, id: string) => {
    const p = l.pos.get(id)!;
    const sx = view.x + p.x * view.k;
    const sy = view.y + p.y * view.k;
    const ex = view.x + (p.x + widths.get(id)!) * view.k;
    if (sx < 20 || ex > mapWidth() - 20 || sy < 40 || sy > size.h - 40) centerOn(l, id);
  };

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Premier affichage, puis chargement des polices : la carte entière, ou le nœud mémorisé.
  const ready = size.w > 0;
  useLayoutEffect(() => {
    if (!ready) return;
    if (selectedId === "root") fit(lay);
    else centerOn(lay, selectedId, 1);
  }, [ready, widths]);

  useEffect(() => {
    box.current?.focus();
  }, []);

  // Déplie ou replie un nœud sans le déplacer à l'écran.
  const toggle = (n: TreeNode, open = !expanded.has(n.id)) => {
    if (!n.children.length) return;
    const next = new Set(expanded);
    if (open) next.add(n.id);
    else next.delete(n.id);
    const nextLay = layout(tree, next, widths);
    const dy = (lay.pos.get(n.id)!.y - nextLay.pos.get(n.id)!.y) * view.k;
    setExpanded(next);
    setView((v) => ({ ...v, y: v.y + dy }));
  };
  const select = (n: TreeNode) => {
    setSelectedId(n.id);
    keepVisible(lay, n.id);
  };
  // Déplie le chemin d'un nœud, le sélectionne et le centre.
  const reveal = (n: TreeNode) => {
    const next = new Set(expanded);
    for (const a of ancestors(n).slice(n.children.length ? 0 : 1)) next.add(a.id);
    const nextLay = layout(tree, next, widths);
    setExpanded(next);
    setSelectedId(n.id);
    centerOn(nextLay, n.id, Math.max(view.k, 0.8));
  };
  const setAll = (open: boolean) => {
    const next = new Set(open ? tree.all.filter((n) => n.children.length).map((n) => n.id) : ["root"]);
    const nextLay = layout(tree, next, widths);
    setExpanded(next);
    if (!open) {
      setSelectedId(ancestors(selected).find((a) => a.depth <= 1)!.id);
      return fit(nextLay);
    }
    // Dépliée, la carte entière ne tient pas lisiblement à l'écran : taille réelle, la colonne
    // des modules au bord gauche, à hauteur du module sélectionné ou du premier.
    const mod = ancestors(selected).find((n) => n.depth === 1) ?? tree.root.children[0]!;
    const p = nextLay.pos.get(mod.id)!;
    setView({ k: 1, x: 32 - p.x, y: size.h / 2 - p.y });
  };
  const zoom = (factor: number, cx = mapWidth() / 2, cy = size.h / 2) =>
    setView((v) => {
      const k = Math.min(3, Math.max(0.15, v.k * factor));
      return { k, x: cx - ((cx - v.x) * k) / v.k, y: cy - ((cy - v.y) * k) / v.k };
    });

  // La molette zoome autour du pointeur ; l'écouteur est actif pour pouvoir bloquer le défilement.
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoom(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  const onNode = (n: TreeNode) => {
    if (moved.current) return;
    setSelectedId(n.id);
    if (n.children.length) toggle(n);
  };

  const openSlide = (c: CarteConcept) => {
    if (c.slide !== undefined) location.hash = String(c.slide + 1);
  };

  // Le clavier parcourt la carte depuis toute la page, sauf dans le champ de recherche
  // et pour Entrée ou Espace sur un bouton de la barre d'outils.
  const onKey = (e: React.KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t.tagName === "INPUT" || (t.tagName === "BUTTON" && (e.key === "Enter" || e.key === " "))) return;
    const k = lay.visible.indexOf(selected);
    const step = (to: TreeNode | undefined) => {
      e.preventDefault();
      if (to) select(to);
    };
    switch (e.key) {
      case "ArrowDown":
        return step(lay.visible[k + 1]);
      case "ArrowUp":
        return step(lay.visible[k - 1]);
      case "Home":
        return step(lay.visible[0]);
      case "End":
        return step(lay.visible.at(-1));
      case "ArrowRight":
        e.preventDefault();
        if (!selected.children.length) return;
        return expanded.has(selected.id) ? select(selected.children[0]!) : toggle(selected, true);
      case "ArrowLeft":
        e.preventDefault();
        return expanded.has(selected.id) && selected.children.length ? toggle(selected, false) : selected.parent && select(selected.parent);
      case "Enter":
        e.preventDefault();
        return selected.concept ? openSlide(selected.concept) : toggle(selected);
      case "/":
        e.preventDefault();
        return search.current?.focus();
      case "+":
      case "=":
        return zoom(1.25);
      case "-":
        return zoom(0.8);
      case "0":
        return fit(lay);
    }
  };

  const q = normalize(query.trim());
  const results = q ? tree.all.filter((n) => n.depth > 0 && normalize(n.label).includes(q)).slice(0, 8) : [];
  const matches = new Set(q ? tree.all.filter((n) => n.depth > 0 && normalize(n.label).includes(q)).map((n) => n.id) : []);
  const choose = (n: TreeNode) => {
    reveal(n);
    setQuery("");
    box.current?.focus();
  };
  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, results.length - 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
    else if (e.key === "Enter" && results[active]) choose(results[active]);
    else if (e.key === "Escape") {
      // Échap vide la recherche sans quitter la carte.
      e.stopPropagation();
      setQuery("");
      box.current?.focus();
    } else return;
    e.preventDefault();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slide-paper text-slide-ink" onKeyDown={onKey}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-deck-muted px-4 py-2.5 text-sm">
        <button onClick={onBack} className="flex items-center gap-1.5 opacity-70 hover:opacity-100">
          <ArrowLeft className="h-4 w-4" /> Slides
        </button>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-slide-accent">Carte mentale</p>
        <div className="relative ml-auto w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          <input
            ref={search}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onSearchKey}
            placeholder="Chercher un concept (/)"
            aria-label="Chercher un concept"
            className="w-full rounded-full border border-deck-muted bg-slide-paper py-1.5 pl-8 pr-3 outline-none focus:border-slide-accent"
          />
          {q && (
            <ul className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-deck-muted bg-slide-paper shadow-deck">
              {results.length === 0 && <li className="px-3 py-2 opacity-60">Aucun concept</li>}
              {results.map((n, k) => (
                <li key={n.id}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(n)}
                    className={`flex w-full items-baseline gap-2 px-3 py-1.5 text-left ${k === active ? "bg-deck" : ""}`}
                  >
                    <span className="font-mono text-[11px] text-slide-accent">{ancestors(n).find((a) => a.depth === 1)!.number}</span>
                    <span>{n.label}</span>
                    {n.depth < 3 && <span className="ml-auto text-xs opacity-50">{n.depth === 1 ? "module" : "section"}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center">
          <ToolBtn label="Tout déplier" onClick={() => setAll(true)}><ChevronsUpDown className="h-4 w-4" /></ToolBtn>
          <ToolBtn label="Tout replier" onClick={() => setAll(false)}><ChevronsDownUp className="h-4 w-4" /></ToolBtn>
          <ToolBtn label="Zoom arrière (−)" onClick={() => zoom(0.8)}><Minus className="h-4 w-4" /></ToolBtn>
          <ToolBtn label="Zoom avant (+)" onClick={() => zoom(1.25)}><Plus className="h-4 w-4" /></ToolBtn>
          <ToolBtn label="Ajuster à la fenêtre (0)" onClick={() => fit(lay)}><Scan className="h-4 w-4" /></ToolBtn>
        </div>
      </div>

      <div
        ref={box}
        tabIndex={0}
        role="tree"
        aria-label={carte.title}
        className="relative min-h-0 flex-1 overflow-hidden outline-none"
      >
        <svg
          ref={svg}
          className={`carte-svg h-full w-full ${drag.current?.moved ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            moved.current = false;
            drag.current = { x: e.clientX, y: e.clientY, view, moved: false };
            box.current?.focus();
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const dx = e.clientX - d.x;
            const dy = e.clientY - d.y;
            if (!d.moved && Math.hypot(dx, dy) < 4) return;
            if (!d.moved) e.currentTarget.setPointerCapture(e.pointerId);
            d.moved = moved.current = true;
            setView({ ...d.view, x: d.view.x + dx, y: d.view.y + dy });
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
            <MapSvg tree={tree} lay={lay} widths={widths} expanded={expanded} selected={selected} matches={matches} onNode={onNode} />
          </g>
        </svg>

        <p className="pointer-events-none absolute bottom-3 left-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs opacity-60">
          <span className="flex items-center gap-1.5">
            <svg width="28" height="6" aria-hidden="true"><path d="M0 3H28" stroke="var(--slide-accent)" strokeWidth="1.5" strokeDasharray="4 4" /></svg>
            Lien transverse
          </span>
          <span>Flèches : parcourir · Entrée : ouvrir la slide · Molette : zoom · Glisser : déplacer</span>
        </p>

        <Panel node={selected} tree={tree} onPick={reveal} onOpen={openSlide} />
      </div>
    </div>
  );
}

function Panel({ node, tree, onPick, onOpen }: { node: TreeNode; tree: Tree; onPick: (n: TreeNode) => void; onOpen: (c: CarteConcept) => void }) {
  const c = node.concept;
  const module = ancestors(node).find((a) => a.depth === 1);
  const kicker = node.depth === 0 ? "Formation" : node.depth === 1 ? `Module ${node.number}` : `Module ${module!.number} · ${node.depth === 3 ? node.parent!.label : "Section"}`;
  return (
    <aside
      aria-live="polite"
      className="absolute bottom-4 right-4 top-4 flex w-[400px] max-w-[calc(100%-2rem)] flex-col overflow-auto border-t-4 border-slide-accent bg-slide-paper p-6 shadow-deck"
    >
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slide-accent">{kicker}</p>
      <h2 className="mt-3 font-display text-2xl leading-snug">{node.label}</h2>
      {c ? (
        <>
          <p className="carte-md mt-4" dangerouslySetInnerHTML={{ __html: c.definitionHtml }} />
          {c.outils && (
            <dl className="mt-6 space-y-3 border-t border-deck-muted pt-4">
              {([["claude", c.outils.claudeHtml], ["opencode", c.outils.opencodeHtml]] as const).map(([tool, html]) => (
                <div key={tool}>
                  <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slide-accent">{TOOL_LABELS[tool]}</dt>
                  <dd className="carte-md mt-1" dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              ))}
            </dl>
          )}
          {c.voir.length > 0 && (
            <div className="mt-6 border-t border-deck-muted pt-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60">Voir aussi</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {c.voir.map((id) => (
                  <button key={id} onClick={() => onPick(tree.byId.get(id)!)} className="rounded-full border border-dashed border-slide-accent px-3 py-1 text-sm text-slide-accent hover:bg-slide-accent/10">
                    {tree.byId.get(id)!.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {c.slide !== undefined && (
            <button onClick={() => onOpen(c)} className="mt-auto self-start rounded-full bg-slide-accent px-5 py-2 text-sm text-slide-paper">
              Ouvrir la slide {c.slide + 1} →
            </button>
          )}
        </>
      ) : (
        <ul className="mt-5 space-y-1 border-t border-deck-muted pt-4">
          {node.children.map((n) => (
            <li key={n.id}>
              <button onClick={() => onPick(n)} className="flex w-full items-baseline gap-3 rounded px-1 py-1 text-left hover:bg-deck">
                {n.number && <span className="font-mono text-xs font-semibold text-slide-accent">{n.number}</span>}
                <span>{n.label}</span>
                {!n.concept && <span className="ml-auto text-xs tabular-nums opacity-50">{conceptCount(n)}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function ToolBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button title={label} aria-label={label} onClick={onClick} className="rounded-md p-2 transition-colors hover:bg-deck">
      {children}
    </button>
  );
}
