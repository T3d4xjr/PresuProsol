// src/components/PresupuestosFloat.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { fetchPresupuestosUsuario } from "../pages/api/presupuestos";
import styles from "./PresupuestosFloat.module.css";

export default function PresupuestosFloat() {
  const router = useRouter();
  const { session } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      loadCount();
    }
  }, [session]);

  async function loadCount() {
    setLoading(true);
    try {
      const data = await fetchPresupuestosUsuario(session.user.id);
      setCount(data?.length || 0);
    } catch (error) {
      console.error("Error cargando presupuestos:", error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }

  // No mostrar si no hay sesión
  if (!session?.user?.id) return null;

  return (
    <button
      className={styles.floatButton}
      onClick={() => router.push("/mis-presupuestos")}
      title="Ver mis presupuestos"
    >
      <div className={styles.icon}>
        📋
      </div>
      {count > 0 && !loading && (
        <div className={styles.badge}>{count}</div>
      )}
    </button>
  );
}
