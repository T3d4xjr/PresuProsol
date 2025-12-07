// src/pages/mis-presupuestos.js
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import ModalPago from "../components/ModalPago";
import jsPDF from "jspdf";
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
  const [filtroPrecio, setFiltroPrecio] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [ordenamiento, setOrdenamiento] = useState("fecha-desc");
  const [mostrarModalDesactualizado, setMostrarModalDesactualizado] = useState(false);
  const [presupuestoDesactualizado, setPresupuestoDesactualizado] = useState(null);
  const [accionDesactualizado, setAccionDesactualizado] = useState(null);

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
    

    if (presupuesto.pagado) {
      alert("⚠️ No puedes editar un presupuesto ya pagado");
      return;
    }

    if (presupuesto.invalidado) {
      alert(`⚠️ Este presupuesto no se puede editar\n\nMotivo: ${presupuesto.razon_invalidacion || "Producto eliminado del catálogo"}`);
      return;
    }

    if (presupuesto.precio_desactualizado) {
      setPresupuestoDesactualizado(presupuesto);
      setAccionDesactualizado('editar');
      setMostrarModalDesactualizado(true);
      return;
    }

    router.push(`/editar-presupuesto/${presupuesto.id}`);
  }

  function confirmarEdicionDesactualizada() {
    if (presupuestoDesactualizado) {
      router.push(`/editar-presupuesto/${presupuestoDesactualizado.id}`);
    }
    setMostrarModalDesactualizado(false);
    setPresupuestoDesactualizado(null);
    setAccionDesactualizado(null);
  }

  function abrirModalPago(presupuesto) {
    if (presupuesto.invalidado) {
      alert(`⚠️ Este presupuesto no se puede pagar\n\nMotivo: ${presupuesto.razon_invalidacion || "Producto eliminado del catálogo"}`);
      return;
    }

    if (presupuesto.precio_desactualizado) {
      setPresupuestoDesactualizado(presupuesto);
      setAccionDesactualizado('pagar');
      setMostrarModalDesactualizado(true);
      return;
    }

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
      // Crear PDF directamente con jsPDF sin html2canvas
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Función auxiliar para agregar nueva página si es necesario
      const checkPageBreak = (requiredSpace) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Función para agregar texto con wrap
      const addText = (text, x, y, options = {}) => {
        const fontSize = options.fontSize || 10;
        const fontStyle = options.fontStyle || 'normal';
        const align = options.align || 'left';
        const maxWidth = options.maxWidth || contentWidth;
        
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y, { align });
        
        return lines.length * (fontSize * 0.4); // Retorna altura usada
      };

      // HEADER - TÍTULO
      pdf.setFillColor(52, 152, 219);
      pdf.rect(margin, yPos, contentWidth, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PRESUPUESTO', pageWidth / 2, yPos + 12, { align: 'center' });
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('PresuProsol - Soluciones Profesionales', pageWidth / 2, yPos + 19, { align: 'center' });
      yPos += 30;

      // INFORMACIÓN DEL CLIENTE
      checkPageBreak(50);
      pdf.setDrawColor(52, 152, 219);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, yPos, contentWidth, 45);
      
      pdf.setTextColor(44, 62, 80);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Información del Cliente', margin + 5, yPos + 8);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      let clienteY = yPos + 16;
      
      pdf.setTextColor(127, 140, 141);
      pdf.text('Cliente:', margin + 5, clienteY);
      pdf.setTextColor(44, 62, 80);
      pdf.setFont('helvetica', 'bold');
      pdf.text(presupuesto.cliente || "N/A", margin + 40, clienteY);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(127, 140, 141);
      pdf.text('Email:', margin + 5, clienteY + 7);
      pdf.setTextColor(44, 62, 80);
      pdf.setFont('helvetica', 'bold');
      pdf.text(presupuesto.email || "N/A", margin + 40, clienteY + 7);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(127, 140, 141);
      pdf.text('CIF:', margin + 5, clienteY + 14);
      pdf.setTextColor(44, 62, 80);
      pdf.setFont('helvetica', 'bold');
      pdf.text(presupuesto.cif || "N/A", margin + 40, clienteY + 14);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(127, 140, 141);
      pdf.text('Fecha:', margin + 5, clienteY + 21);
      pdf.setTextColor(44, 62, 80);
      pdf.setFont('helvetica', 'bold');
      pdf.text(new Date(presupuesto.created_at).toLocaleDateString("es-ES"), margin + 40, clienteY + 21);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(127, 140, 141);
      pdf.text('Tipo:', margin + 5, clienteY + 28);
      pdf.setTextColor(44, 62, 80);
      pdf.setFont('helvetica', 'bold');
      pdf.text((presupuesto.tipo || "N/A").toUpperCase(), margin + 40, clienteY + 28);
      
      yPos += 52;

      // DETALLES DEL PRODUCTO
      checkPageBreak(40);
      pdf.setDrawColor(46, 204, 113);
      pdf.rect(margin, yPos, contentWidth, 35);
      
      pdf.setTextColor(44, 62, 80);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detalles del Producto', margin + 5, yPos + 8);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      let detalleY = yPos + 16;
      
      if (presupuesto.alto_mm) {
        pdf.setTextColor(127, 140, 141);
        pdf.text('Alto:', margin + 5, detalleY);
        pdf.setTextColor(44, 62, 80);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${presupuesto.alto_mm} mm`, margin + 40, detalleY);
        pdf.setFont('helvetica', 'normal');
        detalleY += 7;
      }
      
      if (presupuesto.ancho_mm) {
        pdf.setTextColor(127, 140, 141);
        pdf.text('Ancho:', margin + 5, detalleY);
        pdf.setTextColor(44, 62, 80);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${presupuesto.ancho_mm} mm`, margin + 40, detalleY);
        pdf.setFont('helvetica', 'normal');
        detalleY += 7;
      }
      
      if (presupuesto.color) {
        pdf.setTextColor(127, 140, 141);
        pdf.text('Color:', margin + 5, detalleY);
        pdf.setTextColor(44, 62, 80);
        pdf.setFont('helvetica', 'bold');
        pdf.text(presupuesto.color, margin + 40, detalleY);
        pdf.setFont('helvetica', 'normal');
      }
      
      yPos += 42;

      // ACCESORIOS (si existen)
      if (presupuesto.accesorios && presupuesto.accesorios.length > 0) {
        const tableHeight = 15 + (presupuesto.accesorios.length * 8);
        checkPageBreak(tableHeight + 15);
        
        pdf.setDrawColor(231, 76, 60);
        pdf.rect(margin, yPos, contentWidth, tableHeight);
        
        pdf.setTextColor(44, 62, 80);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Accesorios', margin + 5, yPos + 8);
        
        yPos += 15;
        
        // Cabecera de tabla
        pdf.setFillColor(236, 240, 241);
        pdf.rect(margin + 2, yPos, contentWidth - 4, 8, 'F');
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(44, 62, 80);
        pdf.text('Descripción', margin + 5, yPos + 5.5);
        pdf.text('Uds', margin + 110, yPos + 5.5, { align: 'center' });
        pdf.text('P. Unit.', margin + 140, yPos + 5.5, { align: 'right' });
        pdf.text('Total', margin + contentWidth - 5, yPos + 5.5, { align: 'right' });
        
        yPos += 8;
        
        // Filas de accesorios
        pdf.setFont('helvetica', 'normal');
        presupuesto.accesorios.forEach((acc) => {
          pdf.setFontSize(9);
          pdf.text(acc.nombre || "Accesorio", margin + 5, yPos + 5);
          pdf.text(String(acc.unidades || 0), margin + 110, yPos + 5, { align: 'center' });
          pdf.text(`${(acc.precio_unit || 0).toFixed(2)} €`, margin + 140, yPos + 5, { align: 'right' });
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${((acc.unidades || 0) * (acc.precio_unit || 0)).toFixed(2)} €`, margin + contentWidth - 5, yPos + 5, { align: 'right' });
          pdf.setFont('helvetica', 'normal');
          yPos += 8;
        });
        
        yPos += 7;
      }

      // RESUMEN FINANCIERO
      checkPageBreak(45);
      pdf.setFillColor(102, 126, 234);
      pdf.rect(margin, yPos, contentWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumen Financiero', margin + 5, yPos + 8);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      let resumenY = yPos + 16;
      
      pdf.text('Subtotal:', margin + 5, resumenY);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${(presupuesto.subtotal || 0).toFixed(2)} €`, margin + contentWidth - 5, resumenY, { align: 'right' });
      
      if (presupuesto.descuento_cliente > 0) {
        resumenY += 7;
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Descuento (${presupuesto.descuento_cliente}%):`, margin + 5, resumenY);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 234, 167);
        pdf.text(`-${((presupuesto.subtotal || 0) * (presupuesto.descuento_cliente / 100)).toFixed(2)} €`, margin + contentWidth - 5, resumenY, { align: 'right' });
        pdf.setTextColor(255, 255, 255);
      }
      
      resumenY += 9;
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(margin + 5, resumenY - 2, margin + contentWidth - 5, resumenY - 2);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TOTAL:', margin + 5, resumenY + 5);
      pdf.setFontSize(18);
      pdf.text(`${(presupuesto.total || 0).toFixed(2)} €`, margin + contentWidth - 5, resumenY + 5, { align: 'right' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Estado: ${presupuesto.pagado ? "✓ PAGADO" : "○ Pendiente de pago"}`, margin + 5, resumenY + 12);
      
      yPos += 47;

      // FOOTER
      pdf.setTextColor(127, 140, 141);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.text('PresuProsol - Documento generado automáticamente', pageWidth / 2, pageHeight - 10, { align: 'center' });

      const fileName = `presupuesto-${
        presupuesto.cliente?.replace(/\s+/g, "-") ||
        presupuesto.id.substring(0, 8)
      }.pdf`;
      pdf.save(fileName);

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

  // Filtrar y ordenar presupuestos
  const presupuestosFiltrados = presupuestos
    .filter((p) => {
      // Filtro de precio
      let matchPrecio = true;
      if (filtroPrecio !== "todos") {
        const total = p.total || 0;
        if (filtroPrecio === "0-500") matchPrecio = total >= 0 && total <= 500;
        else if (filtroPrecio === "500-1000") matchPrecio = total > 500 && total <= 1000;
        else if (filtroPrecio === "1000-2500") matchPrecio = total > 1000 && total <= 2500;
        else if (filtroPrecio === "2500+") matchPrecio = total > 2500;
      }

      // Filtro de tipo
      const matchTipo = filtroTipo === "todos" || p.tipo === filtroTipo;

      return matchPrecio && matchTipo;
    })
    .sort((a, b) => {
      if (ordenamiento === "fecha-desc") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (ordenamiento === "fecha-asc") {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (ordenamiento === "precio-desc") {
        return (b.total || 0) - (a.total || 0);
      } else if (ordenamiento === "precio-asc") {
        return (a.total || 0) - (b.total || 0);
      }
      return 0;
    });

  // Obtener todos los tipos únicos para el filtro
  const tiposUnicos = [...new Set(presupuestos.map(p => p.tipo))].sort();

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
          <>
            <div className={styles.filtersContainer}>
              <div className={styles.filterRow}>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="todos">Todos los tipos</option>
                  {tiposUnicos.map(tipo => (
                    <option key={tipo} value={tipo}>{getNombreCategoria(tipo)}</option>
                  ))}
                </select>

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

                <select
                  value={ordenamiento}
                  onChange={(e) => setOrdenamiento(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="fecha-desc">Más recientes</option>
                  <option value="fecha-asc">Más antiguos</option>
                  <option value="precio-desc">Precio mayor</option>
                  <option value="precio-asc">Precio menor</option>
                </select>
              </div>

              {(filtroTipo !== "todos" || filtroPrecio !== "todos") && (
                <div className={styles.resultsCount}>
                  Mostrando {presupuestosFiltrados.length} de {presupuestos.length} presupuestos
                </div>
              )}
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Cliente</th>
                    <th>Detalles</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {presupuestosFiltrados.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {new Date(p.created_at).toLocaleDateString("es-ES")}
                      </td>
                      <td>
                        <span className={styles.tipoBadge}>
                          {getNombreCategoria(p.tipo)}
                        </span>
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
                        {/* Medidas según tipo de producto */}
                        {p.tipo?.includes("pergola") && p.ancho_mm && p.fondo_mm ? (
                          <div className={styles.detailItem}>
                            {p.ancho_mm} × {p.fondo_mm} mm
                          </div>
                        ) : p.alto_mm && p.ancho_mm ? (
                          <div className={styles.detailItem}>
                            {p.alto_mm} × {p.ancho_mm} mm
                          </div>
                        ) : null}
                        
                        {/* Modelo para compactos, paños, protección solar */}
                        {p.modelo && (
                          <div className={styles.detailItem}>
                            {p.modelo}
                          </div>
                        )}
                        
                        {/* Acabado para compactos, paños */}
                        {p.acabado && (
                          <div className={styles.detailItem}>
                            {p.acabado}
                          </div>
                        )}
                        
                        {/* Color */}
                        {p.color && (
                          <div className={styles.detailItem}>
                            Color: {p.color}
                          </div>
                        )}
                        
                        {/* Accesorios */}
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
                            Pagado
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgePending}`}>
                            Pendiente
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
                        ) : p.invalidado ? (
                          <div className={styles.invalidadoContainer}>
                            <div className={styles.alertInvalidado}>
                              <div className={styles.alertIcon}>⚠️</div>
                              <div className={styles.alertContent}>
                                <div className={styles.alertTitle}>Presupuesto no disponible</div>
                                <div className={styles.alertMessage}>{p.razon_invalidacion || "Producto eliminado del catálogo"}</div>
                              </div>
                            </div>
                            <button
                              className={`${styles.btn} ${styles.btnDelete}`}
                              onClick={() => abrirModalEliminar(p)}
                              title="Eliminar presupuesto"
                            >
                              Eliminar
                            </button>
                          </div>
                        ) : (
                          <div>
                            {p.precio_desactualizado && (
                              <div className={styles.alertDesactualizado}>
                                <div className={styles.alertIconSmall}>⚠️</div>
                                <div>
                                  <div className={styles.alertTitleSmall}>Precios desactualizados</div>
                                  <div className={styles.alertMessageSmall}>Edita para actualizar</div>
                                </div>
                              </div>
                            )}
                            <div className={styles.btnGroup} style={{ marginTop: p.precio_desactualizado ? '0.75rem' : '0' }}>
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
                                disabled={p.precio_desactualizado}
                                style={{ opacity: p.precio_desactualizado ? 0.5 : 1, cursor: p.precio_desactualizado ? 'not-allowed' : 'pointer' }}
                              >
                                Pagar
                              </button>
                              <button
                                className={`${styles.btn} ${styles.btnDelete}`}
                                onClick={() => abrirModalEliminar(p)}
                                title="Eliminar presupuesto"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {presupuestosFiltrados.length === 0 && (
                <div className={styles.emptyState}>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                    No se encontraron presupuestos con los filtros aplicados
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

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
              <h5 className={styles.modalTitle}>Eliminar Presupuesto</h5>
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

      {/* Modal de precios desactualizados */}
      {mostrarModalDesactualizado && presupuestoDesactualizado && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            setMostrarModalDesactualizado(false);
            setPresupuestoDesactualizado(null);
            setAccionDesactualizado(null);
          }}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`${styles.modalHeader} ${styles.modalHeaderWarning}`}>
              <h5 className={styles.modalTitle}>⚠️ Precios Desactualizados</h5>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setMostrarModalDesactualizado(false);
                  setPresupuestoDesactualizado(null);
                  setAccionDesactualizado(null);
                }}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.warningIconLarge}>⚠️</div>
              <h6 className={styles.modalTextLarge}>
                Los precios de este presupuesto están desactualizados
              </h6>
              {accionDesactualizado === 'editar' ? (
                <div className={styles.modalMessage}>
                  <p style={{ margin: '0 0 1rem 0' }}>
                    Si editas este presupuesto, se <strong>recalcularán automáticamente</strong> con los nuevos precios del catálogo.
                  </p>
                  <p style={{ margin: '0', color: '#666' }}>
                    ¿Deseas continuar con la edición?
                  </p>
                </div>
              ) : (
                <div className={styles.modalMessage}>
                  <p style={{ margin: '0 0 1rem 0' }}>
                    No puedes pagar un presupuesto con precios desactualizados.
                  </p>
                  <p style={{ margin: '0', color: '#666' }}>
                    Por favor, <strong>edita el presupuesto</strong> primero para actualizar los precios.
                  </p>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => {
                  setMostrarModalDesactualizado(false);
                  setPresupuestoDesactualizado(null);
                  setAccionDesactualizado(null);
                }}
              >
                Cancelar
              </button>
              {accionDesactualizado === 'editar' && (
                <button
                  className={`${styles.btn} ${styles.btnWarning}`}
                  onClick={confirmarEdicionDesactualizada}
                >
                  Sí, continuar editando
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
