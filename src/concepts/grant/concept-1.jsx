import { useState } from 'react'
import DefaultSheet from '../../components/DefaultSheet'

export default function Concept1({ page }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button style={styles.fab} onClick={() => setOpen(true)}>
        Open Sheet
      </button>
      {open && (
        <DefaultSheet
          onClose={() => setOpen(false)}
          onNext={() => setOpen(false)}
        />
      )}
    </>
  )
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: 80,
    padding: '14px 28px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    pointerEvents: 'auto',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  },
}
