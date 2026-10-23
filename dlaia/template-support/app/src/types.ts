// Structure produite par le compilateur (compiler/parse.ts) et consommée par l'application.
// Les champs suffixés Html contiennent du HTML déjà rendu depuis le Markdown source.

type Base = {
  section: number;
  // Titre brut (navigation, captures, carte) et son rendu Markdown en ligne (code, emphase).
  title: string;
  titleHtml: string;
  kicker?: string;
  sourcesHtml: string[];
  notesHtml: string;
  origin: string;
};

export type Slide =
  | (Base & { kind: "title"; subtitleHtml?: string })
  | (Base & { kind: "agenda"; modules: { number: string; title: string }[]; days?: number })
  | (Base & { kind: "module-title"; subtitleHtml?: string })
  // afterHtml : bloc pleine largeur affiché sous les deux colonnes (après un second « ||| »).
  | (Base & { kind: "content"; columns: string[]; afterHtml?: string })
  | (Base & { kind: "statement" })
  | (Base & { kind: "facts"; facts: { termHtml?: string; textHtml: string }[] })
  | (Base & { kind: "figure"; value: string })
  | (Base & { kind: "figures"; stats: { value: string; labelHtml: string }[]; remarkHtml?: string })
  | (Base & { kind: "quote"; quoteHtml: string; author?: string })
  | (Base & { kind: "compare"; claudeHtml: string; opencodeHtml: string })
  // stepTitles : titres des étapes rendus en HTML (Markdown en ligne).
  | (Base & { kind: "tp"; tpId: string; introHtml: string; stepTitles: string[]; optionalFirst?: boolean; duration?: string })
  | (Base & { kind: "end"; subtitleHtml?: string })
  | (Base & { kind: "carte"; carte: Carte });

export type SlideKind = Slide["kind"];

export type Section = { number?: string; title: string };

// Page d'énoncé d'un TP. Les segments gardent l'ordre du Markdown source ; un segment
// claude-code ou opencode ne s'affiche que pour l'outil choisi par le stagiaire.
export type TpSegment = { kind: "common" | "claude-code" | "opencode" | "attendu" | "indice"; html: string };

export type TpStep = { title: string; titleHtml: string; segments: TpSegment[] };

export type Tp = {
  id: string;
  section: number;
  slideIndex: number;
  title: string;
  duration?: string;
  introHtml: string;
  steps: TpStep[];
  // Vrai quand la première étape est optionnelle : elle porte le numéro 00.
  optionalFirst?: boolean;
  corrigeHtml?: string;
};

// Carte mentale compilée depuis carte-mentale.yaml : formation, modules, sections, concepts.
// `slide` est l'indice de la slide qui présente le concept ; `voir` liste des identifiants de concepts.
export type CarteConcept = {
  id: string;
  name: string;
  definitionHtml: string;
  slide?: number;
  outils?: { claudeHtml: string; opencodeHtml: string };
  voir: string[];
};

export type CarteSection = { id: string; title: string; concepts: CarteConcept[] };

export type CarteModule = { id: string; number: string; title: string; sections: CarteSection[] };

export type Carte = { title: string; modules: CarteModule[] };

export type Deck = { sections: Section[]; slides: Slide[]; tps: Tp[] };
