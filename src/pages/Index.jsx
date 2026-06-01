import { Link } from 'react-router-dom'
import { CONCEPTS } from '../App'

export default function Index() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>FAB Prototypes</h1>
      <p style={styles.subtitle}>Overlay component concepts</p>
      <div style={styles.grid}>
        {CONCEPTS.map((concept) => (
          <div key={concept.id} style={styles.card}>
            <h2 style={styles.cardTitle}>{concept.label}</h2>
            <div style={styles.links}>
              {concept.home ? (
                <Link to={`/concept/${concept.id}/home`} style={styles.linkEnabled}>
                  Home
                </Link>
              ) : (
                <span style={styles.linkDisabled}>Home</span>
              )}
              {concept.productDetail ? (
                <Link to={`/concept/${concept.id}/product-detail`} style={styles.linkEnabled}>
                  Product Detail
                </Link>
              ) : (
                <span style={styles.linkDisabled}>Product Detail</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '80px 24px',
  },
  title: {
    fontSize: 32,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 48,
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    background: '#141414',
    border: '1px solid #222',
    borderRadius: 12,
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 500,
    color: '#e0e0e0',
  },
  links: {
    display: 'flex',
    gap: 12,
  },
  linkEnabled: {
    fontSize: 14,
    fontWeight: 500,
    padding: '6px 16px',
    borderRadius: 8,
    background: '#1a1a2e',
    color: '#818cf8',
    border: '1px solid #2a2a4a',
    transition: 'background 0.15s',
    cursor: 'pointer',
  },
  linkDisabled: {
    fontSize: 14,
    fontWeight: 500,
    padding: '6px 16px',
    borderRadius: 8,
    background: '#111',
    color: '#333',
    border: '1px solid #1a1a1a',
    cursor: 'default',
  },
}
