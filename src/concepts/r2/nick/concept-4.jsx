import { motion, useAnimate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// ─── Easing library ──────────────────────────────────────────────────────────
const CIRC_OUT   = [0, 0.55, 0.45, 1]
const EXPO_OUT   = [0.16, 1, 0.3, 1]
const EXPO_INOUT = [0.87, 0, 0.13, 1]
const SOFT_OUT   = [0.22, 1, 0.36, 1]

// ─── Layout constants ─────────────────────────────────────────────────────────
const FAB_W  = 314
const FAB_H  = 68
const RISE_Y = 24   // how far below viewport the circle rises from

export default function Concept4({ page }) {
  return (
    <div style={styles.overlay}>
      <TriggerFAB />
    </div>
  )
}

function TriggerFAB() {
  const [scope, animate]          = useAnimate()
  const avatarRef                 = useRef(null)
  const ringRef                   = useRef(null)
  const textRef                   = useRef(null)
  const dismissRef                = useRef(null)
  const timerRef                  = useRef(null)
  const [ready, setReady]         = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const TIMER_DURATION = 6

  const triggerDismiss = async () => {
    setReady(false)
    animate(dismissRef.current, { opacity: 0, y: RISE_Y }, { duration: 0.28, ease: [0.4, 0, 1, 1] })
    await animate(scope.current, { opacity: 0, y: RISE_Y }, { duration: 0.32, ease: [0.4, 0, 1, 1] })
    setDismissed(true)
  }

  useEffect(() => {
    const run = async () => {
      // Brief pause — let the page settle first
      await new Promise(r => setTimeout(r, 1200))

      // ── ACT 1: RISE ───────────────────────────────────────────────────────
      // Spring from below — genuine physics, one clean overshoot
      await animate(scope.current,
        { opacity: 1, y: 0 },
        {
          type: 'spring',
          stiffness: 280,
          damping: 20,
          mass: 1.1,
          velocity: -2,
        }
      )

      // ── ACT 2: SONAR PING + HEARTBEAT ─────────────────────────────────────
      // Ring radiates outward and dissolves — "I just arrived"
      animate(ringRef.current,
        { scale: 1.9, opacity: 0 },
        { duration: 0.7, ease: EXPO_OUT }
      )

      // Avatar pulses once — a heartbeat
      await animate(avatarRef.current,
        { scale: [1, 1.18, 1] },
        { duration: 0.55, ease: [0.45, 0, 0.55, 1], times: [0, 0.38, 1] }
      )

      // Tiny breath before unfurling
      await new Promise(r => setTimeout(r, 60))

      // ── ACT 3: UNFURL ─────────────────────────────────────────────────────
      // Pill expands — slow start, fast mid, soft land
      animate(scope.current,
        { width: FAB_W },
        { duration: 0.68, ease: [0.76, 0, 0.24, 1] }
      )

      // ── ACT 4: TEXT BLOOM ─────────────────────────────────────────────────
      // Reveals like a camera lens focusing — blur → crisp, not a slide
      await animate(textRef.current,
        { opacity: 1, filter: 'blur(0px)', x: 0 },
        { duration: 0.5, ease: [0.0, 0.0, 0.2, 1], delay: 0.18 }
      )

      // ── ACT 5: DISMISS BUTTON + TIMER ─────────────────────────────────────
      animate(timerRef.current, { opacity: 1 }, { duration: 0.3, ease: 'linear' })
      await animate(dismissRef.current,
        { opacity: 1, scale: 1 },
        { duration: 0.22, ease: CIRC_OUT }
      )

      setReady(true)

      // ── ACT 6: TIMER COUNTS DOWN ───────────────────────────────────────────
      await animate(timerRef.current,
        { width: '0%' },
        { duration: TIMER_DURATION, ease: 'linear' }
      )

      triggerDismiss()
    }
    run()
  }, [])

  const handleDismiss = async (e) => {
    e.stopPropagation()
    triggerDismiss()
  }

  if (dismissed) return null

  // ── HOVER: Lifted card ─────────────────────────────────────────────────────
  const handleHoverStart = () => {
    if (!ready) return
    // Pill floats up — physical, tangible surface
    animate(scope.current,
      { y: -4 },
      { duration: 0.25, ease: CIRC_OUT }
    )
    // Avatar leans in
    animate(avatarRef.current,
      { scale: 1.1 },
      { duration: 0.28, ease: SOFT_OUT }
    )
  }

  const handleHoverEnd = () => {
    // Gentle settle back down — slight spring feel on return
    animate(scope.current,
      { y: 0 },
      { type: 'spring', stiffness: 320, damping: 22 }
    )
    animate(avatarRef.current,
      { scale: 1 },
      { duration: 0.3, ease: SOFT_OUT }
    )
  }

  return (
    <div style={styles.wrapper}>
      {/* Sonar ring — outside FAB so overflow:hidden doesn't clip it */}
      <motion.div
        ref={ringRef}
        style={styles.ring}
        initial={{ scale: 1, opacity: 0.45 }}
      />

      <motion.div
        ref={scope}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        style={{
          ...styles.fab,
          opacity: 0,
          y: RISE_Y,
          width: FAB_H,
        }}
      >
        {/* Timer bar — top edge, fades in after expansion */}
        <div ref={timerRef} style={styles.timer} />

        {/* Avatar */}
        <motion.div ref={avatarRef} style={styles.avatar}>
          <img src={`${import.meta.env.BASE_URL}avatar.png`} alt="avatar" style={styles.avatarImg} />
        </motion.div>

        {/* Text — blooms from blur, never slides */}
        <motion.span
          ref={textRef}
          style={{
            ...styles.label,
            opacity: 0,
            filter: 'blur(8px)',
            x: 6,
          }}
        >
          Do the new arrivals interest you?
        </motion.span>
      </motion.div>

      {/* X button — overlaps top-right corner of expanded pill */}
      <motion.button
        ref={dismissRef}
        onClick={handleDismiss}
        onHoverStart={() => animate(dismissRef.current, { scale: 1.1 }, { duration: 0.15 })}
        onHoverEnd={() => animate(dismissRef.current, { scale: 1 }, { duration: 0.15 })}
        style={{
          ...styles.dismiss,
          top: 1,
          left: 296,
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
  },

  fab: {
    position: 'relative',
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
    willChange: 'width, transform, filter',
    transformOrigin: 'bottom left',
    transform: 'translateZ(0)',
  },

  timer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 4,
    background: '#d8d8d8',
    opacity: 0,
  },

  // Sonar ring — in wrapper (not inside FAB) so overflow:hidden can't clip it
  // Avatar is at left:10, centered vertically in 68px FAB → bottom:10 aligns ring with avatar
  ring: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '1.5px solid rgba(255,255,255,0.5)',
    pointerEvents: 'none',
    transformOrigin: 'center center',
    zIndex: 200,
  },

  avatar: {
    position: 'relative',
    flexShrink: 0,
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 1,
  },

  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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

  label: {
    color: '#FAFAFA',
    fontSize: 14,
    lineHeight: 1.3,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    whiteSpace: 'nowrap',
    willChange: 'filter, opacity, transform',
  },
}
