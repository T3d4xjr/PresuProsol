// src/pages/api/mosquiteras.js
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { table } = req.query;

  try {
    if (table === 'medidas') {
      const result = await fetchMosqMedidas();
      return res.status(200).json(result);
    }

    if (table === 'options') {
      const result = await fetchMosqOptions();
      return res.status(200).json(result);
    }

    // Por defecto devolver todo
    const medidas = await fetchMosqMedidas();
    const options = await fetchMosqOptions();
    return res.status(200).json({ medidas, ...options });
  } catch (err) {
    console.error("Error en handler mosquiteras:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

/* ========= Helpers internos ========= */

function guessHexFromName(nombre = "") {
  const n = (nombre || "").toLowerCase();
  if (/blanco/.test(n)) return "#FFFFFF";
  if (/plata/.test(n) || /anodiz/.test(n)) return "#C0C0C0";
  if (/bronce/.test(n)) return "#8C6239";
  if (/ral\s*est[aá]ndar/.test(n)) return "#4F4F4F";
  if (/ral\s*especial/.test(n)) return "#7C3AED";
  return "#2D2A6E";
}

function normalizeHex(v) {
  if (!v) return null;
  let s = String(v).trim();
  if (!s) return null;
  if (!s.startsWith("#")) s = "#" + s;
  const ok = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);
  return ok ? s.toUpperCase() : null;
}

/* ========= Pricing base ========= */

export async function getMosqBasePrice(alto, ancho) {
  

  const { data, error, status } = await supabase
    .from("mosq_medidas")
    .select("precio")
    .eq("alto_mm", alto)
    .eq("ancho_mm", ancho)
    .maybeSingle();

  
  if (error) return null;
  return data?.precio ?? null;
}

/* ========= Catálogo medidas ========= */

export async function fetchMosqMedidas() {
  const { data, error, status } = await supabase
    .from("mosq_medidas")
    .select("*");

  

  if (error || !data) {
    console.error("[fetchMosqMedidas] ERROR:", error);
    return { altos: [], anchos: [], combinaciones: [] };
  }

  // Filtrar solo las que tienen precio mayor a 0
  const conPrecio = data.filter(d => {
    const precio = d.precio_base || d.precio || 0;
    return precio > 0;
  });

  

  const uniqueAltos = [...new Set(conPrecio.map((d) => d.alto_mm))].sort((a, b) => a - b);
  const uniqueAnchos = [...new Set(conPrecio.map((d) => d.ancho_mm))].sort((a, b) => a - b);
  
  // Devolver también las combinaciones válidas
  const combinaciones = conPrecio.map(d => ({
    alto: d.alto_mm,
    ancho: d.ancho_mm
  }));

  

  return { altos: uniqueAltos, anchos: uniqueAnchos, combinaciones };
}

/* ========= Colores + accesorios ========= */

export async function fetchMosqOptions() {
  try {
    

    // Colores
    const { data: col, error: colErr, status: colStatus } = await supabase
      .from("mosq_colores")
      .select("id, color, precio, activo, hex");

    
    

    const colores = (col || [])
      .filter((c) => c.activo === true)
      .map((c) => {
        const hexNorm = normalizeHex(c.hex) || guessHexFromName(c.color);
        return {
          id: String(c.id),
          nombre: c.color,
          incremento_eur_ml: Number(c.precio ?? 0),
          hex: hexNorm,
        };
      });

    // Accesorios
    const { data: acc, error: accErr, status: accStatus } = await supabase
      .from("mosq_accesorios")
      .select("*");

    

    const accesorios = (acc || [])
      .filter((a) => a.activo === true)
      .map((a) => ({
        id: a.id,
        nombre: a.nombre,
        unidad: a.unidad || "ud",
        perimetral: Boolean(a.perimetral),
        precio_unit: Number(a.precio ?? a.precio_unit ?? a.precio_ud ?? 0),
      }));

    return { colores, accesorios };
  } catch (e) {
    console.error("💥 [API MOSQ fetchMosqOptions] exception:", e);
    return { colores: [], accesorios: [] };
  }
}

/* ========= Descuento cliente ========= */

export async function fetchMosqDescuentoCliente(userId) {
  if (!userId) return 0;

  try {
    

    const { data, error, status } = await supabase
      .from("administracion_usuarios")
      .select("id, auth_user_id, descuento, descuento_cliente")
      .or(`auth_user_id.eq.${userId},id.eq.${userId}`)
      .maybeSingle();

    

    if (error || !data) {
      console.warn("[API mosq descuento] error o sin usuario:", error);
      return 0;
    }

    const pct = Number(data?.descuento ?? data?.descuento_cliente ?? 0);
    
    return Number.isFinite(pct) ? pct : 0;
  } catch (e) {
    console.error("[API mosq descuento] exception:", e);
    return 0;
  }
}

/* ========= Insert presupuesto ========= */

export async function insertarPresupuestoMosq(payload) {
  const { data, error, status } = await supabase
    .from("presupuestos")
    .insert([payload])
    .select("id")
    .maybeSingle();

  

  if (error) {
    console.error("[API insertar presupuesto MOSQ] error:", error);
  }

  return { data, error, status };
}
