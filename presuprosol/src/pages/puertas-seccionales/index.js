// src/pages/puertas-seccionales/index.js
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import MosqTypeCard from "../../components/MosqTypeCard";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/ProductPages.module.css";

export default function PuertasSeccionalesIndex() {
  const router = useRouter();
  const { session } = useAuth();

  const go = (tipo) => {
    if (!session) return router.push("/login?m=login-required");
    router.push(`/puertas-seccionales/${tipo}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Head><title>Puertas Seccionales · PresuProsol</title></Head>
      
      <Header />

      <main className={styles.mainContent}>
        <section className={styles.section}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              Elige el tipo de puerta seccional
            </h1>
            <p className={styles.pageSubtitle}>
              Selecciona el tipo de puerta seccional que necesitas configurar.
            </p>
          </div>

          <div className={styles.cardsGrid2Col}>
            <MosqTypeCard
              title="Puerta Seccional Residencial"
              imgSrc="/assets/puertasGaraje/puertaSeccional01.png"
              onClick={() => go("residencial")}
            />
            <MosqTypeCard
              title="Puerta Seccional Industrial"
              imgSrc="/assets/puertasGaraje/puertaSeccional02.png"
              onClick={() => go("industrial")}
            />
          </div>
        </section>
      </main>

    </div>
  );
}