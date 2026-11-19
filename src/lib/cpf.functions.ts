import { createServerFn } from "@tanstack/react-start";
import { isValidCpf, onlyDigits } from "./cpf";

export type CpfData = {
  nome: string;
  nascimento: string; // dd/mm/yyyy
  sexo: "M" | "F" | null;
};

function pickName(obj: any): string | undefined {
  if (!obj || typeof obj !== "object") return;
  return (
    obj.nome ||
    obj.name ||
    obj.NOME ||
    obj.nomeCompleto ||
    obj.nome_completo ||
    obj.fullName
  );
}

function pickBirth(obj: any): string | undefined {
  if (!obj || typeof obj !== "object") return;
  for (const k of Object.keys(obj)) {
    const low = k.toLowerCase();
    const v = (obj as any)[k];
    if (typeof v !== "string" && typeof v !== "number") continue;
    if (
      low === "nascimento" ||
      low === "datanascimento" ||
      low === "data_nascimento" ||
      low === "dt_nascimento" ||
      low === "dtnascimento" ||
      low === "birthdate" ||
      low === "birth_date" ||
      low === "datadenascimento" ||
      low.includes("nasc") ||
      low.includes("birth")
    ) {
      return String(v);
    }
  }
}

function pickSex(obj: any): string | undefined {
  if (!obj || typeof obj !== "object") return;
  for (const k of Object.keys(obj)) {
    const low = k.toLowerCase();
    const v = (obj as any)[k];
    if (typeof v !== "string") continue;
    if (low === "sexo" || low === "sex" || low === "gender" || low === "genero" || low === "gênero") {
      return v;
    }
  }
}

function normalizeSex(raw: string | undefined): "M" | "F" | null {
  if (!raw) return null;
  const s = raw.trim().toUpperCase();
  if (s.startsWith("M")) return "M";
  if (s.startsWith("F")) return "F";
  return null;
}


function formatBirth(raw: string): string {
  if (!raw) return "";
  // already dd/mm/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
  // yyyy-mm-dd or yyyy-mm-ddT...
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  // dd-mm-yyyy
  const br = raw.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (br) return `${br[1]}/${br[2]}/${br[3]}`;
  return raw;
}

function deepFind(obj: any, picker: (o: any) => string | undefined): string | undefined {
  if (!obj) return;
  const direct = picker(obj);
  if (direct) return direct;
  if (typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      const v = (obj as any)[k];
      if (v && typeof v === "object") {
        const found = deepFind(v, picker);
        if (found) return found;
      }
    }
  }
}

export const consultCpf = createServerFn({ method: "POST" })
  .inputValidator((input: { cpf: string }) => ({
    cpf: onlyDigits(String(input?.cpf ?? "")),
  }))
  .handler(async ({ data }): Promise<CpfData> => {
    if (!isValidCpf(data.cpf)) throw new Error("Informe um CPF válido");

    const token = process.env.MAGMA_CPF_TOKEN;
    if (!token) throw new Error("Serviço de consulta indisponível no momento");

    const url = `https://magmadatahub.com/api.php?token=${encodeURIComponent(token)}&cpf=${data.cpf}`;

    let json: unknown = {};
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (compatible; CpfLookup/1.0)" },
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 404) throw new Error("CPF não encontrado em nossa base");
      if (!res.ok) {
        console.error("[magma-cpf] http error:", res.status);
        throw new Error("Serviço de consulta instável. Tente novamente em instantes.");
      }
      json = await res.json().catch(() => ({}));
    } catch (e) {
      if (e instanceof Error && (e.message.startsWith("Serviço") || e.message.startsWith("CPF"))) throw e;
      console.error("[magma-cpf] network failure:", e instanceof Error ? e.message : e);
      throw new Error("Falha de conexão ao consultar CPF. Tente novamente em instantes.");
    }

    const nome = deepFind(json, pickName);
    if (!nome) throw new Error("CPF não encontrado em nossa base");

    return {
      nome: String(nome).trim(),
      nascimento: formatBirth(String(deepFind(json, pickBirth) ?? "")),
      sexo: normalizeSex(deepFind(json, pickSex)),
    };
  });
