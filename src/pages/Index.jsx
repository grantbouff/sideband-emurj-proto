import { useState } from 'react'
import { Link } from 'react-router-dom'

const CARDS = {
  grant: [
    {
      id: 1, page: 'product-detail', pageLabel: 'Product Detail',
      description: 'Scroll-triggered pill FAB, auto-dismisses in 7 seconds with a timer underline.',
    },
    {
      id: 2, page: 'home', pageLabel: 'Home',
      description: 'Same pill on the home page, appears on load. No dismiss timer.',
    },
    {
      id: 3, page: 'home', pageLabel: 'Home',
      description: 'Circle enters from the right, slides left as the pill widens. X badge above the corner.',
    },
    {
      id: 4, page: 'home', pageLabel: 'Home',
      description: 'Circle with sonar ring and logo pulse, then expands — no lateral slide like C3.',
    },
    {
      id: 5, page: 'product-detail', pageLabel: 'Product Detail',
      description: 'Fixed bottom banner with thumbs up/down. Dismisses via a shrinking timer line.',
    },
    {
      id: 6, page: 'home', pageLabel: 'Home',
      description: 'Floating dot pulses, then widens on hover to expose a thumbs rating.',
    },
    {
      id: 7, page: 'home', pageLabel: 'Home',
      description: 'Sonar-ring FAB with thumbs icon, expands to show a rating prompt, morphs into a feedback card.',
    },
  ],
  nick: [
    {
      id: 1, page: 'product-detail', pageLabel: 'Product Detail',
      description: 'Circle scales from zero, expands to pill as text slides in from the right. X scales in after.',
    },
    {
      id: 2, page: 'product-detail', pageLabel: 'Product Detail', favorite: true,
      description: 'Avatar springs in, then rolls to the right edge as the pill expands around it.',
    },
    {
      id: 3, page: 'product-detail', pageLabel: 'Product Detail',
      description: 'Pill expands; text slides up from a clip mask rather than sliding in from the side.',
    },
    {
      id: 4, page: 'product-detail', pageLabel: 'Product Detail', favorite: true,
      description: 'Circle spring-rises with a sonar ring and avatar heartbeat, then expands.',
    },
    {
      id: 5, page: 'product-detail', pageLabel: 'Product Detail',
      description: 'Spring drop from above. Avatar iris-wipes in as shimmer sweeps. Drifts toward cursor.',
    },
    {
      id: 6, page: 'product-detail', pageLabel: 'Product Detail', favorite: true,
      description: 'Rises from below as a clip mask opens mid-flight. Avatar slot grows open separately.',
    },
  ],
}

const USERS = [
  { key: 'grant', name: 'Grant' },
  { key: 'nick',  name: 'Nick' },
]

function ConceptCard({ user, card }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={`/concept/${user}/${card.id}/${card.page}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: hovered ? '#1c1c1c' : '#141414',
        borderRadius: 3,
        minHeight: 200,
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.15s',
        cursor: 'pointer',
      }}>
        {card.favorite && (
          <div style={{ position: 'absolute', top: 9, left: 9 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5c518">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        )}

        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: '#1b1b1b',
          border: '1px solid #252525',
          borderRadius: 2,
          padding: '2px 5px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 400,
            color: '#a5a5a5',
            letterSpacing: '-0.02em',
            fontFamily: 'Inter, sans-serif',
          }}>
            {card.pageLabel}
          </span>
        </div>

        <div style={{
          position: 'absolute',
          bottom: 14,
          left: 8,
          right: 8,
        }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#ffffff',
            margin: '0 0 5px 0',
            fontFamily: 'Inter, sans-serif',
          }}>
            Concept {card.id}
          </h3>
          <p style={{
            fontSize: 12,
            fontWeight: 300,
            color: '#a5a5a5',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {card.description}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function Index() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>FAB Prototypes</h1>
      <p style={styles.subtitle}>Overlay component concepts</p>

      <div style={styles.columns}>
        {USERS.map(({ key, name }) => (
          <h2 key={key} style={styles.sectionName}>{name}</h2>
        ))}
        {USERS.map(({ key }) => (
          <div key={key} style={styles.grid}>
            {CARDS[key].map(card => (
              <ConceptCard key={card.id} user={key} card={card} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '80px 32px',
  },
  title: {
    fontSize: 32,
    fontWeight: 600,
    color: '#fff',
    margin: '0 0 4px 0',
    fontFamily: 'Inter, sans-serif',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    margin: '0 0 56px 0',
    fontFamily: 'Inter, sans-serif',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    columnGap: 32,
    rowGap: 12,
  },
  sectionName: {
    fontSize: 13,
    fontWeight: 500,
    color: '#444',
    margin: 0,
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 8,
    alignSelf: 'start',
  },
}
