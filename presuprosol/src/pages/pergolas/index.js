// src/pages/pergolas/index.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/ProductPages.module.css";

export default function PergolaIndex() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login?m=login-required");
    }
  }, [loading, session, router]);

  return (
    <>
      <Head>
        <title>Pérgolas Bioclimáticas · PresuProsol</title>
      </Head>

      <div className={styles.pageContainer}>
        <Header />

        <main className={styles.mainContent}>
          <section className={styles.narrowSection}>
            <div className={styles.headerWithBack}>
              <h1 className={styles.pageTitle}>Pérgolas Bioclimáticas</h1>
              <button
                className={styles.btnBack}
                onClick={() => router.push("/")}
              >
                ← Volver al inicio
              </button>
            </div>

            <div 
              className={styles.pergolaCard}
              onClick={() => router.push("/pergolas/bioclimatica")}
            >
              <div className={styles.pergolaCardImage}>
                <img
                  src="/assets/pergolaBioclimatica/pergola01.png"
                  alt="Pérgola Bioclimática"
                />
              </div>
              <div className={styles.pergolaCardBody}>
                <h5 className={styles.pergolaCardTitle}>
                  Pérgola Bioclimática
                </h5>
                <p className={styles.pergolaCardText}>
                  Configura tu pérgola bioclimática personalizada con
                  lamas orientables de aluminio. Sistema de alto
                  rendimiento que te permite controlar la luz y la
                  ventilación.
                </p>
                <div className={styles.pergolaFeatures}>
                  ✓ Lamas orientables de aluminio<br />
                  ✓ Control de luz y ventilación<br />
                  ✓ Resistente a la intemperie
                </div>
                <button className={styles.pergolaButton}>
                  Configurar pérgola →
                </button>
              </div>
            </div>

            <div className={styles.pergolaAlert}>
              <strong>ℹ️ Información:</strong> Las pérgolas bioclimáticas
              requieren un presupuesto mínimo de <strong>2.500 €</strong>.
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
