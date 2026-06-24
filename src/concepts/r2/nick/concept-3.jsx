import { motion, useAnimate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const EXPO_IN_OUT = [0.87, 0, 0.13, 1]
const EXPO_OUT   = [0.16, 1, 0.3, 1]
const SNAPPY_OUT = [0.25, 1, 0.5, 1]
const CIRC_OUT   = [0, 0.55, 0.45, 1]

const CIRCLE_SIZE  = 68
const PILL_WIDTH   = 314
const PADDING      = 10
const AVATAR_SIZE  = 48
const AVATAR_TRAVEL = (PILL_WIDTH - PADDING - AVATAR_SIZE) - PADDING // 246px
const TIMER_DURATION = 6 // seconds

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
  const timerRef                  = useRef(null)
  const [ready, setReady]         = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const triggerDismiss = async () => {
    setReady(false)
    animate(dismissRef.current, { opacity: 0, y: 24 }, { duration: 0.28, ease: [0.4, 0, 1, 1] })
    animate('#fab-container', { opacity: 0, y: 24 }, { duration: 0.32, ease: [0.4, 0, 1, 1] })
    await new Promise(r => setTimeout(r, 320))
    setDismissed(true)
  }

  useEffect(() => {
    const run = async () => {
      await new Promise(r => setTimeout(r, 2000))

      // Phase 1: container scales in
      animate('#fab-container', { opacity: 1, scale: 1 }, {
        opacity: { duration: 0.4, ease: EXPO_IN_OUT },
        scale:   { type: 'spring', stiffness: 300, damping: 24 },
      })

      // Phase 2: avatar scales in 200ms later
      await animate('#fab-avatar', { scale: 1 }, {
        type: 'spring', stiffness: 320, damping: 22, delay: 0.2,
      })

      // Phase 3: container expands + avatar rolls right + text slides in
      animate('#fab-container', { width: PILL_WIDTH }, {
        duration: 0.84, ease: EXPO_OUT,
      })
      animate('#fab-avatar', { x: AVATAR_TRAVEL }, {
        duration: 0.84, ease: EXPO_OUT,
      })
      await animate('#fab-label', { opacity: 1, x: 0 }, {
        duration: 0.48, ease: SNAPPY_OUT, delay: 0.1,
      })

      // Phase 4: dismiss button + timer bar fade in together
      animate(timerRef.current, { opacity: 1 }, { duration: 0.3, ease: 'linear' })
      await animate(dismissRef.current,
        { opacity: 1, scale: 1 },
        { duration: 0.22, ease: CIRC_OUT }
      )

      setReady(true)

      // Phase 5: timer bar shrinks from full width to 0 over TIMER_DURATION seconds
      await animate(timerRef.current,
        { width: '0%' },
        { duration: TIMER_DURATION, ease: 'linear' }
      )

      triggerDismiss()
    }
    run()
  }, [])

  // Scroll dismiss
  useEffect(() => {
    if (!ready) return

    const iframe = document.querySelector('iframe')
    const win = iframe?.contentWindow
    if (!win) return

    win.addEventListener('scroll', triggerDismiss, { once: true, passive: true })
    return () => win.removeEventListener('scroll', triggerDismiss)
  }, [ready])

  const handleHoverStart = () => {
    if (!ready) return
    animate('#fab-container', { y: -4 }, { duration: 0.25, ease: CIRC_OUT })
    animate('#fab-avatar', { scale: 1.1 }, { duration: 0.28, ease: SNAPPY_OUT })
  }

  const handleHoverEnd = () => {
    animate('#fab-container', { y: 0 }, { type: 'spring', stiffness: 320, damping: 22 })
    animate('#fab-avatar', { scale: 1 }, { duration: 0.3, ease: SNAPPY_OUT })
  }

  const handleDismiss = async (e) => {
    e.stopPropagation()
    triggerDismiss()
  }

  if (dismissed) return null

  return (
    <div ref={scope} style={{ position: 'relative' }}>
      <motion.div id="fab-container" style={styles.fab} initial={{ opacity: 0, scale: 0 }} onHoverStart={handleHoverStart} onHoverEnd={handleHoverEnd}>

        {/* Timer bar — top edge, shrinks left to right */}
        <div
          ref={timerRef}
          style={styles.timer}
        />

        {/* Text — left side, in normal flow */}
        <motion.span
          id="fab-label"
          style={styles.label}
          initial={{ opacity: 0, x: -10 }}
        >
          Do the new arrivals interest you?
        </motion.span>

        {/* Avatar — absolutely positioned, rolls right during expansion */}
        <motion.div
          id="fab-avatar"
          style={styles.avatar}
          initial={{ scale: 0 }}
        >
          <img src={`${import.meta.env.BASE_URL}avatar.png`} alt="avatar" style={styles.avatarImg} />
        </motion.div>

      </motion.div>

      {/* X button — overlaps top-left corner of expanded pill */}
      <motion.button
        ref={dismissRef}
        onClick={handleDismiss}
        onHoverStart={() => animate(dismissRef.current, { scale: 1.1 }, { duration: 0.15 })}
        onHoverEnd={() => animate(dismissRef.current, { scale: 1 }, { duration: 0.15 })}
        style={{
          ...styles.dismiss,
          top: 1,
          left: -4,
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
  fab: {
    position: 'relative',
    height: CIRCLE_SIZE,
    width: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    background: '#000',
    cursor: 'pointer',
    overflow: 'hidden',
    transformOrigin: 'center',
    willChange: 'width, transform',
    transform: 'translateZ(0)',
    display: 'flex',
    alignItems: 'center',
    padding: PADDING,
    boxSizing: 'border-box',
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
  avatar: {
    position: 'absolute',
    left: PADDING,
    top: PADDING,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: '50%',
    background: '#fff',
    overflow: 'hidden',
    transformOrigin: 'center',
    willChange: 'transform',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  label: {
    width: PILL_WIDTH - PADDING - (AVATAR_SIZE + PADDING),
    color: '#FAFAFA',
    fontSize: 14,
    lineHeight: 1.3,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    whiteSpace: 'nowrap',
    textAlign: 'center',
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
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
}
