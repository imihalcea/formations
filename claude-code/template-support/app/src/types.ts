// Structure produite par le compilateur (compiler/parse.ts) et consommée par l'application.
// Les champs suffixés Html contiennent du HTML déjà rendu depuis le Markdown source.

type Base = {
  section: number;
  title: string;
  kicker?: string;
  sourcesHtml: string[];
  notesHtml: string;
  origin: string;
};

export type Slide =
  | (Base & { kind: "title"; subtitleHtml?: string })
  | (Base & { kind: "agenda"; modules: { number: string; title: string }[] })
  | (Base & { kind: "module-title"; subtitleHtml?: string })
  | (Base & { kind: "content"; columns: string[] })
  | (Base & { kind: "statement" })
  | (Base & { kind: "facts"; itemsHtml: string[] })
  | (Base & { kind: "figure"; value: string })
  | (Base & { kind: "figures"; stats: { value: string; labelHtml: string }[] })
  | (Base & { kind: "quote"; quoteHtml: string; author?: string })
  | (Base & { kind: "compare"; claudeHtml: string; opencodeHtml: string })
  | (Base & { kind: "tp"; tpId: string; introHtml: string; stepTitles: string[]; duration?: string })
  | (Base & { kind: "end"; subtitleHtml?: string });

export type SlideKind = Slide["kind"];

export type Section = { number?: string; title: string };

// Page d'énoncé d'un TP. Les segments gardent l'ordre du Markdown source ; un segment
// claude-code ou opencode ne s'affiche que pour l'outil choisi par le stagiaire.
export type TpSegment = { kind: "common" | "claude-code" | "opencode" | "attendu" | "indice"; html: string };

export type TpStep = { title: string; segments: TpSegment[] };

export type Tp = {
  id: string;
  section: number;
  slideIndex: number;
  title: string;
  duration?: string;
  introHtml: string;
  steps: TpStep[];
  corrigeHtml?: string;
};

export type Deck = { sections: Section[]; slides: Slide[]; tps: Tp[] };
