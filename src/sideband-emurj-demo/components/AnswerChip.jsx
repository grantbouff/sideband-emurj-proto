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
  const isVerbose = styleVariant === 'verbose'
  const isOther = type === 'other'

  const surface = active && !isOther
    ? (pressed ? 'var(--c-input-surface-primary-active-pressed)' : 'var(--c-input-surface-primary-active)')
    : (pressed ? 'var(--c-input-surface-primary-pressed)' : 'var(--c-input-surface-primary)')
  const color = active && !isOther ? 'var(--c-input-text-on-active)' : 'var(--c-input-text-primary)'
  // Active states drop the hairline; keep the 1px so the box doesn't resize.
  const border = `1px solid ${active && !isOther ? 'transparent' : 'var(--c-button-surface-ghosted-border)'}`

  return (
    <button
      className={isOther ? 'sb-input-placeholder' : 'sb-chip-label'}
      onClick={() => onToggle?.(!active)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        minWidth: isVerbose ? 180 : undefined,
        boxSizing: 'border-box',
        padding: isOther ? '16px' : (isVerbose ? '16px 22px' : '16px 8px'),
        borderRadius: isVerbose ? 16 : 80,
        background: surface,
        color,
        border,
        cursor: 'pointer',
        overflow: 'hidden',
        pointerEvents: 'auto',
        transition: 'background 0.12s ease, color 0.12s ease',
      }}
    >
      <span style={{
        flex: '1 0 0',
        textAlign: isVerbose && !isOther ? 'left' : 'center',
        opacity: isOther ? 0.4 : 1,
      }}>
        {label}
      </span>

      {/* Input caret — sits just left of the placeholder, as drawn. */}
      {isOther && (
        <span style={{
          position: 'absolute',
          left: isVerbose ? 20 : 50,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 1,
          height: 22,
          background: 'var(--text-primary)',
        }} />
      )}
    </button>
  )
}
