// ./api/presupuestos.js
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  const { userId, id } = req.query;

  if (req.method === 'GET') {
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }

    try {
      const { data, error } = await supabase
        .from("presupuestos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando presupuestos:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ presupuestos: data || [] });
    } catch (err) {
      console.error("Error en handler presupuestos GET:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ error: 'id requerido' });
    }

    try {
      const { error } = await supabase
        .from("presupuestos")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error eliminando presupuesto:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Error en handler presupuestos DELETE:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}

export async function fetchPresupuestosUsuario(userId) {
  const { data, error } = await supabase
    .from("presupuestos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[API PRESUPUESTOS] ❌ Error cargando presupuestos:", error);
    throw error;
  }

  return data || [];
}

export async function eliminarPresupuesto(id) {
  const { error } = await supabase
    .from("presupuestos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[API PRESUPUESTOS] ❌ Error eliminando presupuesto:", error);
    throw error;
  }

  return true;
}
