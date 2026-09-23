import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon } from './icons'
import { INTERSTITIAL_HOLD } from './interstitialTiming'

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
 *
 * anchor:
 *   'corner' — bottom-left, morphing out of the FAB (layoutId). Default.
 *   'center' — horizontally centred with its bottom edge pinned
 *              CENTER_BASELINE up, so the baseline holds through resizes and
 *              every step's height change (the height tween grows the card
 *              upward). On a window too short for that it slides down to
 *              centre instead, keeping CENTER_MIN_GAP clear top and bottom;
 *              past that it scrolls. No layoutId:
 *              the in-page entry (snack bar) fades out on its own rather than
 *              morphing. Card is 344 wide, per the interstitial comp.
 *
 * interstitial: a node shown *instead of* the header/content/footer, in a
 * 300-wide card — the rated message after rating from the snack bar. When it
 * clears, the comp (Figma 4835:30279) plays, rebased to that moment: message
 * lifts out 0→0.277s, card grows to full size 0.128→0.669s, card content
 * fades in 0.233→0.373s, and the progress fill grows in from empty
 * 0.277→1.177s. The scrim departs from the comp: rather than snapping in on
 * the morph, it fades in slowly across the whole interstitial (SCRIM_SLOW).
 */

// Centre anchor: how far the card's bottom edge sits above the bottom of the
// window — the baseline it holds through step height changes. Any CSS length
// (vh, dvh, px, rem…). `wide` applies above the sheet's 768px breakpoint (the
// same one that switches its mobile layout), `narrow` at or below it. On a
// window too short for it the card slides down to centre instead, keeping
// CENTER_MIN_GAP clear top and bottom.
const CENTER_BASELINE = { wide: '15vh', narrow: '5vh' }
const CENTER_MIN_GAP = '1rem'

const EASE_ENTER = [0.649, 0.058, 0.125, 1]
const EASE_IN_OUT = [0.5, 0, 0.5, 1]
const EASE_POP = [0, 0.6, 0, 1]
// Interstitial → card resize, shared by width, the content height tween and
// the footer row so the card grows as one.
const MORPH = { duration: 0.541, delay: 0.128, ease: EASE_ENTER }
// Delay from the snack bar tap to the card surface appearing (comp: 2.398s
// against a 2.263s tap).
const CENTER_ENTER_DELAY = 0.135

// Step-to-step resize, shared by the content height tween and the footer row
// so they move as one. Short with a quick start and a soft landing — snappy,
// but still a readable move rather than a jump.
const STEP_RESIZE = { duration: 0.28, ease: [0.3, 0, 0.2, 1] }

// Centre-anchor scrim: one slow fade that starts once the interstitial has
// settled in (SCRIM_START after the tap) and lands as the card finishes
// growing (the interstitial hold + the morph's delay and duration), so the
// page dims gradually under the interstitial rather than all at once on the
// morph. Derived from INTERSTITIAL_HOLD, so retiming the hold moves it too.
const SCRIM_START = 0.5
const SCRIM_END = INTERSTITIAL_HOLD + MORPH.delay + MORPH.duration
const SCRIM_SLOW = { duration: SCRIM_END - SCRIM_START, delay: SCRIM_START, ease: EASE_IN_OUT }

