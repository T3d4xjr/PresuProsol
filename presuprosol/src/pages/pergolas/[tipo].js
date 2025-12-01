// src/pages/pergolas/[tipo].js
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/ConfigPages.module.css";

import {
  fetchCatalogoPergolas,
  fetchDescuentoClientePergolas,
  fetchPrecioPergola,
  insertarPresupuestoPergola,
} from "../api/pergolas";

const PRESUPUESTO_MINIMO = 2500;

export default function ConfigPergola({
  datosIniciales = null,
  onSubmit = null,
  guardando = false,
  modoEdicion = false,
}) {
  const router = useRouter();
  const { tipo } = router.query;
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

  const medidaSel = useMemo(
    () => medidas.find((m) => m.id === medidaId),
    [medidas, medidaId]
  );

  const colorSel = useMemo(
    () => colores.find((c) => c.id === colorId),
    [colores, colorId]
  );

  /* ================== ACCESO ================== */
  useEffect(() => {
    if (!loading && !session && !modoEdicion) {
      router.replace("/login?m=login-required");
    }
  }, [loading, session, router, modoEdicion]);

  /* ================== VALIDAR TIPO ================== */
  useEffect(() => {
    if (tipo && tipo !== "bioclimatica" && !modoEdicion) {
      router.replace("/pergolas");
    }
  }, [tipo, router, modoEdicion]);

  /* ================== CARGA CATÁLOGO ================== */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        console.log("🔄 [CARGANDO CATÁLOGO PÉRGOLAS DESDE API] tipo:", tipo, "modoEdicion:", modoEdicion);
        const { medidas, colores, accesorios } = await fetchCatalogoPergolas();
        if (!cancelled) {
          console.log("✅ Catálogo pérgolas cargado:", { medidas: medidas.length, colores: colores.length, accesorios: accesorios.length });
          setMedidas(medidas);
          setColores(colores);
          setAccesorios(accesorios);
        }
      } catch (e) {
        console.error("💥 [load catálogo] exception:", e);
        if (!cancelled) {
          setMedidas([]);
          setColores([]);
          setAccesorios([]);
        }
      }
    };

    if (tipo === "bioclimatica" || modoEdicion) load();

    return () => {
      cancelled = true;
    };
  }, [tipo, modoEdicion]);

  /* ================== DESCUENTO CLIENTE ================== */
  useEffect(() => {
    let cancelled = false;

    const loadDesc = async () => {
      if (!session?.user?.id) {
        console.log("⏸️ [DESCUENTO PÉRGOLAS] No hay usuario");
        return;
      }
      console.log("💰 [CARGANDO DESCUENTO PÉRGOLAS] uid:", session.user.id);
      const pct = await fetchDescuentoClientePergolas(session.user.id);
      if (!cancelled) {
        console.log("✅ Descuento pérgolas cargado:", pct, "%");
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

    console.log(
      "📝 [MODO EDICIÓN PÉRGOLA] Cargando datos iniciales:",
      datosIniciales
    );

    if (
      datosIniciales.ancho_mm &&
      datosIniciales.alto_mm &&
      medidas.length > 0
    ) {
      const medidaEncontrada = medidas.find(
        (m) =>
          m.ancho_mm === Number(datosIniciales.ancho_mm) &&
          m.fondo_mm === Number(datosIniciales.alto_mm)
      );
      if (medidaEncontrada) {
        console.log(
          "   → Medida encontrada:",
          medidaEncontrada.ancho_mm,
          "×",
          medidaEncontrada.fondo_mm
        );
        setMedidaId(String(medidaEncontrada.id));
      }
    }

    if (datosIniciales.color && colores.length > 0) {
      const colorEncontrado = colores.find(
        (c) => c.nombre.toLowerCase() === datosIniciales.color.toLowerCase()
      );
      if (colorEncontrado) {
        console.log("   → Color encontrado:", colorEncontrado.nombre);
        setColorId(String(colorEncontrado.id));
      }
    }

    if (
      datosIniciales.accesorios &&
      Array.isArray(datosIniciales.accesorios)
    ) {
      console.log("   → Accesorios:", datosIniciales.accesorios.length);
      const accesoriosNormalizados = datosIniciales.accesorios.map((a) => ({
        id: a.id,
        nombre: a.nombre,
        pvp: Number(a.precio_unit || 0),
        unidades: Number(a.unidades || 0),
      }));
      setAccSel(accesoriosNormalizados);
    }

    if (datosIniciales.medida_precio) {
      console.log("   → Precio base:", datosIniciales.medida_precio);
      setPrecioBase(Number(datosIniciales.medida_precio));
    }

    if (datosIniciales.color_precio) {
      console.log("   → Incremento color:", datosIniciales.color_precio);
      setIncrementoColor(Number(datosIniciales.color_precio));
    }

    if (datosIniciales.descuento_cliente && descuento === 0) {
      console.log("   → Descuento inicial:", datosIniciales.descuento_cliente);
      setDescuento(Number(datosIniciales.descuento_cliente));
    }
  }, [datosIniciales, modoEdicion, medidas, colores, descuento]);

  /* ================== PRECIO BASE ================== */
  useEffect(() => {
    const loadPrecio = async () => {
      setPrecioBase(null);
      setIncrementoColor(0);

      if (!medidaId || !colorId) return;

      const medida = medidas.find((m) => m.id === medidaId);
      const color = colores.find((c) => c.id === colorId);

      if (!medida || !color) return;

      try {
        const { precio, incrementoColor } = await fetchPrecioPergola({
          ancho_mm: medida.ancho_mm,
          fondo_mm: medida.fondo_mm,
          colorId: color.id,
        });

        setPrecioBase(precio);
        setIncrementoColor(incrementoColor);
      } catch (e) {
        console.error("💥 [loadPrecio] exception:", e);
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

  /* ================== HANDLERS ================== */
  const onSetAccUnidades = (acc, value) => {
    const uds = Math.max(0, parseInt(value || "0", 10));

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

  /* ================== FUNCIÓN PARA OBTENER IMAGEN ACCESORIO ================== */
  function getImagenAccesorio(nombreAccesorio) {
    if (!nombreAccesorio) return null;

    const nombre = nombreAccesorio.toLowerCase();

    if (nombre.includes("cerramiento")) {
      return "/assets/pergolaBioclimatica/accesorios/cerramiento.png";
    }

    if (nombre.includes("agua") || nombre.includes("riego")) {
      return "/assets/pergolaBioclimatica/accesorios/kitAgua.png";
    }

    if (nombre.includes("kit") && nombre.includes("perimetral")) {
      return "/assets/pergolaBioclimatica/accesorios/kitIluminacion.png";
    }

    if (nombre.includes("mando")) {
      return "/assets/pergolaBioclimatica/accesorios/mando.png";
    }

    if (nombre.includes("sensor")) {
      return "/assets/pergolaBioclimatica/accesorios/sensorRadio.png";
    }

    return null;
  }

  /* ================== GUARDAR ================== */
  async function guardar() {
    // MODO EDICIÓN
    if (modoEdicion && onSubmit) {
      const subtotal = (precioBase || 0) + incrementoColor + accTotal;

      const datosPresupuesto = {
        cliente: profile?.usuario || datosIniciales?.cliente || "",
        email: profile?.email || datosIniciales?.email || "",
        cif: profile?.cif || datosIniciales?.cif || null,
        ancho_mm: medidaSel?.ancho_mm || 0,
        alto_mm: medidaSel?.fondo_mm || 0,
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

      console.log("💾 [MODO EDICIÓN PÉRGOLA] Enviando datos:", datosPresupuesto);
      onSubmit(datosPresupuesto);
      return;
    }

    // MODO NORMAL
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

      if (total < PRESUPUESTO_MINIMO) {
        setMsg(
          `⚠️ El presupuesto debe ser superior a ${PRESUPUESTO_MINIMO.toFixed(
            2
          )} €`
        );
        return;
      }

      const subtotal = (precioBase || 0) + incrementoColor + accTotal;

      const payload = {
        user_id: session.user.id,
        cliente: profile?.usuario || "",
        email: profile?.email || "",
        cif: profile?.cif || null,
        tipo: "pergola-bioclimatica",
        ancho_mm: medidaSel?.ancho_mm || 0,
        alto_mm: medidaSel?.fondo_mm || 0,
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

      console.log("💾 [GUARDANDO PÉRGOLA]", payload);

      await insertarPresupuestoPergola(payload);

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

  /* ================== RENDER ================== */
  return (
    <>
      <Head>
        <title>Configurar Pérgola Bioclimática · PresuProsol</title>
      </Head>

      {!modoEdicion && <Header />}

      <main className={!modoEdicion ? styles.pageContainer : ""}>
        {!modoEdicion && (
          <div className={styles.header}>
            <h1 className={styles.title}>Pérgola Bioclimática</h1>
            <button
              className={styles.backButton}
              onClick={() => router.push("/pergolas")}
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
                <label className={styles.label}>Medida (ancho × fondo)</label>
                <select
                  className={styles.select}
                  value={medidaId}
                  onChange={(e) => setMedidaId(e.target.value)}
                >
                  <option value="">Selecciona medida…</option>
                  {medidas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.ancho_mm} × {m.fondo_mm} mm
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
              {accesorios.length === 0 && (
                <p className={styles.emptyMessage}>No hay accesorios disponibles</p>
              )}
              {accesorios.length > 0 && (
                <div className={styles.accesoriosGrid}>
                  {accesorios.map((a) => {
                    const sel = accSel.find((x) => x.id === a.id)?.unidades || 0;
                    const imagenUrl = getImagenAccesorio(a.nombre);

                    return (
                      <div className={styles.accesorioCard} key={a.id}>
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
                          step={1}
                          className={`${styles.input} ${styles.accesorioInput}`}
                          value={sel}
                          onChange={(e) => onSetAccUnidades(a, e.target.value)}
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
                <span className={styles.summaryValue} style={{
                  color: total >= PRESUPUESTO_MINIMO ? "#48bb78" : "#e53e3e"
                }}>
                  {total.toFixed(2)} €
                </span>
              </div>
              {total > 0 && total < PRESUPUESTO_MINIMO && (
                <small style={{ color: "#e53e3e", display: "block", marginTop: "0.5rem" }}>
                  ⚠️ Presupuesto mínimo: {PRESUPUESTO_MINIMO.toFixed(2)} €
                </small>
              )}
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
                precioBase === null ||
                (total < PRESUPUESTO_MINIMO && !modoEdicion)
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
