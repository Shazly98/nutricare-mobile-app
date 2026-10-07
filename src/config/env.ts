export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL ?? "ahmed.as.elshazly@gmail.com";
export const web3formsKey = process.env.EXPO_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";
export const siteUrl = (process.env.EXPO_PUBLIC_SITE_URL ?? "https://nutricare-eg.com").replace(/\/$/, "");

export const hasSupabase = Boolean(supabaseUrl && supabaseKey);
