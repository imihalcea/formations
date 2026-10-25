import { useSyncExternalStore } from "react";

// Outil choisi en début de formation (Claude Code ou Open Code). Le choix vient de l'URL
// (?outil=opencode), sinon du navigateur, sinon de Claude Code. Il se partage entre la vue
// présentateur et la fenêtre principale par l'événement « storage ».
export type Outil = "claude-code" | "opencode";
export const OUTILS: { id: Outil; label: string }[] = [
  { id: "claude-code", label: "Claude Code" },
  { id: "opencode", label: "Open Code" },
];

const KEY = "outil";
const valid = (v: string | null): Outil | null => (v === "claude-code" || v === "opencode" ? v : null);
const stored = () => {
  try {
    return valid(localStorage.getItem(KEY));
  } catch {
    return null;
  }
};

let current: Outil = valid(new URLSearchParams(location.search).get("outil")) ?? stored() ?? "claude-code";
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function setOutil(o: Outil) {
  current = o;
  try {
    localStorage.setItem(KEY, o);
  } catch {
    /* stockage indisponible : le choix vaut pour cette fenêtre seulement */
  }
  notify();
}

window.addEventListener("storage", (e) => {
  const v = e.key === KEY ? valid(e.newValue) : null;
  if (v) {
    current = v;
    notify();
  }
});

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useOutil = () => useSyncExternalStore(subscribe, () => current);
