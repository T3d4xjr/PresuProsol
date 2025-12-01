// src/pages/editar-presupuesto/[id].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import Header from "../../components/Header";
import styles from "../../styles/MisPresupuestos.module.css";

// Importar componentes de productos
import CompactosForm from "../../components/productos/compactos";
import MosquiterasForm from "../../components/productos/mosquiteras";
import PanosForm from "../../components/productos/panos";
import ProteccionSolarForm from "../../components/productos/proteccion-solar";
import PuertasForm from "../../components/productos/puertas";
import PergolasForm from "../../components/productos/pergolas";

const TIPOS_PRODUCTOS = [
  { 
    id: "compacto", 
    nombre: "Compactos", 
    componente: CompactosForm, 
    match: ["compacto"] 
  },
  { 
    id: "mosquitera", 
    nombre: "Mosquiteras", 
    componente: MosquiterasForm, 
    match: ["mosquitera", "enrollable", "plisada", "corredera", "fija", "abatible", "lateral"] 
  },
  { 
    id: "pano", 
    nombre: "Paños", 
    componente: PanosForm, 
    match: ["paño", "pano", "completo", "lamas"]
  },
  { 
    id: "proteccion-solar", 
    nombre: "Protección Solar", 
    componente: ProteccionSolarForm, 
    match: ["proteccion-solar", "proteccion", "solar", "ventuszip01", "stor-disaluz", "stor-vilaluz"] 
  },
  { 
    id: "puerta-seccional", 
    nombre: "Puertas Seccionales", 
    componente: PuertasForm, 
    match: ["puerta-seccional", "puerta", "seccional", "residencial", "industrial"] 
  },
  { 
    id: "pergola-bioclimatica", 
    nombre: "Pérgola Bioclimática", 
    componente: PergolasForm, 
    match: ["pergola-bioclimatica", "pergola", "bioclimatica"] 
  },
];

