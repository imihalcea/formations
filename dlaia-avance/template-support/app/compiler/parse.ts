import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import markdownit, { type MarkdownIt } from "markdown-it";
import { createHighlighter, type Highlighter } from "shiki";
import { CARTE_FILE, compileCarte } from "./carte.ts";
import type { Deck, Section, Slide, SlideKind, Tp, TpSegment, TpStep } from "../src/types.ts";

// Langages colorés dans les blocs de code. `console` désigne une session terminal
// (commande puis sortie) et reçoit le style terminal.
const LANGS = ["python", "bash", "console", "toml", "json", "yaml", "markdown", "diff", "gherkin"] as const;
const TERMINAL_LANGS = new Set(["console", "shellsession"]);
// Bloc ```prompt : texte à copier dans l'outil, sans coloration.
const PROMPT_LANG = "prompt";

const KINDS: SlideKind[] = [
  "title", "agenda", "content", "statement", "facts", "figure", "figures", "quote", "video", "compare", "end",
];
const ATTRS = new Set(["kicker", "value", "duration", "author", "days", "src", "start"]);
const CONTAINERS = new Set(["notes", "sources", "claude-code", "opencode"]);
// Une slide de ces types avance un fait chiffré ou cité : sa source est obligatoire.
const NEEDS_SOURCES = new Set<SlideKind>(["facts", "figure", "figures", "quote", "video"]);
const TP_CONTAINERS = new Set<string>(["claude-code", "opencode", "attendu", "indice"]);

const MIME: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".svg": "image/svg+xml", ".webp": "image/webp",
};

export class SupportError extends Error {}

type Line = { text: string; no: number };
type Block = { level: 1 | 2; title: string; kind: string | undefined; attrs: Record<string, string>; body: Line[]; origin: string };

let highlighter: Promise<Highlighter> | undefined;

export async function compileDeck(dir: string): Promise<Deck> {
  highlighter ??= createHighlighter({ themes: ["github-light", "github-dark"], langs: [...LANGS] });
  const md = createMarkdown(await highlighter);

  const files = readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
  if (files.length === 0) throw new SupportError(`Aucun fichier .md dans ${dir}`);

  const sections: Section[] = [];
  const slides: Slide[] = [];
  const tps: Tp[] = [];
  for (const file of files) {
    const m = /^(\d{2})-/.exec(file);
    if (!m) throw new SupportError(`${file} : le nom doit commencer par deux chiffres (01-…, 02-…)`);
    // 00 (ouverture) et 99 (clôture) ne sont pas des modules numérotés.
    const number = m[1] === "00" || m[1] === "99" ? undefined : m[1]!;
    const path = join(dir, file);
    const blocks = splitBlocks(readFileSync(path, "utf8"), file);
    const [head, ...rest] = blocks;
    if (!head || head.level !== 1) throw new SupportError(`${file} : le fichier doit commencer par un titre « # »`);
    const extra = rest.find((b) => b.level === 1);
    if (extra) throw new SupportError(`${extra.origin} : un seul titre « # » par fichier`);

    const section = sections.length;
    sections.push(number ? { number, title: head.title } : { title: head.title });
    const ctx = { md, env: { dir: dirname(resolve(path)) }, section };

    if (number) {
      slides.push(moduleTitle(head, number, ctx));
    } else if (contentOf(head.body).length > 0) {
      throw new SupportError(`${head.origin} : contenu inattendu sous le titre « # » d'un fichier non numéroté`);
    }
    let tpCount = 0;
    for (const b of rest) {
      if (b.kind !== "tp") {
        slides.push(buildSlide(b, ctx));
        continue;
      }
      if (!number) throw new SupportError(`${b.origin} : un TP appartient à un module numéroté`);
      tpCount++;
      const { slide, tp } = buildTp(b, ctx, `tp-${number}${tpCount > 1 ? `-${tpCount}` : ""}`, slides.length);
      slides.push(slide);
      tps.push(tp);
    }
  }

  const modules = sections.flatMap((s) => (s.number ? [{ number: s.number, title: s.title }] : []));
  for (const s of slides) if (s.kind === "agenda") s.modules = modules;

  // La carte mentale forme la dernière section, après la clôture : une slide qui ouvre la page de la carte.
  const cartePath = join(dir, CARTE_FILE);
  if (existsSync(cartePath)) {
    const carte = compileCarte(cartePath, sections, slides, md);
    slides.push({ section: sections.length, title: carte.title, titleHtml: md.utils.escapeHtml(carte.title), kicker: "Carte mentale", sourcesHtml: [], notesHtml: "", origin: `${CARTE_FILE}:1`, kind: "carte", carte });
    sections.push({ title: "Carte mentale" });
  }
  return { sections, slides, tps };
}

