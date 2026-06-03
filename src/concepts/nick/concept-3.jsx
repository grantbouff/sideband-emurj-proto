import { motion, useAnimate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const EXPO_IN_OUT = [0.87, 0, 0.13, 1]
const EXPO_OUT   = [0.16, 1, 0.3, 1]
const SOFT_OUT   = [0.22, 1, 0.36, 1]

const LINE_H     = 20
const FAB_H      = 68
const FAB_CLOSED = 68
const FAB_OPEN   = 314

// X is at x:296, y:1 within the 314×68 FAB (from Figma)
// right edge = 296 + 20 = 316 → 2px past FAB right edge
const DISMISS_TOP  = 1
const DISMISS_LEFT = 296

export default function Concept3({ page }) {
  return (
    <div style={styles.overlay}>
      <TriggerFAB />
    </div>
  )
}

function TriggerFAB() {
  const [scope, animate]          = useAnimate()
  const dismissRef                = useRef(null)
  const [hovered, setHovered]     = useState(false)
  const [ready, setReady]         = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const run = async () => {
      await new Promise(r => setTimeout(r, 2000))

      // Phase 1: circle scales up from 0
      await animate(scope.current,
        { opacity: 1, scale: 1 },
        { duration: 0.8, ease: EXPO_IN_OUT }
      )

      // Phase 2: pill expands width
      animate(scope.current,
        { width: FAB_OPEN },
        { duration: 0.84, ease: EXPO_OUT }
      )

      // Phase 3: text slides up from below mask
      await animate('#c3-text',
        { y: 0 },
        { duration: 0.55, ease: SOFT_OUT, delay: 0.18 }
      )

      // Phase 4: dismiss button appears after text settles
      await animate(dismissRef.current,
        { opacity: 1, scale: 1 },
        { duration: 0.22, ease: SOFT_OUT }
      )

      setReady(true)
    }
    run()
  }, [])

  const handleDismiss = (e) => {
    e.stopPropagation()
    setDismissed(true)
    setReady(false)
    setHovered(false)
    animate(scope.current,
      { opacity: 0, scale: 0.85 },
      { duration: 0.2, ease: [0.4, 0, 1, 1] }
    )
    animate(dismissRef.current,
      { opacity: 0, scale: 0 },
      { duration: 0.15, ease: [0.4, 0, 1, 1] }
    )
  }

  if (dismissed) return null

  return (
    // Wrapper is position:relative so dismiss button can escape FAB overflow
    <div style={styles.wrapper}>
      <motion.div
        ref={scope}
        onHoverStart={() => ready && setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          ...styles.fab,
          opacity: 0,
          scale: 0,
          width: FAB_CLOSED,
        }}
      >
        {/* Avatar */}
        <motion.div
          style={styles.avatar}
          animate={{ scale: hovered ? 1.15 : 1 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <img src="/avatar.png" alt="avatar" style={styles.avatarImg} />
        </motion.div>

        {/* Text with vertical mask */}
        <div style={styles.mask}>
          <motion.span
            id="c3-text"
            style={{ ...styles.label, y: -LINE_H }}
          >
            Do the new arrivals interest you?
          </motion.span>
        </div>
      </motion.div>

      {/* Dismiss — sits outside FAB overflow, overlapping top-right corner */}
      <motion.button
        ref={dismissRef}
        onClick={handleDismiss}
        onHoverStart={() => animate(dismissRef.current, { scale: 1.1 }, { duration: 0.15 })}
        onHoverEnd={() => animate(dismissRef.current, { scale: 1 }, { duration: 0.15 })}
        style={{
          ...styles.dismiss,
          top: DISMISS_TOP,
          left: DISMISS_LEFT,
          opacity: 0,
          scale: 0,
        }}
        aria-label="Dismiss"
      >
        {/* ic-close: 8×8 vector inside 14×14 frame inside 20×20 circle */}
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <line x1="0.5" y1="0.5" x2="7.5" y2="7.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="7.5" y1="0.5" x2="0.5" y2="7.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </motion.button>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    bottom: 16,
    left: 16,
    pointerEvents: 'auto',
    zIndex: 100,
  },
  // Relative wrapper lets dismiss escape the FAB's overflow:hidden
  wrapper: {
    position: 'relative',
    width: FAB_OPEN,
    height: FAB_H,
  },
  fab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    height: FAB_H,
    borderRadius: 34,
    background: '#000',
    overflow: 'hidden',
    cursor: 'pointer',
    flexShrink: 0,
    willChange: 'width, transform',
    transformOrigin: 'bottom left',
  },
  avatar: {
    flexShrink: 0,
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  mask: {
    overflow: 'hidden',
    height: LINE_H,
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    display: 'block',
    color: '#FAFAFA',
    fontSize: 14,
    lineHeight: `${LINE_H}px`,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    whiteSpace: 'nowrap',
  },
  dismiss: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#fff',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    transformOrigin: 'center',
    pointerEvents: 'auto',
  },
}