// Centre-anchor widths: the 300 interstitial and the 344 card on desktop;
// mobile keeps the corner sheet's full-bleed-less-24 width.
function centerWidth(vw, interstitial) {
  if (interstitial) return Math.min(300, vw - 48)
  return vw > 768 ? Math.min(344, vw - 40) : Math.min(420, vw - 48)
}
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
  // Horizontal inset for the children slot. Defaults to the 24 the heading
  // uses; the answer-chip group overrides it to 20.
  slotInline = 24,
  anchor = 'corner', // 'corner' | 'center'
  interstitial = null,
}) {
  const [vw, setVw] = useState(() => window.innerWidth)
  useEffect(() => {
    const fn = () => setVw(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  const isWide = vw > 768
  const centered = anchor === 'center'

  // Which step the card opened on after the interstitial cleared. While we're
  // still on that step, the resize/footer/progress use the interstitial
  // morph timings; later steps fall back to the ordinary step transitions.
  // Derived during render (not in an effect) so the card's very first render
  // already has it — the progress fill's `initial` is read only at mount.
  const [hadInterstitial, setHadInterstitial] = useState(!!interstitial)
  const [introKey, setIntroKey] = useState(null)
  if (hadInterstitial !== !!interstitial) {
    setHadInterstitial(!!interstitial)
    if (!interstitial) setIntroKey(stepKey)
  }
  const intro = introKey !== null && introKey === stepKey

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
  // Interstitial → card: measure the card in the same commit it mounts, so the
  // height tween starts on the same frame as the width tween instead of a
  // frame later off the observer.
  useLayoutEffect(() => {
    if (!interstitial && innerRef.current) setHeight(innerRef.current.offsetHeight)
  }, [interstitial])

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

  // Scrim: the corner sheet dims only on mobile. The centred sheet always
  // dims, but slowly — see SCRIM_SLOW. It only starts catching taps once the
  // interstitial has become the card.
  const scrim = centered ? true : !isWide
  const scrimBlocks = centered ? !interstitial : scrim
  // Centre anchor: the card's content is laid out at its *final* width from
  // the first frame, centred inside the growing surface (a flex child wider
  // than its column overflows both sides equally; the surface clips it).
  // Letting it re-flow with the animating width re-measured the height every
  // frame, and each re-measure restarted the delayed height tween — the card
  // stalled short, then caught up after the width. Now the height is
  // measured once and width + height run as one move.
  const cardW = centerWidth(vw, false)
  const fixedCol = centered ? { width: cardW, alignSelf: 'center', flexShrink: 0 } : null
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
        display: 'flex',
        // Corner: mobile inset matches the 24 margin the surface leaves on
        // the right, so the expanded sheet sits evenly between the screen
        // edges. Centre: a column of spacer / card / spacer — see below.
        ...(centered
          ? { flexDirection: 'column', alignItems: 'center', padding: `${CENTER_MIN_GAP} 0` }
          : {
              alignItems: 'flex-end', justifyContent: 'flex-start',
              padding: isWide ? '0 0 24px 20px' : '0 0 24px 24px',
            }),
        // Without a scrim the sheet is non-modal — the backdrop passes
        // wheel/touch/clicks through to the page (the surface opts back in
        // below). With one, the scrim catches events and a tap on it closes.
        pointerEvents: scrimBlocks ? 'auto' : 'none',
      }}
    >
      <motion.div
        initial={centered ? { opacity: 0 } : false}
        animate={{ opacity: scrim ? 1 : 0 }}
        transition={centered ? SCRIM_SLOW : { duration: 0.2 }}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'var(--shade-default)',
        }}
      />
      {/* Centre anchor, vertical placement. Free space splits evenly between
          two spacers, but the bottom one caps at CENTER_BASELINE (less the
          CENTER_MIN_GAP pad), so with room to spare the card's bottom edge
          sits on the baseline
          and height changes grow it upward. On a short window, once the
          centred position is lower than the baseline, both spacers shrink
          together and the card rides down to centre, never closer than CENTER_MIN_GAP
          to either edge. Plain flex layout, so it follows the height tween
          and window resizes frame by frame. */}
      {centered && <div style={{ flex: '1 1 0' }} />}
      <motion.div
        layoutId={centered ? undefined : 'fab-surface'}
        initial={centered
          ? { y: 40, opacity: 0, width: centerWidth(vw, interstitial) }
          : slideIn ? { y: 64, opacity: 0 } : { opacity: 0 }}
        // Centre: the comp's rise — a quick 40→6 pop with the fade, then a
        // long slow settle 6→0 that runs on under the card morph.
        animate={centered
          ? { y: [40, 6, 0], opacity: 1, width: centerWidth(vw, interstitial) }
          : { y: 0, opacity: 1 }}
        // The thank-you card sinks down as it fades on dismiss (the other
        // variants leave with the backdrop's plain fade).
        exit={variant === 'end'
          ? { y: 48, opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 1, 1] } }
          : undefined}
        transition={centered
          ? {
              opacity: { duration: 0.608, delay: CENTER_ENTER_DELAY, ease: EASE_POP },
              y: {
                duration: 2.288, delay: CENTER_ENTER_DELAY,
                times: [0, 0.2657, 1], ease: [EASE_POP, [0.411, 0.063, 1, 1]],
              },
              // Resizes after the morph (window resize) apply immediately.
              width: intro ? MORPH : { duration: 0 },
            }
          : { duration: 0.5, delay: enterDelay, ease: [0.16, 1, 0.3, 1] }}
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
          //
          // The centred card's width is animated (see `animate`), not styled:
          // a plain width tween keeps its content unskewed, where layout
          // projection would scale it.
          ...(centered ? null : {
            width: isWide
              ? `min(${variant === 'start' ? startWidth : 320}px, calc(100vw - 40px))`
              : 'min(420px, calc(100vw - 48px))',
          }),
          borderRadius: 32,
          background: 'var(--surface-base)',
          border: '1px solid var(--surface-primary-border)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.24)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          pointerEvents: 'auto', // opt back in when the backdrop is pass-through
          flexShrink: 0,

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
          // STEP_RESIZE between steps. Not the expo-out the surface uses for
          // its morph: that covers half the distance in the first frames and
          // reads as the height snapping before it settles.
          transition={hasMeasured.current
            ? (intro ? MORPH : STEP_RESIZE)
            : { duration: 0 }}
          style={{ overflow: 'hidden', ...fixedCol }}
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
          // The centred card fades as a whole surface; no second content fade.
          initial={centered ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0, 0.55, 0.45, 1], delay: enterDelay + 0.12 }}
        >
          {/* Interstitial ⇄ card. popLayout lifts the outgoing message out
              of flow at once, so the height tween only tracks the card. The
              card is initial={false} for sheets that open straight onto it. */}
          <AnimatePresence mode="popLayout" initial={false}>
          {interstitial ? (
          <motion.div
            key="interstitial"
            // Held at the interstitial's own width, centred in the card column.
            style={{ width: centerWidth(vw, true), alignSelf: 'center' }}
            exit={{
              opacity: 0, y: -24,
              transition: {
                opacity: { duration: 0.277, ease: EASE_IN_OUT },
                y: { duration: 0.277, ease: [0.649, 0.058, 0.904, 0.732] },
              },
            }}
          >
            {interstitial}
          </motion.div>
          ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.14, delay: 0.233, ease: EASE_IN_OUT }}
            style={{ display: 'flex', flexDirection: 'column' }}
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
                  {/* Coming out of the interstitial the fill grows in from
                      empty; step to step it just eases to the new value. */}
                  <motion.div
                    initial={intro ? { width: '0%' } : false}
                    animate={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
                    transition={intro
                      ? { duration: 0.9, delay: 0.277, ease: EASE_POP }
                      : { duration: 0.3, ease: 'easeOut' }}
                    style={{
                      height: '100%', borderRadius: 24,
                      background: 'var(--text-primary)',
                    }}
                  />
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
            // Centre anchor: also capped so header (50) + footer (81) + border
            // (2) + this still fit inside the CENTER_MIN_GAP margins — on a very short
            // window the question scrolls rather than the card leaving the
            // screen.
            maxHeight: centered
              ? `min(400px, 60vh, calc(100dvh - 2 * ${CENTER_MIN_GAP} - 133px))`
              : 'min(400px, 60vh)',
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
              <div style={{ width: '100%', padding: `0 ${slotInline}px 16px`, boxSizing: 'border-box' }}>{children}</div>
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
          )}
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
          {footer && !inlineFooter && !interstitial && (
            <motion.div
              key="footer"
              // Same scale correction as the content wrapper — during the
              // layoutId morph the surface scale-animates, and without this
              // the button would stretch with it.
              layout="position"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0, opacity: 0 }}
              transition={intro ? MORPH : STEP_RESIZE}
              style={{ overflow: 'hidden', flexShrink: 0, ...fixedCol }}
            >
              <motion.div
                initial={{ opacity: 0, y: intro ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={intro
                  ? { duration: 0.14, delay: 0.233, ease: EASE_IN_OUT }
                  : { duration: 0.5, ease: [0, 0.55, 0.45, 1], delay: enterDelay + 0.12 }}
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
      {centered && (
        <div style={{ flex: '1 1 0', maxHeight: `calc(${CENTER_BASELINE[isWide ? 'wide' : 'narrow']} - ${CENTER_MIN_GAP})` }} />
      )}
    </motion.div>
  )
}
