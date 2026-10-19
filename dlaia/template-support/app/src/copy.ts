// Boutons de copie des blocs de code, sur les slides et sur la page de TP.

// Texte copié depuis un bloc : pour une session terminal, seulement les commandes, sans « $ ».
export function copyText(pre: HTMLPreElement): string {
  const text = (pre.querySelector("code") ?? pre).textContent ?? "";
  if (!pre.classList.contains("terminal")) return text.replace(/\n$/, "");
  const commands = text.split("\n").filter((l) => l.startsWith("$ ")).map((l) => l.slice(2));
  return commands.length > 0 ? commands.join("\n") : text;
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

// Le libellé vient de l'attribut data-label, affiché par CSS : il reste hors du textContent
// du bloc, que lit copyText.
function copyButton(className: string, label: string, text: () => string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = className;
  btn.type = "button";
  btn.dataset["label"] = label;
  btn.title = label;
  btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    btn.blur(); // la barre d'espace doit continuer à faire avancer les slides
    await writeClipboard(text());
    btn.dataset["label"] = "Copié";
    setTimeout(() => (btn.dataset["label"] = label), 1500);
  });
  return btn;
}

// Ajoute à chaque bloc un bouton qui copie tout le bloc et, à chaque commande d'une session
// terminal, un bouton qui copie cette seule commande.
export function addCopyButtons(root: HTMLElement) {
  for (const pre of root.querySelectorAll<HTMLPreElement>("pre")) {
    if (pre.querySelector(":scope > .copy")) continue;
    pre.appendChild(copyButton("copy", "Tout copier", () => copyText(pre)));
    if (!pre.classList.contains("terminal")) continue;
    for (const line of pre.querySelectorAll<HTMLElement>("code .line")) {
      const command = (line.textContent ?? "").match(/^\$ (.+)$/)?.[1];
      if (command) line.appendChild(copyButton("copy-line", "Copier la commande", () => command));
    }
  }
}
