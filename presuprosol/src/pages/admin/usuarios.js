// src/pages/admin/usuarios.js
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import styles from "../../styles/Admin.module.css";


import {
  fetchAdminUsuarios,
  habilitarUsuarioDb,
  deshabilitarUsuarioDb,
  cambiarRolDb,
  cambiarDescuentoDb,
} from "../api/admin-usuarios-api";


import { enviarAvisoEstadoUsuario } from "../../lib/emailNotifications";

export default function UsuariosAdmin() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [msg, setMsg] = useState("");

  
  useEffect(() => {
    if (!loading) {
      if (!session) {
        router.replace("/login");
      } else if (profile?.rol !== "admin") {
        router.replace("/perfil");
      }
    }
  }, [loading, session, profile, router]);

  // Cargar lista inicial
  useEffect(() => {
    if (profile?.rol === "admin") {
      fetchUsuarios();
    }
  }, [profile]);

  async function fetchUsuarios() {
    setLoadingData(true);
    setMsg("");

    const { data, error } = await fetchAdminUsuarios();

    if (error) {
      console.error("Error cargando usuarios:", error);
      setMsg("❌ Error cargando usuarios.");
      setUsuarios([]);
    } else {
      setUsuarios(data || []);
    }

    setLoadingData(false);
  }

  
  async function habilitarUsuario(u) {
    setMsg("");

    try {
      const { error } = await habilitarUsuarioDb(u);
      if (error) throw error;

      
      enviarAvisoEstadoUsuario({
        email: u.email,
        usuario: u.usuario,
        estado: "habilitado",
      });

      setMsg("✅ Usuario habilitado correctamente.");
      fetchUsuarios();
    } catch (err) {
      console.error("Error al habilitar:", err);
      setMsg("❌ No se pudo habilitar el usuario.");
    }
  }

  
  async function deshabilitarUsuario(u) {
    setMsg("");
    try {
      const { error } = await deshabilitarUsuarioDb(u);
      if (error) throw error;

      
      enviarAvisoEstadoUsuario({
        email: u.email,
        usuario: u.usuario,
        estado: "deshabilitado",
      });

      setMsg("⚠️ Usuario deshabilitado y eliminado de usuarios.");
      fetchUsuarios();
    } catch (err) {
      console.error("Error al deshabilitar:", err);
      setMsg("❌ No se pudo deshabilitar el usuario.");
    }
  }

  // Cambiar ROL
  async function cambiarRol(u, nuevoRol) {
    setMsg("");
    try {
      const { error } = await cambiarRolDb(u, nuevoRol);
      if (error) throw error;

      setMsg("🔄 Rol actualizado correctamente.");
      fetchUsuarios();
    } catch (err) {
      console.error("Error rol:", err);
      setMsg("❌ No se pudo cambiar el rol.");
    }
  }

  // Cambiar % descuento
  async function cambiarDescuento(u, nuevoValor) {
    setMsg("");
    const n = Number(
      String(nuevoValor).replace(",", ".").replace(/[^\d.]/g, "")
    );
    if (Number.isNaN(n) || n < 0) {
      setMsg("❗ El descuento no puede ser negativo");
      return;
    }
    if (n > 50) {
      setMsg("❗ El descuento no puede superar el 50%");
      return;
    }

    // Optimistic UI
    setUsuarios((prev) =>
      prev.map((row) =>
        row.id === u.id
          ? { ...row, descuento: Number(n.toFixed(2)) }
          : row
      )
    );

    const { error } = await cambiarDescuentoDb(u.id, n);

    if (error) {
      console.error("Error descuento:", error);
      setMsg("❌ No se pudo guardar el descuento.");
      fetchUsuarios();
    } else {
      setMsg("💾 Descuento actualizado.");
    }
  }

  return (
    <>
      <Head>
        <title>Administración de Usuarios · PresuProsol</title>
      </Head>
      <Header />

      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>👥 Administración de Usuarios</h1>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className={styles.btnSecondary} onClick={() => router.push("/perfil")}>
                ← Volver
              </button>
              <button className={styles.btnRefresh} onClick={fetchUsuarios}>
                🔄 Actualizar
              </button>
            </div>
          </div>

          {msg && (
            <div
              className={`${styles.alert} ${
                msg.startsWith("✅")
                  ? styles.alertSuccess
                  : msg.startsWith("💾") || msg.startsWith("🔄")
                  ? styles.alertInfo
                  : msg.startsWith("⚠️") || msg.startsWith("❗")
                  ? styles.alertWarning
                  : styles.alertDanger
              }`}
            >
              {msg}
            </div>
          )}

          {loadingData ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Cargando usuarios...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👥</div>
              <h3 className={styles.emptyTitle}>No hay usuarios registrados</h3>
              <p className={styles.emptyText}>
                Los usuarios aparecerán aquí cuando se registren en la aplicación
              </p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>CIF / NIF</th>
                    <th>Rol</th>
                    <th>Descuento %</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th className={styles.textCenter}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td className={styles.userName}>{u.usuario}</td>
                      <td>{u.email}</td>
                      <td>{u.cif}</td>

                      <td>
                        <select
                          value={u.rol || "usuario"}
                          onChange={(e) => cambiarRol(u, e.target.value)}
                          className={styles.select}
                        >
                          <option value="usuario">usuario</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>

                      <td>
                        <div className={styles.inputGroup}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            className={styles.input}
                            value={u.descuento ?? 0}
                            onChange={(e) =>
                              setUsuarios((prev) =>
                                prev.map((row) =>
                                  row.id === u.id
                                    ? { ...row, descuento: e.target.value }
                                    : row
                                )
                              )
                            }
                            onBlur={(e) =>
                              cambiarDescuento(u, e.target.value)
                            }
                          />
                          <span className={styles.inputSuffix}>%</span>
                        </div>
                      </td>

                      <td>
                        {u.habilitado ? (
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                            Habilitado
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeSecondary}`}>
                            Deshabilitado
                          </span>
                        )}
                      </td>

                      <td>
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString("es-ES")
                          : "-"}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        {u.habilitado ? (
                          <button
                            className={`${styles.btn} ${styles.btnWarning}`}
                            onClick={() => deshabilitarUsuario(u)}
                          >
                            Deshabilitar
                          </button>
                        ) : (
                          <button
                            className={`${styles.btn} ${styles.btnSuccess}`}
                            onClick={() => habilitarUsuario(u)}
                          >
                            Habilitar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
