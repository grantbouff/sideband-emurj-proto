import { useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUpIcon, ThumbsDownIcon } from './icons'

/* BinaryRatingNative — one thumb button, per the Figma "Binary Rating Native"
 * set (4847:37281), Type=Filled. The Outlined type is what BinaryRating
 * already draws inside the sheet; this is the filled pill the Snack Bar uses.
 *
 * Filled is two fills stacked, exactly as Figma layers them: the bar's own
 * surface (c-fab-bar/surface) underneath, then a state overlay on top —
 *   default  c-toggle/surface/filled-overlay          (text-primary @ 8% lighter)
 *   hover    c-toggle/surface/filled-overlay-hovered
 *   pressed  c-toggle/surface/filled-overlay-pressed
 *   active   c-toggle/surface/filled-overlay-active   (solid; glyph on-active)
 * The overlay is its own layer rather than a gradient on `background` so the
 * colour can transition between states.
 *
 * Size: small 36×24 / 14 glyph, medium 44×44 / 18, xlarge 80×80 / 36.
 */
const SIZES = {
  small: { w: 36, h: 24, icon: 14 },
  medium: { w: 44, h: 44, icon: 18 },
  xlarge: { w: 80, h: 80, icon: 36 },
}

export default function BinaryRatingNative({
  kind,              // 'positive' | 'negative'
  size = 'medium',
  active = false,
  disabled = false,
  onRate,
}) {
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const Icon = kind === 'positive' ? ThumbsUpIcon : ThumbsDownIcon
  const { w, h, icon } = SIZES[size] || SIZES.medium

  const overlay = active
    ? 'var(--c-toggle-surface-filled-overlay-active)'
    : pressed
      ? 'var(--c-toggle-surface-filled-overlay-pressed)'
      : hovered && !disabled
        ? 'var(--c-toggle-surface-filled-overlay-hovered)'
        : 'var(--c-toggle-surface-filled-overlay)'

  return (
    <motion.button
      type="button"
      aria-label={kind === 'positive' ? 'Yes, helpful' : 'No, not helpful'}
      aria-pressed={active}
      disabled={disabled}
      onClick={() => onRate?.(kind)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => { setHovered(false); setPressed(false) }}
      // Same press dip BinaryRating uses, scoped to the picked thumb.
      animate={active ? { scale: [1, 0.9, 1] } : { scale: 1 }}
      transition={{ duration: 0.24, times: [0, 0.39, 1], ease: [0.5, 0, 0.5, 1] }}
      style={{
        position: 'relative',
        width: w, height: h, borderRadius: 1000, padding: 0,
        background: 'var(--c-fab-bar-surface)',
        border: 'none', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, pointerEvents: 'auto',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      <span
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: overlay,
          transition: 'background 0.15s ease',
        }}
      />
      <span style={{ position: 'relative', display: 'flex' }}>
        <Icon
          size={icon}
          color={active ? 'var(--c-toggle-text-on-active)' : 'var(--c-fab-bar-text)'}
        />
      </span>
    </motion.button>
  )
}
