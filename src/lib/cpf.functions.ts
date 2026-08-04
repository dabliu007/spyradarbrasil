import { createServerFn } from "@tanstack/react-start";

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
    cpf: String(input?.cpf ?? "").replace(/\D/g, ""),
  }))
  .handler(async ({ data }): Promise<CpfData> => {
    if (data.cpf.length !== 11) {
      throw new Error("CPF inválido");
    }
    const token = process.env.ZIPCARDX_API_TOKEN;
    if (!token) throw new Error("Serviço de consulta indisponível no momento");

    const url = `https://api.zipcardx.online/api/v1/consult/${data.cpf}`;

    // Try up to 3 times with timeout — upstream pode flutuar em produção
    let lastErr: unknown = null;
    let res: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          signal: AbortSignal.timeout(12000),
        });
        if (res.ok) break;
        // Retry only para 5xx / 429
        if (res.status < 500 && res.status !== 429) break;
        lastErr = new Error(`HTTP ${res.status}`);
      } catch (e) {
        lastErr = e;
      }
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }

    if (!res) {
      console.error("[zipcardx] network failure:", lastErr);
      throw new Error("Falha de conexão ao consultar CPF. Tente novamente em instantes.");
    }
    if (!res.ok) {
      console.error("[zipcardx] http error:", res.status);
      if (res.status === 404) throw new Error("CPF não encontrado em nossa base");
      throw new Error("Serviço de consulta instável. Tente novamente em instantes.");
    }

    const json = await res.json().catch(() => ({}));
    console.log("[zipcardx] raw response:", JSON.stringify(json).slice(0, 2000));
    const nome = deepFind(json, pickName);
    const nascimentoRaw = deepFind(json, pickBirth);
    const sexoRaw = deepFind(json, pickSex);
    console.log("[zipcardx] extracted:", { nome, nascimentoRaw, sexoRaw });

    if (!nome) throw new Error("CPF não encontrado em nossa base");

    return {
      nome: String(nome).trim(),
      nascimento: formatBirth(String(nascimentoRaw ?? "")),
      sexo: normalizeSex(sexoRaw),
    };
  });
