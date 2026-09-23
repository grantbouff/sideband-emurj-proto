import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUpIcon, ThumbsDownIcon } from './icons'

/* BottomBar — full-width entry point pinned to the bottom, per Figma
 * `entry-point` (3603:19406 default, 3716:16459 rated).
 *
 * The bar is terminal: rating does NOT hand off to the sheet. On rating the
 * whole default layer — question, thumbs AND `dismiss` — fades out in place
 * while the feedback heading rises in centred (opacity + translateY). The
 * rated bar holds for `ratedTimer`, then the entire bar slides back out.
 * Content is centre-hugging; `dismiss` is lifted out of the flex flow and
 * pinned right, exactly as the comp has it.
 *
 * Mobile (≤768) re-cuts that row: the question left-aligns and takes the
 * leftover width with the thumbs beside it, and "Not Now" gives way to a bare
 * countdown on the bar's top edge — no manual dismiss at all. See EdgeTimer.
 */

// Entry decelerates in; exit is slower and eases IN (gentle start, then the
// bar — text riding along — accelerates away). The old shared ease-out
// front-loaded the exit and read as the content popping off.
const EXIT_MS = 450
const EASE_OUT = [0.16, 1, 0.3, 1]
const EASE_EXIT = [0.55, 0, 0.55, 0.2]

