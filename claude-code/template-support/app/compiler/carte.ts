import { readFileSync } from "node:fs";
import type { MarkdownIt } from "markdown-it";
import { isMap, isScalar, isSeq, LineCounter, parseDocument, type Node, type YAMLMap } from "yaml";
import type { Carte, CarteConcept, CarteModule, Section, Slide } from "../src/types.ts";
import { SupportError } from "./parse.ts";

export const CARTE_FILE = "carte-mentale.yaml";

// Champs admis à chaque niveau de l'arbre ; ceux marqués true sont obligatoires.
const FIELDS = {
  racine: { titre: true, modules: true },
  module: { module: true, titre: true, sections: true },
  section: { section: true, concepts: true },
  concept: { concept: true, definition: true, slide: false, outils: false, voir: false },
  outils: { "claude-code": true, opencode: true },
} as const;

// Compile la carte mentale. Le contenu est écrit à la main : le build vérifie seulement
// sa structure, que chaque lien `slide` désigne un titre existant et que chaque `voir` vise un concept.
export function compileCarte(path: string, sections: Section[], slides: Slide[], md: MarkdownIt): Carte {
  const lines = new LineCounter();
  const doc = parseDocument(readFileSync(path, "utf8"), { lineCounter: lines, uniqueKeys: true });
  const fail = (node: Node | null | undefined, msg: string): never => {
    const line = node?.range ? lines.linePos(node.range[0]).line : 1;
    throw new SupportError(`${CARTE_FILE}:${line} : ${msg}`);
  };
  const [error] = doc.errors;
  if (error) throw new SupportError(`${CARTE_FILE}:${error.linePos?.[0].line ?? 1} : YAML illisible (${error.message.split("\n")[0]})`);

  const map = (node: unknown, level: keyof typeof FIELDS, parent: Node | null): YAMLMap => {
    if (!isMap(node)) return fail(parent, `${level} : une table « clé: valeur » est attendue`);
    const fields: Record<string, boolean> = FIELDS[level];
    for (const pair of node.items) {
      const key = isScalar(pair.key) ? String(pair.key.value) : "";
      if (!(key in fields)) fail(pair.key as Node, `champ inconnu « ${key} » dans ${level}`);
    }
    for (const [key, required] of Object.entries(fields)) {
      if (required && !node.has(key)) fail(node, `champ « ${key} » manquant dans ${level}`);
    }
    return node;
  };
  const text = (m: YAMLMap, key: string): string => {
    const node = m.get(key, true);
    if (!isScalar(node) || typeof node.value !== "string" || !node.value.trim()) fail(node ?? m, `« ${key} » doit être un texte non vide`);
    return (node as { value: string }).value.trim();
  };
  const list = (m: YAMLMap, key: string): Node[] => {
    const node = m.get(key, true);
    if (!isSeq(node) || node.items.length === 0) return fail(node ?? m, `« ${key} » doit être une liste non vide`);
    return node.items as Node[];
  };
  const inline = (s: string) => md.renderInline(s);

  const root = map(doc.contents, "racine", null);
  const expected = sections.flatMap((s) => (s.number ? [s.number] : []));
  const concepts: { concept: CarteConcept; node: YAMLMap }[] = [];

  const modules: CarteModule[] = list(root, "modules").map((mn, i) => {
    const m = map(mn, "module", root);
    const number = text(m, "module");
    if (number !== expected[i]) {
      fail(m.get("module", true) as Node, expected[i] ? `module « ${expected[i]} » attendu à cette place, « ${number} » trouvé` : `module « ${number} » absent du support`);
    }
    return {
      id: `m${number}`,
      number,
      title: text(m, "titre"),
      sections: list(m, "sections").map((sn, j) => {
        const s = map(sn, "section", m);
        return {
          id: `m${number}-s${j + 1}`,
          title: text(s, "section"),
          concepts: list(s, "concepts").map((cn) => {
            const c = map(cn, "concept", s);
            const concept: CarteConcept = {
              id: `c${concepts.length + 1}`,
              name: text(c, "concept"),
              definitionHtml: inline(text(c, "definition")),
              voir: [],
            };
            if (c.has("slide")) concept.slide = resolveSlide(text(c, "slide"), c.get("slide", true) as Node);
            if (c.has("outils")) {
              const o = map(c.get("outils", true), "outils", c);
              concept.outils = { claudeHtml: inline(text(o, "claude-code")), opencodeHtml: inline(text(o, "opencode")) };
            }
            concepts.push({ concept, node: c });
            return concept;
          }),
        };
      }),
    };
  });
  const missing = expected.slice(modules.length);
  if (missing.length) fail(root.get("modules", true) as Node, `module${missing.length > 1 ? "s" : ""} absent${missing.length > 1 ? "s" : ""} de la carte : ${missing.join(", ")}`);

  const byName = new Map<string, CarteConcept>();
  for (const { concept, node } of concepts) {
    if (byName.has(concept.name)) fail(node, `concept « ${concept.name} » en double`);
    byName.set(concept.name, concept);
  }
  for (const { concept, node } of concepts) {
    if (!node.has("voir")) continue;
    concept.voir = list(node, "voir").map((v) => {
      const name = isScalar(v) ? String(v.value) : "";
      const target = byName.get(name) ?? fail(v, `« voir » : concept « ${name} » introuvable`);
      if (target === concept) fail(v, `« voir » : le concept « ${name} » renvoie à lui-même`);
      return target.id;
    });
  }
  return { title: text(root, "titre"), modules };

  // « 06-extensions.md#Titre exact » : indice de la slide ouverte par ce titre « ## » dans ce fichier.
  function resolveSlide(ref: string, node: Node): number {
    const m = /^([^#]+\.md)#(.+)$/.exec(ref) ?? fail(node, `« slide » attend « fichier.md#Titre de la slide », « ${ref} » trouvé`);
    const [, file, title] = m;
    const inFile = slides.flatMap((s, k) => (s.origin.split(":")[0] === file ? [k] : []));
    if (inFile.length === 0) fail(node, `« slide » : fichier « ${file} » absent du support`);
    const found = inFile.filter((k) => slides[k]!.title === title);
    if (found.length === 0) fail(node, `« slide » : aucune slide « ${title} » dans ${file}`);
    if (found.length > 1) fail(node, `« slide » : plusieurs slides « ${title} » dans ${file}`);
    return found[0]!;
  }
}
