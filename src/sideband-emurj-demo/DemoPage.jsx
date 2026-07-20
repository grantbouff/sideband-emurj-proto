import { useParams, Link } from 'react-router-dom'
import FlowRunner from './FlowRunner'
import { CONFIG_BY_ID } from './configs'
import './theme/index.css'

const BASE = import.meta.env.BASE_URL
const PAGE_URLS = {
  home: `${BASE}pages/home.html`,
  'product-detail': `${BASE}pages/product-detail.html`,
}

/* DemoPage — iframe background (reusing the real Emurj pages) + a FlowRunner
 * overlay, mirroring src/pages/ConceptPage.jsx. The overlay layer is
 * pointerEvents:none; interactive kit children opt back in themselves.
 */
export default function DemoPage() {
  const { configId } = useParams()
  const config = CONFIG_BY_ID[configId]

  if (!config) {
    return (
      <div style={{ padding: 40, color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
        <p>Unknown prototype: <code>{configId}</code></p>
        <Link to="/demo" style={{ color: '#4A7FEA' }}>← Back to prototypes</Link>
      </div>
    )
  }

  const bgUrl = PAGE_URLS[config.page] || PAGE_URLS['product-detail']

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src={bgUrl}
        title="Background page"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
      />
      <div
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 10,
        }}
      >
        <FlowRunner key={config.id} config={config} />
      </div>
    </div>
  )
}
