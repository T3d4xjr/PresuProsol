import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import AvatarUploader from "../components/AvatarUploader";
import { actualizarPerfil } from "./api/perfil";
import styles from "../styles/Perfil.module.css";

export default function Perfil() {
  const router = useRouter();
  const { session, profile, loading, refreshProfile } = useAuth();

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/assets/avatar.jpg");

  // 🔒 Si no hay sesión -> redirigir a login
  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login?m=login-required");
    }
  }, [loading, session, router]);

  // 🔄 Sincronizar avatar cuando cargue el perfil
  useEffect(() => {
    if (profile?.foto_url) {
      setAvatarUrl(profile.foto_url);
    } else {
      setAvatarUrl("/assets/avatar.jpg");
    }
  }, [profile]);

  // 🕑 Mientras carga, no renderiza nada
  if (loading) return null;

  // 🔐 Si NO hay sesión, no renderiza
  if (!session) return null;

  // 🚫 Perfil no cargado o error
  if (session && profile === null) {
    return (
      <>
        <Head>
          <title>Perfil · PresuProsol</title>
        </Head>
        <Header />
        <main className={styles.perfilContainer}>
          <h1 className={styles.perfilTitle}>Perfil</h1>
          <div className={`${styles.alert} ${styles.alertWarning}`}>
            No hemos podido cargar tu perfil aún. Si acabas de registrarte,
            espera un momento y recarga.
          </div>
        </main>
      </>
    );
  }

  // 🚷 No habilitado por admin
  if (session && profile && profile.habilitado === false) {
    return (
      <>
        <Head>
          <title>Perfil · PresuProsol</title>
        </Head>
        <Header />
        <main className={styles.perfilContainer}>
          <h1 className={styles.perfilTitle}>Perfil</h1>
          <div className={`${styles.alert} ${styles.alertWarning}`}>
            Tu acceso está <strong>pendiente de aprobación</strong> por un
            administrador.
          </div>
        </main>
      </>
    );
  }

  // 💾 Guardar cambios del perfil
  async function onSave(e) {
    e.preventDefault();
    setMsg("");
    setSaving(true);

    const f = new FormData(e.currentTarget);
    const campos = {
      usuario: f.get("usuario")?.toString().trim(),
      email: f.get("email")?.toString().trim(),
      cif: f.get("cif")?.toString().trim(),
      telefono: f.get("telefono")?.toString().trim() || null,
      direccion: f.get("direccion")?.toString().trim() || null,
      nacionalidad: f.get("nacionalidad")?.toString().trim() || null,
      foto_url: avatarUrl || null,
    };

    try {
      await actualizarPerfil(session.user.id, campos);
      setMsg("✅ Perfil actualizado.");
      refreshProfile?.(); // 🔄 Refresca el perfil del hook
    } catch (error) {
      setMsg(`❌ No se pudo actualizar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  // 🧩 Render principal
  return (
    <>
      <Head>
        <title>Perfil · PresuProsol</title>
      </Head>
      <Header />

      <main className={styles.perfilContainer}>
        <div className={styles.perfilHeader}>
          <h1 className={styles.perfilTitle}>Mi perfil</h1>

          <div className={styles.buttonGroup}>
            {/* 📋 Mis Presupuestos - Todos los usuarios */}
            <button
              onClick={() => router.push("/mis-presupuestos")}
              className={`${styles.btn} ${styles.btnOutlinePrimary}`}
            >
              📋 Mis Presupuestos
            </button>

            {/* 📦 Mis Pedidos - Todos los usuarios */}
            <button
              onClick={() => router.push("/mis-pedidos")}
              className={`${styles.btn} ${styles.btnOutlineSuccess}`}
            >
              📦 Mis Pedidos
            </button>

            {/* 🔐 Administración - Solo admin */}
            {profile?.rol === "admin" && (
              <button
                onClick={() => router.push("/admin/usuarios")}
                className={`${styles.btn} ${styles.btnOutlineSecondary}`}
              >
                👤 Usuarios
              </button>
            )}

            {/* 🚚 Gestión de Pedidos - Solo admin */}
            {profile?.rol === "admin" && (
              <button
                onClick={() => router.push("/admin/pedidos")}
                className={`${styles.btn} ${styles.btnOutlineWarning}`}
              >
                🚚 Pedidos
              </button>
            )}
          </div>
        </div>

        <div className={styles.perfilCard}>
          {/* 📸 Selector de foto de perfil */}
          <AvatarUploader
            userId={session.user.id}
            currentUrl={avatarUrl}
            onUploaded={(newUrl) => {
              setAvatarUrl(newUrl);
              refreshProfile?.({ foto_url: newUrl }); // 🔥 Actualiza datos en memoria
            }}
          />

          <form onSubmit={onSave} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Usuario</label>
                <input
                  name="usuario"
                  defaultValue={profile?.usuario || ""}
                  className={styles.formControl}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={profile?.email || ""}
                  className={styles.formControl}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>CIF / NIF</label>
                <input
                  name="cif"
                  defaultValue={profile?.cif || ""}
                  className={styles.formControl}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Teléfono</label>
                <input
                  name="telefono"
                  defaultValue={profile?.telefono || ""}
                  className={styles.formControl}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={`${styles.formGroup} ${styles.formRowFull}`}>
                <label className={styles.formLabel}>Dirección</label>
                <input
                  name="direccion"
                  defaultValue={profile?.direccion || ""}
                  className={styles.formControl}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nacionalidad</label>
                <input
                  name="nacionalidad"
                  defaultValue={profile?.nacionalidad || ""}
                  className={styles.formControl}
                />
              </div>
            </div>

            {msg && (
              <div
                className={`${styles.alert} ${
                  msg.startsWith("✅") ? styles.alertSuccess : styles.alertDanger
                }`}
              >
                {msg}
              </div>
            )}

            <button className={styles.btnAccent} disabled={saving}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
