import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CloseIcon } from './icons'

/* Sheet — the modal shell. Header (progress track + close), Content with three
 * optional slots (Media / Text / Input), and an optional Footer. Morphs from the
 * entry point via layoutId="fab-surface" (set slideIn to skip the morph and just
 * rise from the bottom). Width min 344 / max 620, radius 32. Colour via
 * surface / text / shade tokens. Anchored bottom-left to match the FAB origin.
 */
export default function Sheet({
  progress = 0,
  eyebrow,
  heading,
  body,
  media,
  children,     // input slot
  footer,
  onClose,
  slideIn = false,
  enterDelay = 0,
}) {
  const [isWide, setIsWide] = useState(() => window.innerWidth > 768)
  useEffect(() => {
    const fn = () => setIsWide(window.innerWidth > 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.2, delay: enterDelay }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start',
        padding: '0 0 24px 20px',
        background: isWide ? 'transparent' : 'var(--shade-default)',
        pointerEvents: 'auto',
      }}
    >
      <motion.div
        layoutId="fab-surface"
        initial={slideIn ? { y: 64, opacity: 0 } : { opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: enterDelay, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(620px, calc(100vw - 40px))',
          minWidth: 'min(344px, calc(100vw - 40px))',
          borderRadius: 32,
          background: 'var(--surface-base)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.24)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <motion.div
          style={{ display: 'flex', flexDirection: 'column' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0, 0.55, 0.45, 1], delay: enterDelay + 0.12 }}
        >
          {/* Header */}
          <div style={{ height: 50, position: 'relative', flexShrink: 0 }}>
            <div style={{
              position: 'absolute', left: 24, right: 72, top: 27,
              height: 6, borderRadius: 24, overflow: 'hidden',
              background: 'var(--surface-tertiary)',
            }}>
              <div style={{
                height: '100%', borderRadius: 24,
                width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
                background: 'var(--text-primary)',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 8, right: 12,
                width: 40, height: 40, borderRadius: 8,
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-primary)', pointerEvents: 'auto',
              }}
            >
              <CloseIcon size={22} color="var(--text-primary)" />
            </button>
          </div>

          {/* Content */}
          <div style={{
            maxHeight: '60vh', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '8px 24px 8px',
          }}>
            {media && (
              <div style={{ padding: '8px 0 20px', display: 'flex', justifyContent: 'center' }}>
                {media}
              </div>
            )}

            {(eyebrow || heading || body) && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, padding: '4px 0 24px', textAlign: 'center', maxWidth: 420,
              }}>
                {eyebrow && (
                  <p className="sb-caption" style={{ color: 'var(--text-tertiary)', margin: 0 }}>{eyebrow}</p>
                )}
                {heading && (
                  <h2 className="sb-heading-2" style={{ color: 'var(--text-primary)', margin: 0 }}>{heading}</h2>
                )}
                {body && (
                  <p className="sb-body" style={{ color: 'var(--text-secondary)', margin: 0 }}>{body}</p>
                )}
              </div>
            )}

            {children && (
              <div style={{ width: '100%', paddingBottom: 8 }}>{children}</div>
            )}
          </div>

          {/* Footer */}
          {footer && (
            <div style={{
              padding: '16px 24px', display: 'flex', justifyContent: 'flex-end',
              borderTop: '1px solid var(--surface-primary-border)',
            }}>
              {footer}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
