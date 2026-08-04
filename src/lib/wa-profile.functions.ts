import { createServerFn } from "@tanstack/react-start";

/**
 * Busca foto de perfil do WhatsApp via ZapGet API.
 * Endpoint: https://zapgetapi.online/api/v1/whatsapp/profile/{phone}
 */
export const getWhatsAppProfilePicture = createServerFn({ method: "POST" })
  .inputValidator((input: { phone: string }) => {
    if (!input || typeof input.phone !== "string") {
      throw new Error("phone obrigatório");
    }
    return { phone: input.phone.replace(/\D/g, "").slice(0, 13) };
  })
  .handler(async ({ data }) => {
    // API ZapGet em STANDBY — retorna sempre null para evitar chamadas externas.
    void data;
    return { link: null as string | null, isWhatsapp: null as boolean | null, error: null };
  });
