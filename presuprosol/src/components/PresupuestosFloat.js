// src/components/PresupuestosFloat.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { fetchPresupuestosUsuario } from "../pages/api/presupuestos";
import styles from "./PresupuestosFloat.module.css";

const IVA_PERCENTAGE = 21; // IVA del 21%

export default function PresupuestosFloat() {
  const router = useRouter();
  const { session } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [presupuestos, setPresupuestos] = useState([]);
  const [mostrarResumen, setMostrarResumen] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      loadPresupuestos();
    }
  }, [session]);

  async function loadPresupuestos() {
    setLoading(true);
    try {
      const data = await fetchPresupuestosUsuario(session.user.id);
      setPresupuestos(data || []);
      setCount(data?.length || 0);
    } catch (error) {
      console.error("Error cargando presupuestos:", error);
      setPresupuestos([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }

  // Calcular totales
  const calcularTotales = () => {
    const totalSinIVA = presupuestos.reduce((sum, p) => sum + (p.total || 0), 0);
    const iva = totalSinIVA * (IVA_PERCENTAGE / 100);
    const totalConIVA = totalSinIVA + iva;
    
    return {
      totalSinIVA,
      iva,
      totalConIVA,
      cantidadPresupuestos: presupuestos.length,
      pendientesPago: presupuestos.filter(p => !p.pagado).length,
      pagados: presupuestos.filter(p => p.pagado).length,
    };
  };

  // No mostrar si no hay sesión
  if (!session?.user?.id) return null;

  const totales = calcularTotales();

  return (
    <>
      <button
        className={styles.floatButton}
        onClick={() => setMostrarResumen(!mostrarResumen)}
        title="Ver resumen de presupuestos"
      >
        <div className={styles.icon}>
          📋
        </div>
        {count > 0 && !loading && (
          <div className={styles.badge}>{count}</div>
        )}
      </button>

      {mostrarResumen && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setMostrarResumen(false)}
        >
          <div 
            className={styles.resumenModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>📊 Resumen de Presupuestos</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setMostrarResumen(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Estadísticas generales */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📋</div>
                  <div className={styles.statValue}>{totales.cantidadPresupuestos}</div>
                  <div className={styles.statLabel}>Total Presupuestos</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⏳</div>
                  <div className={styles.statValue}>{totales.pendientesPago}</div>
                  <div className={styles.statLabel}>Pendientes</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>✅</div>
                  <div className={styles.statValue}>{totales.pagados}</div>
                  <div className={styles.statLabel}>Pagados</div>
                </div>
              </div>

              {/* Desglose de precios */}
              <div className={styles.preciosSection}>
                <h4 className={styles.sectionTitle}>💰 Desglose de Precios</h4>
                
                <div className={styles.precioRow}>
                  <span className={styles.precioLabel}>Total sin IVA:</span>
                  <span className={styles.precioValue}>{totales.totalSinIVA.toFixed(2)} €</span>
                </div>

                <div className={styles.precioRow}>
                  <span className={styles.precioLabel}>IVA ({IVA_PERCENTAGE}%):</span>
                  <span className={styles.precioValue}>{totales.iva.toFixed(2)} €</span>
                </div>

                <div className={styles.precioRowTotal}>
                  <span className={styles.precioLabelTotal}>Total con IVA:</span>
                  <span className={styles.precioValueTotal}>{totales.totalConIVA.toFixed(2)} €</span>
                </div>
              </div>

              {/* Lista de productos */}
              {presupuestos.length > 0 && (
                <div className={styles.productosSection}>
                  <h4 className={styles.sectionTitle}>📦 Productos en Presupuestos</h4>
                  <div className={styles.productosList}>
                    {presupuestos.map((p, index) => (
                      <div key={p.id} className={styles.productoItem}>
                        <div className={styles.productoInfo}>
                          <div className={styles.productoTipo}>
                            {p.tipo}
                            {p.pagado && <span className={styles.badgePagado}>Pagado</span>}
                            {p.invalidado && <span className={styles.badgeInvalidado}>Invalidado</span>}
                          </div>
                          <div className={styles.productoCliente}>{p.cliente || 'Sin nombre'}</div>
                        </div>
                        <div className={styles.productoPrecio}>
                          <div className={styles.precioSinIva}>{p.total.toFixed(2)} € (sin IVA)</div>
                          <div className={styles.precioConIva}>
                            {(p.total * (1 + IVA_PERCENTAGE / 100)).toFixed(2)} € (con IVA)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setMostrarResumen(false)}
              >
                Cerrar
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => {
                  setMostrarResumen(false);
                  router.push("/mis-presupuestos");
                }}
              >
                Ver todos los presupuestos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
