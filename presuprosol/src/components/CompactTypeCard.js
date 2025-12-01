// src/components/CompactTypeCard.jsx
import styles from "./CompactTypeCard.module.css";

export default function CompactTypeCard({ title, subtitle, imgSrc, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      {/* Imagen con ratio 4:3 */}
      <div className={styles.imageContainer}>
        <img
          src={imgSrc}
          alt={title}
          className={styles.image}
          onError={(e) => (e.currentTarget.src = "/assets/avatar.jpg")}
        />
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && (
          <p className={styles.subtitle}>
            {subtitle}
          </p>
        )}
        <button
          type="button"
          className={styles.button}
        >
          Configurar
        </button>
      </div>
    </div>
  );
}
