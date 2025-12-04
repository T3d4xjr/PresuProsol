// ./api/politicaPrivacidad.js
import { supabase } from "../../lib/supabaseClient";

export async function fetchPoliticaPrivacidadActiva() {
  

  const { data, error } = await supabase
    .from("politica_privacidad")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("❌ [API] Error cargando política:", error);
    throw error;
  }

  
  return data || [];
}
