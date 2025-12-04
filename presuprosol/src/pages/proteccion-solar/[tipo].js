// src/pages/proteccion-solar/[tipo].js
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/ConfigPages.module.css";

import {
  fetchCatalogoProteccionSolar,
  fetchDescuentoClienteProteccionSolar,
  fetchPrecioProteccionSolar,
  insertarPresupuestoProteccionSolar,
} from "../api/proteccionSolar";

export default function ConfigProteccionSolar({
  datosIniciales = null,
  onSubmit = null,
  guardando = false,
  modoEdicion = false,
  tipoOverride = null,
}) {
  const router = useRouter();
  const { tipo: tipoQuery } = router.query;

  const tipo = tipoOverride || tipoQuery;

  const { session, profile, loading } = useAuth();

  const [modelos, setModelos] = useState([]);
  const [colores, setColores] = useState([]);
  const [accesorios, setAccesorios] = useState([]);

  const [modeloId, setModeloId] = useState("");
  const [colorId, setColorId] = useState("");
  const [accSel, setAccSel] = useState([]);

  const [precioBase, setPrecioBase] = useState(null);
  const [incrementoColor, setIncrementoColor] = useState(0);
  const [accTotal, setAccTotal] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [total, setTotal] = useState(0);

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [ordenPrecio, setOrdenPrecio] = useState("asc");
  const [rangoPrecio, setRangoPrecio] = useState("todos");

  const tituloTipo = tipo || "Protección Solar";

  const modeloSel = useMemo(
    () => modelos.find((m) => m.id === modeloId),
    [modelos, modeloId]
  );

  const colorSel = useMemo(
    () => colores.find((c) => c.id === colorId),
    [colores, colorId]
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
        

        const { modelos, colores, accesorios } =
          await fetchCatalogoProteccionSolar();

        if (!cancelled) {
          
          setModelos(modelos);
          setColores(colores);
          setAccesorios(accesorios);
        }
      } catch (e) {
        console.error("💥 Error cargando catálogo:", e);
        if (!cancelled) {
          setModelos([]);
          setColores([]);
          setAccesorios([]);
        }
      }
    };

    if (tipo || modoEdicion) load();

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
      
      const pct = await fetchDescuentoClienteProteccionSolar(
        session.user.id
      );
      if (!cancelled) {
        
        setDescuento(pct);
      }
    };

    loadDesc();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  /* ================== CARGAR DATOS INICIALES EN MODO EDICIÓN ================== */
  useEffect(() => {
    if (!datosIniciales || !modoEdicion) return;

    

    // Modelo
    if (datosIniciales.tipo && modelos.length > 0) {
      const tipoPresupuesto = datosIniciales.tipo.replace(
        "proteccion-solar-",
        ""
      );
      const modeloEncontrado = modelos.find((m) =>
        m.nombre.toLowerCase().includes(tipoPresupuesto.toLowerCase())
      );

      if (modeloEncontrado) {
        
        setModeloId(String(modeloEncontrado.id));
      } else {
        
        setModeloId(String(modelos[0].id));
      }
    }

    // Color
    if (datosIniciales.color && colores.length > 0) {
      const colorEncontrado = colores.find(
        (c) => c.nombre.toLowerCase() === datosIniciales.color.toLowerCase()
      );
      if (colorEncontrado) {
        
        setColorId(String(colorEncontrado.id));
      }
    }

    // Accesorios
    if (datosIniciales.accesorios && Array.isArray(datosIniciales.accesorios)) {
      
      const accesoriosNormalizados = datosIniciales.accesorios.map((a) => ({
        id: a.id,
        nombre: a.nombre,
        pvp: Number(a.precio_unit || 0),
        unidades: Number(a.unidades || 0),
      }));
      setAccSel(accesoriosNormalizados);
    }

    // Precio base
    if (datosIniciales.medida_precio) {
      
      setPrecioBase(Number(datosIniciales.medida_precio));
    }

    // Incremento color
    if (datosIniciales.color_precio) {
      
      setIncrementoColor(Number(datosIniciales.color_precio));
    }

    // Descuento
    if (datosIniciales.descuento_cliente && descuento === 0) {
      
      setDescuento(Number(datosIniciales.descuento_cliente));
    }
  }, [datosIniciales, modoEdicion, modelos, colores, descuento]);

  
  useEffect(() => {
    const loadPrecio = async () => {
      setPrecioBase(null);
      setIncrementoColor(0);

      if (!modeloId || !colorId) return;

      const modelo = modelos.find((m) => m.id === modeloId);
      const color = colores.find((c) => c.id === colorId);

      if (!modelo || !color) return;

      try {
        const { precio, incrementoColor } = await fetchPrecioProteccionSolar({
          modeloId: modelo.id,
          colorId: color.id,
        });

        setPrecioBase(precio);
        setIncrementoColor(incrementoColor);
      } catch (e) {
        console.error("💥 EXCEPTION precio:", e);
        setPrecioBase(null);
        setIncrementoColor(0);
      }
    };

    loadPrecio();
  }, [modeloId, colorId, modelos, colores]);

  /* ================== CÁLCULOS ================== */
  useEffect(() => {
    const acc = accSel.reduce((sum, a) => {
      return sum + Number(a.pvp || 0) * Number(a.unidades || 0);
    }, 0);

    setAccTotal(+acc.toFixed(2));

    const subtotal = (precioBase || 0) + incrementoColor + acc;
    const desc = subtotal * (descuento / 100);
    const tot = subtotal - desc;

    setTotal(+tot.toFixed(2));
  }, [precioBase, incrementoColor, accSel, descuento]);

  
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
          .filter((x) => x.unidades > 0);
      }

      return prev;
    });
  };

  /* ================== FUNCIÓN PARA OBTENER IMAGEN ACCESORIO ================== */
  function getImagenAccesorio(nombreAccesorio) {
    if (!nombreAccesorio) return null;

    const nombre = nombreAccesorio.toLowerCase();

    if (nombre.includes("kit") && nombre.includes("fijación")) {
      return "/assets/proteccionSolar/accesorios/kitFijacion.png";
    }

    if (nombre.includes("motor") && nombre.includes("40")) {
      return "/assets/proteccionSolar/accesorios/motorRadio.png";
    }

    if (nombre.includes("motor") && nombre.includes("50")) {
      return "/assets/proteccionSolar/accesorios/motorRadio.png";
    }

    if (nombre.includes("sensor")) {
      return "/assets/proteccionSolar/accesorios/sensorRadio.png";
    }

    if (nombre.includes("manivela")) {
      return "/assets/proteccionSolar/accesorios/manivelaMonoblock.png";
    }

    return null;
  }

  
  async function guardar() {
    // MODO EDICIÓN: usar callback
    if (modoEdicion && onSubmit) {
      const subtotal = (precioBase || 0) + incrementoColor + accTotal;

      const datosPresupuesto = {
        cliente: profile?.usuario || datosIniciales?.cliente || "",
        email: profile?.email || datosIniciales?.email || "",
        cif: profile?.cif || datosIniciales?.cif || null,
        modelo: modeloSel?.nombre || null,
        medida_precio: precioBase || 0,
        color: colorSel?.nombre || null,
        color_precio: incrementoColor,
        accesorios: accSel.map((a) => ({
          id: a.id,
          nombre: a.nombre,
          unidades: a.unidades,
          precio_unit: a.pvp,
        })),
        subtotal: subtotal,
        descuento_cliente: descuento,
        total: total,
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

      if (!modeloId || !colorId || precioBase === null) {
        setMsg("⚠️ Completa todos los campos.");
        return;
      }

      const subtotal = (precioBase || 0) + incrementoColor + accTotal;

      const payload = {
        user_id: session.user.id,
        cliente: profile?.usuario || "",
        email: profile?.email || "",
        cif: profile?.cif || null,
        tipo: `proteccion-solar-${tipo}`,
        modelo: modeloSel?.nombre || null,
        alto_mm: 0,
        ancho_mm: 0,
        medida_precio: precioBase || 0,
        color: colorSel?.nombre || null,
        color_precio: incrementoColor,
        accesorios: accSel.map((a) => ({
          id: a.id,
          nombre: a.nombre,
          unidades: a.unidades,
          precio_unit: a.pvp,
        })),
        subtotal: subtotal,
        descuento_cliente: descuento,
        total: total,
        pagado: false,
      };

      

      await insertarPresupuestoProteccionSolar(payload);

      setMsg("✅ Presupuesto guardado correctamente.");

      setTimeout(() => {
        router.push("/");
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
        <title>{`Configurar ${tituloTipo} · PresuProsol`}</title>
      </Head>

      {!modoEdicion && <Header />}

      <main className={styles.pageContainer}>
        {!modoEdicion && (
          <div className={styles.header}>
            <h1 className={styles.title}>{tituloTipo}</h1>
            <button
              className={styles.backButton}
              onClick={() => router.push("/proteccion-solar")}
            >
              ← Volver
            </button>
          </div>
        )}

        <div className={styles.card}>
          <div className={styles.formGrid}>
            {/* Modelo y Color */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Modelo</label>
                <select
                  className={styles.select}
                  value={modeloId}
                  onChange={(e) => setModeloId(e.target.value)}
                >
                  <option value="">Selecciona modelo…</option>
                  {modelos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} {m.descripcion && `- ${m.descripcion}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Color / Estructura</label>
                <select
                  className={styles.select}
                  value={colorId}
                  onChange={(e) => setColorId(e.target.value)}
                >
                  <option value="">Selecciona color…</option>
                  {colores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                      {c.incremento_m2 > 0 && ` (+${c.incremento_m2} €)`}
                    </option>
                  ))}
                </select>

                {precioBase === null && modeloId && colorId && (
                  <small style={{ color: "#e53e3e", display: "block", marginTop: "0.25rem" }}>
                    Precio: consultar
                  </small>
                )}

                {precioBase !== null && (
                  <small style={{ color: "#718096", display: "block", marginTop: "0.25rem" }}>
                    Precio base: {precioBase.toFixed(2)} €
                  </small>
                )}
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
              {accesorios.length > 0 && (
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
                    const imagenUrl = getImagenAccesorio(a.nombre);
                    
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
                          {imagenUrl ? (
                            <img
                              src={imagenUrl}
                              alt={a.nombre}
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                              onError={(e) => {
                                console.error("❌ Error cargando imagen:", imagenUrl);
                                e.target.style.display = "none";
                              }}
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
              )}
            </div>

            {/* Resumen */}
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Precio base:</span>
                <span className={styles.summaryValue}>
                  {precioBase !== null ? precioBase.toFixed(2) : "0.00"} €
                </span>
              </div>

              {incrementoColor > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Incremento color:</span>
                  <span className={styles.summaryValue}>{incrementoColor.toFixed(2)} €</span>
                </div>
              )}

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Accesorios:</span>
                <span className={styles.summaryValue}>{accTotal.toFixed(2)} €</span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Descuento cliente:</span>
                <span className={styles.summaryValue}>{descuento}%</span>
              </div>

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
                !colorId ||
                precioBase === null
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
