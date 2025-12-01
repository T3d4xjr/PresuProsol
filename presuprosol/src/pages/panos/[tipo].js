// src/pages/panos/[tipo].js
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/ConfigPages.module.css";

import {
  getPanoPricePerM2,
  calcAreaM2,
  calcAccesoriosTotal,
  applyDiscount,
} from "../api/pricingPanos";

import {
  fetchCatalogoPanos,
  fetchDescuentoClientePanos,
  insertarPresupuestoPanos,
} from "../api/panos";

// MAPEO DE IMÁGENES DE ACCESORIOS
const ACCESORIO_IMAGENES = {
  cajillaRecogedor: "/assets/panos/accesorios/cajillaRecogedor.png",
  capsulaMetalica: "/assets/panos/accesorios/capsulaMetalica.png",
  cinta: "/assets/panos/accesorios/cinta.png",
  DiscoMetalico: "/assets/panos/accesorios/DiscoMetalico.png",
  pasacintas: "/assets/panos/accesorios/pasacintas.png",
  placarecogedor: "/assets/panos/accesorios/placarecogedor.png",
  recogerdorAbatible: "/assets/panos/accesorios/recogerdorAbatible.png",
  recogerdorPlastico: "/assets/panos/accesorios/recogerdorPlastico.png",
  recogerdorMetalico: "/assets/panos/accesorios/recogerdorMetalico.png",
  rodamiento: "/assets/panos/accesorios/rodamiento.png",
  soporte: "/assets/panos/accesorios/soporte.png",
  tubo: "/assets/panos/accesorios/tubo.png",
};

// Función para obtener la imagen del accesorio
const getAccesorioImagen = (nombreAccesorio) => {
  if (!nombreAccesorio) return null;

  const nombre = nombreAccesorio.toLowerCase();

  if (nombre.includes("cajilla") || nombre.includes("recogedor cajilla")) {
    return ACCESORIO_IMAGENES.cajillaRecogedor;
  }
  if (nombre.includes("cápsula") || nombre.includes("capsula") || nombre.includes("metalica")) {
    return ACCESORIO_IMAGENES.capsulaMetalica;
  }
  if (nombre.includes("cinta") && !nombre.includes("pasacinta")) {
    return ACCESORIO_IMAGENES.cinta;
  }
  if (nombre.includes("disco") || nombre.includes("metálico disco")) {
    return ACCESORIO_IMAGENES.DiscoMetalico;
  }
  if (nombre.includes("pasacinta") || nombre.includes("pasa cinta")) {
    return ACCESORIO_IMAGENES.pasacintas;
  }
  if (nombre.includes("placa") && nombre.includes("recogedor")) {
    return ACCESORIO_IMAGENES.placarecogedor;
  }
  if (nombre.includes("recogedor abatible")) {
    return ACCESORIO_IMAGENES.recogerdorAbatible;
  }
  if (nombre.includes("recogedor") && nombre.includes("plástico")) {
    return ACCESORIO_IMAGENES.recogerdorPlastico;
  }
  if (nombre.includes("recogedor") && nombre.includes("metálico")) {
    return ACCESORIO_IMAGENES.recogerdorMetalico;
  }
  if (nombre.includes("rodamiento")) {
    return ACCESORIO_IMAGENES.rodamiento;
  }
  if (nombre.includes("soporte")) {
    return ACCESORIO_IMAGENES.soporte;
  }
  if (nombre.includes("tubo")) {
    return ACCESORIO_IMAGENES.tubo;
  }

  return null;
};

