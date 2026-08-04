import { createServerFn } from "@tanstack/react-start";

export type InstagramProfile = {
  username: string | null;
  full_name: string | null;
  biography: string | null;
  followers: number | null;
  following: number | null;
  media_count: number | null;
  is_verified: boolean | null;
  is_private: boolean | null;
  profile_pic_url: string | null;
  user_id: string | null;
};

const clean = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t || t.toLowerCase() === "null" || t.toLowerCase() === "undefined") return null;
  return t;
};
const num = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return null;
};
const bool = (v: unknown): boolean | null => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true" || v === "1";
  return null;
};

export const getInstagramProfile = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string }) => {
    if (!input || typeof input.username !== "string") throw new Error("username obrigatório");
    return {
      username: input.username.replace(/[^a-zA-Z0-9._]/g, "").slice(0, 30).toLowerCase(),
    };
  })
  .handler(async ({ data }): Promise<{ profile: InstagramProfile | null; error: string | null }> => {
    const apiUrl = process.env.INSTAGRAM_API_URL;
    const apiKey = process.env.INSTAGRAM_API_KEY;
    if (!apiUrl || !apiKey) return { profile: null, error: "config" };
    if (!data.username) return { profile: null, error: "invalid_username" };

    try {
      const base = apiUrl.replace(/\/+$/, "");
      const res = await fetch(`${base}/api/v1/instagram/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: data.username }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json || typeof json !== "object") {
        console.error("[ig] status", res.status, json);
        return { profile: null, error: `http_${res.status}` };
      }
      const p = (json as { data?: Record<string, unknown> }).data ?? (json as Record<string, unknown>);
      const profile: InstagramProfile = {
        username: clean(p.username) ?? data.username,
        full_name: clean(p.full_name) ?? clean(p.fullName) ?? clean(p.name),
        biography: clean(p.biography) ?? clean(p.bio),
        followers: num(p.followers) ?? num(p.follower_count) ?? num(p.followers_count),
        following: num(p.following) ?? num(p.following_count),
        media_count: num(p.media_count) ?? num(p.posts) ?? num(p.media),
        is_verified: bool(p.is_verified) ?? bool(p.verified),
        is_private: bool(p.is_private) ?? bool(p.private),
        profile_pic_url:
          clean(p.profile_pic_url) ??
          clean(p.profile_picture) ??
          clean(p.profilePicUrl) ??
          clean(p.photo),
        user_id: clean(p.user_id) ?? clean(p.id) ?? clean(p.pk),
      };
      return { profile, error: null };
    } catch (e) {
      console.error("[ig] fetch err", e);
      return { profile: null, error: "fetch_failed" };
    }
  });
