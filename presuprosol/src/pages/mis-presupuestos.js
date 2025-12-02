// src/pages/mis-presupuestos.js
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import ModalPago from "../components/ModalPago";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  fetchPresupuestosUsuario,
  eliminarPresupuesto,
} from "./api/presupuestos";
import styles from "../styles/MisPresupuestos.module.css";

export default function MisPresupuestos() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [presupuestos, setPresupuestos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState(null);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [presupuestoAEliminar, setPresupuestoAEliminar] = useState(null);
  const [categoriaAbierta, setCategoriaAbierta] = useState(null);
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [filtroPrecio, setFiltroPrecio] = useState("todos");

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login?m=login-required");
    }
  }, [loading, session, router]);

  useEffect(() => {
    if (session?.user?.id) {
      loadPresupuestos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadPresupuestos() {
    setLoadingData(true);
    try {
      const data = await fetchPresupuestosUsuario(session.user.id);
      setPresupuestos(data);
    } catch (error) {
      console.error("Error cargando presupuestos:", error);
    } finally {
      setLoadingData(false);
    }
  }

  function abrirModalEliminar(presupuesto) {
    setPresupuestoAEliminar(presupuesto);
    setMostrarModalEliminar(true);
  }

  function cerrarModalEliminar() {
    setPresupuestoAEliminar(null);
    setMostrarModalEliminar(false);
  }

  async function confirmarEliminar() {
    if (!presupuestoAEliminar) return;

    try {
      await eliminarPresupuesto(presupuestoAEliminar.id);
      cerrarModalEliminar();
      await loadPresupuestos();
    } catch (error) {
      alert("Error eliminando: " + error.message);
    }
  }

  function handleEditar(presupuesto) {
    console.log("📝 Editando presupuesto:", presupuesto);

    if (presupuesto.pagado) {
      alert("⚠️ No puedes editar un presupuesto ya pagado");
      return;
    }

    router.push(`/editar-presupuesto/${presupuesto.id}`);
  }

  function abrirModalPago(presupuesto) {
    setPresupuestoSeleccionado(presupuesto);
    setMostrarModalPago(true);
  }

  function cerrarModalPago() {
    setPresupuestoSeleccionado(null);
    setMostrarModalPago(false);
  }

  async function onPagoExitoso() {
    cerrarModalPago();
    await loadPresupuestos();
    router.push("/pago-exitoso");
  }

  async function generarPDF(presupuesto) {
    try {
      const contenedor = document.createElement("div");
      contenedor.style.position = "absolute";
      contenedor.style.left = "-9999px";
      contenedor.style.width = "210mm";
      contenedor.style.padding = "20mm";
      contenedor.style.backgroundColor = "white";
      contenedor.style.fontFamily = "Arial, sans-serif";

      contenedor.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px; font-weight: bold; font-size: 32px;">PRESUPUESTO</h1>
            <p style="color: #7f8c8d; font-size: 14px;">PresuProsol - Soluciones Profesionales</p>
          </div>

          <div style="border: 2px solid #3498db; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">Información del Cliente</h2>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 5px 0; color: #7f8c8d; width: 150px;">Cliente:</td>
                <td style="padding: 5px 0; font-weight: bold;">${presupuesto.cliente || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #7f8c8d;">Email:</td>
                <td style="padding: 5px 0; font-weight: bold;">${presupuesto.email || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #7f8c8d;">CIF:</td>
                <td style="padding: 5px 0; font-weight: bold;">${presupuesto.cif || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #7f8c8d;">Fecha:</td>
                <td style="padding: 5px 0; font-weight: bold;">${new Date(presupuesto.created_at).toLocaleDateString("es-ES")}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #7f8c8d;">Tipo:</td>
                <td style="padding: 5px 0; font-weight: bold; text-transform: capitalize;">${presupuesto.tipo || "N/A"}</td>
              </tr>
            </table>
          </div>

          <div style="border: 2px solid #2ecc71; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">Detalles del Producto</h2>
            <table style="width: 100%; font-size: 14px;">
              ${presupuesto.alto_mm ? `
              <tr>
                <td style="padding: 5px 0; color: #7f8c8d; width: 150px;">Alto:</td>
                <td style="padding: 5px 0; font-weight: bold;">${presupuesto.alto_mm} mm</td>
              </tr>
              ` : ''}
              ${presupuesto.ancho_mm ? `
              <tr>
                <td style="padding: 5px 0; color: #7f8c8d;">Ancho:</td>
                <td style="padding: 5px 0; font-weight: bold;">${presupuesto.ancho_mm} mm</td>
              </tr>
              ` : ''}
              ${presupuesto.color ? `
              <tr>
                <td style="padding: 5px 0; color: #7f8c8d;">Color:</td>
                <td style="padding: 5px 0; font-weight: bold;">${presupuesto.color}</td>
              </tr>
              ` : ''}
              ${presupuesto.medida_precio ? `
              <tr>
                <td style="padding: 5px 0; color: #7f8c8d;">Precio medida:</td>
                <td style="padding: 5px 0; font-weight: bold;">${presupuesto.medida_precio.toFixed(2)} €</td>
              </tr>
              ` : ''}
            </table>
          </div>

          ${presupuesto.accesorios && presupuesto.accesorios.length > 0 ? `
          <div style="border: 2px solid #e74c3c; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">Accesorios</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background-color: #ecf0f1;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #bdc3c7;">Descripción</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #bdc3c7;">Unidades</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #bdc3c7;">Precio Unit.</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #bdc3c7;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${presupuesto.accesorios
                  .map(
                    (acc) => `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ecf0f1;">${
                    acc.nombre || "Accesorio"
                  }</td>
                  <td style="padding: 8px; text-align: center; border-bottom: 1px solid #ecf0f1;">${
                    acc.unidades || 0
                  }</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ecf0f1;">${(
                    acc.precio_unit || 0
                  ).toFixed(2)} €</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ecf0f1; font-weight: bold;">${(
                    (acc.unidades || 0) * (acc.precio_unit || 0)
                  ).toFixed(2)} €</td>
                </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 20px; color: white;">
            <h2 style="font-size: 18px; margin-bottom: 15px;">Resumen Financiero</h2>
            <table style="width: 100%; font-size: 16px;">
              <tr>
                <td style="padding: 8px 0;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${(presupuesto.subtotal || 0).toFixed(2)} €</td>
              </tr>
              ${
                presupuesto.descuento_cliente > 0
                  ? `
              <tr>
                <td style="padding: 8px 0;">Descuento (${presupuesto.descuento_cliente}%):</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #ffeaa7;">-${(
                  (presupuesto.subtotal || 0) *
                  (presupuesto.descuento_cliente / 100)
                ).toFixed(2)} €</td>
              </tr>
              `
                  : ""
              }
              <tr style="border-top: 2px solid rgba(255,255,255,0.3);">
                <td style="padding: 12px 0; font-size: 20px; font-weight: bold;">TOTAL:</td>
                <td style="padding: 12px 0; text-align: right; font-size: 24px; font-weight: bold;">${(presupuesto.total || 0).toFixed(2)} €</td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 10px; font-size: 14px; opacity: 0.8;">
                  Estado: ${presupuesto.pagado ? "✅ PAGADO" : "⏳ Pendiente de pago"}
                </td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ecf0f1; text-align: center; color: #7f8c8d; font-size: 12px;">
            <p>PresuProsol</p>
          </div>
        </div>
      `;

      document.body.appendChild(contenedor);

      const canvas = await html2canvas(contenedor, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: contenedor.scrollWidth,
        windowHeight: contenedor.scrollHeight,
      });

      document.body.removeChild(contenedor);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;
      let page = 1;

      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        page++;
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      const fileName = `presupuesto-${
        presupuesto.cliente?.replace(/\s+/g, "-") ||
        presupuesto.id.substring(0, 8)
      }.pdf`;
      pdf.save(fileName);

      console.log(`✅ PDF generado: ${page} página(s)`);
    } catch (error) {
      console.error("❌ Error generando PDF:", error);
      alert("Error al generar el PDF. Por favor, inténtalo de nuevo.");
    }
  }

  if (loading || loadingData) {
    return (
      <>
        <Header />
        <main className={styles.pageContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Cargando presupuestos...</p>
          </div>
        </main>
      </>
    );
  }

  // Agrupar presupuestos por tipo
  const grouped = presupuestos.reduce((acc, p) => {
    const tipo = p.tipo || "Otros";
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(p);
    return acc;
  }, {});

  // Mapeo de nombres de categorías más amigables
  const categoriaNombres = {
    "mosquitera-corredera": "Mosquiteras Correderas",
    "mosquitera-enrollable": "Mosquiteras Enrollables",
    "mosquitera-fija": "Mosquiteras Fijas",
    "mosquitera-plisada": "Mosquiteras Plisadas",
    "pano-enrollable": "Paños Enrollables",
    "pano-plisado": "Paños Plisados",
    "compacto-cajonfrontal": "Compactos Cajón Frontal",
    "compacto-minimo": "Compactos Mínimo",
    "compacto-monoblock": "Compactos Monoblock",
    "proteccion-solar-enrollable": "Protección Solar Enrollable",
    "proteccion-solar-lateral": "Protección Solar Lateral",
    "proteccion-solar-ventuszip01": "Protección Solar Ventus",
    "puerta-seccional-residencial": "Puertas Seccionales Residencial",
    "puerta-seccional-industrial": "Puertas Seccionales Industrial",
    "pergola-bioclimatica": "Pérgolas Bioclimáticas",
    "Otros": "Otros"
  };

  const getNombreCategoria = (tipo) => {
    return categoriaNombres[tipo] || tipo;
  };

  return (
    <>
      <Head>
        <title>Mis Presupuestos · PresuProsol</title>
      </Head>
      <Header />

      <main className={styles.pageContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>📋 Mis Presupuestos</h1>
          <button
            onClick={() => router.push("/perfil")}
            className={styles.backButton}
          >
            ← Volver
          </button>
        </div>

        {presupuestos.length === 0 && (
          <div className={styles.emptyState}>
            <p style={{ margin: 0 }}>
              No tienes presupuestos aún. ¡Crea tu primer presupuesto!
            </p>
          </div>
        )}

        {presupuestos.length > 0 && (
          <div className={styles.filterSection}>
            <select
              value={filtroPrecio}
              onChange={(e) => setFiltroPrecio(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="todos">Todos los precios</option>
              <option value="0-500">0€ - 500€</option>
              <option value="500-1000">500€ - 1000€</option>
              <option value="1000-2500">1000€ - 2500€</option>
              <option value="2500+">2500€ o más</option>
            </select>
          </div>
        )}

        <div className={styles.categoriesGrid}>
          {Object.keys(grouped).sort().map((categoria) => {
            const presupuestosCategoria = grouped[categoria].filter((p) => {
              // Filtro de precio
              let matchPrecio = true;
              if (filtroPrecio !== "todos") {
                const total = p.total || 0;
                if (filtroPrecio === "0-500") matchPrecio = total >= 0 && total <= 500;
                else if (filtroPrecio === "500-1000") matchPrecio = total > 500 && total <= 1000;
                else if (filtroPrecio === "1000-2500") matchPrecio = total > 1000 && total <= 2500;
                else if (filtroPrecio === "2500+") matchPrecio = total > 2500;
              }
              
              return matchPrecio;
            });
            
            if (presupuestosCategoria.length === 0) return null;
            
            const totalCategoria = presupuestosCategoria.reduce((sum, p) => sum + (p.total || 0), 0);
            
            return (
              <div key={categoria} className={styles.categoryCard}>
                <div 
                  className={styles.categoryHeader}
                  onClick={() => {
                    setCategoriaAbierta(categoria);
                    setMostrarModalCategoria(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.categoryInfo}>
                    <h3 className={styles.categoryCardTitle}>{getNombreCategoria(categoria)}</h3>
                    <div className={styles.categoryStats}>
                      <span className={styles.statBadge}>
                        {presupuestosCategoria.length} presupuesto{presupuestosCategoria.length !== 1 ? 's' : ''}
                      </span>
                      <span className={styles.statTotal}>
                        Total: {totalCategoria.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                  <div className={styles.expandIcon}>
                    ▶
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal de categoría */}
      {mostrarModalCategoria && categoriaAbierta && (
        <div
          className={styles.modalOverlay}
          onClick={() => setMostrarModalCategoria(false)}
        >
          <div
            className={styles.modalContentLarge}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>{getNombreCategoria(categoriaAbierta)}</h5>
              <button
                className={styles.closeButton}
                onClick={() => setMostrarModalCategoria(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBodyLarge}>
              <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Detalles</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[categoriaAbierta]
                    .filter((p) => {
                      let matchPrecio = true;
                      if (filtroPrecio !== "todos") {
                        const total = p.total || 0;
                        if (filtroPrecio === "0-500") matchPrecio = total >= 0 && total <= 500;
                        else if (filtroPrecio === "500-1000") matchPrecio = total > 500 && total <= 1000;
                        else if (filtroPrecio === "1000-2500") matchPrecio = total > 1000 && total <= 2500;
                        else if (filtroPrecio === "2500+") matchPrecio = total > 2500;
                      }
                      
                      return matchPrecio;
                    })
                    .map((p) => (
                    <tr key={p.id}>
                      <td>
                        {new Date(p.created_at).toLocaleDateString("es-ES")}
                      </td>
                      <td>
                        <div className={styles.clientName}>
                          {p.cliente || "Sin nombre"}
                        </div>
                        <small className={styles.clientEmail}>
                          {p.email || ""}
                        </small>
                      </td>
                      <td>
                        {p.alto_mm && p.ancho_mm && (
                          <div className={styles.detailItem}>
                            {p.alto_mm} × {p.ancho_mm} mm
                          </div>
                        )}
                        {p.color && (
                          <div className={styles.detailItem}>
                            Color: {p.color}
                          </div>
                        )}
                        {p.accesorios && p.accesorios.length > 0 && (
                          <div className={styles.detailItem}>
                            {p.accesorios.length} accesorio
                            {p.accesorios.length !== 1 ? "s" : ""}
                          </div>
                        )}
                      </td>
                      <td className={styles.totalPrice}>
                        {p.total?.toFixed(2)} €
                      </td>
                      <td>
                        {p.pagado ? (
                          <span className={`${styles.badge} ${styles.badgePaid}`}>
                            ✅ Pagado
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgePending}`}>
                            ⏳ Pendiente
                          </span>
                        )}
                      </td>
                      <td>
                        {p.pagado ? (
                          <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => generarPDF(p)}
                          >
                            📄 Descargar PDF
                          </button>
                        ) : (
                          <div className={styles.btnGroup}>
                            <button
                              className={`${styles.btn} ${styles.btnEdit}`}
                              onClick={() => handleEditar(p)}
                              title="Editar presupuesto"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              className={`${styles.btn} ${styles.btnPay}`}
                              onClick={() => abrirModalPago(p)}
                              title="Proceder al pago"
                            >
                              💳 Pagar
                            </button>
                            <button
                              className={`${styles.btn} ${styles.btnDelete}`}
                              onClick={() => abrirModalEliminar(p)}
                              title="Eliminar presupuesto"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {mostrarModalEliminar && presupuestoAEliminar && (
        <div
          className={styles.modalOverlay}
          onClick={cerrarModalEliminar}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`${styles.modalHeader} ${styles.modalHeaderDanger}`}>
              <h5 className={styles.modalTitle}>🗑️ Eliminar Presupuesto</h5>
              <button
                className={styles.closeButton}
                onClick={cerrarModalEliminar}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.warningIcon}>⚠️</div>
              <h6 className={styles.modalText}>
                ¿Estás seguro de que quieres eliminar este presupuesto?
              </h6>
              <div className={styles.infoBox}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Cliente:</span>
                  <strong className={styles.infoValue}>
                    {presupuestoAEliminar.cliente || "Sin nombre"}
                  </strong>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Tipo:</span>
                  <strong className={styles.infoValue} style={{ textTransform: "capitalize" }}>
                    {presupuestoAEliminar.tipo}
                  </strong>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Total:</span>
                  <strong className={styles.infoValueSuccess}>
                    {presupuestoAEliminar.total?.toFixed(2)} €
                  </strong>
                </div>
              </div>
              <p className={styles.warningText}>
                Esta acción no se puede deshacer
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={cerrarModalEliminar}
              >
                Cancelar
              </button>
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={confirmarEliminar}
              >
                Sí, eliminar presupuesto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pago */}
      {mostrarModalPago && presupuestoSeleccionado && (
        <ModalPago
          presupuesto={presupuestoSeleccionado}
          userId={session.user.id}
          onClose={cerrarModalPago}
          onSuccess={onPagoExitoso}
        />
      )}
    </>
  );
}
