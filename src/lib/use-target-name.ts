import { useEffect, useState } from "react";

/**
 * Returns the first name of the target when the user came from a CPF search.
 * Reads from sessionStorage key "zr.target.cpf" (set by /cpf-alvo).
 * Returns null when no CPF lookup was done — caller should fall back to "alvo".
 */
export function useTargetName(): string | null {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("zr.target.cpf");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const full = (parsed?.nome || "").toString().trim();
      if (!full) return;
      const first = full.split(/\s+/)[0];
      if (first) setName(first);
    } catch {}
  }, []);

  return name;
}

/** Convenience: returns the first name or the fallback ("alvo" by default). */
export function useTargetLabel(fallback = "alvo"): string {
  const n = useTargetName();
  return n || fallback;
}