function createMarkdown(hl: Highlighter): MarkdownIt {
  const md: MarkdownIt = new markdownit({
    highlight(code, lang) {
      const name = lang || "text";
      if (name === PROMPT_LANG) return `<pre class="prompt"><code>${md.utils.escapeHtml(code)}</code></pre>`;
      const terminal = TERMINAL_LANGS.has(name);
      const html = hl.codeToHtml(code, {
        lang: hl.getLoadedLanguages().includes(name) ? name : "text",
        theme: terminal ? "github-dark" : "github-light",
      });
      return terminal ? html.replace('class="shiki', 'class="shiki terminal') : html;
    },
  });

  const link = md.renderer.rules["link_open"] ?? ((t, i, o, _e, self) => self.renderToken(t, i, o));
  md.renderer.rules["link_open"] = (tokens, idx, options, env, self) => {
    tokens[idx]!.attrSet("target", "_blank");
    tokens[idx]!.attrSet("rel", "noopener");
    return link(tokens, idx, options, env, self);
  };

  // Typographie française dans les titres : une espace insécable précède « ; », « : », « ? » et « ! »,
  // pour qu'une ponctuation double n'ouvre jamais une ligne. Actif quand env.nbsp est vrai (renderTitle).
  md.core.ruler.push("nbsp", (state) => {
    if (!state.env?.["nbsp"]) return;
    for (const token of state.tokens) {
      for (const child of token.children ?? []) {
        if (child.type === "text") child.content = child.content.replace(/ ([;:?!])/g, "\u00a0$1");
      }
    }
  });

  // ```python file="../tp/…/x.py" lines="10-25" : le bloc reprend le contenu d'un fichier,
  // par exemple un corrigé testé de tp/, au lieu d'en recopier le code.
  const fence = md.renderer.rules["fence"]!;
  md.renderer.rules["fence"] = (tokens, idx, options, env, self) => {
    const token = tokens[idx]!;
    const m = /\bfile="([^"]+)"/.exec(token.info);
    if (m) {
      if (token.content.trim()) throw new SupportError(`Bloc file="${m[1]}" : le bloc doit être vide`);
      const file = resolve(String(env?.["dir"]), m[1]!);
      let text: string;
      try {
        text = readFileSync(file, "utf8");
      } catch {
        throw new SupportError(`Fichier inclus introuvable : ${file}`);
      }
      const range = /\blines="(\d+)-(\d+)"/.exec(token.info);
      if (range) text = text.split("\n").slice(Number(range[1]) - 1, Number(range[2])).join("\n") + "\n";
      token.content = text;
      token.info = token.info.split(/\s+/)[0]!;
    }
    return fence(tokens, idx, options, env, self);
  };

  // Les images sont intégrées en data URI : le support généré tient en un seul fichier.
  const image = md.renderer.rules["image"]!;
  md.renderer.rules["image"] = (tokens, idx, options, env, self) => {
    const token = tokens[idx]!;
    const src = String(token.attrGet("src") ?? "");
    if (!/^(https?:|data:)/.test(src)) {
      const file = resolve(String(env?.["dir"]), src);
      const mime = MIME[extname(file).toLowerCase()];
      if (!mime) throw new SupportError(`Image ${src} : format non pris en charge`);
      let data: Buffer;
      try {
        data = readFileSync(file);
      } catch {
        throw new SupportError(`Image introuvable : ${file}`);
      }
      // Un SVG est inséré en ligne : il hérite des polices et des couleurs de la charte (var(--slide-accent)…).
      if (mime === "image/svg+xml") {
        const svg = data.toString("utf8").replace(/<\?xml[^>]*\?>\s*/, "").trim();
        const alt = md.utils.escapeHtml(token.content);
        return svg.replace(/^<svg\b/, `<svg role="img" aria-label="${alt}" class="slide-svg"`);
      }
      token.attrSet("src", `data:${mime};base64,${data.toString("base64")}`);
    }
    return image(tokens, idx, options, env, self);
  };
  return md;
}

