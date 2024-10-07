import { Card } from 'react-bootstrap';
import styles from '../styles/SentimentValues.module.css';

const classifySentiment = (value) => {
  if (value < -10) return ['Bearish', styles.bearish];
  if (value > 10) return ['Bullish', styles.bullish];
  return ['Neutral', styles.neutral];
};

const SentimentValues = ({ banknifty, nifty, overall }) => {
  const [bankniftyClass, bankniftyStyle] = classifySentiment(banknifty?.sentiment);
  const [niftyClass, niftyStyle] = classifySentiment(nifty?.sentiment);
  const [overallClass, overallStyle] = classifySentiment(overall?.sentiment);

  return (
    <Card className={styles.card}>
      <Card.Header>Current Sentiment Values</Card.Header>
      <Card.Body>
        <div>
          <h5>Bank Nifty Sentiment:</h5>
          <p>Value: {banknifty?.sentiment.toFixed(2)}</p>
          <p className={bankniftyStyle}>Classification: {bankniftyClass}</p>
        </div>
        <div>
          <h5>Nifty Sentiment:</h5>
          <p>Value: {nifty?.sentiment.toFixed(2)}</p>
          <p className={niftyStyle}>Classification: {niftyClass}</p>
        </div>
        <div>
          <h5>Overall Sentiment:</h5>
          <p>Value: {overall?.sentiment.toFixed(2)}</p>
          <p className={overallStyle}>Classification: {overallClass}</p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SentimentValues;