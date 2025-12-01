// src/pages/mosquiteras/index.js
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import MosqTypeCard from "../../components/MosqTypeCard";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/ProductPages.module.css";

export default function Mosquiteras() {
  const router = useRouter();
  const { session } = useAuth();

  const goConfig = (tipo) => {
    if (!session) {
      router.push("/login?m=login-required");
      return;
    }
    router.push(`/mosquiteras/${tipo}`);
  };

  return (
    <>
      <Head>
        <title>Mosquiteras · PresuProsol</title>
      </Head>

      <div className={styles.pageContainer}>
        <Header />

        <main className={styles.mainContent}>
          <section className={styles.section}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>
                Elige el tipo de mosquitera
              </h1>
              <p className={styles.pageSubtitle}>
                Selecciona un tipo para configurarlo y obtener tu precio
                personalizado.
              </p>
            </div>

            <div className={styles.cardsGrid}>
              <MosqTypeCard
                title="Mosquitera Corredera"
                imgSrc="/assets/mosquiteras/mosquitera01.jpg"
                onClick={() => goConfig("corredera")}
              />

              <MosqTypeCard
                title="Mosquitera Fija"
                imgSrc="/assets/mosquiteras/mosquitera02.jpg"
                onClick={() => goConfig("fija")}
              />

              <MosqTypeCard
                title="Mosquitera Enrollable"
                imgSrc="/assets/mosquiteras/mosquitera03.png"
                onClick={() => goConfig("enrollable")}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
