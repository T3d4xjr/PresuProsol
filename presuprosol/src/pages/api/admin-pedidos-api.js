// src/pages/api/admin-pedidos-api.js
import { supabase } from "../../lib/supabaseClient";

/** 📥 Cargar pedidos + datos de usuario y presupuesto */
export async function fetchAdminPedidos() {
  try {
    

    const { data: pedidosData, error: pedidosError } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });

    if (pedidosError) {
      console.error("❌ [fetchAdminPedidos] Error pedidos:", pedidosError);
      return { data: [], error: pedidosError };
    }

    if (!pedidosData || pedidosData.length === 0) {
      return { data: [], error: null };
    }

    const pedidosConDatos = await Promise.all(
      pedidosData.map(async (pedido) => {
        const { data: usuarioData } = await supabase
          .from("usuarios")
          .select("usuario, email")
          .eq("id", pedido.user_id)
          .maybeSingle();

        const { data: presupuestoData } = await supabase
          .from("presupuestos")
          .select("tipo, total, color")
          .eq("id", pedido.presupuesto_id)
          .maybeSingle();

        return {
          ...pedido,
          usuario_nombre: usuarioData?.usuario || "Usuario desconocido",
          usuario_email: usuarioData?.email || "N/A",
          presupuesto_tipo: presupuestoData?.tipo || "N/A",
        };
      })
    );

    
    return { data: pedidosConDatos, error: null };
  } catch (e) {
    console.error("💥 [fetchAdminPedidos] exception:", e);
    return { data: [], error: e };
  }
}

/** 🔄 Actualizar estado del pedido */
export async function updatePedidoEstado(id, nuevoEstado) {
  try {
    

    const { error } = await supabase
      .from("pedidos")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (error) {
      console.error("❌ [updatePedidoEstado] Error:", error);
      return { error };
    }

    
    return { error: null };
  } catch (e) {
    console.error("💥 [updatePedidoEstado] exception:", e);
    return { error: e };
  }
}
