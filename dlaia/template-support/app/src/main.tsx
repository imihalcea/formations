import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import deck from "virtual:deck";
import { Deck } from "./Deck";
import "./styles.css";

// Expose le deck compilé au script de captures (scripts/captures.mjs).
Object.assign(window, { __deck: deck });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Deck />
  </StrictMode>,
);
