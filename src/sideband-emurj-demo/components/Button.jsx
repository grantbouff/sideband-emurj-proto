import { ArrowIcon } from './icons'

/* Button — level primary|secondary, style compact|fill.
 * compact = auto-width pill; fill = full-width. Colour via c-button-* tokens.
 * `icon` renders a trailing ButtonIcon (arrow by default when icon===true).
 */
export default function Button({
  level = 'primary',
  styleVariant = 'compact',
  children,
  icon,
  onClick,
  disabled = false,
}) {
  const isPrimary = level === 'primary'
  const bg = isPrimary ? 'var(--c-button-surface-primary)' : 'var(--c-button-surface-secondary)'
  const fg = isPrimary ? 'var(--c-button-text-primary)' : 'var(--c-button-text-secondary)'

  const iconNode = icon === true ? <ArrowIcon size={20} color={fg} /> : icon

  return (
    <button
      className="sb-button-label"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 48,
        padding: children ? '0 22px' : 0,
        width: styleVariant === 'fill' ? '100%' : (children ? 'auto' : 85),
        minWidth: children ? 96 : 85,
        borderRadius: 1000,
        border: 'none',
        background: bg,
        color: fg,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: 'auto',
        transition: 'opacity 0.15s ease, filter 0.15s ease',
      }}
    >
      {children}
      {iconNode}
    </button>
  )
}
