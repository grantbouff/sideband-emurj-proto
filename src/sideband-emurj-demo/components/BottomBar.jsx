import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUpIcon, ThumbsDownIcon, EmurjAvatar } from './icons'

/* BottomBar — full-width entry point pinned to the bottom. Inline question +
 * a thumbs up/down RateButton pair + a timed dismiss link. On rating it fires
 * onRate('positive'|'negative') which opens the sheet. Colour via surface and
 * c-button tokens.
 */
function RateButton({ kind, onRate }) {
  const [pressed, setPressed] = useState(false)
  const Icon = kind === 'positive' ? ThumbsUpIcon : ThumbsDownIcon
  return (
    <button
      onClick={() => onRate?.(kind)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: 44, height: 44, borderRadius: 12,
        background: pressed ? 'var(--c-toggle-surface-pressed)' : 'var(--c-toggle-surface-default)',
        border: '1px solid var(--c-button-surface-ghosted-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0, pointerEvents: 'auto',
      }}
    >
      <Icon size={22} color="var(--c-toggle-text-default)" />
    </button>
  )
}

export default function BottomBar({
  question,
  onRate,
  onDismiss,
  dismissTimer = 12,
  startDelay = 400,
}) {
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), startDelay)
    return () => clearTimeout(t)
  }, [startDelay])

  useEffect(() => {
    if (!entered || !dismissTimer) return
    const t = setTimeout(() => onDismiss?.(), dismissTimer * 1000)
    return () => clearTimeout(t)
  }, [entered, dismissTimer, onDismiss])

  return (
    <motion.div
      layoutId="fab-surface"
      initial={{ y: 80 }}
      animate={{ y: entered ? 0 : 80 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
        minHeight: 48,
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '12px 20px',
        background: 'var(--surface-base)',
        borderTop: '1px solid var(--surface-primary-border)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
        pointerEvents: 'auto',
      }}
    >
      <EmurjAvatar size={32} />
      <span className="sb-label" style={{ color: 'var(--text-primary)', flex: 1, minWidth: 0 }}>
        {question}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <RateButton kind="positive" onRate={onRate} />
        <RateButton kind="negative" onRate={onRate} />
      </div>
      <button
        onClick={onDismiss}
        className="sb-caption"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-tertiary)', padding: '8px 4px', pointerEvents: 'auto',
        }}
      >
        Dismiss
      </button>
    </motion.div>
  )
}