// Découpe un fichier en blocs, un par titre « # » ou « ## » situé hors d'un bloc de code.
export function splitBlocks(text: string, file: string): Block[] {
  const blocks: Block[] = [];
  let fence: string | undefined;
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = { text: raw, no: i + 1 };
    const f = /^(`{3,}|~{3,})/.exec(raw)?.[1];
    if (f && (!fence || f.startsWith(fence))) fence = fence ? undefined : f;
    const h = fence || f ? null : /^(#{1,2})\s+(.+?)\s*$/.exec(raw);
    if (h) {
      blocks.push({ level: h[1]!.length as 1 | 2, ...parseHeading(h[2]!, `${file}:${line.no}`), body: [], origin: `${file}:${line.no}` });
    } else if (blocks.length > 0) {
      blocks.at(-1)!.body.push(line);
    } else if (raw.trim()) {
      throw new SupportError(`${file}:${line.no} : contenu avant le premier titre`);
    }
  });
  if (fence) throw new SupportError(`${file} : bloc de code non fermé`);
  return blocks;
}

// « Titre {.kind cle="valeur"} » : la classe donne le type de slide, les paires ses attributs.
function parseHeading(raw: string, origin: string) {
  const m = /^(.*?)\s*\{([^}]*)\}$/.exec(raw);
  const title = m ? m[1]! : raw;
  const attrs: Record<string, string> = {};
  let kind: string | undefined;
  if (m) {
    const rest = m[2]!.replace(/\.([\w-]+)|([\w-]+)=(?:"([^"]*)"|(\S+))/g, (_all, cls, key, quoted, bare) => {
      if (cls) {
        if (kind) throw new SupportError(`${origin} : un seul type par slide`);
        kind = cls;
      } else {
        if (!ATTRS.has(key)) throw new SupportError(`${origin} : attribut inconnu « ${key} »`);
        attrs[key] = quoted ?? bare;
      }
      return "";
    });
    if (rest.trim()) throw new SupportError(`${origin} : attributs illisibles « ${rest.trim()} »`);
  }
  return { title, kind, attrs };
}

// Sépare les conteneurs « ::: nom … ::: » du reste du corps.
function extractContainers(body: Line[], origin: string) {
  const containers = new Map<string, Line[]>();
  const rest: Line[] = [];
  let open: { name: string; lines: Line[]; no: number } | undefined;
  let fence: string | undefined;
  for (const line of body) {
    const f = /^(`{3,}|~{3,})/.exec(line.text)?.[1];
    if (f && (!fence || f.startsWith(fence))) fence = fence ? undefined : f;
    const c = fence || f ? null : /^:::\s*([\w-]*)\s*$/.exec(line.text);
    if (c && c[1]) {
      if (open) throw new SupportError(`${origin} (ligne ${line.no}) : conteneurs imbriqués`);
      if (!CONTAINERS.has(c[1])) throw new SupportError(`${origin} (ligne ${line.no}) : conteneur inconnu « ${c[1]} »`);
      if (containers.has(c[1])) throw new SupportError(`${origin} (ligne ${line.no}) : conteneur « ${c[1]} » en double`);
      open = { name: c[1], lines: [], no: line.no };
    } else if (c) {
      if (!open) throw new SupportError(`${origin} (ligne ${line.no}) : « ::: » fermant sans ouverture`);
      containers.set(open.name, open.lines);
      open = undefined;
    } else {
      (open ? open.lines : rest).push(line);
    }
  }
  if (open) throw new SupportError(`${origin} (ligne ${open.no}) : conteneur « ${open.name} » non fermé`);
  return { containers, rest };
}

