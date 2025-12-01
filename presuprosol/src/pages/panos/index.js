// src/pages/panos/index.js
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import MosqTypeCard from "../../components/MosqTypeCard";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/ProductPages.module.css";

export default function PanosIndex() {
  const router = useRouter();
  const { session } = useAuth();

  const go = (slug) => {
    if (!session) return router.push("/login?m=login-required");
    router.push(`/panos/${slug}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Head><title>Paños · PresuProsol</title></Head>
      
      <Header />

      <main className={styles.mainContent}>
        <section className={styles.section}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              Elige el tipo de paño
            </h1>
            <p className={styles.pageSubtitle}>
              Selecciona si quieres un paño completo o comprar lamas sueltas.
            </p>
          </div>

          <div className={styles.cardsGrid2Col}>
            <MosqTypeCard
              title="Paño completo"
              imgSrc="/assets/panos/panoaluminio01.png"
              onClick={() => go("pano")}
            />
            <MosqTypeCard
              title="Lamas sueltas"
              imgSrc="/assets/panos/lamas-sueltas.png"
              onClick={() => go("lamas")}
            />
          </div>
        </section>
      </main>

    </div>
  );
}
