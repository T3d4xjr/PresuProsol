// src/pages/api/proteccionSolar.js
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { table } = req.query;

  try {
    if (table === 'combinaciones') {
      const combinaciones = await fetchCombinacionesProteccionSolar();
      return res.status(200).json({ combinaciones });
    }

    const catalog = await fetchCatalogoProteccionSolar();
    const combinaciones = await fetchCombinacionesProteccionSolar();
    return res.status(200).json({ ...catalog, combinaciones });
  } catch (err) {
    console.error("Error en handler protección solar:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function fetchCatalogoProteccionSolar() {
  

  // MODELOS
  let modelos = [];
  const { data: m, error: mErr } = await supabase
    .from("proteccionsolar_modelos")
    .select("*")
    .eq("activo", true);

  

  if (mErr) {
    console.error("[API proteccionsolar_modelos] error:", mErr);
  } else {
    modelos = (m || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
    
  }

  // COLORES / ESTRUCTURA
  let colores = [];
  const { data: c, error: cErr } = await supabase
    .from("proteccionsolar_colores_estructura")
    .select("*")
    .eq("activo", true);

  if (cErr) {
    console.error("[API proteccionsolar_colores_estructura] error:", cErr);
  } else {
    colores = (c || []).sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
  }

  // ACCESORIOS
  let accesorios = [];
  const { data: acc, error: accErr } = await supabase
    .from("proteccionsolar_accesorios")
    .select("*")
    .eq("activo", true);

  if (accErr) {
    console.error("[API proteccionsolar_accesorios] error:", accErr);
  } else {
    accesorios = (acc || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
    
  }

  return { modelos, colores, accesorios };
}


export async function fetchCombinacionesProteccionSolar() {
  try {
    const { data, error } = await supabase
      .from("proteccionsolar_precios")
      .select("modelo_id, color_id, precio_m2, precio")
      .or("precio_m2.gt.0,precio.gt.0");

    if (error) {
      console.error("[API combinaciones proteccion-solar] error:", error);
      return [];
    }

    const combinaciones = (data || []).map(p => ({
      modelo_id: p.modelo_id,
      color_id: p.color_id
    }));

    
    return combinaciones;
  } catch (e) {
    console.error("[API combinaciones proteccion-solar] exception:", e);
    return [];
  }
}


export async function fetchDescuentoClienteProteccionSolar(userId) {
  if (!userId) return 0;

  try {
    

    const { data, error, status } = await supabase
      .from("administracion_usuarios")
      .select("id, auth_user_id, descuento, descuento_cliente")
      .or(`auth_user_id.eq.${userId},id.eq.${userId}`)
      .maybeSingle();

    

    if (error) {
      console.warn("[API proteccion-solar descuento] error:", error);
      return 0;
    }

    if (!data) {
      console.warn("[API proteccion-solar descuento] no se encontró usuario");
      return 0;
    }

    const pct = Number(data?.descuento ?? data?.descuento_cliente ?? 0);
    

    return Number.isFinite(pct) ? pct : 0;
  } catch (e) {
    console.error("[API proteccion-solar descuento] exception:", e);
    return 0;
  }
}


export async function fetchPrecioProteccionSolar({ modeloId, colorId }) {
  if (!modeloId || !colorId) {
    return { precio: null, incrementoColor: 0 };
  }

  try {
    const { data, error } = await supabase
      .from("proteccionsolar_precios")
      .select("*")
      .eq("modelo_id", modeloId)
      .eq("color_id", colorId)
      .maybeSingle();

    if (error) {
      console.error("❌ [API precio proteccion-solar] error:", error);
      return { precio: null, incrementoColor: 0 };
    }

    if (!data) {
      console.warn(
        "⚠️ [API precio proteccion-solar] NO ENCONTRADO para modelo/color:",
        modeloId,
        colorId
      );
      return { precio: null, incrementoColor: 0 };
    }

    const precioValue = data.precio_m2 ?? data.precio ?? 0;
    

    const precio = Number(precioValue || 0);
    let incrementoColor = 0;

    // El incremento viene del color (€/m2 ya precalculado)
    if (data.incremento_m2 && data.incremento_m2 > 0) {
      incrementoColor = Number(data.incremento_m2);
    }

    return { precio, incrementoColor };
  } catch (e) {
    console.error("💥 [API precio proteccion-solar] exception:", e);
    return { precio: null, incrementoColor: 0 };
  }
}


export async function insertarPresupuestoProteccionSolar(payload) {
  const { error } = await supabase.from("presupuestos").insert([payload]);

  if (error) {
    console.error("[API insertar presupuesto proteccion-solar]", error);
    throw error;
  }

  return true;
}
