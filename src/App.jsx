import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import ConceptPage from './pages/ConceptPage'
import './index.css'

const CONCEPTS = [
  { id: 1, label: 'Concept 1', home: false, productDetail: true },
  { id: 2, label: 'Concept 2', home: false, productDetail: false },
  { id: 3, label: 'Concept 3', home: false, productDetail: false },
]

export { CONCEPTS }

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/concept/:conceptId/:page" element={<ConceptPage />} />
      </Routes>
    </BrowserRouter>
  )
}
