// src/pages/compactos/index.js
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Header from "../../components/Header";
import CompactTypeCard from "../../components/CompactTypeCard";
import { useAuth } from "../../context/AuthContext";
import styles from "../../styles/ProductPages.module.css";

export default function Compactos() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login?m=login-required");
    }
  }, [loading, session, router]);

  const goConfig = (tipo) => {
    if (!session) {
      router.push("/login?m=login-required");
      return;
    }
    router.push(`/compactos/${tipo}`);
  };

  return (
    <>
      <Head>
        <title>Persianas Compacto · PresuProsol</title>
      </Head>

      <div className={styles.pageContainer}>
        <Header />

        <main className={styles.mainContent}>
          <section className={styles.section}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>
                Elige el tipo de persiana compacto
              </h1>
              <p className={styles.pageSubtitle}>
                Selecciona un tipo de sistema compacto para configurarlo y
                obtener tu precio personalizado.
              </p>
            </div>

            <div className={styles.cardsGrid2Col}>
              <CompactTypeCard
                title="Compacto cajón PVC"
                subtitle="Recto, Aislamax y Deco"
                imgSrc="/assets/persianasCompacto/compacto01.jpg"
                onClick={() => goConfig("pvc")}
              />

              <CompactTypeCard
                title="Compacto cajón Aluminio"
                subtitle="Perfilado, Aislabox y Extrusión"
                imgSrc="/assets/persianasCompacto/compacto02.png"
                onClick={() => goConfig("aluminio")}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

