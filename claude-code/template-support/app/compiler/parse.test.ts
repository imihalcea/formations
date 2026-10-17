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
    expect(deck.sections.map((s) => s.number ?? s.title)).toEqual(["Ouverture", "01", "02", "Clôture"]);
    const agenda = deck.slides.find((s) => s.kind === "agenda");
    expect(agenda?.kind === "agenda" && agenda.modules.map((m) => m.number)).toEqual(["01", "02"]);
    expect(deck.slides.filter((s) => s.kind === "module-title")).toHaveLength(2);
  });

  it("ignore les titres situés dans un bloc de code", async () => {
    const dir = supportWith({ "01-m.md": "# M\n\n## Code\n\n```markdown\n## Pas une slide\n```\n" });
    const deck = await compileDeck(dir);
    expect(deck.slides.map((s) => s.title)).toEqual(["M", "Code"]);
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

  it("refuse une image introuvable", async () => {
    const dir = supportWith({ "01-m.md": "# M\n\n## X\n\n![](images/absente.png)\n" });
    await expect(compileDeck(dir)).rejects.toThrow("Image introuvable");
  });
});
