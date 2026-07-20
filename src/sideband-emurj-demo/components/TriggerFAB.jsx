import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { EmurjAvatar, CloseIcon } from './icons'

const EASE_ENTER = [0.16, 1, 0.3, 1]

/* TriggerFAB — the pill entry point. Geometry from Figma "Trigger FAB":
 * height 60, pad-left 14 / right 28, gap 12, radius 1000, 32px avatar,
 * label Inter SemiBold 14/100%. Colour via c-fab-* tokens.
 *
 * timer:
 *   'none'       — static pill; dismiss via the X badge.
 *   'background'  — ghosted fill sweeps left→right, then auto-dismiss.
 *   'hairline'    — 2px brand hairline drains along the bottom, then auto-dismiss.
 *
 * layoutId="fab-surface" morphs the pill into the Sheet on open.
 */
export default function TriggerFAB({
  ctaValue,
  timer = 'none',
  dismissTimer = 8,
  startDelay = 400,
  onOpen,
  onDismiss,
}) {
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), startDelay)
    return () => clearTimeout(t)
  }, [startDelay])

  // Auto-dismiss for the timed variants.
  useEffect(() => {
    if (timer === 'none' || !entered) return
    const t = setTimeout(() => onDismiss?.(), dismissTimer * 1000)
    return () => clearTimeout(t)
  }, [timer, entered, dismissTimer, onDismiss])

  return (
    <div style={{ position: 'fixed', bottom: 32, left: 20, zIndex: 50, pointerEvents: 'auto' }}>
      <motion.button
        layoutId="fab-surface"
        onClick={onOpen}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 16 }}
        transition={{ duration: 0.45, ease: EASE_ENTER }}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: 12,
          height: 60, paddingLeft: 14, paddingRight: 28,
          borderRadius: 1000,
          background: 'var(--c-fab-surface)',
          border: '1px solid var(--c-fab-border)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.16)',
          cursor: 'pointer', overflow: 'hidden',
        }}
      >
        {timer === 'background' && entered && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: dismissTimer, ease: 'linear' }}
            style={{
              position: 'absolute', inset: 0, transformOrigin: 'left',
              background: 'var(--c-fab-ghosted-fill)', pointerEvents: 'none',
            }}
          />
        )}

        <EmurjAvatar size={32} />
        <span
          className="sb-button-label"
          style={{ color: 'var(--c-fab-text)', whiteSpace: 'nowrap', position: 'relative' }}
        >
          {ctaValue}
        </span>

        {timer === 'hairline' && entered && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: dismissTimer, ease: 'linear' }}
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: 2,
              transformOrigin: 'left',
              background: 'var(--c-fab-hairline-timer-fill)', pointerEvents: 'none',
            }}
          />
        )}
      </motion.button>

      {/* X dismiss badge — the untimed variant's only way out. */}
      {timer === 'none' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: entered ? 1 : 0, scale: entered ? 1 : 0.6 }}
          transition={{ duration: 0.2, delay: 0.25 }}
          onClick={(e) => { e.stopPropagation(); onDismiss?.() }}
          style={{
            position: 'absolute', top: -8, right: -8,
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--c-button-surface-primary)',
            border: '1.5px solid var(--surface-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', pointerEvents: 'auto', padding: 0,
          }}
        >
          <CloseIcon size={12} color="var(--c-button-text-primary)" />
        </motion.button>
      )}
    </div>
  )
}
