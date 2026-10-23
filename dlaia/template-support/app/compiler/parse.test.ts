import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { compileDeck } from "./parse.ts";

function supportWith(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "support-"));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}

describe("compileDeck", () => {
  it("compile le support d'exemple", async () => {
    const deck = await compileDeck(join(import.meta.dirname, "../exemple"));
    expect(deck.sections.map((s) => s.number ?? s.title)).toEqual(["Ouverture", "01", "02", "Clôture", "Carte mentale"]);
    const agenda = deck.slides.find((s) => s.kind === "agenda");
    expect(agenda?.kind === "agenda" && agenda.modules.map((m) => m.number)).toEqual(["01", "02"]);
    expect(deck.slides.filter((s) => s.kind === "module-title")).toHaveLength(2);
  });

  it("lit l'attribut days de l'agenda et rejette une valeur invalide", async () => {
    const md = (attr: string) => `# M\n\n## Plan {.agenda ${attr}}\n`;
    const deck = await compileDeck(supportWith({ "01-m.md": md('days="4"') }));
    const agenda = deck.slides.find((s) => s.kind === "agenda");
    expect(agenda?.kind === "agenda" && agenda.days).toBe(4);
    await expect(compileDeck(supportWith({ "01-m.md": md('days="x"') }))).rejects.toThrow(/days="x" invalide/);
  });

  it("ignore les titres situés dans un bloc de code", async () => {
    const dir = supportWith({ "01-m.md": "# M\n\n## Code\n\n```markdown\n## Pas une slide\n```\n" });
    const deck = await compileDeck(dir);
    expect(deck.slides.map((s) => s.title)).toEqual(["M", "Code"]);
  });

  it("colore un bloc gherkin", async () => {
    const dir = supportWith({ "01-m.md": "# M\n\n## Scénario\n\n```gherkin\n# language: fr\nFonctionnalité: Réserver\n  Scénario: Créneau libre\n    Soit une salle libre\n```\n" });
    const deck = await compileDeck(dir);
    const slide = deck.slides.find((s) => s.title === "Scénario");
    expect(slide?.kind === "content" && slide.columns[0]).toContain('style="color:');
  });

  it("refuse une slide de chiffre sans source", async () => {
    const dir = supportWith({ "01-m.md": '# M\n\n## Part {.figure value="40 %"}\n' });
    await expect(compileDeck(dir)).rejects.toThrow("01-m.md:3 : une slide « figure » doit citer ses sources");
  });

  it("refuse un type de slide inconnu", async () => {
    const dir = supportWith({ "01-m.md": "# M\n\n## X {.inconnu}\n" });
    await expect(compileDeck(dir)).rejects.toThrow("type de slide inconnu « inconnu »");
  });

  it("refuse une slide compare incomplète", async () => {
    const dir = supportWith({ "01-m.md": "# M\n\n## X {.compare}\n\n::: claude-code\nA\n:::\n" });
    await expect(compileDeck(dir)).rejects.toThrow("conteneur « opencode » manquant");
  });

  it("coupe le corps en deux colonnes sur « ||| »", async () => {
    const dir = supportWith({ "01-m.md": "# M\n\n## X\n\nA\n\n|||\n\nB\n" });
    const slide = (await compileDeck(dir)).slides[1]!;
    expect(slide.kind === "content" && slide.columns).toEqual(["<p>A</p>\n", "<p>B</p>\n"]);
    expect(slide.kind === "content" && slide.afterHtml).toBeUndefined();
  });

  it("affiche en pleine largeur ce qui suit un second « ||| »", async () => {
    const dir = supportWith({ "01-m.md": "# M\n\n## X\n\nA\n\n|||\n\nB\n\n|||\n\nC\n" });
    const slide = (await compileDeck(dir)).slides[1]!;
    expect(slide.kind === "content" && slide.columns).toEqual(["<p>A</p>\n", "<p>B</p>\n"]);
    expect(slide.kind === "content" && slide.afterHtml).toBe("<p>C</p>\n");
    const trop = supportWith({ "01-m.md": "# M\n\n## X\n\nA\n\n|||\n\nB\n\n|||\n\nC\n\n|||\n\nD\n" });
    await expect(compileDeck(trop)).rejects.toThrow("deux colonnes au plus");
  });

  it("rend le code en ligne des titres de slide et d'étape", async () => {
    const dir = supportWith({ "01-m.md": "# M\n\n## Le dossier `x/`\n\nA\n\n## TP {.tp}\n\n### Lancer `specify`\n\n::: attendu\nB\n:::\n" });
    const deck = await compileDeck(dir);
    expect(deck.slides[1]!.title).toBe("Le dossier `x/`");
    expect(deck.slides[1]!.titleHtml).toBe("Le dossier <code>x/</code>");
    expect(deck.tps[0]!.steps[0]!.titleHtml).toBe("Lancer <code>specify</code>");
  });

  it("place une espace insécable avant les ponctuations doubles des titres", async () => {
    const dir = supportWith({ "01-m.md": "# M\n\n## Le QUOI ; le COMMENT : deux ? {.statement}\n\n## TP {.tp}\n\n### Lancer : `a b`\n\n::: attendu\nB\n:::\n" });
    const deck = await compileDeck(dir);
    expect(deck.slides[1]!.titleHtml).toBe("Le QUOI\u00a0; le COMMENT\u00a0: deux\u00a0?");
    expect(deck.tps[0]!.steps[0]!.titleHtml).toBe("Lancer\u00a0: <code>a b</code>");
    expect(deck.tps[0]!.introHtml).not.toContain("\u00a0");
  });

  it("compile un TP en slide de lancement et page d'énoncé", async () => {
    const deck = await compileDeck(join(import.meta.dirname, "../exemple"));
    const tp = deck.tps[0]!;
    expect(tp.id).toBe("tp-02");
    expect(tp.steps.map((s) => s.title)).toEqual(["Lancer l'outil dans le projet", "Demander une vue d'ensemble", "Lancer les tests"]);
    expect(tp.steps[0]!.segments.map((s) => s.kind)).toEqual(["common", "claude-code", "opencode", "attendu"]);
    expect(tp.corrigeHtml).toContain("avec_tva");
    expect(deck.slides[tp.slideIndex]!.kind).toBe("tp");
  });

  it("refuse une étape de TP sans résultat attendu", async () => {
    const dir = supportWith({ "01-m.md": "# M\n\n## TP {.tp}\n\n### Étape\n\nFaire.\n" });
    await expect(compileDeck(dir)).rejects.toThrow("01-m.md:5 : chaque étape décrit son résultat");
  });

  it("refuse une étape de TP avec une seule variante d'outil", async () => {
    const dir = supportWith({ "01-m.md": "# M\n\n## TP {.tp}\n\n### Étape\n\n::: claude-code\nA\n:::\n\n::: attendu\nB\n:::\n" });
    await expect(compileDeck(dir)).rejects.toThrow("a aussi une variante opencode");
  });

  it("accepte une première étape optionnelle et refuse les suivantes", async () => {
    const step = (h: string) => `### ${h}\n\n::: attendu\nB\n:::\n\n`;
    const ok = supportWith({ "01-m.md": `# M\n\n## TP {.tp}\n\n${step("Zéro {.optionnel}")}${step("Un")}` });
    const tp = (await compileDeck(ok)).tps[0]!;
    expect(tp.optionalFirst).toBe(true);
    expect(tp.steps.map((s) => s.title)).toEqual(["Zéro", "Un"]);
    const ko = supportWith({ "01-m.md": `# M\n\n## TP {.tp}\n\n${step("Un")}${step("Deux {.optionnel}")}` });
    await expect(compileDeck(ko)).rejects.toThrow("seule la première étape peut être optionnelle");
  });

  it("inclut un fichier ou une plage de lignes dans un bloc de code", async () => {
    const dir = supportWith({
      "x.py": "un = 1\ndeux = 2\ntrois = 3\n",
      "01-m.md": '# M\n\n## Tout\n\n```text file="x.py"\n```\n\n## Partie\n\n```text file="x.py" lines="2-3"\n```\n',
    });
    const [, tout, partie] = (await compileDeck(dir)).slides;
    expect(tout!.kind === "content" && tout!.columns[0]).toContain("un = 1");
    expect(partie!.kind === "content" && partie!.columns[0]).not.toContain("un = 1");
    expect(partie!.kind === "content" && partie!.columns[0]).toContain("trois = 3");
  });

  it("sépare le terme de l'explication dans une slide facts", async () => {
    const src = "::: sources\n- [S](https://s)\n:::\n";
    const dir = supportWith({ "01-m.md": `# M\n\n## X {.facts}\n\n- **Terme** explication\n- Texte seul\n\n${src}` });
    const slide = (await compileDeck(dir)).slides[1]!;
    expect(slide.kind === "facts" && slide.facts).toEqual([{ termHtml: "Terme", textHtml: "explication" }, { textHtml: "Texte seul" }]);
  });

  it("lit la remarque qui suit les chiffres d'une slide figures", async () => {
    const src = "::: sources\n- [S](https://s)\n:::\n";
    const dir = supportWith({ "01-m.md": `# M\n\n## X {.figures}\n\n- **1** a\n- **2** b\n- **3** c\n\nUne remarque.\n\n${src}` });
    const slide = (await compileDeck(dir)).slides[1]!;
    expect(slide.kind === "figures" && slide.stats).toHaveLength(3);
    expect(slide.kind === "figures" && slide.remarkHtml).toBe("Une remarque.");
  });

  it("refuse une image introuvable", async () => {
    const dir = supportWith({ "01-m.md": "# M\n\n## X\n\n![](images/absente.png)\n" });
    await expect(compileDeck(dir)).rejects.toThrow("Image introuvable");
  });
});

