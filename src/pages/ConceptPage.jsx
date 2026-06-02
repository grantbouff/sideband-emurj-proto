import { useParams } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const PAGE_URLS = {
  home: '/pages/home.html',
  'product-detail': '/pages/product-detail.html',
}

const conceptModules = import.meta.glob('../concepts/*/concept-*.jsx')

function getConceptComponent(user, conceptId) {
  const key = `../concepts/${user}/concept-${conceptId}.jsx`
  if (conceptModules[key]) {
    return lazy(conceptModules[key])
  }
  return null
}

export default function ConceptPage() {
  const { user, conceptId, page } = useParams()
  const bgUrl = PAGE_URLS[page]
  const ConceptOverlay = getConceptComponent(user, conceptId)

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
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
