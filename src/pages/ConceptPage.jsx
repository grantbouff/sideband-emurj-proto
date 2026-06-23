import { useParams, useSearchParams } from 'react-router-dom'
import { lazy, Suspense, useState } from 'react'
import { NAV } from '../conceptNav'
import { getNavConfig } from '../releasesConfig'

const BASE = import.meta.env.BASE_URL
const PAGE_URLS = {
  home: `${BASE}pages/home.html`,
  'product-detail': `${BASE}pages/product-detail.html`,
}

const r1Modules = import.meta.glob('../concepts/r1/*/concept-*.jsx')
const r2Modules = import.meta.glob('../concepts/r2/*/concept-*.jsx')

function getConceptComponent(release, user, conceptId) {
  const modules = release === 'r1' ? r1Modules : r2Modules
  const key = `../concepts/${release}/${user}/concept-${conceptId}.jsx`
  if (modules[key]) {
    return lazy(modules[key])
  }
  return null
}

function ConceptNav({ release, user, conceptId }) {
  const [hovered, setHovered] = useState(false)
  const navConfig = getNavConfig(release)
  const concepts = navConfig[user] || []
  const idx      = concepts.findIndex(c => String(c.id) === String(conceptId))
  const prev     = concepts[idx - 1]
  const next     = concepts[idx + 1]
  const otherUser    = user === 'nick' ? 'grant' : 'nick'
  const otherConcepts = navConfig[otherUser] || []
  const otherTarget  = otherConcepts.find(c => String(c.id) === String(conceptId)) || otherConcepts[0]

  // Silently update the hash then force full reload so entrance animations fire fresh
  const goTo = (u, id, page) => {
    history.replaceState(null, '', `#/concept/${u}/${id}/${page}?release=${release}`)
    window.location.reload()
  }

  const btnStyle = (disabled) => ({
    background: 'none',
    border: 'none',
    color: disabled ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.5)',
    cursor: disabled ? 'default' : 'pointer',
    padding: '0 8px',
    fontSize: 11,
    lineHeight: '24px',
    fontFamily: 'Inter, -apple-system, sans-serif',
    letterSpacing: '0.02em',
  })

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 24,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: hovered ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: hovered ? 'blur(8px)' : 'none',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        pointerEvents: 'auto',
        padding: '0 4px',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}>
      {/* Center group: home | C# | Nick Grant | ← → */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

        {/* Home icon */}
        <a
          href={`#/`}
          style={{ display: 'flex', alignItems: 'center', padding: '0 4px', color: 'rgba(0,0,0,0.35)', lineHeight: '24px' }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M1 5.5L6 1.5L11 5.5V11H8V8H4V11H1V5.5Z" fill="currentColor" fillOpacity="0.7" />
          </svg>
        </a>

        <div style={{ width: 1, height: 10, background: 'rgba(0,0,0,0.12)' }} />

        {/* Concept label */}
        <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em', padding: '0 4px' }}>
          C{conceptId}
        </span>

        <div style={{ width: 1, height: 10, background: 'rgba(0,0,0,0.12)' }} />

        {/* User toggle */}
        {['nick', 'grant'].map(u => (
          <button
            key={u}
            style={{
              background: u === user ? 'rgba(0,0,0,0.08)' : 'none',
              border: 'none',
              borderRadius: 3,
              color: u === user ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.28)',
              cursor: u === user ? 'default' : 'pointer',
              padding: '1px 6px',
              fontSize: 11,
              fontFamily: 'Inter, -apple-system, sans-serif',
              letterSpacing: '0.02em',
              lineHeight: '18px',
            }}
            onClick={() => {
              if (u !== user && otherTarget) {
                goTo(u, otherTarget.id, otherTarget.page)
              }
            }}
          >
            {u.charAt(0).toUpperCase() + u.slice(1)}
          </button>
        ))}

        <div style={{ width: 1, height: 10, background: 'rgba(0,0,0,0.12)' }} />

        {/* Prev / Next arrows */}
        <button style={btnStyle(!prev)} onClick={() => prev && goTo(user, prev.id, prev.page)}>←</button>
        <button style={btnStyle(!next)} onClick={() => next && goTo(user, next.id, next.page)}>→</button>

      </div>
    </div>
  )
}

export default function ConceptPage() {
  const { user, conceptId, page } = useParams()
  const [searchParams] = useSearchParams()
  const release = searchParams.get('release') || 'r2'
  const bgUrl = PAGE_URLS[page]
  const ConceptOverlay = getConceptComponent(release, user, conceptId)

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ConceptNav release={release} user={user} conceptId={conceptId} />
      <iframe
        src={bgUrl}
        title="Background page"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {ConceptOverlay ? (
          <Suspense fallback={null}>
            <ConceptOverlay page={page} />
          </Suspense>
        ) : (
          <div
            style={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.8)',
              color: '#666',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 14,
              pointerEvents: 'auto',
            }}
          >
            No component yet — create src/concepts/{user}/concept-{conceptId}.jsx
          </div>
        )}
      </div>
    </div>
  )
}
