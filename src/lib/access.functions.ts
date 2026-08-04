import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Verifica se o telefone informado possui uma compra paga
 * (produto principal — R$ 147,00) registrada em purchase_logs.
 */
export const checkClientAccess = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ phone: z.string().min(8) }).parse(data),
  )
  .handler(async ({ data }) => {
    const digits = data.phone.replace(/\D/g, "");
    if (digits.length < 10) return { ok: false as const };

    // últimos 10 dígitos p/ ignorar 9 opcional / código de país
    const tail = digits.slice(-10);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows, error } = await supabaseAdmin
      .from("purchase_logs")
      .select("transaction_id, amount, status, raw_metadata, created_at")
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[checkClientAccess] query error", error);
      return { ok: false as const };
    }

    const found = (rows || []).some((r) => {
      const meta = (r.raw_metadata ?? {}) as Record<string, unknown>;
      const candidates: string[] = [];
      const push = (v: unknown) => {
        if (typeof v === "string") candidates.push(v);
      };
      // Formatos usados pela Black Cat / checkout
      push(meta.ph);
      push(meta.phone);
      push(meta.customer_phone);
      const customer = meta.customer as Record<string, unknown> | undefined;
      if (customer) {
        push(customer.phone);
        push(customer.telefone);
      }
      return candidates.some((c) => c.replace(/\D/g, "").slice(-10) === tail);
    });

    return { ok: found };
  });
