import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { EmurjAvatar, CloseIcon } from './icons'

// Geometry, per Figma. COLLAPSED is the circle phase: 60 wide, 60 tall.
const COLLAPSED = 60
const PAD_LEFT = 14
const AVATAR = 32
const GAP = 12

/* Motion from the Figma "Trigger FAB" timeline (node 3247:7309). That comp is a
 * 10s loop, so only the curves and the offsets *within* entry/exit are taken
 * from it — the hold length is `dismissTimer`, not the comp's 7s.
 */
const EASE_ENTER = [0.649, 0.058, 0.125, 1] // FAB + avatar scale-in, width expand
const EASE_COLLAPSE = [0.678, 0.17, 0.696, 0.998] // width collapse on exit
const EASE_FADE = [0.5, 0, 0.5, 1] // label in/out
const EASE_AVATAR_OUT = [0.5, 0, 1, 0.6]
const EASE_GROUP_OUT = [0.362, 0.095, 0.497, 0.933]

const EXPAND = 0.893

// Seconds, rebased so the FAB's own scale-in starts at 0 (the comp's 0.26s lead
// is `startDelay` here).
const T = {
  scaleIn: 0.89,
  avatarIn: 0.753, avatarInDelay: 0.137,
  expand: EXPAND, expandDelay: 0.99,
  // Tracks the expansion, deliberately wider than the comp's 0.442s. At 0.442
  // the text is fully opaque while EASE_ENTER is still holding the width near
  // 60, so the reveal reads as the clip edge wiping the label open rather than
  // a fade. Sharing EXPAND keeps opacity climbing for exactly as long as the
  // pill is widening, in every timer variant.
  labelIn: EXPAND,
  // Measured from the start of the expansion, per the comp: the fill begins at
  // 2.25s while the width settles at 2.143s, so the drain waits out the
  // expansion with ~107ms to spare. Without it the bar shrinks while the pill
  // is still growing, and the two motions fight.
  drainDelay: 1.0,
  collapse: 0.292,
  labelOut: 0.39,
  avatarOut: 0.298, avatarOutDelay: 0.098,
  groupOut: 0.39, groupOutDelay: 0.167,
}
const EXIT_MS = (T.groupOutDelay + T.groupOut) * 1000

/* TriggerFAB — the pill entry point. Geometry from Figma "Trigger FAB"
 * (node 3435:22433): height 60, pad-left 14, gap 12, radius 1000, 32px avatar,
 * label Inter SemiBold 14/100%. Pad-right is 24 untimed, 28 when timed.
 * Colour via c-fab-* tokens.
 *
 * Entry is staged, matching the comp: a 60px circle pops in on a *uniform*
 * scale, the avatar follows 0.137s behind it, then at +0.99s the pill widens
 * and the label fades in.
 *
 * The widening is an explicit `width` tween over a measured target — same as
 * the comp, which animates real width alongside a uniform scale. It is
 * deliberately not a framer `layout` animation: layout projection widens the
 * box by scaling it, which skews the avatar and text horizontally. Width is
 * measured from the label rather than hardcoded, since the comp's 60→327 only
 * holds for its own CTA string. Radius stays 1000 throughout, so the collapsed
 * phase is a true circle and every frame between is a clean pill.
 *
 * timer:
 *   'none'       — static pill; dismiss via the X badge.
 *   'background' — the surface drains left→right off a ghosted underlay.
 *   'hairline'   — 2px brand hairline drains over a 25% track, under the label.
 *
 * Both timers are the same left-origin scaleX drain, so they share `drain`.
 *
 * layoutId="fab-surface" morphs the pill into the Sheet on open.
 */