export default function EditarPresupuesto() {
  const router = useRouter();
  const { id } = router.query;
  const { session, loading: authLoading } = useAuth();

  const [presupuesto, setPresupuesto] = useState(null);
  const [tipoProducto, setTipoProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [mostrarModalError, setMostrarModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace("/login?m=login-required");
      return;
    }

    if (id && session?.user?.id) {
      cargarPresupuesto();
    }
  }, [id, session, authLoading]);

  async function cargarPresupuesto() {
    setLoading(true);
    try {
      console.log("🔍 Cargando presupuesto ID:", id);

      const { data, error } = await supabase
        .from("presupuestos")
        .select("*")
        .eq("id", id)
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("❌ Error cargando presupuesto:", error);
        setMensajeError("No se pudo cargar el presupuesto. Por favor, inténtalo de nuevo.");
        setMostrarModalError(true);
        setTimeout(() => router.push("/mis-presupuestos"), 3000);
        return;
      }

      if (!data) {
        setMensajeError("El presupuesto que buscas no existe o no tienes permiso para editarlo.");
        setMostrarModalError(true);
        setTimeout(() => router.push("/mis-presupuestos"), 3000);
        return;
      }

      if (data.pagado) {
        setMensajeError("No puedes editar un presupuesto que ya ha sido marcado como pagado.");
        setMostrarModalError(true);
        setTimeout(() => router.push("/mis-presupuestos"), 3000);
        return;
      }

      console.log("✅ Presupuesto cargado:", data);
      setPresupuesto(data);

      const tipoPresupuesto = (data.tipo || "").toLowerCase();
      console.log("   Tipo detectado:", tipoPresupuesto);

      const tipoEncontrado = TIPOS_PRODUCTOS.find((t) =>
        t.match.some((m) => tipoPresupuesto.includes(m))
      );

      if (tipoEncontrado) {
        console.log("✅ Tipo de producto:", tipoEncontrado.nombre);
        setTipoProducto(tipoEncontrado);
      } else {
        console.warn("⚠️ Tipo de producto no reconocido:", tipoPresupuesto);
        setMensajeError(`El tipo de presupuesto "${data.tipo}" aún no está disponible para edición. Pronto estará disponible.`);
        setMostrarModalError(true);
        setTimeout(() => router.push("/mis-presupuestos"), 3000);
      }
    } catch (error) {
      console.error("💥 Error inesperado:", error);
      setMensajeError("Ocurrió un error inesperado al cargar el presupuesto. Por favor, contacta con soporte.");
      setMostrarModalError(true);
      setTimeout(() => router.push("/mis-presupuestos"), 3000);
    } finally {
      setLoading(false);
    }
  }

  async function handleGuardarPresupuesto(datosPresupuesto) {
    setGuardando(true);
    try {
      console.log("💾 Guardando cambios:", datosPresupuesto);

      const updateData = {
        cliente: datosPresupuesto.cliente,
        email: datosPresupuesto.email,
        cif: datosPresupuesto.cif,
        alto_mm: datosPresupuesto.alto_mm,
        ancho_mm: datosPresupuesto.ancho_mm,
        color: datosPresupuesto.color,
        medida_precio: datosPresupuesto.medida_precio || 0,
        accesorios: datosPresupuesto.accesorios || [],
        subtotal: datosPresupuesto.subtotal || 0,
        descuento_cliente: datosPresupuesto.descuento_cliente || 0,
        total: datosPresupuesto.total || 0,
        updated_at: new Date().toISOString(),
      };

      // Agregar color_precio solo si existe (mosquiteras)
      if (datosPresupuesto.color_precio !== undefined) {
        updateData.color_precio = datosPresupuesto.color_precio || 0;
      }

      const { error } = await supabase
        .from("presupuestos")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (error) {
        console.error("❌ Error guardando:", error);
        setMensajeError("No se pudieron guardar los cambios. Por favor, verifica los datos e inténtalo de nuevo.");
        setMostrarModalError(true);
        return;
      }

      console.log("✅ Presupuesto actualizado");
      setMostrarModalExito(true);
      
      setTimeout(() => {
        router.push("/mis-presupuestos");
      }, 2000);
    } catch (error) {
      console.error("💥 Error inesperado guardando:", error);
      setMensajeError("Ocurrió un error inesperado al guardar. Por favor, contacta con soporte si el problema persiste.");
      setMostrarModalError(true);
    } finally {
      setGuardando(false);
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className={styles.pageContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Cargando presupuesto...</p>
          </div>
        </main>
      </>
    );
  }

  if (!presupuesto || !tipoProducto) {
    return null;
  }

  const FormularioProducto = tipoProducto.componente;

  return (
    <>
      <Head>
        <title>Editar Presupuesto · PresuProsol</title>
      </Head>
      <Header />

      <main className={styles.pageContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>✏️ Editar Presupuesto</h1>
          <button
            onClick={() => router.push("/mis-presupuestos")}
            className={styles.backButton}
            disabled={guardando}
          >
            ← Cancelar
          </button>
        </div>

        <div className={styles.infoAlert}>
          <h6 className={styles.infoAlertTitle}>📋 Información del presupuesto</h6>
          <p className={styles.infoAlertText}>
            <strong>ID:</strong> {presupuesto.id.substring(0, 8)}...
          </p>
          <p className={styles.infoAlertText}>
            <strong>Creado:</strong>{" "}
            {new Date(presupuesto.created_at).toLocaleDateString("es-ES")}
          </p>
          <p className={styles.infoAlertText}>
            <strong>Tipo:</strong>{" "}
            <span className={styles.infoAlertBadge}>{tipoProducto.nombre}</span>
          </p>
          <p className={styles.infoAlertText} style={{ marginBottom: 0 }}>
            <strong>Cliente:</strong> {presupuesto.cliente || "Sin nombre"}
          </p>
        </div>

        <div className={styles.card}>
          <h5 className={styles.cardTitle}>
            Modificar datos de {tipoProducto.nombre}
          </h5>
          <FormularioProducto
            datosIniciales={presupuesto}
            onSubmit={handleGuardarPresupuesto}
            guardando={guardando}
            modoEdicion={true}
          />
        </div>
      </main>

      {/* Modal de éxito */}
      {mostrarModalExito && (
        <div className={styles.successModal}>
          <div className={styles.successModalContent}>
            <div className={styles.successIcon}>
              <svg
                className={styles.checkIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline className={styles.checkPath} points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h3 className={styles.successModalTitle}>
              ¡Presupuesto Actualizado!
            </h3>
            
            <p className={styles.successModalText}>
              Los cambios se han guardado correctamente
            </p>

            <div className={styles.successModalInfo}>
              <div className={styles.successModalRow}>
                <span className={styles.successModalLabel}>Cliente:</span>
                <strong className={styles.successModalValue}>{presupuesto.cliente || "Sin nombre"}</strong>
              </div>
              <div className={styles.successModalRow}>
                <span className={styles.successModalLabel}>Tipo:</span>
                <strong className={styles.successModalValue}>{tipoProducto.nombre}</strong>
              </div>
              <div className={styles.successModalRow}>
                <span className={styles.successModalLabel}>Total:</span>
                <strong className={styles.successModalTotal}>
                  {presupuesto.total?.toFixed(2)} €
                </strong>
              </div>
            </div>

            <div className={styles.redirectSpinner}>
              <div className={styles.smallSpinner}></div>
              <span>Redirigiendo a tus presupuestos...</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de error */}
      {mostrarModalError && (
        <div className={styles.successModal}>
          <div className={styles.successModalContent}>
            <div className={`${styles.successIcon} ${styles.errorIcon}`}>
              <svg
                className={styles.checkIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>

            <h3 className={styles.successModalTitle}>
              Oops, algo salió mal
            </h3>
            
            <p className={styles.successModalText}>
              {mensajeError}
            </p>

            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => {
                setMostrarModalError(false);
                router.push("/mis-presupuestos");
              }}
            >
              Volver a mis presupuestos
            </button>
          </div>
        </div>
      )}

    </>
  );
}
