// src/components/MosqTypeCard.jsx
import Image from "next/image";
import styles from "./MosqTypeCard.module.css";

export default function MosqTypeCard({ title, imgSrc, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageContainer}>
        <Image
          src={imgSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          className={styles.image}
        />
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.title}>{title}</h3>
        <button className={styles.button}>
          Configurar
        </button>
      </div>
    </div>
  );
}