export default function ConfigPanos({
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
  const [acabados, setAcabados] = useState([]);
  const [accesorios, setAccesorios] = useState([]);

  const [modeloId, setModeloId] = useState("");
  const [acabadoId, setAcabadoId] = useState("");
  const [alto, setAlto] = useState("");
  const [ancho, setAncho] = useState("");
  const [accSel, setAccSel] = useState([]);

  const [precioM2, setPrecioM2] = useState(null);
  const [areaM2, setAreaM2] = useState(0);
  const [base, setBase] = useState(0);
  const [accTotal, setAccTotal] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [total, setTotal] = useState(0);

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  /* ================== ACCESO ================== */
  useEffect(() => {
    if (!loading && !session && !modoEdicion) {
      router.replace("/login?m=login-required");
    }
  }, [loading, session, router, modoEdicion]);

  /* ================== CARGA CATÁLOGO ================== */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      console.log("📦 [CARGANDO CATÁLOGO PAÑOS DESDE API] tipo:", tipo, "modoEdicion:", modoEdicion);
      try {
        const { modelos, acabados, accesorios } = await fetchCatalogoPanos();
        if (!cancelled) {
          console.log("✅ Paños cargados:", { modelos: modelos.length, acabados: acabados.length, accesorios: accesorios.length });
          setModelos(modelos);
          setAcabados(acabados);
          setAccesorios(accesorios);
        }
      } catch (e) {
        console.error("❌ [panos catálogo] exception:", e);
        if (!cancelled) {
          setModelos([]);
          setAcabados([]);
          setAccesorios([]);
        }
      }
    };

    if (tipo || modoEdicion) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [tipo, modoEdicion]);

  /* ================== DESCUENTO CLIENTE ================== */
  useEffect(() => {
    let cancelled = false;

    const loadDesc = async () => {
      if (!session?.user?.id) {
        console.log("⏸️ [DESCUENTO PAÑOS] No hay usuario");
        return;
      }
      console.log("💰 [CARGANDO DESCUENTO PAÑOS] uid:", session.user.id);
      const pct = await fetchDescuentoClientePanos(session.user.id);
      if (!cancelled) {
        console.log("✅ Descuento paños cargado:", pct, "%");
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

    console.log("📝 [MODO EDICIÓN PAÑOS] Cargando datos iniciales:", datosIniciales);

    if (datosIniciales.alto_mm) {
      setAlto(datosIniciales.alto_mm.toString());
    }
    if (datosIniciales.ancho_mm) {
      setAncho(datosIniciales.ancho_mm.toString());
    }

    if (datosIniciales.accesorios && Array.isArray(datosIniciales.accesorios)) {
      const accesoriosNormalizados = datosIniciales.accesorios.map((a) => ({
        id: a.id,
        nombre: a.nombre,
        pvp: Number(a.precio_unit || a.pvp || 0),
        unidades: Number(a.unidades || 0),
      }));
      setAccSel(accesoriosNormalizados);
    }

    if (datosIniciales.medida_precio) {
      setBase(Number(datosIniciales.medida_precio));
    }

    if (datosIniciales.descuento_cliente && descuento === 0) {
      setDescuento(Number(datosIniciales.descuento_cliente));
    }
  }, [datosIniciales, modoEdicion, descuento]);

  /* ================== ENCONTRAR MODELO Y ACABADO POR NOMBRE ================== */
  useEffect(() => {
    if (!datosIniciales || !modoEdicion) return;
    if (modelos.length === 0 || acabados.length === 0) return;

    if (datosIniciales.color && !acabadoId) {
      const acabadoEncontrado = acabados.find(
        (a) => a.nombre.toLowerCase() === datosIniciales.color.toLowerCase()
      );

      if (acabadoEncontrado) {
        setAcabadoId(String(acabadoEncontrado.id));
      }
    }

    if (!modeloId && modelos.length > 0) {
      setModeloId(String(modelos[0].id));
    }
  }, [datosIniciales, modoEdicion, modelos, acabados, modeloId, acabadoId]);

  /* ================== PRECIO €/m² ================== */
  useEffect(() => {
    const run = async () => {
      setPrecioM2(null);
      if (!modeloId || !acabadoId) return;

      const p = await getPanoPricePerM2(modeloId, acabadoId);
      setPrecioM2(p);
    };

    run();
  }, [modeloId, acabadoId]);

  /* ================== CÁLCULOS ================== */
  useEffect(() => {
    const area = calcAreaM2(alto, ancho);
    setAreaM2(+area.toFixed(4));

    const baseImporte =
      precioM2 == null
        ? 0
        : +(area * Number(precioM2 || 0)).toFixed(2);
    setBase(baseImporte);

    const acc = calcAccesoriosTotal(accSel);
    setAccTotal(+acc.toFixed(2));

    const subtotal = baseImporte + acc;
    const tot = applyDiscount(subtotal, descuento);
    setTotal(+tot.toFixed(2));
  }, [alto, ancho, precioM2, accSel, descuento]);

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
          .map((x) =>
            x.id === acc.id ? { ...x, unidades: uds } : x
          )
          .filter((x) => (x.unidades || 0) > 0);
      }

      return prev;
    });
  };

  const modeloSel = useMemo(
    () => modelos.find((m) => m.id === modeloId),
    [modelos, modeloId]
  );
  const acabadoSel = useMemo(
    () => acabados.find((a) => a.id === acabadoId),
    [acabados, acabadoId]
  );

  /* ================== GUARDAR ================== */
  async function guardar() {
    // MODO EDICIÓN: usar callback
    if (modoEdicion && onSubmit) {
      const datosPresupuesto = {
        cliente: profile?.usuario || datosIniciales?.cliente || "",
        email: profile?.email || datosIniciales?.email || "",
        cif: profile?.cif || datosIniciales?.cif || null,
        alto_mm: Number(alto),
        ancho_mm: Number(ancho),
        color: acabadoSel?.nombre || null,
        medida_precio: Number(base),
        accesorios: accSel.map((a) => ({
          id: a.id,
          nombre: a.nombre,
          unidades: Number(a.unidades || 0),
          precio_unit: Number(a.pvp || 0),
        })),
        subtotal: Number(base + accTotal),
        descuento_cliente: Number(descuento),
        total: Number(total),
      };

      console.log("💾 [MODO EDICIÓN PAÑOS] Enviando datos:", datosPresupuesto);
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
        setMsg("⚠️ Completa modelo, acabado y medidas.");
        return;
      }

      if (precioM2 === null) {
        setMsg("⚠️ No hay precio disponible para esta combinación. Contacta con administración.");
        return;
      }

      const subtotalCalc = Number(base) + Number(accTotal);
      const acabadoNombre = acabadoSel?.nombre || null;

      const payload = {
        user_id: session.user.id,
        cliente: profile?.usuario || "",
        email: profile?.email || "",
        cif: profile?.cif || null,
        tipo: `paño-${tipo || "completo"}`,
        alto_mm: Number(alto),
        ancho_mm: Number(ancho),
        medida_precio: Number(base),
        color: acabadoNombre,
        color_precio: 0,
        accesorios: accSel.map((a) => ({
          id: a.id,
          nombre: a.nombre,
          unidades: Number(a.unidades || 0),
          precio_unit: Number(a.pvp || 0),
        })),
        subtotal: Number(subtotalCalc),
        descuento_cliente: Number(descuento),
        total: Number(total),
        pagado: false,
      };

      console.log("[payload json] >>>");
      console.log(JSON.stringify(payload, null, 2));

      const { data, error, status } = await insertarPresupuestoPanos(payload);

      console.log("[insert presupuestos] status:", status);
      console.log("[insert presupuestos] data:", data);

      if (error) {
        setMsg(`❌ No se pudo guardar el presupuesto: ${error.message || "error desconocido"}`);
        return;
      }

      setMsg("✅ Presupuesto guardado correctamente.");
      setTimeout(() => router.push("/mis-presupuestos"), 1500);
    } catch (e) {
      console.error("💥 [guardarPresupuesto] exception:", e);
      setMsg(`❌ Error inesperado: ${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  }

  /* ================== RENDER ================== */
  return (
    <>
      <Head>
        <title>Configurar Paño · PresuProsol</title>
      </Head>

      {!modoEdicion && <Header />}

      <main className={styles.pageContainer}>
        {!modoEdicion && (
          <div className={styles.header}>
            <h1 className={styles.title}>
              Configurar {tipo === "lamas" ? "lamas sueltas" : "paño completo"}
            </h1>
            <button
              className={styles.backButton}
              onClick={() => router.push("/panos")}
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
                <label className={styles.label}>Modelo</label>
                <select
                  className={styles.select}
                  value={modeloId}
                  onChange={(e) => setModeloId(e.target.value)}
                >
                  <option value="">Selecciona modelo…</option>
                  {["perfilado", "extrusionado", "pvc", "enrollable"].map((t) => {
                    const group = modelos.filter((m) => m.tipo === t);
                    if (!group.length) return null;
                    return (
                      <optgroup key={t} label={t.toUpperCase()}>
                        {group.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nombre}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Acabado</label>
                <select
                  className={styles.select}
                  value={acabadoId}
                  onChange={(e) => setAcabadoId(e.target.value)}
                >
                  <option value="">Selecciona acabado…</option>
                  {acabados.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>

                {precioM2 === null && modeloId && acabadoId && (
                  <small style={{ color: "#e53e3e", display: "block", marginTop: "0.25rem" }}>
                    Precio: consultar
                  </small>
                )}

                {precioM2 != null && modeloId && acabadoId && (
                  <small style={{ color: "#718096", display: "block", marginTop: "0.25rem" }}>
                    Precio: {Number(precioM2).toFixed(2)} €/m²
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
                  value={alto}
                  onChange={(e) => setAlto(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Ancho (mm)</label>
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  value={ancho}
                  onChange={(e) => setAncho(e.target.value)}
                />
              </div>
            </div>

            {/* Accesorios */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Accesorios</h2>
              {accesorios.length === 0 && (
                <p className={styles.emptyMessage}>No hay accesorios disponibles</p>
              )}
              <div className={styles.accesoriosGrid}>
                  {accesorios.map((a) => {
                    const sel = accSel.find((x) => x.id === a.id)?.unidades || 0;
                    const imgSrc = getAccesorioImagen(a.nombre);

                    return (
                      <div className={styles.accesorioCard} key={a.id}>
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
                          step={1}
                          className={`${styles.input} ${styles.accesorioInput}`}
                          value={sel}
                          onChange={(e) => onSetAccUnidades(a, e.target.value)}
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
                <span className={styles.summaryLabel}>Área:</span>
                <span className={styles.summaryValue}>{areaM2.toFixed(3)} m²</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Precio base:</span>
                <span className={styles.summaryValue}>
                  {base.toFixed(2)} €
                  {precioM2 === null && " (consultar)"}
                </span>
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
                      {(base + accTotal).toFixed(2)} €
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Descuento ({descuento}%):</span>
                    <span className={styles.summaryValue} style={{ color: "#e53e3e" }}>
                      -{((base + accTotal) * (descuento / 100)).toFixed(2)} €
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
                <span className={styles.summaryValue}>
                  {total.toFixed(2)} €
                </span>
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
                precioM2 === null
              }
            >
              {(saving || guardando) ? (
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