// 36×24 pill. Figma draws it flat with a ghosted hairline; selected fills to
// the toggle's active pair rather than a literal black. `scale` multiplies the
// whole geometry — pill, padding and glyph together — so the mobile bar can
// run bigger targets without redrawing the proportions.
function RateButton({ kind, selected, onRate, disabled, scale = 1 }) {
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const Icon = kind === 'positive' ? ThumbsUpIcon : ThumbsDownIcon

  // No dedicated toggle-hover token in the system, so hover sits halfway
  // between each theme's default and pressed surfaces — a gentle nudge in
  // whichever direction that theme's pressed state already moves.
  const hover = selected
    ? 'color-mix(in srgb, var(--c-toggle-surface-active), var(--c-toggle-surface-active-pressed) 55%)'
    : 'color-mix(in srgb, var(--c-toggle-surface-default), var(--c-toggle-surface-pressed) 45%)'

  const background = selected
    ? (pressed ? 'var(--c-toggle-surface-active-pressed)' : (hovered ? hover : 'var(--c-toggle-surface-active)'))
    : (pressed ? 'var(--c-toggle-surface-pressed)' : (hovered ? hover : 'var(--c-toggle-surface-default)'))

  return (
    <button
      onClick={() => onRate?.(kind)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => { setHovered(false); setPressed(false) }}
      disabled={disabled}
      style={{
        width: 36 * scale, height: 24 * scale, borderRadius: 36 * scale,
        background,
        // Border firms up on hover to echo the surface fill; ghosted at rest.
        border: `1px solid ${hovered && !selected
          ? 'color-mix(in srgb, var(--c-button-surface-ghosted-border), var(--c-toggle-text-default) 35%)'
          : 'var(--c-button-surface-ghosted-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 7.111 * scale,
        cursor: disabled ? 'default' : 'pointer',
        flexShrink: 0, pointerEvents: 'auto',
        // Slight sink on press for tactility; hover/rest sit flat.
        transform: pressed && !disabled ? 'scale(0.92)' : 'scale(1)',
        transition: 'background 0.18s ease, border-color 0.18s ease, transform 0.12s ease',
      }}
    >
      <Icon
        size={14.4 * scale}
        color={selected ? 'var(--c-toggle-text-on-active)' : 'var(--c-toggle-text-default)'}
      />
    </button>
  )
}

/* 58px-wide "Not Now" + the 1px drain beneath it. The track is scoped to the
 * label width, not the bar — same treatment as TriggerFAB's hairline timer.
 * The fill is the shared CSS drain (motion.css): hovering the bar pauses it,
 * and its `animationend` is what dismisses the un-rated bar — no parallel
 * timeout. `faded` fades the whole affordance out once a rating lands (the
 * rated hold runs on its own clock in the parent).
 */
function Dismiss({ duration, running, faded, onDismiss }) {
  return (
    <motion.div
      animate={{ opacity: faded ? 0 : 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        position: 'absolute', right: 25, top: '50%', marginTop: -9,
        width: 58, height: 18,
        pointerEvents: faded ? 'none' : 'auto',
      }}
    >
      <button
        onClick={onDismiss}
        className="sb-body"
        style={{
          position: 'absolute', inset: '0 0 auto 0',
          background: 'none', border: 'none', padding: 0,
          color: 'var(--text-secondary)', textAlign: 'center', width: '100%',
          cursor: 'pointer', whiteSpace: 'nowrap', pointerEvents: 'inherit',
        }}
      >
        Not Now
      </button>
      <span
        style={{
          position: 'absolute', left: 0, bottom: 0.5, width: 58, height: 1,
          background: 'var(--text-quaternary)', overflow: 'hidden',
        }}
      >
        <span
          // Until `running`, no animation class — the fill just sits full.
          className={running ? 'sb-timer-drain' : undefined}
          onAnimationEnd={(e) => { if (e.animationName === 'sb-drain') onDismiss?.() }}
          style={{
            position: 'absolute', inset: 0, display: 'block',
            transformOrigin: 'left center',
            background: 'var(--text-secondary)',
            animationDuration: `${duration}s`,
          }}
        />
      </span>
    </motion.div>
  )
}

/* The dismiss timer, rehoused. "Not Now" owned the countdown on desktop (its
 * drain's `animationend` IS the auto-dismiss) and it needs horizontal room the
 * phone bar doesn't have once the question is left-aligned with the thumbs
 * beside it — so on mobile the drain becomes the bar's own top hairline,
 * running the full width over the existing border. Same shared CSS drain, so
 * hovering the bar still pauses it and its end still dismisses.
 *
 * It is also the *only* way out of the un-rated mobile bar: there is no manual
 * dismiss affordance down here, by design. Rating still closes it early.
 */
function EdgeTimer({ duration, running, faded, onDismiss }) {
  return (
    <motion.span
      animate={{ opacity: faded ? 0 : 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        // -1 lands on the padding box's outer edge, i.e. exactly over borderTop.
        position: 'absolute', top: -1, left: 0, right: 0, height: 1,
        overflow: 'hidden', pointerEvents: 'none',
      }}
    >
      <span
        className={running ? 'sb-timer-drain' : undefined}
        onAnimationEnd={(e) => { if (e.animationName === 'sb-drain') onDismiss?.() }}
        style={{
          position: 'absolute', inset: 0, display: 'block',
          background: 'var(--c-fab-text)',
          animationDuration: `${duration}s`,
        }}
      />
    </motion.span>
  )
}

export default function BottomBar({
  question,
  responses = {},
  onRate,
  onDismiss,
  dismissTimer = 12,
  ratedTimer = 3,
  startDelay = 400,
}) {
  const [entered, setEntered] = useState(false)
  const [rated, setRated] = useState(null)     // 'positive' | 'negative'
  const [exiting, setExiting] = useState(false)

  // Same breakpoint the Sheet uses. Phone layout is a single left-aligned row
  // — question, then thumbs — with the X badge on the top edge; desktop keeps
  // the centre-hugging content and the "Not Now" affordance.
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), startDelay)
    return () => clearTimeout(t)
  }, [startDelay])

  // Play the slide-down exit, then hand back to the flow — same staging as
  // TriggerFAB. Every path out (drain end, Not Now, rated hold) funnels here.
  const exitingRef = useRef(false)
  const dismiss = () => {
    if (exitingRef.current) return
    exitingRef.current = true
    setExiting(true)
    setTimeout(() => onDismiss?.(), EXIT_MS)
  }

  // Rated hold: the drain fades out with the rest of the default layer, so
  // the rated bar times itself — nothing left on it is interactive.
  useEffect(() => {
    if (!rated) return
    const t = setTimeout(dismiss, ratedTimer * 1000)
    return () => clearTimeout(t)
  }, [rated])  // eslint-disable-line react-hooks/exhaustive-deps

  const rate = (kind) => {
    if (rated) return
    setRated(kind)
    onRate?.(kind)
  }

  const heading = rated ? responses[rated] : null
  const rateScale = isMobile ? 4 / 3 : 1

  return (
    <motion.div
      layoutId="fab-surface"
      className="sb-timer-hover-scope"
      initial={{ y: 80 }}
      animate={{ y: entered && !exiting ? 0 : 80 }}
      transition={exiting
        ? { duration: 0.4, ease: EASE_EXIT }
        : { duration: 0.45, ease: EASE_OUT }}
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
        minHeight: 48,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        padding: '10px 24px',
        background: 'var(--c-fab-surface)',
        borderTop: '1px solid var(--c-fab-border)',
        pointerEvents: 'auto',
      }}
    >
      {/* Default layer — question + thumbs. Fades out in place on rating.
          Mobile spans the bar so the question can left-align and the thumbs
          take the far side; desktop keeps the pair hugging the centre. */}
      <motion.div
        animate={{ opacity: rated ? 0 : 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          width: isMobile ? '100%' : undefined,
          pointerEvents: rated ? 'none' : 'auto',
        }}
      >
        <span
          className="sb-body"
          style={{
            color: 'var(--c-fab-text)',
            textAlign: isMobile ? 'left' : 'center',
            // Takes the leftover width so the thumbs stay pinned right however
            // many lines the question wraps to.
            flex: isMobile ? '1 1 auto' : undefined,
            textWrap: 'pretty',
          }}
        >
          {question}
        </span>
        {/* Phone thumbs run a third larger than the Figma pill (36×24 → 48×32)
            for a thumb-sized target; the gap scales with them. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 * rateScale, flexShrink: 0 }}>
          <RateButton kind="positive" selected={rated === 'positive'} onRate={rate} disabled={!!rated} scale={rateScale} />
          <RateButton kind="negative" selected={rated === 'negative'} onRate={rate} disabled={!!rated} scale={rateScale} />
        </div>
      </motion.div>

      {/* Rated layer — feedback heading rises in over the bar. */}
      {heading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.1 }}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center',
            // Follows the question's alignment so the response lands on the
            // same left edge it replaces.
            justifyContent: isMobile ? 'flex-start' : 'center',
            padding: isMobile ? '0 24px' : 0,
            pointerEvents: 'none',
          }}
        >
          <span
            className="sb-heading-2-web"
            style={{ color: 'var(--text-primary)', textAlign: isMobile ? 'left' : 'center' }}
          >
            {heading}
          </span>
        </motion.div>
      )}

      {isMobile ? (
        <EdgeTimer
          duration={dismissTimer}
          running={entered && !rated}
          faded={!!rated}
          onDismiss={dismiss}
        />
      ) : (
        <Dismiss
          duration={dismissTimer}
          running={entered && !rated}
          faded={!!rated}
          onDismiss={dismiss}
        />
      )}
    </motion.div>
  )
}