describe("carte mentale", () => {
  const module = (concepts: string) =>
    `titre: F\nmodules:\n  - module: "01"\n    titre: M\n    sections:\n      - section: S\n        concepts:\n${concepts}`;
  const md = "# M\n\n## Une slide\n\n## Autre\n";

  it("compile la carte du support d'exemple en dernière section", async () => {
    const deck = await compileDeck(join(import.meta.dirname, "../exemple"));
    const slide = deck.slides.at(-1)!;
    expect(slide.kind).toBe("carte");
    expect(slide.section).toBe(deck.sections.length - 1);
    if (slide.kind !== "carte") return;
    const [liste, numerotee] = slide.carte.modules[0]!.sections[0]!.concepts;
    expect(deck.slides[liste!.slide!]!.title).toBe("Liste à puces");
    expect(numerotee!.voir).toEqual([liste!.id]);
    const contexte = slide.carte.modules[1]!.sections[0]!.concepts[1]!;
    expect(contexte.outils).toEqual({ claudeHtml: "<code>CLAUDE.md</code>", opencodeHtml: "<code>AGENTS.md</code>" });
  });

  it("refuse un titre de slide inexistant, avec sa ligne", async () => {
    const yaml = module("          - concept: C\n            definition: D\n            slide: 01-m.md#Absente\n");
    const dir = supportWith({ "01-m.md": md, "carte-mentale.yaml": yaml });
    await expect(compileDeck(dir)).rejects.toThrow("carte-mentale.yaml:10 : « slide » : aucune slide « Absente » dans 01-m.md");
  });

  it("refuse un lien voir vers un concept inconnu", async () => {
    const yaml = module("          - concept: C\n            definition: D\n            voir: [Inconnu]\n");
    const dir = supportWith({ "01-m.md": md, "carte-mentale.yaml": yaml });
    await expect(compileDeck(dir)).rejects.toThrow("carte-mentale.yaml:10 : « voir » : concept « Inconnu » introuvable");
  });

  it("refuse un champ inconnu et un champ obligatoire manquant", async () => {
    const inconnu = module("          - concept: C\n            definition: D\n            lien: x\n");
    await expect(compileDeck(supportWith({ "01-m.md": md, "carte-mentale.yaml": inconnu }))).rejects.toThrow(
      "carte-mentale.yaml:10 : champ inconnu « lien » dans concept",
    );
    const manquant = module("          - concept: C\n");
    await expect(compileDeck(supportWith({ "01-m.md": md, "carte-mentale.yaml": manquant }))).rejects.toThrow(
      "carte-mentale.yaml:8 : champ « definition » manquant dans concept",
    );
  });

  it("refuse une carte à laquelle manque un module", async () => {
    const yaml = module("          - concept: C\n            definition: D\n");
    const dir = supportWith({ "01-m.md": md, "02-n.md": "# N\n", "carte-mentale.yaml": yaml });
    await expect(compileDeck(dir)).rejects.toThrow("module absent de la carte : 02");
  });

  it("refuse un concept en double", async () => {
    const yaml = module("          - concept: C\n            definition: D\n          - concept: C\n            definition: E\n");
    const dir = supportWith({ "01-m.md": md, "carte-mentale.yaml": yaml });
    await expect(compileDeck(dir)).rejects.toThrow("carte-mentale.yaml:10 : concept « C » en double");
  });
});
