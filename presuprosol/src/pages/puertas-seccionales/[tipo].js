// src/pages/puertas-seccionales/[tipo].js
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/ConfigPages.module.css";

import {
  fetchCatalogoPuertasSeccionales,
  fetchDescuentoClientePuertas,
  fetchPrecioPuertaSeccional,
  insertarPresupuestoPuertaSeccional,
} from "../api/puertasSeccionales";

export default function ConfigPuertaSeccional({
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

  const [medidas, setMedidas] = useState([]);
  const [colores, setColores] = useState([]);
  const [accesorios, setAccesorios] = useState([]);

  const [medidaId, setMedidaId] = useState("");
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

  const tituloTipo =
    tipo === "residencial"
      ? "Puerta Seccional Residencial"
      : "Puerta Seccional Industrial";

  const medidaSel = useMemo(
    () => medidas.find((m) => m.id === medidaId),
    [medidas, medidaId]
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
        

        const { medidas, colores, accesorios } =
          await fetchCatalogoPuertasSeccionales();

        if (!cancelled) {
          
          setMedidas(medidas);
          setColores(colores);
          setAccesorios(accesorios);
        }
      } catch (e) {
        console.error("💥 Error cargando catálogo:", e);
        if (!cancelled) {
          setMedidas([]);
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

      try {
        
        const pct = await fetchDescuentoClientePuertas(session.user.id);
        if (!cancelled) {
          
          setDescuento(pct);
        }
      } catch (e) {
        console.error("❌ [puertas descuento] exception:", e);
        if (!cancelled) {
          setDescuento(0);
        }
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

    

    // Medida - buscar por alto y ancho
    if (
      datosIniciales.alto_mm &&
      datosIniciales.ancho_mm &&
      medidas.length > 0
    ) {
      const medidaEncontrada = medidas.find(
        (m) =>
          m.alto_mm === Number(datosIniciales.alto_mm) &&
          m.ancho_mm === Number(datosIniciales.ancho_mm)
      );
      if (medidaEncontrada) {
        
        setMedidaId(String(medidaEncontrada.id));
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
  }, [datosIniciales, modoEdicion, medidas, colores, descuento]);

  
  useEffect(() => {
    const loadPrecio = async () => {
      setPrecioBase(null);
      setIncrementoColor(0);

      if (!medidaId || !colorId) return;

      const medida = medidas.find((m) => m.id === medidaId);
      const color = colores.find((c) => c.id === colorId);

      if (!medida || !color) return;

      try {
        const { precio, incrementoColor } = await fetchPrecioPuertaSeccional({
          ancho_mm: medida.ancho_mm,
          alto_mm: medida.alto_mm,
          colorId: color.id,
        });

        setPrecioBase(precio);
        setIncrementoColor(incrementoColor);
      } catch (e) {
        console.error("💥 Error precio:", e);
        setPrecioBase(null);
        setIncrementoColor(0);
      }
    };

    loadPrecio();
  }, [medidaId, colorId, medidas, colores]);

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
    const uds = Math.max(0, Math.min(10, parseInt(value || "0", 10)));

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
          .map((x) =>
            x.id === acc.id ? { ...x, unidades: uds } : x
          )
          .filter((x) => x.unidades > 0);
      }

      return prev;
    });
  };

  /* ================== FUNCIÓN PARA OBTENER IMAGEN ACCESORIO ================== */
  function getImagenAccesorio(nombreAccesorio) {
    if (!nombreAccesorio) return null;

    const nombre = nombreAccesorio.toLowerCase();

    if (nombre.includes("centralita")) {
      return "/assets/puertasGaraje/accesorios/centralita.png";
    }

    if (nombre.includes("decodificador")) {
      return "/assets/puertasGaraje/accesorios/decodificador.png";
    }

    if (nombre.includes("emisor")) {
      return "/assets/puertasGaraje/accesorios/emisor.png";
    }

    if (nombre.includes("fotocelula") || nombre.includes("fotocélula")) {
      return "/assets/puertasGaraje/accesorios/fotocelula.png";
    }

    if (nombre.includes("kit") && nombre.includes("fijacion")) {
      return "/assets/puertasGaraje/accesorios/kitFijacion.png";
    }

    if (nombre.includes("llavero")) {
      return "/assets/puertasGaraje/accesorios/llavero.png";
    }

    if (nombre.includes("luz") && nombre.includes("parpadeante")) {
      return "/assets/puertasGaraje/accesorios/luzParpadeante.png";
    }

    if (nombre.includes("manivela")) {
      return "/assets/puertasGaraje/accesorios/manivelaMonoblock.png";
    }

    if (nombre.includes("motor")) {
      return "/assets/puertasGaraje/accesorios/motor.png";
    }

    if (nombre.includes("pulsador")) {
      return "/assets/puertasGaraje/accesorios/pulsadorPared.png";
    }

    if (nombre.includes("sensor")) {
      return "/assets/puertasGaraje/accesorios/sensorRadio.png";
    }

    if (nombre.includes("tarjeta")) {
      return "/assets/puertasGaraje/accesorios/tarjeta.png";
    }

    if (nombre.includes("unidad") && nombre.includes("mando")) {
      return "/assets/puertasGaraje/accesorios/unidadMando.png";
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
        alto_mm: medidaSel?.alto_mm || 0,
        ancho_mm: medidaSel?.ancho_mm || 0,
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

      if (!medidaId || !colorId) {
        setMsg("⚠️ Completa todos los campos requeridos.");
        return;
      }

      if (precioBase === null) {
        setMsg(
          "⚠️ No hay precio disponible para esta combinación. Contacta con administración."
        );
        return;
      }

      const subtotal = (precioBase || 0) + incrementoColor + accTotal;

      const payload = {
        user_id: session.user.id,
        cliente: profile?.usuario || "",
        email: profile?.email || "",
        cif: profile?.cif || null,
        tipo: `puerta-seccional-${tipo}`,
        alto_mm: medidaSel?.alto_mm || 0,
        ancho_mm: medidaSel?.ancho_mm || 0,
        medida_precio: precioBase || 0,
        color: colorSel?.nombre || null,
        color_precio: incrementoColor,
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

      

      await insertarPresupuestoPuertaSeccional(payload);

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
              onClick={() => router.push("/puertas-seccionales")}
            >
              ← Volver
            </button>
          </div>
        )}

        <div className={styles.card}>
          <div className={styles.formGrid}>
            {/* Medida y Color */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Medida (ancho × alto)</label>
                <select
                  className={styles.select}
                  value={medidaId}
                  onChange={(e) => setMedidaId(e.target.value)}
                >
                  <option value="">Selecciona medida…</option>
                  {medidas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.ancho_mm} × {m.alto_mm} mm
                    </option>
                  ))}
                </select>
                {medidas.length === 0 && (
                  <small style={{ color: "#718096", display: "block", marginTop: "0.25rem" }}>
                    No hay medidas disponibles
                  </small>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Color / Acabado</label>
                <select
                  className={styles.select}
                  value={colorId}
                  onChange={(e) => setColorId(e.target.value)}
                >
                  <option value="">Selecciona color…</option>
                  {colores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}{" "}
                      {c.incremento_eur_m2 > 0 &&
                        `(+${c.incremento_eur_m2.toFixed(2)} €/m²)`}
                    </option>
                  ))}
                </select>

                {precioBase === null && medidaId && colorId && (
                  <small style={{ color: "#e53e3e", display: "block", marginTop: "0.25rem" }}>
                    Precio: consultar
                  </small>
                )}

                {precioBase !== null && medidaId && colorId && (
                  <small style={{ color: "#718096", display: "block", marginTop: "0.25rem" }}>
                    Precio base: {Number(precioBase).toFixed(2)} €
                  </small>
                )}

                {colores.length === 0 && (
                  <small style={{ color: "#718096", display: "block", marginTop: "0.25rem" }}>
                    No hay colores disponibles
                  </small>
                )}
              </div>
            </div>

            {/* Accesorios */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Accesorios</h2>
              
              {accesorios.length > 0 && (
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: '#666' }}>Filtrar:</label>
                    <select
                      className={styles.select}
                      value={rangoPrecio}
                      onChange={(e) => setRangoPrecio(e.target.value)}
                      style={{ width: "auto", padding: "0.5rem" }}
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
                      style={{ width: "auto", padding: "0.5rem" }}
                    >
                      <option value="asc">Menor a mayor</option>
                      <option value="desc">Mayor a menor</option>
                    </select>
                  </div>
                </div>
              )}
              
              {accesorios.length === 0 && (
                <p className={styles.emptyMessage}>No hay accesorios disponibles</p>
              )}
              {accesorios.length > 0 && (
                <div className={styles.accesoriosGrid}>
                  {[...accesorios]
                    .sort((a, b) => {
                      const precioA = Number(a.pvp || 0);
                      const precioB = Number(b.pvp || 0);
                      return ordenPrecio === "asc" ? precioA - precioB : precioB - precioA;
                    })
                    .map((a) => {
                      const sel = accSel.find((x) => x.id === a.id)?.unidades || 0;
                      const imagenUrl = getImagenAccesorio(a.nombre);
                      const precio = Number(a.pvp || 0);
                      
                      let enRango = true;
                      if (rangoPrecio === "0-10") {
                        enRango = precio >= 0 && precio <= 10;
                      } else if (rangoPrecio === "10-20") {
                        enRango = precio > 10 && precio <= 20;
                      } else if (rangoPrecio === "20-50") {
                        enRango = precio > 20 && precio <= 50;
                      } else if (rangoPrecio === "50+") {
                        enRango = precio > 50;
                      }

                      return (
                        <div 
                          className={styles.accesorioCard} 
                          key={a.id}
                          style={{
                            opacity: enRango ? 1 : 0.4,
                            filter: enRango ? "none" : "grayscale(1)",
                            pointerEvents: enRango ? "auto" : "none"
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
                              {precio.toFixed(2)} € / {a.unidad}
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
                            disabled={!enRango}
                            title="Máximo 10 unidades"
                          />
                        </div>
                      );
                    })}
                </div>
              )}

              {accSel.length > 0 && (
                <div className={styles.hint}>
                  💡 Total accesorios: <strong>{accTotal.toFixed(2)} €</strong>
                </div>
              )}
            </div>

            {/* Resumen */}
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Precio base:</span>
                <span className={styles.summaryValue}>{(precioBase || 0).toFixed(2)} €</span>
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

            {/* MENSAJE */}
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
                !medidaId ||
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
