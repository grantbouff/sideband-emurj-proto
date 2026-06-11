import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { THEMES } from '../themes'

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.9998 13.4L7.0998 18.3C6.91647 18.4834 6.68314 18.575 6.3998 18.575C6.11647 18.575 5.88314 18.4834 5.6998 18.3C5.51647 18.1167 5.4248 17.8834 5.4248 17.6C5.4248 17.3167 5.51647 17.0834 5.6998 16.9L10.5998 12L5.6998 7.10005C5.51647 6.91672 5.4248 6.68338 5.4248 6.40005C5.4248 6.11672 5.51647 5.88338 5.6998 5.70005C5.88314 5.51672 6.11647 5.42505 6.3998 5.42505C6.68314 5.42505 6.91647 5.51672 7.0998 5.70005L11.9998 10.6L16.8998 5.70005C17.0831 5.51672 17.3165 5.42505 17.5998 5.42505C17.8831 5.42505 18.1165 5.51672 18.2998 5.70005C18.4831 5.88338 18.5748 6.11672 18.5748 6.40005C18.5748 6.68338 18.4831 6.91672 18.2998 7.10005L13.3998 12L18.2998 16.9C18.4831 17.0834 18.5748 17.3167 18.5748 17.6C18.5748 17.8834 18.4831 18.1167 18.2998 18.3C18.1165 18.4834 17.8831 18.575 17.5998 18.575C17.3165 18.575 17.0831 18.4834 16.8998 18.3L11.9998 13.4Z" fill="currentColor" />
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
  enterDelay = 0,
  slideIn = true,
  onClose,
  onNext,
}) {
  const t = THEMES[theme] ?? THEMES.dark

  const [isWide, setIsWide] = useState(() => window.innerWidth > 768)
  useEffect(() => {
    const fn = () => setIsWide(window.innerWidth > 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: enterDelay }}
      style={{ ...styles.backdrop, background: isWide ? 'transparent' : t.backdrop }}
      exit={{ opacity: 0, x: '-6%', transition: { duration: 0.25, ease: [0.7, 0, 1, 1] } }}
      onClick={onClose}
    >
      {/* Sheet — layoutId morphs from the FAB pill surface; slides up when entering without a match */}
      <motion.div
        layoutId="fab-surface"
        initial={slideIn ? { y: 64, opacity: 0 } : { opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ ...styles.sheet, background: t.sheetBg }}
        transition={{ duration: 0.5, delay: enterDelay, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Content slides up after the sheet has settled */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0, 0.55, 0.45, 1], delay: enterDelay + 0.12 }}
        >
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
              {chips.map(label => (
                <button key={label} style={{ ...styles.chip, background: t.chipBg, border: `1px solid ${t.chipBorder}`, color: t.chipText }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...styles.footer, borderTop: `1px solid ${t.chipBorder}`, background: t.sheetBg }}>
            <button style={{ ...styles.nextButton, background: t.nextBg, color: t.nextIcon }} onClick={onNext}>
              <ArrowIcon />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
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
    maxWidth: 376,
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
    left: 80, right: 80, top: 27,
    height: 6, borderRadius: 24, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 24 },
  closeButton: {
    position: 'absolute', top: 10, right: 16,
    width: 40, height: 40,
    border: 'none', background: 'transparent',
    cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 4, pointerEvents: 'auto',
  },
  content: {
    maxHeight: 400, overflowY: 'auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  textContent: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 8,
    padding: '16px 8px 24px', textAlign: 'center',
  },
  heading: {
    fontFamily: 'Inter, sans-serif', fontSize: 18,
    fontWeight: 600, lineHeight: 1.4, width: 330, margin: 0,
  },
  body: {
    fontFamily: 'Inter, sans-serif', fontSize: 14,
    fontWeight: 400, lineHeight: 1.3, maxWidth: 280, margin: 0,
  },
  chipGrid: {
    display: 'flex', flexWrap: 'wrap', gap: 8,
    justifyContent: 'center', padding: '0 8px 16px',
    maxWidth: 512, width: '100%',
  },
  chip: {
    width: 160, padding: '16px 8px', borderRadius: 80,
    fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700,
    lineHeight: 1.2, cursor: 'pointer', textAlign: 'center', pointerEvents: 'auto',
  },
  footer: {
    padding: '18px 20px', display: 'flex', justifyContent: 'flex-end',
  },
  nextButton: {
    width: 85, height: 44, border: 'none', borderRadius: 80,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', pointerEvents: 'auto',
  },
}
