const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function DefaultSheet({
  heading = 'Modal Heading',
  body = 'Some text that can be added here... Sed posuere consectetur est.',
  chips = ['Fast', 'Faster', 'Fasterer', 'Fasterest'],
  progress = 0.4,
  onClose,
  onNext,
}) {
  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.sheet} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress * 100}%` }} />
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={styles.content}>
          <div style={styles.textContent}>
            <p style={styles.heading}>{heading}</p>
            <p style={styles.body}>{body}</p>
          </div>
          <div style={styles.chipGrid}>
            {chips.map((label) => (
              <button key={label} style={styles.chip}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.nextButton} onClick={onNext}>
            <ArrowIcon />
          </button>
        </div>

      </div>
    </div>
  )
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 100,
    pointerEvents: 'auto',
    padding: '0 0 24px',
  },
  sheet: {
    background: '#141414',
    borderRadius: 32,
    width: '100%',
    maxWidth: 420,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  header: {
    height: 50,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  progressTrack: {
    position: 'absolute',
    left: 80,
    right: 80,
    top: 27,
    height: 6,
    background: '#333',
    borderRadius: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#fff',
    borderRadius: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 16,
    width: 40,
    height: 40,
    border: 'none',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    pointerEvents: 'auto',
  },
  content: {
    maxHeight: 400,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  textContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '16px 8px 24px',
    textAlign: 'center',
  },
  heading: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
    lineHeight: 1.4,
    width: 330,
  },
  body: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 400,
    color: '#999',
    lineHeight: 1.3,
    maxWidth: 280,
  },
  chipGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    padding: '0 8px 16px',
    maxWidth: 512,
    width: '100%',
  },
  chip: {
    width: 160,
    padding: '16px 8px',
    background: '#1c1c1c',
    border: '1px solid #333',
    borderRadius: 80,
    color: '#fff',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.2,
    cursor: 'pointer',
    textAlign: 'center',
    pointerEvents: 'auto',
  },
  footer: {
    borderTop: '1px solid #2a2a2a',
    padding: '18px 20px',
    display: 'flex',
    justifyContent: 'flex-end',
    background: '#141414',
  },
  nextButton: {
    width: 48,
    height: 48,
    background: '#fff',
    border: 'none',
    borderRadius: 80,
    color: '#000',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
  },
}
