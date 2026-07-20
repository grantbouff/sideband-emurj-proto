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
  const border = active ? '1px solid transparent' : '1px solid var(--c-button-surface-ghosted-border)'

  return (
    <button
      onClick={() => onRate?.(kind)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: 80, height: 80, borderRadius: 24,
        background: surface, border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0, pointerEvents: 'auto',
        transition: 'background 0.12s ease',
      }}
    >
      <Icon size={30} color={color} />
    </button>
  )
}

export default function BinaryRating({ value, onRate }) {
  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
      <ThumbButton kind="positive" active={value === 'positive'} onRate={onRate} />
      <ThumbButton kind="negative" active={value === 'negative'} onRate={onRate} />
    </div>
  )
}
