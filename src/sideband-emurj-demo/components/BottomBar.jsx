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
 */

// Entry decelerates in; exit is slower and eases IN (gentle start, then the
// bar — text riding along — accelerates away). The old shared ease-out
// front-loaded the exit and read as the content popping off.
const EXIT_MS = 650
const EASE_OUT = [0.16, 1, 0.3, 1]
const EASE_EXIT = [0.55, 0, 0.55, 0.2]

// 36×24 pill. Figma draws it flat with a ghosted hairline; selected fills to
// the toggle's active pair rather than a literal black.
function RateButton({ kind, selected, onRate, disabled }) {
  const [pressed, setPressed] = useState(false)
  const Icon = kind === 'positive' ? ThumbsUpIcon : ThumbsDownIcon

  const background = selected
    ? (pressed ? 'var(--c-toggle-surface-active-pressed)' : 'var(--c-toggle-surface-active)')
    : (pressed ? 'var(--c-toggle-surface-pressed)' : 'var(--c-toggle-surface-default)')

  return (
    <button
      onClick={() => onRate?.(kind)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      disabled={disabled}
      style={{
        width: 36, height: 24, borderRadius: 36,
        background,
        border: '1px solid var(--c-button-surface-ghosted-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 7.111,
        cursor: disabled ? 'default' : 'pointer',
        flexShrink: 0, pointerEvents: 'auto',
        transition: 'background 0.18s ease',
      }}
    >
      <Icon
        size={14.4}
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

  return (
    <motion.div
      layoutId="fab-surface"
      className="sb-timer-hover-scope"
      initial={{ y: 80 }}
      animate={{ y: entered && !exiting ? 0 : 80 }}
      transition={exiting
        ? { duration: 0.6, ease: EASE_EXIT }
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
      {/* Default layer — question + thumbs. Fades out in place on rating. */}
      <motion.div
        animate={{ opacity: rated ? 0 : 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          pointerEvents: rated ? 'none' : 'auto',
        }}
      >
        <span className="sb-body" style={{ color: 'var(--c-fab-text)', textAlign: 'center' }}>
          {question}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <RateButton kind="positive" selected={rated === 'positive'} onRate={rate} disabled={!!rated} />
          <RateButton kind="negative" selected={rated === 'negative'} onRate={rate} disabled={!!rated} />
        </div>
      </motion.div>

      {/* Rated layer — feedback heading rises in centred over the bar. */}
      {heading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.1 }}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span className="sb-heading-2-web" style={{ color: 'var(--text-primary)', textAlign: 'center' }}>
            {heading}
          </span>
        </motion.div>
      )}

      <Dismiss
        duration={dismissTimer}
        running={entered && !rated}
        faded={!!rated}
        onDismiss={dismiss}
      />
    </motion.div>
  )
}
