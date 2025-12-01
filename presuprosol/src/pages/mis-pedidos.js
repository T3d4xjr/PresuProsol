import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { fetchPedidosUsuario } from "./api/pedidos";
import styles from "../styles/MisPresupuestos.module.css";

export default function MisPedidos() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login?m=login-required");
    }
  }, [loading, session, router]);

  useEffect(() => {
    if (session?.user?.id) {
      loadPedidos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadPedidos() {
    setLoadingData(true);
    try {
      const data = await fetchPedidosUsuario(session.user.id);
      setPedidos(data);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    } finally {
      setLoadingData(false);
    }
  }

  if (loading || loadingData) {
    return (
      <>
        <Header />
        <main className={styles.pageContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Cargando pedidos...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Mis Pedidos · PresuProsol</title>
      </Head>
      <Header />

      <main className={styles.pageContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>📦 Mis Pedidos</h1>
          <button
            onClick={() => router.push("/perfil")}
            className={styles.backButton}
          >
            ← Volver
          </button>
        </div>

        {pedidos.length === 0 ? (
          <div className={styles.emptyState}>
            <p style={{ margin: 0 }}>
              No tienes pedidos aún. Los pedidos aparecerán aquí una vez que pagues tus presupuestos.
            </p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Detalles</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {new Date(p.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeInfo}`}>
                        {p.presupuestos?.tipo || "N/A"}
                      </span>
                    </td>
                    <td>
                      {p.presupuestos?.alto_mm && p.presupuestos?.ancho_mm && (
                        <div className={styles.detailItem}>
                          {p.presupuestos.alto_mm} × {p.presupuestos.ancho_mm} mm
                        </div>
                      )}
                      {p.presupuestos?.color && (
                        <div className={styles.detailItem}>
                          Color: {p.presupuestos.color}
                        </div>
                      )}
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
                            : styles.badgePaid
                        }`}
                      >
                        {p.estado === "En proceso" ? "⏳ En proceso" : 
                         p.estado === "Enviando" ? "📤 Enviando" : 
                         "✅ " + p.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
