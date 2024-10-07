import styles from '../styles/SentimentLegend.module.css';

const SentimentLegend = () => (
  <div className={styles.legend}>
    <h4>Sentiment Legend</h4>
    <div className={styles.item}>
      <div className={`${styles.badge} ${styles.bearish}`}></div>
      <span>Bearish (-40 to -10)</span>
    </div>
    <div className={styles.item}>
      <div className={`${styles.badge} ${styles.neutral}`}></div>
      <span>Neutral (-10 to 10)</span>
    </div>
    <div className={styles.item}>
      <div className={`${styles.badge} ${styles.bullish}`}></div>
      <span>Bullish (10 to 40)</span>
    </div>
  </div>
);

export default SentimentLegend;