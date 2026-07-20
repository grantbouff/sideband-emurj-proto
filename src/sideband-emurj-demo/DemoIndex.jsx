import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONFIGS } from './configs'

/* DemoIndex — grid of the five SideBand prototypes, styled after
 * src/pages/Index.jsx.
 */
function PrototypeCard({ config }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={`/demo/${config.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: hovered ? '#1c1c1c' : '#141414',
        borderRadius: 3, minHeight: 200, position: 'relative', overflow: 'hidden',
        transition: 'background 0.15s', cursor: 'pointer',
      }}>
        <div style={{
          position: 'absolute', top: 8, right: 8,
          background: '#1b1b1b', border: '1px solid #252525', borderRadius: 2,
          padding: '2px 5px', display: 'inline-flex', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, color: '#a5a5a5', letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif' }}>
            {config.page === 'home' ? 'Home' : 'Product Detail'}
          </span>
        </div>
        <div style={{ position: 'absolute', bottom: 14, left: 8, right: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 5px 0', fontFamily: 'Inter, sans-serif' }}>
            {config.title}
          </h3>
          <p style={{
            fontSize: 12, fontWeight: 300, color: '#a5a5a5', letterSpacing: '-0.02em',
            lineHeight: 1.3, margin: 0, fontFamily: 'Inter, sans-serif',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {config.description}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function DemoIndex() {
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 600, color: '#fff', margin: '0 0 4px 0', fontFamily: 'Inter, sans-serif' }}>
          SideBand Emurj Demo
        </h1>
        <p style={{ fontSize: 14, color: '#555', margin: '0 0 8px 0', fontFamily: 'Inter, sans-serif' }}>
          Five themed prototypes over the SideBand token system
        </p>
        <Link to="/" style={{ fontSize: 13, color: '#666', fontFamily: 'Inter, sans-serif' }}>
          ← FAB Prototypes
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
        {CONFIGS.map((config) => (
          <PrototypeCard key={config.id} config={config} />
        ))}
      </div>
    </div>
  )
}
