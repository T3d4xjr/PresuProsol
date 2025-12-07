// src/pages/api/panos.js
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const catalog = await fetchCatalogoPanos();
    return res.status(200).json(catalog);
  } catch (err) {
    console.error("Error en handler paños:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function fetchCatalogoPanos() {
  

  // MODELOS
  let modelos = [];
  const { data: m, error: mErr } = await supabase
    .from("panos_modelos")
    .select("id,tipo,nombre,activo")
    .eq("activo", true)
    .order("tipo")
    .order("nombre");

  if (mErr) {
    console.error("[API panos_modelos] error:", mErr);
  } else {
    
    modelos = m || [];
  }

  // ACABADOS
  let acabados = [];
  const { data: a, error: aErr } = await supabase
    .from("panos_acabados")
    .select("id,clave,nombre,activo,orden")
    .eq("activo", true)
    .order("orden");

  if (aErr) {
    console.error("[API panos_acabados] error:", aErr);
  } else {
    
    acabados = a || [];
  }

  // ACCESORIOS
  let accesorios = [];
  const { data: acc, error: accErr } = await supabase
    .from("panos_accesorios")
    .select("id,nombre,unidad,pvp,activo")
    .eq("activo", true)
    .order("nombre");

  if (accErr) {
    console.error("[API panos_accesorios] error:", accErr);
  } else {
    
    accesorios = acc || [];
  }

  return { modelos, acabados, accesorios };
}


export async function fetchDescuentoClientePanos(userId) {
  if (!userId) return 0;

  try {
    

    const { data, error, status } = await supabase
      .from("administracion_usuarios")
      .select("id, auth_user_id, descuento, descuento_cliente")
      .or(`auth_user_id.eq.${userId},id.eq.${userId}`)
      .maybeSingle();

    

    if (error) {
      console.warn("[API panos descuento] error:", error);
      return 0;
    }

    const pct = Number(data?.descuento ?? data?.descuento_cliente ?? 0);
    
    return Number.isFinite(pct) ? pct : 0;
  } catch (e) {
    console.error("[API panos descuento] exception:", e);
    return 0;
  }
}


export async function insertarPresupuestoPanos(payload) {
  const { data, error, status } = await supabase
    .from("presupuestos")
    .insert([payload])
    .select("id")
    .maybeSingle();

  

  if (error) {
    console.error("[API insertar presupuesto panos] error:", error);
  }

  return { data, error, status };
}
