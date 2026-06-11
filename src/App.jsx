import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import ConceptPage from './pages/ConceptPage'
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
