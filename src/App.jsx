import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import ConceptPage from './pages/ConceptPage'
import './index.css'

export const CONCEPTS = {
  grant: [
    { id: 1, label: 'Concept 1', home: false, productDetail: true },
    { id: 2, label: 'Concept 2', home: true,  productDetail: false },
  ],
  nick: [
    { id: 1, label: 'Concept 1', home: false, productDetail: false },
  ],
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/concept/:user/:conceptId/:page" element={<ConceptPage />} />
      </Routes>
    </BrowserRouter>
  )
}
