// ./api/terminos.js
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { data, error } = await supabase
      .from("terminos_condiciones")
      .select("*")
      .eq("activo", true)
      .order("orden", { ascending: true });

    if (error) {
      console.error("Error cargando términos:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ terminos: data || [] });
  } catch (err) {
    console.error("Error en handler términos:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function fetchTerminosActivos() {
  const { data, error } = await supabase
    .from("terminos_condiciones")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error cargando términos:", error);
    throw error;
  }

  return data || [];
}
