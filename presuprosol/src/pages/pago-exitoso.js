import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Header from "../components/Header";
import styles from "../styles/MisPresupuestos.module.css";

export default function PagoExitoso() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/mis-pedidos");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Pago Exitoso · PresuProsol</title>
      </Head>
      <Header />

      <main className={styles.pageContainer}>
        <div className={styles.successContainer}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✅</div>
            <h1 className={styles.successTitle}>¡Pago realizado con éxito!</h1>
            <p className={styles.successText}>
              Tu pedido ha sido confirmado y será procesado pronto.
            </p>
            <p className={styles.successRedirect}>
              Redirigiendo a Mis Pedidos en 3 segundos...
            </p>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => router.push("/mis-pedidos")}
              style={{ marginTop: "1rem" }}
            >
              Ver mis pedidos
            </button>
          </div>
        </div>
      </main>

    </>
  );
}