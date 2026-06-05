import { motion, useAnimate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// ─── Easing library ──────────────────────────────────────────────────────────
const EXPO_OUT = [0.16, 1, 0.3, 1]
const SOFT_OUT = [0.22, 1, 0.36, 1]
const CIRC_OUT = [0, 0.55, 0.45, 1]

// ─── Layout constants ─────────────────────────────────────────────────────────
const FAB_W      = 314
const FAB_H      = 68
const AVATAR_W   = 48
const AVATAR_GAP = 12

const RISE_Y = 120

export default function Concept6({ page }) {
  return (
    <div style={styles.overlay}>
      <TriggerFAB />
    </div>
  )
}

function TriggerFAB() {
  const [scope, animate]          = useAnimate()
  const avatarWrapperRef          = useRef(null)
  const avatarRef                 = useRef(null)
  const dismissRef                = useRef(null)
  const [ready, setReady]         = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const run = async () => {
      await new Promise(r => setTimeout(r, 1200))

      // ── ACT 1: RISE FIRST, THEN CLIP EXPANDS ─────────────────────────────
      // y rises immediately so the pill enters view small.
      // clipPath is delayed so it only starts opening once the pill is already
      // partway up — you see it small at the bottom, then it snaps open on arrival.
      await animate(scope.current,
        { opacity: 1, y: 0, clipPath: 'inset(0% 0% round 34px)' },
        {
          opacity:   { duration: 0.2, ease: 'linear' },
          y:         { duration: 0.6, ease: EXPO_OUT },
          clipPath:  { duration: 0.38, ease: EXPO_OUT, delay: 0.28 },
        }
      )

      // ── ACT 2: EXPAND + AVATAR SLOT OPENS ────────────────────────────────
      animate(scope.current,
        { width: FAB_W },
        { duration: 0.55, ease: EXPO_OUT }
      )
      animate(avatarWrapperRef.current,
        { width: AVATAR_W, marginRight: AVATAR_GAP },
        { duration: 0.55, ease: EXPO_OUT }
      )

      // ── ACT 3: AVATAR SCALES IN — overlaps with expansion ─────────────────
      await new Promise(r => setTimeout(r, 150))
      await animate(avatarRef.current,
        { scale: 1, opacity: 1 },
        { type: 'spring', stiffness: 320, damping: 22 }
      )

      // ── ACT 4: DISMISS — quiet fade, doesn't compete for attention ──────────
      await animate(dismissRef.current,
        { opacity: 1 },
        { duration: 0.4, ease: 'linear' }
      )

      setReady(true)
    }
    run()
  }, [])

  // ── HOVER ─────────────────────────────────────────────────────────────────
  const handleHoverStart = () => {
    if (!ready) return
    animate(scope.current, { y: -3 }, { duration: 0.25, ease: CIRC_OUT })
    animate(avatarRef.current, { scale: 1.1 }, { duration: 0.28, ease: SOFT_OUT })
  }
  const handleHoverEnd = () => {
    animate(scope.current, { y: 0 }, { type: 'spring', stiffness: 320, damping: 22 })
    animate(avatarRef.current, { scale: 1 }, { duration: 0.3, ease: SOFT_OUT })
  }

  // ── DISMISS ───────────────────────────────────────────────────────────────
  const handleDismiss = async (e) => {
    e.stopPropagation()
    setReady(false)
    animate(dismissRef.current,
      { opacity: 0, scale: 0 },
      { duration: 0.15, ease: [0.4, 0, 1, 1] }
    )
    await animate(scope.current,
      { opacity: 0, y: RISE_Y },
      { duration: 0.3, ease: [0.4, 0, 1, 1] }
    )
    setDismissed(true)
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
          y: RISE_Y,
          clipPath: 'inset(50% 50% round 34px)',
        }}
      >
        {/* Avatar wrapper — grows from 0 to open the slot, no overflow clip
            so the avatar's own border-radius shows a clean circle on scale-in */}
        <motion.div
          ref={avatarWrapperRef}
          style={styles.avatarWrapper}
        >
          <motion.div
            ref={avatarRef}
            style={styles.avatar}
            initial={{ scale: 0, opacity: 0 }}
          >
            <img src={`${import.meta.env.BASE_URL}avatar.png`} alt="avatar" style={styles.avatarImg} />
          </motion.div>
        </motion.div>

        {/* Text — always visible, rides right as avatar slot opens */}
        <span style={styles.label}>
          Do the new arrivals interest you?
        </span>
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
    height: FAB_H,
    padding: 10,
    borderRadius: 34,
    background: '#000',
    overflow: 'hidden',
    cursor: 'pointer',
    willChange: 'width, transform',
  },

  // No overflow:hidden here — avatar's own border-radius handles the circle clip
  // so scale-in looks clean without a rectangular mask showing
  avatarWrapper: {
    width: 0,
    marginRight: 0,
    height: AVATAR_W,
    flexShrink: 0,
  },

  // overflow:hidden + border-radius here creates the circle — not on the wrapper
  avatar: {
    width: AVATAR_W,
    height: AVATAR_W,
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    transformOrigin: 'center',
    flexShrink: 0,
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
    flexShrink: 0,
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
