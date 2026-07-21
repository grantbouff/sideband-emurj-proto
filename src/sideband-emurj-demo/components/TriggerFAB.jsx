import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { EmurjAvatar, CloseIcon } from './icons'

const EASE_ENTER = [0.16, 1, 0.3, 1]

/* TriggerFAB — the pill entry point. Geometry from Figma "Trigger FAB"
 * (node 3435:22433): height 60, pad-left 14, gap 12, radius 1000, 32px avatar,
 * label Inter SemiBold 14/100%. Pad-right is 24 untimed, 28 when timed.
 * Colour via c-fab-* tokens.
 *
 * timer:
 *   'none'       — static pill; dismiss via the X badge.
 *   'background' — the surface drains left→right off a ghosted underlay.
 *   'hairline'   — 2px brand hairline drains over a 25% track, under the label.
 *
 * Both timers are the same left-origin scaleX drain, so they share `drain`.
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

  // Shared left-origin drain used by both timed variants.
  const drain = {
    initial: { scaleX: 1 },
    animate: { scaleX: 0 },
    transition: { duration: dismissTimer, ease: 'linear' },
    style: { transformOrigin: 'left', pointerEvents: 'none' },
  }
  const timed = timer !== 'none'

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
          height: 60, paddingLeft: 14, paddingRight: timed ? 28 : 24,
          borderRadius: 1000,
          // Always opaque — the ghosted fill is a translucent overlay on top of
          // this, never the pill's own background.
          background: 'var(--c-fab-surface)',
          border: '1px solid var(--c-fab-border)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.16)',
          cursor: 'pointer', overflow: 'hidden',
        }}
      >
        {timer === 'background' && entered && (
          <>
            {/* Static translucent ghost, then the opaque surface drains off it. */}
            <div
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'var(--c-fab-ghosted-fill)',
              }}
            />
            <motion.div
              {...drain}
              style={{
                ...drain.style,
                position: 'absolute', inset: 0,
                background: 'var(--c-fab-surface)',
              }}
            />
          </>
        )}

        {/* position:relative keeps the avatar above the drain layer. */}
        <span style={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
          <EmurjAvatar size={32} />
        </span>

        {/* Label wrapper is the hairline's track width — Figma scopes the timer
         * to the text, not the full pill. */}
        <span style={{ position: 'relative', height: 36, display: 'flex', alignItems: 'center' }}>
          <span
            className="sb-button-label"
            style={{ color: 'var(--c-fab-text)', whiteSpace: 'nowrap' }}
          >
            {ctaValue}
          </span>

          {timer === 'hairline' && entered && (
            <span
              style={{
                position: 'absolute', left: 0, right: 0, top: 42, height: 2,
                borderRadius: 1000, overflow: 'hidden',
                background: 'color-mix(in srgb, var(--c-fab-text) 25%, transparent)',
              }}
            >
              <motion.span
                {...drain}
                style={{
                  ...drain.style,
                  position: 'absolute', inset: 0, display: 'block',
                  borderRadius: 1000,
                  background: 'var(--c-fab-hairline-timer-fill)',
                }}
              />
            </span>
          )}
        </span>
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
