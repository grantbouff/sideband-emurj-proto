import { useState } from 'react'
import { ArrowIcon } from './icons'

/* Button — level primary|secondary, style compact|fill.
 * compact = fixed 101×48 icon pill (arrow by default); fill = full-width with a
 * centred label. Colour via c-button-* tokens. Pressed lays a 20% surface-base
 * overlay over the whole button; disabled dims the container (primary 30%,
 * secondary 80%) and the content a further 50%, matching the Figma states.
 */
export default function Button({
  level = 'primary',
  styleVariant = 'compact',
  children,
  icon,
  onClick,
  disabled = false,
}) {
  const [pressed, setPressed] = useState(false)
  const isPrimary = level === 'primary'
  const isFill = styleVariant === 'fill'

  const bg = isPrimary ? 'var(--c-button-surface-primary)' : 'var(--c-button-surface-secondary)'
  const fg = isPrimary ? 'var(--c-button-text-primary)' : 'var(--c-button-text-secondary)'

  const iconNode = icon === true ? <ArrowIcon size={24} color={fg} /> : icon

  return (
    <button
      className="sb-button-label"
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
        background: bg,
        color: fg,
        overflow: 'hidden',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? (isPrimary ? 0.3 : 0.8) : 1,
        pointerEvents: 'auto',
        transition: 'opacity 0.15s ease',
      }}
    >
      <span style={{
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
