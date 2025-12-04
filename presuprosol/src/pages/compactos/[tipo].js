// src/pages/compactos/[tipo].js
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/ConfigPages.module.css";


import {
  fetchCompactosCatalog,
  fetchCompactosDescuento,
  fetchPrecioGuiaMl,
  insertarPresupuestoCompacto,
} from "../api/compactos-api";

// MAPEO DE IMÁGENES DE ACCESORIOS
const ACCESORIO_IMAGENES = {
  "capsulaAluminio.png": "capsulaAluminio.png",
  "capsulaDiagonal.png": "capsulaDiagonal.png",
  "capsulaPlastico.png": "capsulaPlastico.png",
  "discoPlastico.png": "discoPlastico.png",
};

// Función para obtener la imagen del accesorio
const getAccesorioImagen = (nombreAccesorio) => {
  

  if (!nombreAccesorio) return null;

  const nombre = nombreAccesorio.toLowerCase();
  

  if (nombre.includes("capsula") && nombre.includes("aluminio")) {
    console.log("   ✅ Match: capsulaAluminio.png");
    return "/assets/persianasCompacto/accesorios/capsulaAluminio.png";
  }
  if (nombre.includes("capsula") && nombre.includes("diagonal")) {
    console.log("   ✅ Match: capsulaDiagonal.png");
    return "/assets/persianasCompacto/accesorios/capsulaDiagonal.png";
  }
  if (nombre.includes("capsula") && nombre.includes("plastico")) {
    console.log("   ✅ Match: capsulaPlastico.png");
    return "/assets/persianasCompacto/accesorios/capsulaPlastico.png";
  }
  if (nombre.includes("disco") && nombre.includes("plastico")) {
    console.log("   ✅ Match: discoPlastico.png");
    return "/assets/persianasCompacto/accesorios/discoPlastico.png";
  }
  if (nombre.includes("tubo") || nombre.includes("eje")) {
    console.log("   ✅ Match: tuboEje.png");
    return "/assets/persianasCompacto/accesorios/tuboEje.png";
  }

  console.log("   ❌ No match encontrado");
  return null;
};

