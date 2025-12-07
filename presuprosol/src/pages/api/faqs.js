// ./api/faqs.js
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("activo", true)
      .order("orden", { ascending: true });

    if (error) {
      console.error("Error cargando FAQs:", error);
      return res.status(500).json({ error: error.message });
    }1

    return res.status(200).json({ faqs: data || [] });
  } catch (err) {
    console.error("Error en handler FAQs:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function fetchFaqsActivas() {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error cargando FAQs:", error);
    throw error;
  }

  return data || [];
}
