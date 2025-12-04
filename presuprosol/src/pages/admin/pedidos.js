// src/pages/admin/pedidos.js
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import styles from "../../styles/Admin.module.css";


import {
  fetchAdminPedidos,
  updatePedidoEstado,
} from "../api/admin-pedidos-api";


import { enviarAvisoPedidoEnviado } from "../../lib/emailNotifications";

export default function AdminPedidos() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [estadoAbierto, setEstadoAbierto] = useState(null);
  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);
  const [filtroPrecio, setFiltroPrecio] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    if (!loading && (!session || profile?.rol !== "admin")) {
      router.replace("/perfil");
    }
  }, [loading, session, profile, router]);

  useEffect(() => {
    if (profile?.rol === "admin") {
      loadPedidos();
    }
  }, [profile]);

  async function loadPedidos() {
    setLoadingData(true);

    try {
      const { data, error } = await fetchAdminPedidos();

      if (error) {
        console.error("❌ Error cargando pedidos:", error);
        setPedidos([]);
      } else {
        setPedidos(data || []);
      }
    } catch (error) {
      console.error("❌ Error inesperado:", error);
      setPedidos([]);
    }

    setLoadingData(false);
  }

  
  async function cambiarEstado(id, nuevoEstado) {
    

    // Buscar pedido en memoria para obtener email y nombre
    const pedido = pedidos.find((p) => p.id === id);

    const { error } = await updatePedidoEstado(id, nuevoEstado);

    if (error) {
      console.error("❌ Error actualizando estado:", error);
      alert("Error actualizando estado: " + (error.message || error));
    } else {
      console.log("✅ Estado actualizado correctamente");

      
      if (nuevoEstado === "Enviando" && pedido) {
        enviarAvisoPedidoEnviado({
          email: pedido.usuario_email,
          nombre: pedido.usuario_nombre,
        });
      }

      loadPedidos(); // Recargar la lista
    }
  }

  if (loading || loadingData) {
    return (
      <>
        <Header />
        <div className={styles.pageContainer}>
          <main className={styles.mainContent}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Cargando pedidos...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  // Agrupar pedidos por estado
  const grouped = pedidos.reduce((acc, p) => {
    const estado = p.estado || "Sin estado";
    if (!acc[estado]) acc[estado] = [];
    acc[estado].push(p);
    return acc;
  }, {});

  const estadoNombres = {
    "En proceso": "En Proceso",
    "Enviando": "Enviando",
    "Entregado": "Entregado",
    "Sin estado": "Sin Estado"
  };

  const getNombreEstado = (estado) => {
    return estadoNombres[estado] || estado;
  };

  return (
    <>
      <Head>
        <title>Gestión de Pedidos · PresuProsol</title>
      </Head>
      <Header />

      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>Gestión de Pedidos</h1>
            <button
              onClick={() => router.push("/perfil")}
              className={styles.btnBack}
            >
              ← Volver al Perfil
            </button>
          </div>

          {pedidos.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <h3 className={styles.emptyTitle}>No hay pedidos registrados</h3>
              <p className={styles.emptyText}>
                Los pedidos aparecerán aquí cuando los clientes paguen sus presupuestos
              </p>
            </div>
          ) : (
            <>
              <div className={styles.filterSection}>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="En proceso">En Proceso</option>
                  <option value="Enviando">Enviando</option>
                  <option value="Entregado">Entregado</option>
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
              </div>

              <div className={styles.categoriesGrid}>
                {Object.keys(grouped).sort().map((estado) => {
                  const pedidosEstado = grouped[estado].filter((p) => {
                    const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado;
                    
                    let matchPrecio = true;
                    if (filtroPrecio !== "todos") {
                      const total = p.total || 0;
                      if (filtroPrecio === "0-500") matchPrecio = total >= 0 && total <= 500;
                      else if (filtroPrecio === "500-1000") matchPrecio = total > 500 && total <= 1000;
                      else if (filtroPrecio === "1000-2500") matchPrecio = total > 1000 && total <= 2500;
                      else if (filtroPrecio === "2500+") matchPrecio = total > 2500;
                    }
                    
                    return matchEstado && matchPrecio;
                  });
                  
                  if (pedidosEstado.length === 0) return null;
                  
                  const totalEstado = pedidosEstado.reduce((sum, p) => sum + (p.total || 0), 0);
                  
                  return (
                    <div key={estado} className={styles.categoryCard}>
                      <div 
                        className={styles.categoryHeader}
                        onClick={() => {
                          setEstadoAbierto(estado);
                          setMostrarModalEstado(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={styles.categoryInfo}>
                          <h3 className={styles.categoryCardTitle}>{getNombreEstado(estado)}</h3>
                          <div className={styles.categoryStats}>
                            <span className={styles.statBadge}>
                              {pedidosEstado.length} pedido{pedidosEstado.length !== 1 ? 's' : ''}
                            </span>
                            <span className={styles.statTotal}>
                              Total: {totalEstado.toFixed(2)} €
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
            </>
          )}
        </main>
      </div>

      {/* Modal de estado */}
      {mostrarModalEstado && estadoAbierto && (
        <div
          className={styles.modalOverlay}
          onClick={() => setMostrarModalEstado(false)}
        >
          <div
            className={styles.modalContentLarge}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>{getNombreEstado(estadoAbierto)}</h5>
              <button
                className={styles.closeButton}
                onClick={() => setMostrarModalEstado(false)}
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
                      <th>Tipo</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[estadoAbierto]
                      .filter((p) => {
                        const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado;
                        
                        let matchPrecio = true;
                        if (filtroPrecio !== "todos") {
                          const total = p.total || 0;
                          if (filtroPrecio === "0-500") matchPrecio = total >= 0 && total <= 500;
                          else if (filtroPrecio === "500-1000") matchPrecio = total > 500 && total <= 1000;
                          else if (filtroPrecio === "1000-2500") matchPrecio = total > 1000 && total <= 2500;
                          else if (filtroPrecio === "2500+") matchPrecio = total > 2500;
                        }
                        
                        return matchEstado && matchPrecio;
                      })
                      .map((p) => (
                        <tr key={p.id}>
                          <td>
                            {new Date(p.created_at).toLocaleDateString("es-ES")}
                          </td>
                          <td>
                            <div className={styles.userName}>{p.usuario_nombre}</div>
                            <small className={styles.userEmail}>{p.usuario_email}</small>
                          </td>
                          <td>
                            <span className={`${styles.badge} ${styles.badgeInfo}`}>
                              {p.presupuesto_tipo}
                            </span>
                          </td>
                          <td className={styles.totalPrice}>
                            {p.total?.toFixed(2)} €
                          </td>
                          <td>
                            <span
                              className={`${styles.badge} ${
                                p.estado === "En proceso"
                                  ? styles.badgeWarning
                                  : p.estado === "Enviando"
                                  ? styles.badgePrimary
                                  : styles.badgeSuccess
                              }`}
                            >
                              {p.estado}
                            </span>
                          </td>
                          <td>
                            {p.estado === "En proceso" && (
                              <button
                                className={`${styles.btn} ${styles.btnPrimary}`}
                                onClick={() => cambiarEstado(p.id, "Enviando")}
                              >
                                📤 Marcar como Enviando
                              </button>
                            )}
                            {p.estado === "Enviando" && (
                              <button
                                className={`${styles.btn} ${styles.btnSuccess}`}
                                onClick={() => cambiarEstado(p.id, "Entregado")}
                              >
                                ✅ Marcar como Entregado
                              </button>
                            )}
                            {p.estado === "Entregado" && (
                              <span className={styles.completed}>
                                ✅ Completado
                              </span>
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
    </>
  );
}
