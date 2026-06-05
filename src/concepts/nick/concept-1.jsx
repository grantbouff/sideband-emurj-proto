import { motion, useAnimate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const SNAPPY_OUT  = [0.25, 1, 0.5, 1]
const EXPO_IN_OUT = [0.87, 0, 0.13, 1]
const EXPO_OUT    = [0.16, 1, 0.3, 1]
const CIRC_OUT    = [0, 0.55, 0.45, 1]
const EASE_OUT    = [0.25, 1, 0.5, 1]

// Equal pixel expansion on all sides (5px per side)
const FAB_W = 314, FAB_H = 68, PX = 5
const HOVER_SX = (FAB_W + PX * 2) / FAB_W
const HOVER_SY = (FAB_H + PX * 2) / FAB_H
const CTR_SX   = 1 / HOVER_SX
const CTR_SY   = 1 / HOVER_SY

const X_EXPANDED = 296  // left in expanded state (from Figma)
const X_CIRCLE   = 50   // left in collapsed state — overlaps right edge of 68px circle
const X_TOP      = 1

export default function Concept1({ page }) {
  return (
    <div style={styles.overlay}>
      <TriggerFAB />
    </div>
  )
}

function TriggerFAB() {
  const [scope, animate]          = useAnimate()
  const dismissRef                = useRef(null)
  const [ready, setReady]         = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const run = async () => {
      await new Promise(r => setTimeout(r, 2000))

      // Phase 1: circle scales up from bottom-left
      await animate(scope.current,
        { opacity: 1, scale: 1 },
        { duration: 0.8, ease: EXPO_IN_OUT }
      )

      // Phase 2 + 3: expansion and text slide in together
      animate(scope.current,
        { width: FAB_W },
        { duration: 0.84, ease: EXPO_OUT }
      )
      await animate('#c1-label',
        { opacity: 1, x: 0 },
        { duration: 0.48, ease: SNAPPY_OUT, delay: 0.1 }
      )

      // X scales in at expanded position — only after expansion is done
      await animate(dismissRef.current,
        { opacity: 1, scale: 1 },
        { duration: 0.22, ease: CIRC_OUT }
      )

      // Switch transformOrigin to center for hover
      scope.current.style.transformOrigin = 'center'
      setReady(true)
    }
    run()
  }, [])

  // Scroll collapse — listen to the iframe's scroll
  useEffect(() => {
    if (!ready) return

    const iframe = document.querySelector('iframe')
    const win = iframe?.contentWindow
    if (!win) return

    const collapse = async () => {
      setReady(false)

      // X scales out + text slides out + pill contracts — all together
      animate(dismissRef.current,
        { scale: 0, opacity: 0 },
        { duration: 0.2, ease: [0.4, 0, 1, 1] }
      )
      animate('#c1-label',
        { opacity: 0, x: -12 },
        { duration: 0.3, ease: CIRC_OUT }
      )
      await animate(scope.current,
        { width: FAB_H, scaleX: 1, scaleY: 1 },
        { duration: 0.5, ease: CIRC_OUT }
      )

      // Reposition X to circle, then scale back in
      await animate(dismissRef.current,
        { left: X_CIRCLE },
        { duration: 0 }
      )
      await animate(dismissRef.current,
        { scale: 1, opacity: 1 },
        { duration: 0.22, ease: CIRC_OUT }
      )
    }

    win.addEventListener('scroll', collapse, { once: true, passive: true })
    return () => win.removeEventListener('scroll', collapse)
  }, [ready])

  const handleHoverStart = () => {
    if (!ready) return
    animate(scope.current,
      { scaleX: HOVER_SX, scaleY: HOVER_SY },
      { duration: 0.3, ease: CIRC_OUT }
    )
    animate('#c1-content',
      { scaleX: CTR_SX, scaleY: CTR_SY },
      { duration: 0.3, ease: CIRC_OUT }
    )
  }

  const handleHoverEnd = () => {
    animate(scope.current,
      { scaleX: 1, scaleY: 1 },
      { duration: 0.22, ease: EASE_OUT }
    )
    animate('#c1-content',
      { scaleX: 1, scaleY: 1 },
      { duration: 0.22, ease: EASE_OUT }
    )
  }

  const handleDismiss = (e) => {
    e.stopPropagation()
    setDismissed(true)
    setReady(false)
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
    <div style={styles.wrapper}>
      <motion.div
        ref={scope}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        style={{
          ...styles.fab,
          opacity: 0,
          scale: 0,
          width: FAB_H,
        }}
      >
        <motion.div id="c1-content" style={styles.content}>
          <div style={styles.avatar}>
            <img src={`${import.meta.env.BASE_URL}avatar.png`} alt="avatar" style={styles.avatarImg} />
          </div>
          <motion.span
            id="c1-label"
            style={{ ...styles.label, opacity: 0, x: -12 }}
          >
            Do the new arrivals interest you?
          </motion.span>
        </motion.div>
      </motion.div>

      {/* X button — base at circle position, slides right on expansion */}
      <motion.button
        ref={dismissRef}
        onClick={handleDismiss}
        onHoverStart={() => animate(dismissRef.current, { scale: 1.1 }, { duration: 0.15 })}
        onHoverEnd={() => animate(dismissRef.current, { scale: 1 }, { duration: 0.15 })}
        style={{
          ...styles.dismiss,
          top: X_TOP,
          left: X_EXPANDED,
          opacity: 0,
          scale: 0,
        }}
        aria-label="Dismiss"
      >
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
  wrapper: {
    position: 'relative',
    width: FAB_W + 22,  // enough room for X overhang
    height: FAB_H,
  },
  fab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
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
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    transformOrigin: 'center',
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
  label: {
    color: '#FAFAFA',
    fontSize: 14,
    lineHeight: 1.3,
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
