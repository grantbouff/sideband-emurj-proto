import { useState } from 'react'
import { ArrowIcon } from './icons'

// Same head start as the FAB's background timer (T.drainDelay): the surface
// sits full for a beat before the drain begins, and the auto-fire waits it out
// so `timer` stays honest as "how long the bar takes to empty".
const DRAIN_DELAY = 1.0

/* Button — level primary|secondary, style compact|fill.
 * compact = fixed 101×48 icon pill (arrow by default); fill = full-width with a
 * centred label. Colour via c-button-* tokens. Pressed lays a 20% surface-base
 * overlay over the whole button; disabled dims the container (primary 30%,
 * secondary 80%) and the content a further 50%, matching the Figma states.
 *
 * timer (seconds) — the TriggerFAB 'background' mechanism: the solid surface
 * drains left→right off a ghosted underlay, then the button fires onClick by
 * itself, as if pressed. Hovering the button pauses the drain (and with it
 * the auto-press — dismissal rides `animationend`, not a separate timeout).
 */
export default function Button({
  level = 'primary',
  styleVariant = 'compact',
  children,
  icon,
  onClick,
  disabled = false,
  timer = null,
}) {
  const [pressed, setPressed] = useState(false)
  const isPrimary = level === 'primary'
  const isFill = styleVariant === 'fill'

  const bg = isPrimary ? 'var(--c-button-surface-primary)' : 'var(--c-button-surface-secondary)'
  const fg = isPrimary ? 'var(--c-button-text-primary)' : 'var(--c-button-text-secondary)'

  const iconNode = icon === true ? <ArrowIcon size={24} color={fg} /> : icon

  const timed = timer != null && !disabled

  return (
    <button
      // hover-scope: hovering the button pauses the timed drain (motion.css).
      className={timed ? 'sb-button-label sb-timer-hover-scope' : 'sb-button-label'}
      onClick={onClick}
      disabled={disabled}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        gap: isFill ? 8 : 6,
        height: 48,
        padding: isFill ? '15px 16px' : '16px 14px 16px 16px',
        width: isFill ? '100%' : 101,
        flex: isFill ? '1 0 0' : undefined,
        borderRadius: 80,
        border: 'none',
        // Always the opaque button surface — the timed treatment layers on
        // top of it (see below), so nothing behind the button ever shows
        // through.
        background: bg,
        color: fg,
        overflow: 'hidden',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? (isPrimary ? 0.3 : 0.8) : 1,
        pointerEvents: 'auto',
        transition: 'opacity 0.15s ease',
      }}
    >
      {timed && (
        // Same stack as the FAB's 'background' timer, in the button's own
        // palette: over the opaque base, a tint of the modal surface
        // (theme-driven — the FAB's ghosted-fill role), then the solid
        // surface drains off it left→right with the FAB's linear curve.
        // 0.2, not the ghosted-fill's 0.1: the dark FAB's ghost is 10% white
        // over its #1F1F1F surface (≈#353535), but the primary button's base
        // is pure black, so it takes ~20% white to land on the same tone.
        <>
          <span
            style={{
              position: 'absolute', inset: 0, display: 'block',
              pointerEvents: 'none',
              background: 'var(--surface-base)', opacity: 0.2,
            }}
          />
          <span
            // CSS drain (motion.css): pausable on hover, and its completion
            // IS the auto-press — no parallel timeout to drift from it.
            className="sb-timer-drain"
            onAnimationEnd={(e) => { if (e.animationName === 'sb-drain') onClick?.() }}
            style={{
              position: 'absolute', inset: 0, display: 'block',
              pointerEvents: 'none',
              background: bg,
              animationDuration: `${timer}s`,
              animationDelay: `${DRAIN_DELAY}s`,
            }}
          />
        </>
      )}
      <span style={{
        // Above the drain layer, like the FAB's avatar/label.
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: isFill ? 8 : 6, flex: isFill ? '1 0 0' : undefined,
        opacity: disabled ? 0.5 : 1,
      }}>
        {isFill && children}
        {iconNode}
      </span>
      {pressed && !disabled && (
        <span style={{
          position: 'absolute', inset: 0,
          background: 'var(--surface-base)', opacity: 0.2,
          pointerEvents: 'none',
        }} />
      )}
    </button>
  )
}