export default function TriggerFAB({
  ctaValue,
  timer = 'none',
  dismissTimer = 8,
  startDelay = 400,
  onOpen,
  onDismiss,
}) {
  const [entered, setEntered] = useState(false)
  // `expanded` gates the width/label stage — the comp holds the pill as a bare
  // circle for ~1s before it opens up.
  const [expanded, setExpanded] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setEntered(true), startDelay)
    const t2 = setTimeout(() => setExpanded(true), startDelay + T.expandDelay * 1000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [startDelay])

  // Measure the expanded width off the label. The label is always mounted (it
  // just sits at opacity 0 during the circle phase) and is white-space:nowrap,
  // so its width is stable regardless of what the button is currently doing.
  const labelRef = useRef(null)
  const [fullWidth, setFullWidth] = useState(null)
  const padRight = timer !== 'none' ? 28 : 24
  useLayoutEffect(() => {
    if (!labelRef.current) return
    setFullWidth(PAD_LEFT + AVATAR + GAP + labelRef.current.offsetWidth + padRight)
  }, [ctaValue, padRight])

  // Play the exit, then hand back to the flow.
  const dismiss = () => {
    if (exiting) return
    setExiting(true)
    setExpanded(false)
    setTimeout(() => onDismiss?.(), EXIT_MS)
  }

  // Auto-dismiss for the timed variants. Both the drain and this share the
  // same `drainDelay` head start, so `dismissTimer` stays honest as "how long
  // the bar takes to empty" — the pill just sits full for a beat first.
  useEffect(() => {
    if (timer === 'none' || !expanded) return
    const t = setTimeout(dismiss, (T.drainDelay + dismissTimer) * 1000)
    return () => clearTimeout(t)
  }, [timer, expanded, dismissTimer])

  // The timer layers outlive `expanded`: dismissing clears it to drive the
  // width collapse, but unmounting the drain with it would snap the surface
  // back to opaque white for a frame before the exit plays. Hold them until
  // the whole group is gone.
  const showTimer = expanded || exiting

  // Shared left-origin drain used by both timed variants.
  const drain = {
    initial: { scaleX: 1 },
    animate: { scaleX: 0 },
    transition: { duration: dismissTimer, delay: T.drainDelay, ease: 'linear' },
    style: { transformOrigin: 'left', pointerEvents: 'none' },
  }
  const timed = timer !== 'none'

  return (
    <motion.div
      // The comp's outer "Scale" node — collapses the whole group last.
      initial={{ scale: 1 }}
      animate={{ scale: exiting ? 0 : 1 }}
      transition={{ duration: T.groupOut, delay: T.groupOutDelay, ease: EASE_GROUP_OUT }}
      style={{
        position: 'fixed', bottom: 32, left: 20, zIndex: 50,
        pointerEvents: 'auto', transformOrigin: 'left bottom',
      }}
    >
      <motion.button
        layoutId="fab-surface"
        onClick={onOpen}
        initial={{ scale: 0, width: COLLAPSED }}
        animate={{
          scale: entered ? 1 : 0,
          width: expanded && fullWidth ? fullWidth : COLLAPSED,
        }}
        transition={{
          scale: { duration: T.scaleIn, ease: EASE_ENTER },
          width: exiting
            ? { duration: T.collapse, ease: EASE_COLLAPSE }
            : { duration: T.expand, ease: EASE_ENTER },
        }}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: GAP,
          height: 60, paddingLeft: PAD_LEFT, paddingRight: padRight,
          borderRadius: 1000,
          // Always opaque — the ghosted fill is a translucent overlay on top of
          // this, never the pill's own background.
          background: 'var(--c-fab-surface)',
          border: '1px solid var(--c-fab-border)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.16)',
          cursor: 'pointer', overflow: 'hidden',
        }}
      >
        {timer === 'background' && showTimer && (
          <>
            {/* Static translucent ghost, then the opaque surface drains off it. */}
            <div
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'var(--c-fab-ghosted-fill)',
              }}
            />
            <motion.div
              {...drain}
              style={{
                ...drain.style,
                position: 'absolute', inset: 0,
                background: 'var(--c-fab-surface)',
              }}
            />
          </>
        )}

        {/* position:relative keeps the avatar above the drain layer. It trails
         * the circle in by 0.137s and leads it out — the comp's "Image" track.
         * Uniform scale only, so the asset never skews. */}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: entered && !exiting ? 1 : 0 }}
          transition={exiting
            ? { duration: T.avatarOut, delay: T.avatarOutDelay, ease: EASE_AVATAR_OUT }
            : { duration: T.avatarIn, delay: T.avatarInDelay, ease: EASE_ENTER }}
          style={{ position: 'relative', display: 'flex', flexShrink: 0 }}
        >
          <EmurjAvatar size={32} />
        </motion.span>

        {/* Label wrapper is the hairline's track width — Figma scopes the timer
         * to the text, not the full pill. Always mounted so `fullWidth` stays
         * measurable; it is opacity that stages it in, and the button's
         * overflow clip that hides it during the circle phase. */}
        <motion.span
          ref={labelRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: expanded ? 1 : 0 }}
          transition={{
            duration: expanded ? T.labelIn : T.labelOut,
            ease: EASE_FADE,
          }}
          style={{
            position: 'relative', height: 36,
            display: 'flex', alignItems: 'center',
            // Never compress or wrap while the button's width is mid-tween —
            // the label rides the clip edge instead of reflowing.
            flexShrink: 0,
          }}
        >
          <span
            className="sb-button-label"
            style={{ color: 'var(--c-fab-text)', whiteSpace: 'nowrap' }}
          >
            {ctaValue}
          </span>

          {timer === 'hairline' && showTimer && (
            <span
              style={{
                position: 'absolute', left: 0, right: 0, top: 42, height: 2,
                borderRadius: 1000, overflow: 'hidden',
                background: 'color-mix(in srgb, var(--c-fab-text) 25%, transparent)',
              }}
            >
              <motion.span
                {...drain}
                style={{
                  ...drain.style,
                  position: 'absolute', inset: 0, display: 'block',
                  borderRadius: 1000,
                  background: 'var(--c-fab-hairline-timer-fill)',
                }}
              />
            </span>
          )}
        </motion.span>
      </motion.button>

      {/* X dismiss badge — the untimed variant's only way out. */}
      {timer === 'none' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: entered ? 1 : 0, scale: entered ? 1 : 0.6 }}
          transition={{ duration: 0.2, delay: 0.25 }}
          onClick={(e) => { e.stopPropagation(); dismiss() }}
          style={{
            position: 'absolute', top: -8, right: -8,
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--c-button-surface-primary)',
            border: '1.5px solid var(--surface-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', pointerEvents: 'auto', padding: 0,
          }}
        >
          <CloseIcon size={12} color="var(--c-button-text-primary)" />
        </motion.button>
      )}
    </motion.div>
  )
}
