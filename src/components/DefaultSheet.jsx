import { THEMES } from '../themes'

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
  theme = 'dark',
  onClose,
  onNext,
}) {
  const t = THEMES[theme] ?? THEMES.dark

  return (
    <div style={{ ...styles.backdrop, background: t.backdrop }} onClick={onClose}>
      <div style={{ ...styles.sheet, background: t.sheetBg }} onClick={e => e.stopPropagation()}>

        <div style={styles.header}>
          <div style={{ ...styles.progressTrack, background: t.progressTrack }}>
            <div style={{ ...styles.progressFill, width: `${progress * 100}%`, background: t.progressFill }} />
          </div>
          <button style={{ ...styles.closeButton, color: t.closeColor }} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.textContent}>
            <p style={{ ...styles.heading, color: t.heading }}>{heading}</p>
            <p style={{ ...styles.body, color: t.body }}>{body}</p>
          </div>
          <div style={styles.chipGrid}>
            {chips.map((label) => (
              <button
                key={label}
                style={{
                  ...styles.chip,
                  background: t.chipBg,
                  border: `1px solid ${t.chipBorder}`,
                  color: t.chipText,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ ...styles.footer, borderTop: `1px solid ${t.footerBorder}`, background: t.sheetBg }}>
          <button
            style={{
              ...styles.nextButton,
              background: t.nextBg,
              color: t.nextIcon,
            }}
            onClick={onNext}
          >
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
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    zIndex: 100,
    pointerEvents: 'auto',
    padding: '0 0 24px 20px',
  },
  sheet: {
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
    borderRadius: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
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
    lineHeight: 1.4,
    width: 330,
    margin: 0,
  },
  body: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.3,
    maxWidth: 280,
    margin: 0,
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
    borderRadius: 80,
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.2,
    cursor: 'pointer',
    textAlign: 'center',
    pointerEvents: 'auto',
  },
  footer: {
    padding: '18px 20px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  nextButton: {
    width: 48,
    height: 48,
    border: 'none',
    borderRadius: 80,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
  },
}
