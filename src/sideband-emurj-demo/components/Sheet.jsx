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
 *   start        header close-only, no progress
 *   in-progress  header with progress track
 *   interstitial header close-only, H1, text pads 20/24
 *   end          header hidden entirely, H1, inline footer
 * (Figma gives per-variant max widths of 414/620; this demo pins later
 * variants to a fixed 320. The Start sheet can open narrower via startWidth
 * and morph out to 320 on the following steps.)
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
  morphFromTheme = null, // entry theme when the FAB morph crosses themes
  lockHeight = false, // freeze the surface height (the binary rated hold)
  startWidth = 320, // width of the Start variant; morphs to 320 on later steps
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
  // While locked (the rated-feedback hold) new measurements are ignored, so
  // the sheet keeps the question's height instead of shrinking around the
  // shorter feedback text. Ref, not dep, so the observer never re-subscribes.
  const lockRef = useRef(false)
  lockRef.current = lockHeight
  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => { if (!lockRef.current) setHeight(el.offsetHeight) })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  // On release, re-measure once — the unlock and the next step's resize can
  // land in the same frame, and the observer only fires on further changes.
  useEffect(() => {
    if (!lockHeight && innerRef.current) setHeight(innerRef.current.offsetHeight)
  }, [lockHeight])

  // The text block gets the same freeze: the rated swap trades a two-line
  // question for a one-line response, and without a reserved height the
  // thumbs beneath would jump up. Track the block's height (gated like the
  // sheet's), then pin it as minHeight for the duration of the lock.
  const textWrapRef = useRef(null)
  const textHeightRef = useRef(0)
  const [textMinHeight, setTextMinHeight] = useState(null)
  useLayoutEffect(() => {
    const el = textWrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (!lockRef.current) textHeightRef.current = el.offsetHeight
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useLayoutEffect(() => {
    setTextMinHeight(lockHeight ? textHeightRef.current : null)
  }, [lockHeight])
  useEffect(() => {
    if (height !== 'auto') hasMeasured.current = true
  }, [height])

  const showHeader = variant !== 'end'
  const showProgress = variant === 'in-progress'
  const isH1 = variant === 'interstitial' || variant === 'end'
  const inlineFooter = variant === 'end'
  // Text Content (Figma 770:2689): pt 2 / px 24 / pb 16 — the 16 is the full
  // gap down to the input slot, which carries no top padding of its own. The
  // heading and the answer-chip slot below share a 24 horizontal inset, per
  // the Figma sheet (node 2452:10230).
  // Interstitial gives its lone heading more breathing room.
  const textPadding = variant === 'interstitial' ? '20px 24px 24px' : '2px 24px 16px'

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
        // Mobile inset matches the 24 margin the surface leaves on the right,
        // so the expanded sheet sits evenly between the screen edges.
        padding: isWide ? '0 0 24px 20px' : '0 0 24px 24px',
        background: isWide ? 'transparent' : 'var(--shade-default)',
        // Wide: no scrim, so the sheet is non-modal — the backdrop passes
        // wheel/touch/clicks through to the page (the surface opts back in
        // below). Narrow keeps the dimmed modal: scrim catches events and a
        // tap on it closes.
        pointerEvents: isWide ? 'none' : 'auto',
      }}
    >
      <motion.div
        layoutId="fab-surface"
        initial={slideIn ? { y: 64, opacity: 0 } : { opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        // The thank-you card sinks down as it fades on dismiss (the other
        // variants leave with the backdrop's plain fade).
        exit={variant === 'end'
          ? { y: 48, opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 1, 1] } }
          : undefined}
        transition={{ duration: 0.5, delay: enterDelay, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          boxSizing: 'border-box',
          // One declared width per variant. The Start sheet can open narrower
          // (startWidth) and widen to 320 on later steps: the layoutId element
          // persists across steps, so framer's layout projection tweens the
          // width change as part of the same morph the height tween drives.
          // Every value is a single number (no min/max constraints) so the
          // morph never re-derives width mid-flight.
          //
          // Mobile drops the fixed widths entirely: every variant — the opening
          // Start sheet and the questions that follow — spans the viewport less
          // 24 either side, so the flow holds one width the whole way through.
          // The 420 cap only bites on narrow-window desktop (below the 768
          // wide breakpoint), where full-bleed would stretch the text column.
          width: isWide
            ? `min(${variant === 'start' ? startWidth : 320}px, calc(100vw - 40px))`
            : 'min(420px, calc(100vw - 48px))',
          borderRadius: 32,
          background: 'var(--surface-base)',
          border: '1px solid var(--surface-primary-border)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.24)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          pointerEvents: 'auto', // opt back in when the backdrop is pass-through

        }}
      >
        {/* Cross-theme morph handoff: the surface starts as the entry theme's
            FAB colour and ducks out fast — a quick shift, deliberately much
            shorter than the 0.5s morph, so dark→light never lingers in a dull
            grey mid-blend. data-theme scopes the token lookup to the entry
            theme; positioned before the content wrapper so text paints above. */}
        {morphFromTheme && (
          <motion.div
            data-theme={morphFromTheme}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.18, delay: enterDelay, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'var(--c-fab-surface)',
            }}
          />
        )}
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
          {/* Header — 50px band matching Figma (node 2452:10243): close button
              at top 10 / right 16, progress track centred on the button's
              vertical midline (y=30). Track sized 184×5 (Figma is 216×6 on its
              wider 376 sheet). Progress is In-Progress only. */}
          {showHeader && (
            <div style={{ height: 50, position: 'relative', flexShrink: 0 }}>
              {showProgress && (
                <div style={{
                  position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                  top: 27.5, width: 184, height: 5, borderRadius: 24, overflow: 'hidden',
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
                  color: 'var(--text-secondary)', pointerEvents: 'auto',
                }}
              >
                <CloseIcon size={24} color="var(--text-secondary)" />
              </button>
            </div>
          )}

          {/* Step content — text and input crossfade as one block per step
              (plus the inline End footer; the standard footer is pinned below,
              outside this subtree, so the Next bar holds still between steps).
              popLayout drops the exiting block out of flow immediately,
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
            maxHeight: 'min(400px, 60vh)',
            // The start sheet never scrolls, and its rated pop burst reaches
            // past this box — 'auto' would grow a scrollable region under the
            // dots. The comp clips the burst at the sheet edge, which the
            // surface's own overflow:hidden already does.
            overflowY: variant === 'start' ? 'visible' : 'auto',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingTop: showHeader ? 0 : 16,
          }}>
            {media && (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                {media}
              </div>
            )}

            {(eyebrow || heading || body) && (
              <div
                ref={textWrapRef}
                style={{
                  width: '100%', minHeight: textMinHeight ?? undefined,
                  // Centre the (shorter) response in the reserved space.
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}
              >
              {/* Keyed by heading: a swap *within* a step (the binary step's
                  rated feedback) plays the Figma comp's treatment (node
                  3022:14071, rebased to the tap): after a 0.14s beat the
                  outgoing text fades while rising 25px; the feedback scales
                  0.5→1 with the comp's overshoot-settle ease from an origin
                  *below* the text, so it pops up-and-into place.
                  initial={false} leaves step-to-step changes to the stepKey
                  crossfade above, which remounts this subtree wholesale. */}
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={heading || 'text'}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0, y: -25,
                    transition: {
                      opacity: { duration: 0.25, delay: 0.14, ease: [0.5, 0, 0.5, 1] },
                      y: { duration: 0.38, delay: 0.14, ease: 'linear' },
                    },
                  }}
                  transition={{
                    opacity: { duration: 0.19, delay: 0.14, ease: [0.5, 0, 0.5, 1] },
                    scale: { duration: 1.09, delay: 0.12, ease: [0, 0.827, 0, 1.045] },
                  }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 8, padding: textPadding, textAlign: 'center', width: '100%',
                    boxSizing: 'border-box', transformOrigin: '50% 235%',
                  }}
                >
                  {/* Eyebrow + heading are one tight group (Figma 3750:20463,
                      gap 4); the outer gap 8 separates that group from the
                      body copy. */}
                  {(eyebrow || heading) && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' }}>
                      {eyebrow && (
                        <p className="sb-eyebrow" style={{ color: 'var(--text-tertiary)', margin: 0 }}>{eyebrow}</p>
                      )}
                      {heading && (
                        <h2 className={isH1 ? 'sb-heading-1' : 'sb-heading-2'} style={{ color: 'var(--text-primary)', margin: 0, maxWidth: 330, textWrap: 'pretty' }}>{heading}</h2>
                      )}
                    </div>
                  )}
                  {body && (
                    <p className="sb-body" style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: 280, textWrap: 'pretty' }}>{body}</p>
                  )}
                </motion.div>
              </AnimatePresence>
              </div>
            )}

            {children && (
              <div style={{ width: '100%', padding: '0 24px 16px', boxSizing: 'border-box' }}>{children}</div>
            )}
          </div>

          {/* Inline footer (End only) — borderless, gap 8, buttons share the
              width. Part of the step content, so it crossfades with the
              thank-you block. The standard footer lives outside this subtree —
              see below — so it holds still while steps change. */}
          {footer && inlineFooter && (
            <div style={{
              padding: '18px 20px', display: 'flex', justifyContent: 'flex-end',
              alignItems: 'stretch', gap: 8,
            }}>
              {footer}
            </div>
          )}
          </motion.div>
          </AnimatePresence>
        </motion.div>
        </motion.div>

        {/* Standard footer — pinned outside the height tween and the step
            crossfade. The sheet is bottom-anchored, so with the footer down
            here its screen position never moves between steps: the height
            tween above slides the content while the Next bar stays fixed.
            Its own enter/exit collapses the row's height with the same curve
            as the content tween, so appearing (start → first question) and
            leaving (question → end) read as one continuous resize.
            initial={false}: when the sheet mounts already footered (the
            bottom-bar flow), the row is simply part of the morph target. */}
        <AnimatePresence initial={false}>
          {footer && !inlineFooter && (
            <motion.div
              key="footer"
              // Same scale correction as the content wrapper — during the
              // layoutId morph the surface scale-animates, and without this
              // the button would stretch with it.
              layout="position"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
              style={{ overflow: 'hidden', flexShrink: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0, 0.55, 0.45, 1], delay: enterDelay + 0.12 }}
                style={{
                  padding: '18px 20px', display: 'flex', justifyContent: 'flex-end',
                  alignItems: 'center', gap: 16,
                  borderTop: '1px solid var(--c-button-surface-ghosted-border)',
                }}
              >
                {footer}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
