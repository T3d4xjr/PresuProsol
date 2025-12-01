// src/pages/admin/pedidos.js
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import styles from "../../styles/Admin.module.css";

// 👉 Helpers de pedidos (Supabase encapsulado)
import {
  fetchAdminPedidos,
  updatePedidoEstado,
} from "../api/admin-pedidos-api";

// 👉 Email de pedido enviado
import { enviarAvisoPedidoEnviado } from "../../lib/emailNotifications";

export default function AdminPedidos() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

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

  // 🔄 Cambiar estado y, si pasa a "Enviando", enviar email al cliente
  async function cambiarEstado(id, nuevoEstado) {
    console.log(`🔄 Cambiando estado del pedido ${id} a: ${nuevoEstado}`);

    // Buscar pedido en memoria para obtener email y nombre
    const pedido = pedidos.find((p) => p.id === id);

    const { error } = await updatePedidoEstado(id, nuevoEstado);

    if (error) {
      console.error("❌ Error actualizando estado:", error);
      alert("Error actualizando estado: " + (error.message || error));
    } else {
      console.log("✅ Estado actualizado correctamente");

      // 📧 Solo cuando pasa a "Enviando"
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

  return (
    <>
      <Head>
        <title>Gestión de Pedidos · PresuProsol</title>
      </Head>
      <Header />

      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>🚚 Gestión de Pedidos</h1>
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
              <div className={styles.statsCard}>
                📊 Total de pedidos: <strong>{pedidos.length}</strong>
              </div>

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
                    {pedidos.map((p) => (
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
            </>
          )}
        </main>
      </div>
    </>
  );
}
