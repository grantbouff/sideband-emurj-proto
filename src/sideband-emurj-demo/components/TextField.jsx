import { useState } from 'react'

/* TextField — single/multi-line input. Visual state (default|focused|filled)
 * is derived from focus + value unless `state` is forced. Colour via c-input-*.
 * States: default/focused border, filled = has value, pressed handled by :active.
 */
export default function TextField({
  value = '',
  onChange,
  placeholder = 'Type your answer…',
  multiline = false,
  rows = 3,
  state,
}) {
  const [focused, setFocused] = useState(false)
  const resolved = state || (focused ? 'focused' : value ? 'filled' : 'default')

  const border = resolved === 'focused'
    ? '1px solid var(--text-primary)'
    : '1px solid var(--c-button-surface-ghosted-border)'

  const base = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 16,
    border,
    background: 'var(--c-input-surface-primary)',
    color: 'var(--c-input-text-primary)',
    fontFamily: 'Inter, sans-serif',
    fontSize: 16,
    lineHeight: 1.2,
    fontWeight: 500,
    outline: 'none',
    boxSizing: 'border-box',
    pointerEvents: 'auto',
    transition: 'border-color 0.15s ease',
  }

  const commonProps = {
    value,
    placeholder,
    onChange: (e) => onChange?.(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  }

  return multiline
    // 144 min height per the Figma Text Field (Verbose) spec.
    ? <textarea {...commonProps} rows={rows} style={{ ...base, resize: 'none', minHeight: 144 }} />
    : <input type="text" {...commonProps} style={base} />
}
