import { useState } from 'react'
import TextField from './TextField'

/* AnswerChip — selectable chip mapped to the c-toggle token states.
 *   default | pressed | active | active-pressed
 * `active` drives the selected look; `pressed` is tracked on pointer down so the
 * four c-toggle surfaces all get used. styleVariant: concise (auto pill) | verbose
 * (full-width). type 'other' embeds a TextField once the chip is active.
 */
export default function AnswerChip({
  label,
  active = false,
  styleVariant = 'concise',
  type = 'chip',
  onToggle,
  inputValue = '',
  onInputChange,
}) {
  const [pressed, setPressed] = useState(false)

  const surface = active
    ? (pressed ? 'var(--c-toggle-surface-active-pressed)' : 'var(--c-toggle-surface-active)')
    : (pressed ? 'var(--c-toggle-surface-pressed)' : 'var(--c-toggle-surface-default)')
  const color = active ? 'var(--c-toggle-text-on-active)' : 'var(--c-toggle-text-default)'
  const border = active ? '1px solid transparent' : '1px solid var(--c-button-surface-ghosted-border)'

  return (
    <div style={{ width: styleVariant === 'verbose' || type === 'other' ? '100%' : 'auto' }}>
      <button
        className="sb-chip-label"
        onClick={() => onToggle?.(!active)}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        style={{
          width: styleVariant === 'verbose' || type === 'other' ? '100%' : 'auto',
          minWidth: styleVariant === 'concise' ? 150 : undefined,
          padding: '15px 18px',
          borderRadius: 80,
          background: surface,
          color,
          border,
          cursor: 'pointer',
          textAlign: styleVariant === 'verbose' ? 'left' : 'center',
          pointerEvents: 'auto',
          transition: 'background 0.12s ease, color 0.12s ease',
        }}
      >
        {label}
      </button>

      {type === 'other' && active && (
        <div style={{ marginTop: 8 }}>
          <TextField
            value={inputValue}
            onChange={onInputChange}
            placeholder="Tell us more…"
          />
        </div>
      )}
    </div>
  )
}
