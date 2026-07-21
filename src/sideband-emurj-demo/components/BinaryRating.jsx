import { useState } from 'react'
import { ThumbsUpIcon, ThumbsDownIcon } from './icons'

/* BinaryRating — two 80×80 thumb buttons. Selecting one marks it active
 * (c-toggle-surface-active) and fires onRate('positive'|'negative').
 * pressed tracked on pointer down so active-pressed is exercised too.
 */
function ThumbButton({ kind, active, onRate }) {
  const [pressed, setPressed] = useState(false)
  const Icon = kind === 'positive' ? ThumbsUpIcon : ThumbsDownIcon

  const surface = active
    ? (pressed ? 'var(--c-toggle-surface-active-pressed)' : 'var(--c-toggle-surface-active)')
    : (pressed ? 'var(--c-toggle-surface-pressed)' : 'var(--c-toggle-surface-default)')
  const color = active ? 'var(--c-toggle-text-on-active)' : 'var(--c-toggle-text-default)'
  // Active states drop the hairline in favour of the filled surface.
  const border = `1.111px solid ${active ? surface : 'var(--c-button-surface-ghosted-border)'}`

  return (
    <button
      onClick={() => onRate?.(kind)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: 80, height: 80, borderRadius: 1000, boxSizing: 'border-box',
        background: surface, border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0, pointerEvents: 'auto',
        transition: 'background 0.12s ease, border-color 0.12s ease',
      }}
    >
      <Icon size={36} color={color} />
    </button>
  )
}

export default function BinaryRating({ value, onRate }) {
  return (
    <div style={{
      display: 'flex', gap: 24, justifyContent: 'center',
      padding: '16px 0',  // + the input slot's own 16px bottom = 32 as drawn
    }}>
      <ThumbButton kind="positive" active={value === 'positive'} onRate={onRate} />
      <ThumbButton kind="negative" active={value === 'negative'} onRate={onRate} />
    </div>
  )
}
