// ./api/pedidos.js
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId requerido' });
  }

  try {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*, presupuestos(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando pedidos:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ pedidos: data || [] });
  } catch (err) {
    console.error("Error en handler pedidos:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function fetchPedidosUsuario(userId) {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, presupuestos(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[API PEDIDOS] ❌ Error cargando pedidos:", error);
    throw error;
  }

  return data || [];
}
