import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://byufemtbgoeruenxbrta.supabase.co";

// Ganti dengan Publishable Key atau Legacy Anon Key milik project Anda
const supabaseAnonKey = "sb_publishable_aNCmnELN0YrQ6JLdZK3NFg_fqf4EaEx";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