export default function ConfigCompacto({
  datosIniciales = null,
  onSubmit = null,
  guardando = false,
  modoEdicion = false,
  tipoOverride = null,
}) {
  const router = useRouter();
  const { tipo: tipoQuery } = router.query;

  // Usar tipoOverride si existe (modo edición), sino usar query
  const tipo = tipoOverride || tipoQuery;

  const { session, profile, loading } = useAuth();

  // Catálogo
  const [modelos, setModelos] = useState([]);
  const [acabados, setAcabados] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [combinaciones, setCombinaciones] = useState([]);

  // Selección
  const [modeloId, setModeloId] = useState("");
  const [acabadoId, setAcabadoId] = useState("");
  const [alto, setAlto] = useState("");
  const [ancho, setAncho] = useState("");
  const [accSel, setAccSel] = useState([]);

  // Precios
  const [precioGuiaMl, setPrecioGuiaMl] = useState(null);
  const [precioGuias, setPrecioGuias] = useState(0);
  const [accTotal, setAccTotal] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [total, setTotal] = useState(0);

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [ordenPrecio, setOrdenPrecio] = useState("asc");
  const [rangoPrecio, setRangoPrecio] = useState("todos");

  const tituloTipo =
    tipo === "pvc"
      ? "Compacto cajón PVC"
      : tipo === "aluminio"
      ? "Compacto cajón aluminio"
      : "Compacto";

  const modeloSel = useMemo(
    () => modelos.find((m) => m.id === modeloId),
    [modelos, modeloId]
  );
  const acabadoSel = useMemo(
    () => acabados.find((a) => a.id === acabadoId),
    [acabados, acabadoId]
  );

  
  useEffect(() => {
    if (!loading && !session && !modoEdicion) {
      router.replace("/login?m=login-required");
    }
  }, [loading, session, router, modoEdicion]);

  /* ================== CARGA CATÁLOGO ================== */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        

        const { modelos, acabados, accesorios, combinaciones, error } =
          await fetchCompactosCatalog();

        if (error) {
          console.error("❌ [fetchCompactosCatalog] error:", error);
        }

        if (!cancelled) {
          
          console.table(modelos);
          
          console.table(acabados);
          
          console.table(accesorios);
          

          setModelos(modelos || []);
          setAcabados(acabados || []);
          setAccesorios(accesorios || []);
          setCombinaciones(combinaciones || []);
        }
      } catch (e) {
        console.error("❌ [load catálogo] exception:", e);
        if (!cancelled) {
          setModelos([]);
          setAcabados([]);
          setAccesorios([]);
        }
      }
    };

    if (tipo || modoEdicion) {
      
      load();
    } else {
      console.log("⏸️ Esperando tipo o modo edición...");
    }

    return () => {
      cancelled = true;
    };
  }, [tipo, modoEdicion]);

  
  useEffect(() => {
    let cancelled = false;

    const loadDesc = async () => {
      if (!session?.user?.id) {
        
        return;
      }

      const uid = session.user.id;
      
      const { descuento: pct, error } = await fetchCompactosDescuento(uid);

      if (error) {
        console.warn("⚠️ [compactos descuento] error:", error);
      }

      if (!cancelled) {
        
        setDescuento(pct || 0);
      }
    };

    loadDesc();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  /* ================== PRECIO GUÍAS (€/ml) ================== */
  useEffect(() => {
    let cancelled = false;

    const loadPrecioGuia = async () => {
      setPrecioGuiaMl(null);
      if (!modeloId || !acabadoId) return;

      

      const { precioMl, error } = await fetchPrecioGuiaMl(
        modeloId,
        acabadoId
      );

      if (error) {
        console.error("❌ [fetchPrecioGuiaMl] error:", error);
        if (!cancelled) setPrecioGuiaMl(null);
        return;
      }

      if (precioMl === null) {
        console.warn("⚠️ NO ENCONTRADO precio para combinación:", {
          modeloId,
          acabadoId,
        });
        if (!cancelled) setPrecioGuiaMl(null);
        return;
      }

      if (!cancelled) {
        
        setPrecioGuiaMl(Number(precioMl));
      }
    };

    loadPrecioGuia();

    return () => {
      cancelled = true;
    };
  }, [modeloId, acabadoId, modeloSel, acabadoSel]);

  /* ================== CÁLCULOS ================== */
  useEffect(() => {
    const altoNum = alto ? parseFloat(String(alto).replace(",", ".")) : 0;
    const anchoNum = ancho ? parseFloat(String(ancho).replace(",", ".")) : 0;

    const tieneMedidas =
      altoNum > 0 &&
      anchoNum > 0 &&
      precioGuiaMl !== null &&
      !isNaN(precioGuiaMl);

    let pGuias = 0;

    if (tieneMedidas) {
      const altoM = altoNum / 1000;
      const anchoM = anchoNum / 1000;
      const perimetroM = (altoM + anchoM) * 2;
      pGuias = precioGuiaMl * perimetroM;
    }

    setPrecioGuias(+pGuias.toFixed(2));

    // Accesorios
    const acc = accSel.reduce((sum, a) => {
      return sum + Number(a.pvp || 0) * Number(a.unidades || 0);
    }, 0);
    setAccTotal(+acc.toFixed(2));

    // Subtotal y total con descuento
    const subtotal = pGuias + acc;
    const desc = subtotal * (descuento / 100);
    const tot = subtotal - desc;
    setTotal(+tot.toFixed(2));

    
  }, [alto, ancho, precioGuiaMl, accSel, descuento]);

  
  const onSetAccUnidades = (acc, value) => {
    const uds = Math.max(0, Math.min(10, parseInt(value || "0", 10))); // Límite de 10 unidades

    setAccSel((prev) => {
      const found = prev.find((x) => x.id === acc.id);

      if (!found && uds > 0) {
        return [
          ...prev,
          {
            id: acc.id,
            nombre: acc.nombre,
            pvp: Number(acc.pvp || 0),
            unidades: uds,
          },
        ];
      }

      if (found) {
        return prev
          .map((x) => (x.id === acc.id ? { ...x, unidades: uds } : x))
          .filter((x) => (x.unidades || 0) > 0);
      }

      return prev;
    });
  };

  /* ================== CARGAR DATOS INICIALES EN MODO EDICIÓN ================== */
  useEffect(() => {
    if (!datosIniciales || !modoEdicion) return;

    

    // Medidas
    if (datosIniciales.alto_mm) {
      setAlto(datosIniciales.alto_mm.toString());
    }
    if (datosIniciales.ancho_mm) {
      setAncho(datosIniciales.ancho_mm.toString());
    }

    // Accesorios
    if (datosIniciales.accesorios && Array.isArray(datosIniciales.accesorios)) {
      setAccSel(datosIniciales.accesorios);
    }

    // Descuento inicial (si no viene del perfil)
    if (datosIniciales.descuento_cliente && descuento === 0) {
      setDescuento(Number(datosIniciales.descuento_cliente));
    }
  }, [datosIniciales, modoEdicion, descuento]);

  
  useEffect(() => {
    if (!datosIniciales || !modoEdicion) return;
    if (modelos.length === 0 || acabados.length === 0) {
      
      return;
    }

    
    
    

    // Buscar acabado por nombre (guardado en color)
    if (datosIniciales.color && !acabadoId) {
      const acabadoEncontrado = acabados.find(
        (a) => a.nombre.toLowerCase() === datosIniciales.color.toLowerCase()
      );

      if (acabadoEncontrado) {
        
        setAcabadoId(acabadoEncontrado.id);
      } else {
        console.warn("⚠️ No se encontró acabado:", datosIniciales.color);
      }
    }

    // Si no hay un modelo específico guardado, seleccionar el primero disponible
    if (modelos.length > 0 && !modeloId) {
      
      setModeloId(modelos[0].id);
    }
  }, [datosIniciales, modoEdicion, modelos, acabados, modeloId, acabadoId]);

  
  async function guardar() {
    // MODO EDICIÓN: usar callback
    if (modoEdicion && onSubmit) {
      const datosPresupuesto = {
        cliente: profile?.usuario || datosIniciales?.cliente || "",
        email: profile?.email || datosIniciales?.email || "",
        cif: profile?.cif || datosIniciales?.cif || null,
        modelo: modeloSel?.nombre || null,
        acabado: acabadoSel?.nombre || null,
        alto_mm: Number(alto),
        ancho_mm: Number(ancho),
        color: acabadoSel?.nombre || null,
        medida_precio: Number(precioGuias),
        accesorios: accSel.map((a) => ({
          id: a.id,
          nombre: a.nombre,
          unidades: Number(a.unidades || 0),
          precio_unit: Number(a.pvp || 0),
        })),
        subtotal: Number(precioGuias + accTotal),
        descuento_cliente: Number(descuento),
        total: Number(total),
      };

      
      onSubmit(datosPresupuesto);
      return;
    }

    // MODO NORMAL: guardar nuevo presupuesto
    setSaving(true);
    setMsg("");

    try {
      if (!session?.user?.id) {
        router.push("/login?m=login-required");
        return;
      }

      if (!modeloId || !acabadoId || !alto || !ancho) {
        setMsg("⚠️ Completa todos los campos requeridos.");
        setSaving(false);
        return;
      }

      if (precioGuiaMl === null) {
        setMsg(
          "⚠️ No hay precio disponible para esta combinación. Contacta con administración."
        );
        setSaving(false);
        return;
      }

      const subtotal = Number(precioGuias) + Number(accTotal);

      const payload = {
        user_id: session.user.id,
        cliente: profile?.usuario || "",
        email: profile?.email || "",
        cif: profile?.cif || null,
        tipo: `compacto-${tipo}`,
        modelo: modeloSel?.nombre || null,
        acabado: acabadoSel?.nombre || null,
        alto_mm: Number(alto),
        ancho_mm: Number(ancho),
        medida_precio: Number(precioGuias),
        color: acabadoSel?.nombre || null,
        color_precio: 0,
        accesorios: accSel.map((a) => ({
          id: a.id,
          nombre: a.nombre,
          unidades: Number(a.unidades || 0),
          precio_unit: Number(a.pvp || 0),
        })),
        subtotal: Number(subtotal),
        descuento_cliente: Number(descuento),
        total: Number(total),
        pagado: false,
      };

      

      const { error } = await insertarPresupuestoCompacto(payload);

      if (error) {
        console.error("[insert presupuesto]", error);
        setMsg(`❌ No se pudo guardar: ${error.message || "error desconocido"}`);
        return;
      }

      setMsg("✅ Presupuesto guardado correctamente.");

      setTimeout(() => {
        router.push("/mis-presupuestos");
      }, 1500);
    } catch (e) {
      console.error("[guardar exception]", e);
      setMsg(`❌ Error inesperado: ${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  }

  
  return (
    <>
      <Head>
        <title>Configurar Compacto Cajón {tipo?.toUpperCase()} · PresuProsol</title>
      </Head>

      {/* Solo Header principal si NO está en modo edición */}
      {!modoEdicion && <Header />}

      <main className={styles.pageContainer}>
        {!modoEdicion && (
          <div className={styles.header}>
            <h1 className={styles.title}>{tituloTipo}</h1>
            <button
              className={styles.backButton}
              onClick={() => router.push("/compactos")}
            >
              ← Volver
            </button>
          </div>
        )}

        <div className={styles.card}>
          <div className={styles.formGrid}>
            {/* Modelo y Acabado */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Modelo de guía</label>
                <select
                  className={styles.select}
                  value={modeloId}
                  onChange={(e) => {
                    
                    const modelo = modelos.find((m) => m.id === e.target.value);
                    
                    setModeloId(e.target.value);
                    setAcabadoId(""); // Reset acabado al cambiar modelo
                  }}
                >
                  <option value="">Selecciona modelo…</option>
                  {modelos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
                <small style={{ color: "#718096", display: "block", marginTop: "0.25rem" }}>
                  Total modelos: {modelos.length}
                </small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Acabado</label>
                <select
                  className={styles.select}
                  value={acabadoId}
                  onChange={(e) => setAcabadoId(e.target.value)}
                  disabled={!modeloId}
                >
                  <option value="">
                    {modeloId ? "Selecciona acabado…" : "Primero selecciona un modelo"}
                  </option>
                  {acabados
                    .filter((a) => {
                      // Solo mostrar acabados que tengan combinación válida con el modelo seleccionado
                      if (!modeloId) return false;
                      return combinaciones.some(
                        (c) => c.modeloId === modeloId && c.acabadoId === a.id
                      );
                    })
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                </select>

                {!modeloId && !acabadoId && (
                  <small style={{ color: "#718096", display: "block", marginTop: "0.25rem" }}>
                    Selecciona modelo y acabado
                  </small>
                )}

                {modeloId && !acabadoId && (
                  <small style={{ color: "#718096", display: "block", marginTop: "0.25rem" }}>
                    Selecciona un acabado
                  </small>
                )}

                {modeloId && acabadoId && precioGuiaMl === null && (
                  <small style={{ color: "#e53e3e", display: "block", marginTop: "0.25rem" }}>
                    Precio guías: consultar
                  </small>
                )}

                {modeloId && acabadoId && precioGuiaMl !== null && (
                  <small style={{ color: "#48bb78", display: "block", marginTop: "0.25rem", fontWeight: 600 }}>
                    Precio guías: {Number(precioGuiaMl).toFixed(2)} €/ml
                  </small>
                )}
              </div>
            </div>

            {/* Medidas */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Alto (mm)</label>
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  max={1000}
                  value={alto}
                  onChange={(e) => {
                    const valor = parseInt(e.target.value) || 0;
                    setAlto(Math.min(1000, Math.max(0, valor)).toString());
                  }}
                  onBlur={(e) => {
                    const valor = parseInt(e.target.value) || 0;
                    if (valor > 1000) setAlto("1000");
                  }}
                />
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  Máximo: 1000 mm
                </small>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Ancho (mm)</label>
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  max={2500}
                  value={ancho}
                  onChange={(e) => {
                    const valor = parseInt(e.target.value) || 0;
                    setAncho(Math.min(2500, Math.max(0, valor)).toString());
                  }}
                  onBlur={(e) => {
                    const valor = parseInt(e.target.value) || 0;
                    if (valor > 2500) setAncho("2500");
                  }}
                />
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  Máximo: 2500 mm
                </small>
              </div>
            </div>

            {/* Accesorios */}
            <div className={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className={styles.sectionTitle}>Accesorios</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: '#666' }}>Rango de precio:</label>
                    <select 
                      className={styles.select}
                      value={rangoPrecio}
                      onChange={(e) => setRangoPrecio(e.target.value)}
                      style={{ width: 'auto', padding: '0.5rem' }}
                    >
                      <option value="todos">Todos</option>
                      <option value="0-10">0€ - 10€</option>
                      <option value="10-20">10€ - 20€</option>
                      <option value="20-50">20€ - 50€</option>
                      <option value="50+">Más de 50€</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: '#666' }}>Ordenar:</label>
                    <select 
                      className={styles.select}
                      value={ordenPrecio}
                      onChange={(e) => setOrdenPrecio(e.target.value)}
                      style={{ width: 'auto', padding: '0.5rem' }}
                    >
                      <option value="asc">Menor a mayor</option>
                      <option value="desc">Mayor a menor</option>
                    </select>
                  </div>
                </div>
              </div>
              {accesorios.length === 0 && (
                <p className={styles.emptyMessage}>No hay accesorios disponibles</p>
              )}
              <div className={styles.accesoriosGrid}>
                {[...accesorios]
                  .sort((a, b) => {
                    if (ordenPrecio === 'asc') {
                      return a.pvp - b.pvp;
                    } else {
                      return b.pvp - a.pvp;
                    }
                  })
                  .map((a) => {
                  const sel = accSel.find((x) => x.id === a.id)?.unidades || 0;
                  const imgSrc = getAccesorioImagen(a.nombre);
                  
                  // Filtrar por rango de precio
                  let enRango = true;
                  const precio = a.pvp;
                  if (rangoPrecio === '0-10') enRango = precio >= 0 && precio <= 10;
                  else if (rangoPrecio === '10-20') enRango = precio > 10 && precio <= 20;
                  else if (rangoPrecio === '20-50') enRango = precio > 20 && precio <= 50;
                  else if (rangoPrecio === '50+') enRango = precio > 50;

                  return (
                    <div 
                      className={styles.accesorioCard} 
                      key={a.id}
                      style={{ 
                        opacity: enRango ? 1 : 0.4,
                        pointerEvents: enRango ? 'auto' : 'none',
                        filter: enRango ? 'none' : 'grayscale(1)'
                      }}
                    >
                      <div className={styles.accesorioImage}>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={a.nombre}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        ) : (
                          <div style={{ fontSize: "48px", color: "#dee2e6" }}>📦</div>
                        )}
                      </div>
                      <div className={styles.accesorioInfo}>
                        <div className={styles.accesorioName}>{a.nombre}</div>
                        <div className={styles.accesorioPrecio}>
                          {Number(a.pvp || 0).toFixed(2)} € / {a.unidad}
                        </div>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={1}
                        className={`${styles.input} ${styles.accesorioInput}`}
                        value={sel}
                        onChange={(e) => onSetAccUnidades(a, e.target.value)}
                        title="Máximo 10 unidades"
                        disabled={!enRango}
                      />
                    </div>
                  );
                })}
              </div>

              {accSel.length > 0 && (
                <div className={styles.hint}>
                  💡 Total accesorios: <strong>{accTotal.toFixed(2)} €</strong>
                </div>
              )}
            </div>

            {/* Resumen */}
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>
                  Precio guías
                  {precioGuiaMl !== null ? ` (${precioGuiaMl.toFixed(2)} €/ml)` : ""}:
                </span>
                <span className={styles.summaryValue}>{precioGuias.toFixed(2)} €</span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Accesorios:</span>
                <span className={styles.summaryValue}>{accTotal.toFixed(2)} €</span>
              </div>

              {descuento > 0 && (
                <>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Subtotal:</span>
                    <span className={styles.summaryValue}>
                      {(precioGuias + accTotal).toFixed(2)} €
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Descuento ({descuento}%):</span>
                    <span className={styles.summaryValue} style={{ color: "#e53e3e" }}>
                      -{((precioGuias + accTotal) * (descuento / 100)).toFixed(2)} €
                    </span>
                  </div>
                </>
              )}

              {descuento === 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Descuento cliente:</span>
                  <span className={styles.summaryValue}>{descuento}%</span>
                </div>
              )}

              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span className={styles.summaryLabel}>TOTAL:</span>
                <span className={styles.summaryValue}>{total.toFixed(2)} €</span>
              </div>
            </div>

            {msg && (
              <div className={msg.startsWith("✅") ? styles.alertSuccess : styles.alertWarning}>
                {msg}
              </div>
            )}

            <button
              className={styles.submitButton}
              onClick={guardar}
              disabled={
                saving ||
                guardando ||
                !modeloId ||
                !acabadoId ||
                !alto ||
                !ancho ||
                precioGuiaMl === null
              }
            >
              {saving || guardando ? (
                <>
                  <span className={styles.spinner}></span>
                  {modoEdicion ? "Actualizando…" : "Guardando…"}
                </>
              ) : (
                <>{modoEdicion ? "💾 Guardar Cambios" : "💾 Guardar presupuesto"}</>
              )}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