type Ctx = { md: MarkdownIt; env: { dir: string }; section: number };

const join_ = (lines: Line[]) => lines.map((l) => l.text).join("\n").trim();
const contentOf = (lines: Line[]) => lines.filter((l) => l.text.trim());

// Titre de slide, idée clé ou titre d'étape : Markdown en ligne avec les espaces insécables de la règle nbsp.
function renderTitle(title: string, ctx: Ctx): string {
  return ctx.md.renderInline(title, { ...ctx.env, nbsp: true });
}

function common(b: Block, ctx: Ctx) {
  const { containers, rest } = extractContainers(b.body, b.origin);
  const sourcesHtml = contentOf(containers.get("sources") ?? []).map((l) => {
    const m = /^[-*]\s+(.+)$/.exec(l.text.trim());
    if (!m) throw new SupportError(`${b.origin} (ligne ${l.no}) : une source par élément de liste « - »`);
    return ctx.md.renderInline(m[1]!, ctx.env);
  });
  const base = {
    section: ctx.section,
    title: b.title,
    titleHtml: renderTitle(b.title, ctx),
    sourcesHtml,
    notesHtml: ctx.md.render(join_(containers.get("notes") ?? []), ctx.env),
    origin: b.origin,
    ...(b.attrs["kicker"] ? { kicker: b.attrs["kicker"] } : {}),
  };
  return { base, containers, rest };
}

