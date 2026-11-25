// ============================================================
// AUTENTICACIÓN — Supabase Auth
// Conserva el acceso mediante nombre de usuario + contraseña.
// El usuario "camilo" se convierte en camilo@sorprendiendo.local.
// ============================================================
import { supabase, auth } from "./supabase-config.js";

const AUTH_EMAIL_DOMAIN = "sorprendiendo.local";

function usernameToEmail(username) {
  const clean = String(username || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  if (!clean) throw new Error("auth/invalid-email");
  return `${clean}@${AUTH_EMAIL_DOMAIN}`;
}

export function watchAuthState(onLoggedIn, onLoggedOut) {
  let firstEvent = true;

  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user || null;
    auth.setCurrentUser(user);

    if (user) onLoggedIn(user);
    else onLoggedOut();

    firstEvent = false;
  });

  // onAuthStateChange emite INITIAL_SESSION al recuperar la sesión.
  // No hace falta una segunda consulta getSession().
}

export async function login(username, password) {
  const email = usernameToEmail(username);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  auth.setCurrentUser(data.user);
  return data.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  auth.setCurrentUser(null);
}

const AUTH_ERROR_MESSAGES = {
  "invalid_credentials": "Usuario o contraseña incorrectos.",
  "invalid login credentials": "Usuario o contraseña incorrectos.",
  "auth/invalid-email": "Usuario o contraseña incorrectos.",
  "email_not_confirmed": "La cuenta todavía no está confirmada. Revisa la configuración del usuario en Supabase.",
  "too_many_requests": "Demasiados intentos fallidos. Intenta de nuevo en unos minutos.",
  "fetch_error": "No hay conexión con Supabase. Verifica tu red.",
};

export function friendlyAuthError(error) {
  const key = String(error?.code || error?.message || "").toLowerCase();
  return AUTH_ERROR_MESSAGES[key] || AUTH_ERROR_MESSAGES[error?.code] ||
    "No fue posible iniciar sesión. Verifica el usuario y la contraseña.";
}
