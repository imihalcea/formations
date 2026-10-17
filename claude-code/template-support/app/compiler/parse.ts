import { readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import markdownit, { type MarkdownIt } from "markdown-it";
import { createHighlighter, type Highlighter } from "shiki";
import type { Deck, Section, Slide, SlideKind, Tp, TpSegment, TpStep } from "../src/types.ts";

// Langages colorés dans les blocs de code. `console` désigne une session terminal
// (commande puis sortie) et reçoit le style terminal.
const LANGS = ["python", "bash", "console", "toml", "json", "yaml", "markdown", "diff"] as const;
const TERMINAL_LANGS = new Set(["console", "shellsession"]);
// Bloc ```prompt : texte à copier dans l'outil, sans coloration.
const PROMPT_LANG = "prompt";

const KINDS: SlideKind[] = [
  "title", "agenda", "content", "statement", "facts", "figure", "figures", "quote", "compare", "end",
];
const ATTRS = new Set(["kicker", "value", "duration", "author"]);
const CONTAINERS = new Set(["notes", "sources", "claude-code", "opencode"]);
// Une slide de ces types avance un fait chiffré ou cité : sa source est obligatoire.
const NEEDS_SOURCES = new Set<SlideKind>(["facts", "figure", "figures", "quote"]);
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
    sourcesHtml,
    notesHtml: ctx.md.render(join_(containers.get("notes") ?? []), ctx.env),
    origin: b.origin,
    ...(b.attrs["kicker"] ? { kicker: b.attrs["kicker"] } : {}),
  };
  return { base, containers, rest };
}

// Une ligne « ||| » hors bloc de code coupe le corps en deux colonnes.
function columns(lines: Line[], origin: string): string[] {
  const cols: Line[][] = [[]];
  let fence: string | undefined;
  for (const line of lines) {
    const f = /^(`{3,}|~{3,})/.exec(line.text)?.[1];
    if (f && (!fence || f.startsWith(fence))) fence = fence ? undefined : f;
    if (!fence && !f && line.text.trim() === "|||") {
      if (cols.length === 2) throw new SupportError(`${origin} (ligne ${line.no}) : deux colonnes au plus`);
      cols.push([]);
    } else {
      cols.at(-1)!.push(line);
    }
  }
  return cols.map(join_);
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
      return { ...base, kind, modules: [] };
    case "content":
      return { ...base, kind, columns: columns(rest, b.origin).map((c) => ctx.md.render(c, ctx.env)) };
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
    case "compare": {
      empty();
      const col = (name: string) => {
        const lines = containers.get(name) ?? fail(`conteneur « ${name} » manquant`);
        return ctx.md.render(join_(lines), ctx.env);
      };
      return { ...base, kind, claudeHtml: col("claude-code"), opencodeHtml: col("opencode") };
    }
    case "module-title":
      return fail("le type module-title est généré par le titre « # »");
    case "tp":
      return fail("un TP est compilé par buildTp");
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
    if (p.kind && p.kind !== "corrige") fail(p.origin, `type d'étape inconnu « ${p.kind} »`);
    if (p.kind === "corrige" && i !== parts.length - 1) fail(p.origin, "le corrigé est la dernière partie du TP");
  });
  const corrige = parts.at(-1)?.kind === "corrige" ? parts.pop()! : undefined;
  if (parts.length === 0) fail(b.origin, "un TP contient au moins une étape « ### »");

  const steps: TpStep[] = parts.map((p) => ({ title: p.title, segments: tpSegments(p.body, p.origin, ctx) }));
  const introHtml = ctx.md.render(join_(rest), ctx.env);
  const duration = b.attrs["duration"];
  const slide: Slide = {
    ...base,
    kicker: base.kicker ?? "Travaux pratiques",
    kind: "tp",
    tpId: id,
    introHtml,
    stepTitles: steps.map((s) => s.title),
    ...(duration ? { duration } : {}),
  };
  const tp: Tp = {
    id,
    section: ctx.section,
    slideIndex,
    title: b.title,
    introHtml,
    steps,
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
