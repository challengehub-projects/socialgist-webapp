import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ukghwpkdlsqgwbjhmezy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZ2h3cGtkbHNxZ3diamhtZXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTAzNTIsImV4cCI6MjA5NDMyNjM1Mn0.ZhknNkiUeg1g-7KJowEaUDzChymAQoK1vZc52F8XKcM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey,
    {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
