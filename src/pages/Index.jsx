import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONCEPTS } from '../App'

const USERS = ['grant', 'nick']

export default function Index() {
  const [activeUser, setActiveUser] = useState('grant')
  const concepts = CONCEPTS[activeUser]

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>FAB Prototypes</h1>
      <p style={styles.subtitle}>Overlay component concepts</p>

      <div style={styles.tabs}>
        {USERS.map((user) => (
          <button
            key={user}
            style={{ ...styles.tab, ...(activeUser === user ? styles.tabActive : styles.tabInactive) }}
            onClick={() => setActiveUser(user)}
          >
            {user.charAt(0).toUpperCase() + user.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {concepts.map((concept) => (
          <div key={concept.id} style={styles.card}>
            <h2 style={styles.cardTitle}>{concept.label}</h2>
            <div style={styles.links}>
              {concept.home ? (
                <Link to={`/concept/${activeUser}/${concept.id}/home`} style={styles.linkEnabled}>
                  Home
                </Link>
              ) : (
                <span style={styles.linkDisabled}>Home</span>
              )}
              {concept.productDetail ? (
                <Link to={`/concept/${activeUser}/${concept.id}/product-detail`} style={styles.linkEnabled}>
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
    marginBottom: 32,
  },
  tabs: {
    display: 'flex',
    background: '#111',
    border: '1px solid #222',
    borderRadius: 10,
    padding: 4,
    gap: 4,
    marginBottom: 24,
    width: 'fit-content',
  },
  tab: {
    padding: '7px 20px',
    borderRadius: 7,
    border: 'none',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  },
  tabActive: {
    background: '#fff',
    color: '#000',
  },
  tabInactive: {
    background: 'transparent',
    color: '#555',
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
