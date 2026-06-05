import { motion, useAnimate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// ─── Easing library ──────────────────────────────────────────────────────────
const EXPO_OUT  = [0.16, 1, 0.3, 1]
const SHARP_OUT = [0.76, 0, 0.24, 1]
const CIRC_OUT  = [0, 0.55, 0.45, 1]

// ─── Layout constants ─────────────────────────────────────────────────────────
const FAB_W        = 314
const FAB_H        = 68
const DROP_Y       = -40   // drops in from above
const MAG_RADIUS   = 160   // px — cursor detection radius for magnetic pull
const MAG_STRENGTH = 0.05  // how far the pill moves (fraction of distance)
const MAG_MAX      = 7     // max px of travel in any direction

export default function Concept5({ page }) {
  return (
    <div style={styles.overlay}>
      <TriggerFAB />
    </div>
  )
}

function TriggerFAB() {
  const [scope, animate]          = useAnimate()
  const wrapperRef                = useRef(null)
  const avatarRef                 = useRef(null)
  const shimmerRef                = useRef(null)
  const textRef                   = useRef(null)
  const dismissRef                = useRef(null)
  const readyRef                  = useRef(false)   // avoids stale closure in mousemove
  const attractedRef              = useRef(false)
  const [ready, setReady]         = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const run = async () => {
      await new Promise(r => setTimeout(r, 1200))

      // ── ACT 1: SNAP DROP ──────────────────────────────────────────────────
      // Fire spring without awaiting — wipe starts as soon as it lands
      animate(scope.current,
        { opacity: 1, y: 0 },
        {
          opacity: { duration: 0.12, ease: 'linear' },
          y: { type: 'spring', stiffness: 520, damping: 14, mass: 0.75 },
        }
      )

      // Wait just for the pill to visibly arrive, don't wait for full spring settle
      await new Promise(r => setTimeout(r, 200))

      // ── ACT 2: AVATAR WIPE ────────────────────────────────────────────────
      await animate(avatarRef.current,
        { clipPath: 'circle(50% at 50% 50%)' },
        { duration: 0.42, ease: EXPO_OUT }
      )

      // ── ACT 3: SHIMMER + UNFURL — immediately when wipe finishes, no gap ──
      animate(shimmerRef.current,
        { x: FAB_W + 80 },
        { duration: 0.48, ease: SHARP_OUT }
      )
      animate(scope.current,
        { width: FAB_W },
        { duration: 0.52, ease: SHARP_OUT }
      )

      // ── ACT 4: TEXT RISE ──────────────────────────────────────────────────
      await animate(textRef.current,
        { opacity: 1, y: 0 },
        { duration: 0.38, ease: EXPO_OUT, delay: 0.14 }
      )

      // ── ACT 5: DISMISS SCALES IN ──────────────────────────────────────────
      await animate(dismissRef.current,
        { opacity: 1, scale: 1 },
        { duration: 0.22, ease: CIRC_OUT }
      )

      readyRef.current = true
      setReady(true)
    }
    run()
  }, [])

  // ── MAGNETIC PULL ─────────────────────────────────────────────────────────
  // When cursor enters the radius the whole pill drifts toward it
  useEffect(() => {
    if (!ready) return

    const handleMouseMove = (e) => {
      if (!readyRef.current) return

      const rect = scope.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < MAG_RADIUS) {
        attractedRef.current = true
        const pull = Math.min(dist * MAG_STRENGTH, MAG_MAX)
        const nx = (dx / dist) * pull
        const ny = (dy / dist) * pull
        animate(wrapperRef.current,
          { x: nx, y: ny },
          { duration: 0.35, ease: [0.0, 0.0, 0.2, 1] }
        )
      } else if (attractedRef.current) {
        attractedRef.current = false
        animate(wrapperRef.current,
          { x: 0, y: 0 },
          { type: 'spring', stiffness: 200, damping: 22 }
        )
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [ready])

  // ── DISMISS ───────────────────────────────────────────────────────────────
  const handleDismiss = async (e) => {
    e.stopPropagation()
    readyRef.current = false
    setReady(false)
    animate(dismissRef.current,
      { opacity: 0 },
      { duration: 0.15, ease: [0.4, 0, 1, 1] }
    )
    await animate(scope.current,
      { opacity: 0 },
      { duration: 0.25, ease: [0.4, 0, 1, 1] }
    )
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <motion.div ref={wrapperRef} style={styles.wrapper}>
      <motion.div
        ref={scope}
        style={{
          ...styles.fab,
          opacity: 0,
          y: DROP_Y,
          width: FAB_H,
        }}
      >
        {/* Shimmer — diagonal light sweep across the pill */}
        <motion.div
          ref={shimmerRef}
          style={styles.shimmer}
          initial={{ x: -80, skewX: -12 }}
        />

        {/* Avatar — iris wipe reveal */}
        <motion.div
          ref={avatarRef}
          style={styles.avatar}
          initial={{ clipPath: 'circle(0% at 50% 50%)' }}
        >
          <img src={`${import.meta.env.BASE_URL}avatar.png`} alt="avatar" style={styles.avatarImg} />
        </motion.div>

        {/* Text — rises up into place */}
        <motion.span
          ref={textRef}
          style={{ ...styles.label, opacity: 0, y: 8 }}
        >
          Do the new arrivals interest you?
        </motion.span>
      </motion.div>

      {/* Dismiss X */}
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
    </motion.div>
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
    willChange: 'width, transform',
    transformOrigin: 'bottom left',
  },

  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)',
    pointerEvents: 'none',
    zIndex: 10,
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
    zIndex: 1,
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
    willChange: 'opacity, transform',
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
