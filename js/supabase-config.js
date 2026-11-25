// ============================================================
// CONFIGURACIÓN DE SUPABASE
// La URL y la publishable key son públicas por diseño.
// Nunca colocar aquí la service_role key.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jyoxojywvsajyyqpnlvt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_i5IBm9z3QZqZrLC2URrj9A_-rgoi_t5";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Compatibilidad con la pantalla Configuración existente.
let currentUser = null;
export const auth = {
  get currentUser() {
    return currentUser;
  },
  setCurrentUser(user) {
    currentUser = user;
  },
};
