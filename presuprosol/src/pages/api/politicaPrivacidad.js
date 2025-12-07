// ./api/politicaPrivacidad.js
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { data, error } = await supabase
      .from("politica_privacidad")
      .select("*")
      .eq("activo", true)
      .order("orden", { ascending: true });

    if (error) {
      console.error("Error cargando política:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ politica: data || [] });
  } catch (err) {
    console.error("Error en handler política:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function fetchPoliticaPrivacidadActiva() {
  const { data, error } = await supabase
    .from("politica_privacidad")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error cargando política:", error);
    throw error;
  }

  return data || [];
}
