import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon } from './icons'

/* Sheet — the modal shell. One component, four variants mirroring the Figma
 * `Default Sheet` component set (Sheet Type=Start / In-Progress / Interstitial /
 * End). Header (close, plus progress track on In-Progress only), Content with
 * three optional slots (Media / Text / Input), and an optional Footer. Morphs
 * from the entry point via layoutId="fab-surface" (set slideIn to skip the
 * morph and just rise from the bottom). Colour via surface / text / shade
 * tokens. Anchored bottom-left to match the FAB origin.
 *
 * Per-variant spec (Figma):
 *   start        header close-only, no progress, max width 414
 *   in-progress  header with progress track, max width 620
 *   interstitial header close-only, H1, text pads 20/24, max width 414
 *   end          header hidden entirely, H1, inline footer, max width 414
 */
export default function Sheet({
  variant = 'in-progress', // 'start' | 'in-progress' | 'interstitial' | 'end'
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
  stepKey = 0,  // changes per step; keys the content crossfade
}) {
  const [isWide, setIsWide] = useState(() => window.innerWidth > 768)
  useEffect(() => {
    const fn = () => setIsWide(window.innerWidth > 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  // Height is tweened explicitly between steps: measure the content's natural
  // height and animate the wrapper towards it. Without this the layoutId
  // projection scale-animates the surface on every step change, so content
  // squishes and snaps before settling.
  const innerRef = useRef(null)
  const [height, setHeight] = useState('auto')
  // The first measurement must apply instantly: it lands one frame into the
  // FAB morph, and tweening 'auto'→px there makes framer snapshot the
  // mid-morph *visual* height (the scaled-down pill) as the start value — the
  // sheet collapses to pill height and crawls back up. Only animate changes
  // after that.
  const hasMeasured = useRef(false)
  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    if (height !== 'auto') hasMeasured.current = true
  }, [height])

  const showHeader = variant !== 'end'
  const showProgress = variant === 'in-progress'
  const isH1 = variant === 'interstitial' || variant === 'end'
  const inlineFooter = variant === 'end'
  // Only In-Progress stretches to 620; the bookend states cap at 414.
  const maxWidth = variant === 'in-progress' ? 620 : 414
  // Interstitial gives its lone heading more breathing room.
  const textPadding = variant === 'interstitial' ? '20px 12px 24px' : '2px 12px 16px'

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
          boxSizing: 'border-box',
          width: 'min(376px, calc(100vw - 40px))',
          minWidth: 'min(344px, calc(100vw - 40px))',
          maxWidth,
          borderRadius: 32,
          background: 'var(--surface-base)',
          border: '1px solid var(--surface-primary-border)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.24)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <motion.div
          animate={{ height }}
          // Ease-in-out, not the expo-out the surface uses for its morph: an
          // expo-out covers half the distance in the first frames, which reads
          // as the height snapping before it settles. Starting gently keeps
          // the resize legible as one continuous move.
          transition={hasMeasured.current
            ? { duration: 0.45, ease: [0.65, 0, 0.35, 1] }
            : { duration: 0 }}
          style={{ overflow: 'hidden' }}
        >
        <motion.div
          ref={innerRef}
          // layout="position" opts the content into framer's scale correction:
          // during the layoutId morph the surface scale-animates up from FAB
          // bounds, and without this the header/text stretch with it.
          // "position" (not full layout) so step-to-step size changes stay
          // owned by the measured height tween above.
          layout="position"
          style={{ display: 'flex', flexDirection: 'column' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0, 0.55, 0.45, 1], delay: enterDelay + 0.12 }}
        >
          {/* Header — 50px band; close at 16/10. Progress track (inset 80/80)
              only exists on the In-Progress variant. */}
          {showHeader && (
            <div style={{ height: 50, position: 'relative', flexShrink: 0 }}>
              {showProgress && (
                <div style={{
                  position: 'absolute', left: 80, right: 80, top: 27,
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
              )}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: 10, right: 16,
                  width: 40, height: 40, borderRadius: 4,
                  padding: 8, boxSizing: 'border-box',
                  background: 'var(--c-button-surface-tertiary)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-primary)', pointerEvents: 'auto',
                }}
              >
                <CloseIcon size={24} color="var(--text-primary)" />
              </button>
            </div>
          )}

          {/* Step content — text, input, and footer crossfade as one block per
              step. popLayout drops the exiting block out of flow immediately,
              so the measured height only ever tracks the incoming step. */}
          <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={stepKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
          {/* Content — full sheet width; the text column caps itself at 330. */}
          <div style={{
            maxHeight: 'min(400px, 60vh)', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingTop: showHeader ? 0 : 16,
          }}>
            {media && (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                {media}
              </div>
            )}

            {(eyebrow || heading || body) && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, padding: textPadding, textAlign: 'center', width: '100%',
                boxSizing: 'border-box',
              }}>
                {eyebrow && (
                  <p className="sb-eyebrow" style={{ color: 'var(--text-tertiary)', margin: 0 }}>{eyebrow}</p>
                )}
                {heading && (
                  <h2 className={isH1 ? 'sb-heading-1' : 'sb-heading-2'} style={{ color: 'var(--text-primary)', margin: 0, maxWidth: 330, textWrap: 'pretty' }}>{heading}</h2>
                )}
                {body && (
                  <p className="sb-body" style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: 280 }}>{body}</p>
                )}
              </div>
            )}

            {children && (
              <div style={{ width: '100%', padding: '0 8px 16px', boxSizing: 'border-box' }}>{children}</div>
            )}
          </div>

          {/* Footer — standard: hairline top, gap 16; inline (End): borderless,
              gap 8, buttons share the width. */}
          {footer && (
            <div style={{
              padding: '18px 20px', display: 'flex', justifyContent: 'flex-end',
              alignItems: inlineFooter ? 'stretch' : 'center',
              gap: inlineFooter ? 8 : 16,
              borderTop: inlineFooter
                ? 'none'
                : '1px solid var(--c-button-surface-ghosted-border)',
            }}>
              {footer}
            </div>
          )}
          </motion.div>
          </AnimatePresence>
        </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