// Une ligne « ||| » hors bloc de code coupe le corps en deux colonnes ; une seconde
// ligne « ||| » ferme les colonnes, et ce qui la suit s'affiche en pleine largeur dessous.
function columns(lines: Line[], origin: string): { columns: string[]; after: string } {
  const parts: Line[][] = [[]];
  let fence: string | undefined;
  for (const line of lines) {
    const f = /^(`{3,}|~{3,})/.exec(line.text)?.[1];
    if (f && (!fence || f.startsWith(fence))) fence = fence ? undefined : f;
    if (!fence && !f && line.text.trim() === "|||") {
      if (parts.length === 3) throw new SupportError(`${origin} (ligne ${line.no}) : deux colonnes au plus, puis un seul bloc pleine largeur`);
      parts.push([]);
    } else {
      parts.at(-1)!.push(line);
    }
  }
  const [left, right, rest] = parts.map(join_);
  return { columns: right === undefined ? [left!] : [left!, right], after: rest ?? "" };
}

function moduleTitle(b: Block, number: string, ctx: Ctx): Slide {
  if (b.kind) throw new SupportError(`${b.origin} : le titre « # » ne prend pas de type`);
  const { base, rest } = common(b, ctx);
  const subtitle = join_(rest);
  return {
    ...base,
    kicker: base.kicker ?? `Module ${number}`,
    kind: "module-title",
    ...(subtitle ? { subtitleHtml: ctx.md.renderInline(subtitle, ctx.env) } : {}),
  };
}

function positiveInt(value: string, origin: string, key: string): number {
  if (!/^[1-9]\d*$/.test(value)) throw new SupportError(`${origin} : attribut ${key}="${value}" invalide, entier positif attendu`);
  return Number(value);
}

// Adresse d'une vidéo : YouTube et Vimeo passent par leur lecteur intégré, un .mp4 ou .webm par la balise video.
// Le départ en secondes vient de l'attribut start, à défaut du paramètre t de l'adresse.
function videoSource(src: string, startAttr: string | undefined, origin: string) {
  const fail = (msg: string): never => {
    throw new SupportError(`${origin} : ${msg}`);
  };
  let u: URL;
  try {
    u = new URL(src);
  } catch {
    return fail(`adresse de vidéo invalide « ${src} »`);
  }
  if (u.protocol !== "https:") fail(`la vidéo « ${src} » doit être en https`);
  const startRaw = startAttr ?? u.searchParams.get("t") ?? u.searchParams.get("start") ?? undefined;
  if (startRaw !== undefined && !/^\d+s?$/.test(startRaw)) fail(`départ de vidéo « ${startRaw} » invalide, nombre de secondes attendu`);
  const start = startRaw ? Number(startRaw.replace("s", "")) : 0;
  const host = u.hostname.replace(/^(www|m)\./, "");
  const segs = u.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" || host === "youtube.com") {
    const id = host === "youtu.be" ? segs[0] : u.searchParams.get("v") ?? (["embed", "shorts"].includes(segs[0] ?? "") ? segs[1] : undefined);
    if (!id || !/^[\w-]{11}$/.test(id)) return fail(`identifiant YouTube introuvable dans « ${src} »`);
    const q = new URLSearchParams({ rel: "0", ...(start ? { start: String(start) } : {}) });
    return { provider: "youtube" as const, embedUrl: `https://www.youtube-nocookie.com/embed/${id}?${q}`, watchUrl: src, posterUrl: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` };
  }
  if (host === "vimeo.com") {
    const id = segs.find((s) => /^\d+$/.test(s));
    if (!id) return fail(`identifiant Vimeo introuvable dans « ${src} »`);
    return { provider: "vimeo" as const, embedUrl: `https://player.vimeo.com/video/${id}${start ? `#t=${start}s` : ""}`, watchUrl: src };
  }
  if (/\.(mp4|webm)$/i.test(u.pathname)) {
    return { provider: "file" as const, embedUrl: start ? `${src}#t=${start}` : src, watchUrl: src };
  }
  return fail(`vidéo non reconnue « ${src} » : YouTube, Vimeo ou fichier .mp4 / .webm attendu`);
}

function buildSlide(b: Block, ctx: Ctx): Slide {
  const kind = (b.kind ?? "content") as SlideKind;
  if (!KINDS.includes(kind)) throw new SupportError(`${b.origin} : type de slide inconnu « ${b.kind} »`);
  const { base, containers, rest } = common(b, ctx);
  const fail = (msg: string): never => {
    throw new SupportError(`${b.origin} : ${msg}`);
  };
  if (NEEDS_SOURCES.has(kind) && base.sourcesHtml.length === 0) fail(`une slide « ${kind} » doit citer ses sources (::: sources)`);
  if (kind !== "compare" && (containers.has("claude-code") || containers.has("opencode"))) {
    fail("les conteneurs claude-code et opencode sont réservés aux slides « compare »");
  }
  const text = join_(rest);
  const empty = () => {
    if (text) fail(`une slide « ${kind} » n'a pas de corps`);
  };
  const listItems = () =>
    contentOf(rest).map((l) => /^[-*]\s+(.+)$/.exec(l.text.trim())?.[1] ?? fail(`ligne ${l.no} : élément de liste « - » attendu`));
  const inline = (s: string) => ctx.md.renderInline(s, ctx.env);
  const subtitle = text ? { subtitleHtml: inline(text) } : {};

  switch (kind) {
    case "title":
      return { ...base, kind, ...subtitle };
    case "end":
      return { ...base, kind, ...subtitle };
    case "agenda":
      empty();
      return { ...base, kind, modules: [], ...(b.attrs["days"] ? { days: positiveInt(b.attrs["days"], b.origin, "days") } : {}) };
    case "content": {
      const { columns: cols, after } = columns(rest, b.origin);
      return {
        ...base,
        kind,
        columns: cols.map((c) => ctx.md.render(c, ctx.env)),
        ...(after ? { afterHtml: ctx.md.render(after, ctx.env) } : {}),
      };
    }
    case "statement":
      empty();
      return { ...base, kind };
    case "facts": {
      const items = listItems();
      if (items.length < 2 || items.length > 4) fail("une slide « facts » contient de 2 à 4 éléments");
      // « - **Terme** explication » affiche le terme en vedette au-dessus de l'explication.
      const facts = items.map((it) => {
        const m = /^\*\*(.+?)\*\*\s+(.+)$/.exec(it);
        return m ? { termHtml: inline(m[1]!), textHtml: inline(m[2]!) } : { textHtml: inline(it) };
      });
      return { ...base, kind, facts };
    }
    case "figure":
      empty();
      return { ...base, kind, value: b.attrs["value"] ?? fail('attribut value="…" obligatoire') };
    case "figures": {
      // La liste des chiffres, puis un paragraphe facultatif affiché en remarque sous les chiffres.
      const lines = contentOf(rest);
      const end = lines.findIndex((l) => !/^[-*]\s+/.test(l.text.trim()));
      const list = end === -1 ? lines : lines.slice(0, end);
      const remark = end === -1 ? "" : lines.slice(end).map((l) => l.text.trim()).join(" ");
      const stats = list.map((l) => {
        const it = l.text.trim().replace(/^[-*]\s+/, "");
        const m = /^\*\*(.+?)\*\*\s+(.+)$/.exec(it) ?? fail(`« ${it} » : format attendu « - **valeur** légende »`);
        return { value: m[1]!, labelHtml: inline(m[2]!) };
      });
      if (stats.length < 3 || stats.length > 5) fail("une slide « figures » contient de 3 à 5 chiffres");
      return { ...base, kind, stats, ...(remark ? { remarkHtml: inline(remark) } : {}) };
    }
    case "quote": {
      const lines = contentOf(rest).map((l) => /^>\s?(.*)$/.exec(l.text)?.[1] ?? fail(`ligne ${l.no} : citation « > » attendue`));
      if (lines.length === 0) fail("citation « > » manquante");
      const author = b.attrs["author"];
      return { ...base, kind, quoteHtml: inline(lines.join(" ")), ...(author ? { author } : {}) };
    }
    case "video": {
      empty();
      const src = b.attrs["src"] ?? fail('attribut src="…" obligatoire');
      return { ...base, kind, ...videoSource(src, b.attrs["start"], b.origin) };
    }
    case "compare": {
      const common = text.trim() ? ctx.md.render(text, ctx.env) : "";
      const col = (name: string) => {
        const lines = containers.get(name) ?? fail(`conteneur « ${name} » manquant`);
        return ctx.md.render(join_(lines), ctx.env);
      };
      return { ...base, kind, claudeHtml: col("claude-code"), opencodeHtml: col("opencode"), ...(common ? { commonHtml: common } : {}) };
    }
    case "module-title":
      return fail("le type module-title est généré par le titre « # »");
    case "tp":
      return fail("un TP est compilé par buildTp");
    case "carte":
      return fail(`la carte mentale s'écrit dans ${CARTE_FILE}`);
  }
}

// Un TP : introduction, puis une étape par titre « ### », puis un « ### … {.corrige} » facultatif.
// Il produit la slide de lancement projetée et la page d'énoncé lue par le stagiaire.
function buildTp(b: Block, ctx: Ctx, id: string, slideIndex: number): { slide: Slide; tp: Tp } {
  const file = b.origin.split(":")[0]!;
  const intro: Line[] = [];
  const parts: { title: string; kind: string | undefined; origin: string; body: Line[] }[] = [];
  let fence: string | undefined;
  for (const line of b.body) {
    const f = /^(`{3,}|~{3,})/.exec(line.text)?.[1];
    if (f && (!fence || f.startsWith(fence))) fence = fence ? undefined : f;
    const h = fence || f ? null : /^###\s+(.+?)\s*$/.exec(line.text);
    if (h) {
      const origin = `${file}:${line.no}`;
      const { title, kind } = parseHeading(h[1]!, origin);
      parts.push({ title, kind, origin, body: [] });
    } else {
      (parts.at(-1)?.body ?? intro).push(line);
    }
  }

  const { base, containers, rest } = common({ ...b, body: intro }, ctx);
  const fail = (origin: string, msg: string): never => {
    throw new SupportError(`${origin} : ${msg}`);
  };
  if (containers.has("claude-code") || containers.has("opencode")) fail(b.origin, "les variantes d'outil se placent dans une étape");
  parts.forEach((p, i) => {
    if (p.kind && p.kind !== "corrige" && p.kind !== "optionnel") fail(p.origin, `type d'étape inconnu « ${p.kind} »`);
    if (p.kind === "corrige" && i !== parts.length - 1) fail(p.origin, "le corrigé est la dernière partie du TP");
    if (p.kind === "optionnel" && i !== 0) fail(p.origin, "seule la première étape peut être optionnelle");
  });
  const corrige = parts.at(-1)?.kind === "corrige" ? parts.pop()! : undefined;
  if (parts.length === 0) fail(b.origin, "un TP contient au moins une étape « ### »");

  // Une première étape optionnelle porte le numéro 00 : les étapes communes gardent 01, 02…
  const optionalFirst = parts[0]!.kind === "optionnel";
  const steps: TpStep[] = parts.map((p) => ({
    title: p.title,
    titleHtml: renderTitle(p.title, ctx),
    segments: tpSegments(p.body, p.origin, ctx),
  }));
  const introHtml = ctx.md.render(join_(rest), ctx.env);
  const duration = b.attrs["duration"];
  const slide: Slide = {
    ...base,
    kicker: base.kicker ?? "Travaux pratiques",
    kind: "tp",
    tpId: id,
    introHtml,
    stepTitles: steps.map((s) => s.titleHtml),
    ...(optionalFirst ? { optionalFirst } : {}),
    ...(duration ? { duration } : {}),
  };
  const tp: Tp = {
    id,
    section: ctx.section,
    slideIndex,
    title: b.title,
    introHtml,
    steps,
    ...(optionalFirst ? { optionalFirst } : {}),
    ...(duration ? { duration } : {}),
    ...(corrige ? { corrigeHtml: ctx.md.render(join_(corrige.body), ctx.env) } : {}),
  };
  return { slide, tp };
}

// Découpe une étape en segments ordonnés : texte commun, variantes d'outil, résultat attendu, indices.
function tpSegments(body: Line[], origin: string, ctx: Ctx): TpSegment[] {
  const raw: { kind: TpSegment["kind"]; lines: Line[] }[] = [];
  let current: { kind: TpSegment["kind"]; lines: Line[] } = { kind: "common", lines: [] };
  let fence: string | undefined;
  for (const line of body) {
    const f = /^(`{3,}|~{3,})/.exec(line.text)?.[1];
    if (f && (!fence || f.startsWith(fence))) fence = fence ? undefined : f;
    const c = fence || f ? null : /^:::\s*([\w-]*)\s*$/.exec(line.text);
    if (c && c[1]) {
      if (current.kind !== "common") throw new SupportError(`${origin} (ligne ${line.no}) : conteneurs imbriqués`);
      if (!TP_CONTAINERS.has(c[1])) throw new SupportError(`${origin} (ligne ${line.no}) : conteneur « ${c[1]} » interdit dans une étape`);
      raw.push(current);
      current = { kind: c[1] as TpSegment["kind"], lines: [] };
    } else if (c) {
      if (current.kind === "common") throw new SupportError(`${origin} (ligne ${line.no}) : « ::: » fermant sans ouverture`);
      raw.push(current);
      current = { kind: "common", lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.kind !== "common") throw new SupportError(`${origin} : conteneur « ${current.kind} » non fermé`);
  raw.push(current);

  const segments = raw
    .filter((r) => r.kind !== "common" || contentOf(r.lines).length > 0)
    .map((r) => ({ kind: r.kind, html: ctx.md.render(join_(r.lines), ctx.env) }));
  const has = (k: TpSegment["kind"]) => segments.some((s) => s.kind === k);
  if (!has("attendu")) throw new SupportError(`${origin} : chaque étape décrit son résultat (::: attendu)`);
  if (has("claude-code") !== has("opencode")) {
    throw new SupportError(`${origin} : une étape qui a une variante claude-code a aussi une variante opencode, et inversement`);
  }
  return segments;
}
