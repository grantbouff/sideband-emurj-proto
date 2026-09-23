import { useState } from 'react'

/* AnswerChip — selectable chip mapped to the c-input token states.
 *   default | pressed | active | active-pressed
 * `active` drives the selected look; `pressed` is tracked on pointer down so the
 * four c-input surfaces all get used. styleVariant: concise (pill) | verbose
 * (16px radius, left-aligned). Width comes from the caller's grid cell.
 *
 * type 'other' is NOT a toggle — it renders as a text input (placeholder at 40%
 * plus a caret rule) but behaves as a button that diverts to the long-form
 * sheet, per the Figma interaction note on `Other`.
 */
export default function AnswerChip({
  label,
  active = false,
  styleVariant = 'concise',
  type = 'chip',
  onToggle,
}) {
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const isVerbose = styleVariant === 'verbose'
  const isOther = type === 'other'
  // 'other' never takes the selected look — it diverts rather than toggles.
  const isActive = active && !isOther

  // No dedicated input-hover token in the system, so hover sits between each
  // theme's default and pressed surfaces — the same halfway nudge the rate
  // buttons use, in whichever direction that theme's pressed state moves.
  const hover = isActive
    ? 'color-mix(in srgb, var(--c-input-surface-primary-active), var(--c-input-surface-primary-active-pressed) 55%)'
    : 'color-mix(in srgb, var(--c-input-surface-primary), var(--c-input-surface-primary-pressed) 45%)'

  const surface = isActive
    ? (pressed ? 'var(--c-input-surface-primary-active-pressed)' : (hovered ? hover : 'var(--c-input-surface-primary-active)'))
    : (pressed ? 'var(--c-input-surface-primary-pressed)' : (hovered ? hover : 'var(--c-input-surface-primary)'))
  const color = isActive ? 'var(--c-input-text-on-active)' : 'var(--c-input-text-primary)'
  // Active states drop the hairline; keep the 1px so the box doesn't resize.
  // Unselected chips firm the border up on hover to echo the surface fill.
  const border = `1px solid ${isActive
    ? 'transparent'
    : (hovered
      ? 'color-mix(in srgb, var(--c-button-surface-ghosted-border), var(--c-input-text-primary) 35%)'
      : 'var(--c-button-surface-ghosted-border)')}`

  return (
    <button
      className={isOther ? 'sb-input-placeholder' : 'sb-chip-label'}
      onClick={() => onToggle?.(!active)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => { setHovered(false); setPressed(false) }}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        minWidth: isVerbose ? 180 : undefined,
        boxSizing: 'border-box',
        padding: isVerbose ? '16px 22px' : (isOther ? '16px' : '16px 8px'),
        borderRadius: isVerbose ? 16 : 80,
        background: surface,
        color,
        border,
        cursor: 'pointer',
        overflow: 'hidden',
        pointerEvents: 'auto',
        transition: 'background 0.12s ease, color 0.12s ease, border-color 0.12s ease',
      }}
    >
      {isOther ? (
        // Caret + placeholder flow together so the rule sits just left of the
        // text without overlapping it, whatever width the chip lands at.
        <span style={{
          flex: '1 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isVerbose ? 'flex-start' : 'center',
          gap: 1,
        }}>
          {/* Text-input caret: a thin bar scaled to the 14px placeholder
              (≈1.2em), so it reads as a cursor sitting just before the text
              rather than a full-height rule. Width is a flat 1px, not 1.5:
              the half pixel rasterised crisply when the caret sits at
              flex-start (verbose) but softly when centred (concise), so the
              same element read as two different weights across the variants.
              1px is the thinner of the two, and lands the same either way. */}
          <span style={{
            flex: 'none',
            width: 1,
            height: '1.2em',
            background: 'var(--text-primary)',
          }} />
          <span style={{ opacity: 0.4 }}>{label}</span>
        </span>
      ) : (
        <span style={{
          flex: '1 0 0',
          textAlign: isVerbose ? 'left' : 'center',
        }}>
          {label}
        </span>
      )}
    </button>
  )
}
