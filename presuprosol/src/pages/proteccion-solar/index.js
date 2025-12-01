// src/pages/proteccion-solar/index.js
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import MosqTypeCard from "../../components/MosqTypeCard";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/ProductPages.module.css";

export default function ProteccionSolarIndex() {
  const router = useRouter();
  const { session } = useAuth();

  const go = (tipo) => {
    if (!session) return router.push("/login?m=login-required");
    router.push(`/proteccion-solar/${tipo}`);
  };

  return (
    <div className={styles.pageContainer}>
      <Head><title>Protección Solar · PresuProsol</title></Head>
      
      <Header />

      <main className={styles.mainContent}>
        <section className={styles.section}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              Elige el tipo de protección solar
            </h1>
            <p className={styles.pageSubtitle}>
              Selecciona el tipo de toldo o screen que necesitas configurar.
            </p>
          </div>

          <div className={styles.cardsGrid}>
            <MosqTypeCard
              title="Stor-disaluz"
              imgSrc="/assets/proteccionSolar/Stor-disaluz.jpg"
              onClick={() => go("Stor-disaluz")}
            />
            <MosqTypeCard
              title="Stor-vilaluz"
              imgSrc="/assets/proteccionSolar/Stor-vilaluz.png"
              onClick={() => go("Stor-vilaluz")}
            />
            <MosqTypeCard
              title="Ventuszip01"
              imgSrc="/assets/proteccionSolar/ventuszip01.jpg"
              onClick={() => go("ventuszip01")}
            />
          </div>
        </section>
      </main>

    </div>
  );
}