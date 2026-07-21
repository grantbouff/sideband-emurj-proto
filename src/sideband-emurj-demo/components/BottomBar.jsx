import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUpIcon, ThumbsDownIcon } from './icons'

/* BottomBar — full-width entry point pinned to the bottom, per Figma
 * `entry-point` (3603:19406 default, 3603:19663 / 3603:19715 rated).
 *
 * The bar is terminal: rating does NOT hand off to the sheet. It swaps the
 * question for a heading, fills the chosen thumb, restarts the dismiss timer
 * and then closes itself. Content is centre-hugging; `dismiss` is lifted out
 * of the flex flow and pinned right, exactly as the comp has it.
 */

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
 * `runKey` remounts the fill so the drain restarts after a rating.
 */
function Dismiss({ duration, running, runKey, onDismiss }) {
  return (
    <div
      style={{
        position: 'absolute', right: 25, top: '50%', marginTop: -9,
        width: 58, height: 18,
      }}
    >
      <button
        onClick={onDismiss}
        className="sb-body"
        style={{
          position: 'absolute', inset: '0 0 auto 0',
          background: 'none', border: 'none', padding: 0,
          color: 'var(--text-secondary)', textAlign: 'center', width: '100%',
          cursor: 'pointer', whiteSpace: 'nowrap', pointerEvents: 'auto',
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
        <motion.span
          key={runKey}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: running ? 0 : 1 }}
          transition={{ duration, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0, display: 'block',
            transformOrigin: 'left center',
            background: 'var(--text-secondary)',
          }}
        />
      </span>
    </div>
  )
}

export default function BottomBar({
  question,
  responses = {},
  onRate,
  onDismiss,
  dismissTimer = 12,
  ratedTimer = 4,
  startDelay = 400,
}) {
  const [entered, setEntered] = useState(false)
  const [rated, setRated] = useState(null)   // 'positive' | 'negative'

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), startDelay)
    return () => clearTimeout(t)
  }, [startDelay])

  // One timer across both states — rating swaps its duration and restarts it.
  const duration = rated ? ratedTimer : dismissTimer
  useEffect(() => {
    if (!entered || !duration) return
    const t = setTimeout(() => onDismiss?.(), duration * 1000)
    return () => clearTimeout(t)
  }, [entered, rated, duration, onDismiss])

  const rate = (kind) => {
    if (rated) return
    setRated(kind)
    onRate?.(kind)
  }

  const heading = rated ? responses[rated] : null

  return (
    <motion.div
      layoutId="fab-surface"
      initial={{ y: 80 }}
      animate={{ y: entered ? 0 : 80 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
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
      {heading ? (
        <span className="sb-heading-2" style={{ color: 'var(--text-primary)', textAlign: 'center' }}>
          {heading}
        </span>
      ) : (
        <span className="sb-body" style={{ color: 'var(--c-fab-text)', textAlign: 'center' }}>
          {question}
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <RateButton kind="positive" selected={rated === 'positive'} onRate={rate} disabled={!!rated} />
        <RateButton kind="negative" selected={rated === 'negative'} onRate={rate} disabled={!!rated} />
      </div>

      <Dismiss
        duration={duration}
        running={entered}
        runKey={rated || 'initial'}
        onDismiss={onDismiss}
      />
    </motion.div>
  )
}
