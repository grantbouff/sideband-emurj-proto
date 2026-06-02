import { motion, useAnimate } from 'framer-motion'
import { useEffect } from 'react'

const CIRC_OUT   = [0, 0.55, 0.45, 1]
const SNAPPY_OUT = [0.25, 1, 0.5, 1]
const EXPO_IN_OUT = [0.87, 0, 0.13, 1]
const EXPO_OUT = [0.16, 1, 0.3, 1]

export default function Concept1({ page }) {
  return (
    <div style={styles.overlay}>
      <TriggerFAB />
    </div>
  )
}

function TriggerFAB() {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    const run = async () => {
      await new Promise(r => setTimeout(r, 2000))
      // Phase 1: circle scales up from 0
      await animate(scope.current,
        { opacity: 1, scale: 1 },
        { duration: 0.8, ease: EXPO_IN_OUT }
      )
      // Phase 2 + 3: expansion and text fire together
      animate(scope.current,
        { width: 314 },
        { duration: 0.84, ease: EXPO_OUT }
      )
      animate('#fab-label',
        { opacity: 1, x: 0 },
        { duration: 0.48, ease: SNAPPY_OUT, delay: 0.1 }
      )
    }
    run()
  }, [])

  return (
    <motion.div
      ref={scope}
      style={{
        ...styles.fab,
        opacity: 0,
        scale: 0,
        width: 68,
      }}
    >
      <div style={styles.avatar}>
        <img src="/avatar.png" alt="avatar" style={styles.avatarImg} />
      </div>

      <motion.span
        id="fab-label"
        style={{ ...styles.label, opacity: 0, x: -12 }}
      >
        Do the new arrivals interest you?
      </motion.span>
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
  fab: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    height: 68,
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
  label: {
    color: '#FAFAFA',
    fontSize: 14,
    lineHeight: 1.3,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    whiteSpace: 'nowrap',
  },
}
