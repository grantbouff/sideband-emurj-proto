import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import Index from './pages/Index'
import ConceptPage from './pages/ConceptPage'
import DemoIndex from './sideband-emurj-demo/DemoIndex'
import DemoPage from './sideband-emurj-demo/DemoPage'
import './index.css'

export const CONCEPTS = {
  grant: [
    { id: 1, label: 'Concept 1', home: false, productDetail: true },
    { id: 2, label: 'Concept 2', home: true,  productDetail: false },
    { id: 3, label: 'Concept 3', home: true,  productDetail: false },
    { id: 4, label: 'Concept 4', home: true,  productDetail: false },
    { id: 5, label: 'Concept 5', home: false, productDetail: true  },
    { id: 6, label: 'Concept 6', home: true,  productDetail: true  },
    { id: 7, label: 'Concept 7', home: true,  productDetail: false },
  ],
  nick: [
    { id: 1, label: 'Concept 1', home: false, productDetail: true },
    { id: 2, label: 'Concept 2', home: false, productDetail: true },
    { id: 3, label: 'Concept 3', home: false, productDetail: true },
    { id: 4, label: 'Concept 4', home: false, productDetail: true },
    { id: 5, label: 'Concept 5', home: false, productDetail: true },
    { id: 6, label: 'Concept 6', home: false, productDetail: true },
  ],
}

function LegacyDemoRedirect() {
  const { configId } = useParams()
  return <Navigate to={`/web-demo/${configId}`} replace />
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Web demo is the landing page */}
        <Route path="/" element={<DemoIndex />} />
        <Route path="/web-demo" element={<Navigate to="/" replace />} />
        <Route path="/web-demo/:configId" element={<DemoPage />} />

        <Route path="/fab-prototypes" element={<Index />} />
        <Route path="/concept/:user/:conceptId/:page" element={<ConceptPage />} />

        {/* Legacy paths */}
        <Route path="/demo" element={<Navigate to="/" replace />} />
        <Route path="/demo/:configId" element={<LegacyDemoRedirect />} />
        <Route path="/sideband-emurj-demo" element={<Navigate to="/" replace />} />
        <Route path="/sideband-emurj-demo/:configId" element={<LegacyDemoRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
