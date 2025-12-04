// src/pages/api/pergolas.js
import { supabase } from "../../lib/supabaseClient";


export async function fetchCatalogoPergolas() {
  

  // MEDIDAS
  let medidas = [];
  const { data: m, error: mErr } = await supabase
    .from("pergolas_medidas")
    .select("*")
    .eq("activo", true); // Filtrar solo activos desde el query

  

  if (mErr) {
    console.error("[API pergolas_medidas] error:", mErr);
  } else {
    medidas = (m || []).sort((a, b) => {
      if (a.ancho_mm !== b.ancho_mm) return a.ancho_mm - b.ancho_mm;
      return a.fondo_mm - b.fondo_mm;
    });
    
  }

  // COLORES
  let colores = [];
  const { data: c, error: cErr } = await supabase
    .from("pergolas_colores")
    .select("*")
    .eq("activo", true); // Filtrar solo activos desde el query

  

  if (cErr) {
    console.error("[API pergolas_colores] error:", cErr);
  } else {
    colores = (c || []).sort(
      (a, b) => (a.incremento_eur_m2 || 0) - (b.incremento_eur_m2 || 0)
    );
    
  }

  // ACCESORIOS
  let accesorios = [];
  const { data: acc, error: accErr } = await supabase
    .from("pergolas_accesorios")
    .select("*")
    .eq("activo", true); // Filtrar solo activos desde el query

  

  if (accErr) {
    console.error("[API pergolas_accesorios] error:", accErr);
  } else {
    accesorios = (acc || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
    
  }

  return { medidas, colores, accesorios };
}


export async function fetchCombinacionesPergolas() {
  try {
    const { data, error } = await supabase
      .from("pergolas_precios")
      .select("ancho_mm, fondo_mm, color_id, precio_m2")
      .gt("precio_m2", 0);

    if (error) {
      console.error("[API combinaciones pergolas] error:", error);
      return [];
    }

    const combinaciones = (data || []).map(p => ({
      ancho_mm: p.ancho_mm,
      fondo_mm: p.fondo_mm,
      color_id: p.color_id
    }));

    
    return combinaciones;
  } catch (e) {
    console.error("[API combinaciones pergolas] exception:", e);
    return [];
  }
}


export async function fetchDescuentoClientePergolas(userId) {
  if (!userId) return 0;

  try {
    

    const { data, error, status } = await supabase
      .from("administracion_usuarios")
      .select("id, auth_user_id, descuento, descuento_cliente")
      .or(`auth_user_id.eq.${userId},id.eq.${userId}`)
      .maybeSingle();

    

    if (error) {
      console.warn("[API pergolas descuento] error:", error);
      return 0;
    }

    if (!data) {
      console.warn("[API pergolas descuento] no se encontró usuario");
      return 0;
    }

    const pct = Number(data?.descuento ?? data?.descuento_cliente ?? 0);
    

    return Number.isFinite(pct) ? pct : 0;
  } catch (e) {
    console.error("[API pergolas descuento] exception:", e);
    return 0;
  }
}


export async function fetchPrecioPergola({ ancho_mm, fondo_mm, colorId }) {
  if (!ancho_mm || !fondo_mm || !colorId) {
    return { precio: null, incrementoColor: 0 };
  }

  try {
    

    const { data, error } = await supabase
      .from("pergolas_precios")
      .select(
        `
        *,
        color:pergolas_colores(*)
      `
      )
      .eq("ancho_mm", ancho_mm)
      .eq("fondo_mm", fondo_mm)
      .eq("color_id", colorId)
      .maybeSingle();

    

    if (error || !data) {
      console.warn("⚠️ [API PRECIO PÉRGOLA] no encontrado");
      return { precio: null, incrementoColor: 0 };
    }

    const areaM2 = (ancho_mm * fondo_mm) / 1_000_000;
    const precioCalculado = Number(data.precio_m2 || 0) * areaM2;

    let incrementoColor = 0;
    if (data.color?.incremento_eur_m2) {
      incrementoColor =
        Number(data.color.incremento_eur_m2 || 0) * areaM2;
    }

    

    return {
      precio: +precioCalculado.toFixed(2),
      incrementoColor: +incrementoColor.toFixed(2),
    };
  } catch (e) {
    console.error("💥 [API PRECIO PÉRGOLA] exception:", e);
    return { precio: null, incrementoColor: 0 };
  }
}


export async function insertarPresupuestoPergola(payload) {
  const { error } = await supabase.from("presupuestos").insert([payload]);

  if (error) {
    console.error("[API insertar presupuesto pérgola]", error);
    throw error;
  }

  return true;
}
