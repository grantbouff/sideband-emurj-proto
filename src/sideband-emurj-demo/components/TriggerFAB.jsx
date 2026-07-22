import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { EmurjAvatar, CloseIcon } from './icons'

// Geometry, per Figma. COLLAPSED is the circle phase: 60 wide, 60 tall.
const COLLAPSED = 60
const PAD_LEFT = 10
const AVATAR = 40
const GAP = 10

/* Motion from the Figma "Trigger FAB" timeline (node 3247:7309). That comp is a
 * 10s loop, so only the curves and the offsets *within* entry/exit are taken
 * from it — the hold length is `dismissTimer`, not the comp's 7s.
 */
const EASE_ENTER = [0.649, 0.058, 0.125, 1] // FAB + avatar scale-in, width expand
const EASE_COLLAPSE = [0.678, 0.17, 0.696, 0.998] // width collapse on exit
const EASE_FADE = [0.5, 0, 0.5, 1] // label in/out
const EASE_AVATAR_OUT = [0.5, 0, 1, 0.6]
const EASE_GROUP_OUT = [0.362, 0.095, 0.497, 0.933]
// Hairline track grow-in, from the hairline comp (node 3579:3082).
const EASE_TIMER_IN = [0.65, 0.06, 0.207, 0.986]
// X badge pop-in, from the dismiss comp (node 3655:18908).
const EASE_CLOSE_IN = [0, 0.6, 0, 1]

const EXPAND = 0.893

// Same shadow, alpha 0 — keeping every other component identical lets framer
// tween it as a pure opacity fade instead of interpolating geometry.
const SHADOW = '0 4px 32px rgba(0,0,0,0.16)'
const SHADOW_NONE = '0 4px 32px rgba(0,0,0,0)'

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
  // Hairline track entry, per the hairline comp (3579:3082): it trails the
  // expansion by 0.114s and grows left→right while the pill is still
  // widening, finishing at +0.894 — inside drainDelay's 1.0s, so the drain
  // never starts on a half-grown track.
  timerIn: 0.78, timerInDelay: 0.114, timerFadeIn: 0.587,
  // X badge pop, per the dismiss comp (3655:18908): it enters 0.442s after the
  // expansion starts — the moment the comp's label fade completes — so its
  // 0.497s pop lands right as the width settles. Delay is from `expanded`,
  // not entry, to keep that anchoring.
  closeIn: 0.497, closeInDelay: 0.442,
  labelOut: 0.39,
  avatarOut: 0.298, avatarOutDelay: 0.098,
  groupOut: 0.39, groupOutDelay: 0.167,
}
const EXIT_MS = (T.groupOutDelay + T.groupOut) * 1000

/* TriggerFAB — the pill entry point. Geometry from Figma "Trigger FAB"
 * (node 3435:22433): height 60, pad-left 10, gap 10, radius 1000, 40px avatar,
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
 *   'hairline'   — 2px brand hairline drains over a 15% track, under the label.
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

  // The timer layers outlive `expanded`: dismissing clears it to drive the
  // width collapse, but unmounting the drain with it would snap the surface
  // back to opaque white for a frame before the exit plays. Hold them until
  // the whole group is gone.
  const showTimer = expanded || exiting

  // Shared left-origin drain used by both timed variants — a CSS animation
  // (theme/motion.css) so hovering the pill pauses it. Its completion IS the
  // auto-dismiss: `animationend` fires dismiss, so a paused drain pauses the
  // timer by construction. `drainDelay` keeps `dismissTimer` honest as "how
  // long the bar takes to empty" — the pill sits full for a beat first.
  const drain = {
    className: 'sb-timer-drain',
    onAnimationEnd: (e) => { if (e.animationName === 'sb-drain') dismiss() },
    style: {
      animationDuration: `${dismissTimer}s`,
      animationDelay: `${T.drainDelay}s`,
      pointerEvents: 'none',
    },
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
        pointerEvents: 'auto',
        // Exit anchor, per the motion comp (node 3379:8284): the width collapse
        // condenses the pill leftward (a width tween on a left-anchored box —
        // no transform, so no origin applies), then the group scale shrinks
        // what's left — the 60px circle — into the avatar's own center, 30px in
        // (pad 10 + 40px avatar / 2) and mid-height. Pinning the origin there
        // makes the left-anchored condense hand off to a logo-centered
        // scale-down with no origin jump; the comp fakes this with a wrapper
        // div scaled about its (post-collapse) center.
        transformOrigin: `${PAD_LEFT + AVATAR / 2}px 50%`,
      }}
    >
      <motion.button
        layoutId="fab-surface"
        className="sb-timer-hover-scope"
        onClick={onOpen}
        initial={{ scale: 0, width: COLLAPSED, boxShadow: SHADOW }}
        animate={{
          scale: entered ? 1 : 0,
          width: expanded && fullWidth ? fullWidth : COLLAPSED,
          // The shadow fades over the whole exit rather than riding the
          // scale to 0 — a full-strength shadow on a shrinking circle reads
          // as a dark blob chasing the logo out.
          boxShadow: exiting ? SHADOW_NONE : SHADOW,
        }}
        transition={{
          scale: { duration: T.scaleIn, ease: EASE_ENTER },
          width: exiting
            ? { duration: T.collapse, ease: EASE_COLLAPSE }
            : { duration: T.expand, ease: EASE_ENTER },
          boxShadow: { duration: T.groupOutDelay + T.groupOut, ease: EASE_FADE },
        }}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: GAP,
          // Figma's insets are from the visual edge — its stroke takes no
          // layout space — so the 1px border eats into each pad here. With the
          // full 10px the avatar centers at x=31 in the 60px circle phase, and
          // the logo reads 1px right of center while the FAB scales in.
          height: 60, paddingLeft: PAD_LEFT - 1, paddingRight: padRight - 1,
          // 30, not 1000: for a 60-high box they render identically (radius
          // clamps at half-height), but the layoutId morph tweens the
          // *declared* value to the Sheet's 32 — from 1000 the corners stay
          // capsule-clamped for most of the morph, then snap. 30→32 is clean.
          borderRadius: COLLAPSED / 2,
          // Always opaque — the ghosted fill is a translucent overlay on top of
          // this, never the pill's own background.
          background: 'var(--c-fab-surface)',
          border: '1px solid var(--c-fab-border)',
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
            <div
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
          <EmurjAvatar size={40} />
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
            // Track + full fill grow in together as one unit — the comp's
            // "Timer" node: scaleX 0→1 from the left edge with its own ease,
            // opacity fading in over a shorter span. Mounts at `expanded`, so
            // the delay is measured from the start of the pill's expansion.
            <motion.span
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                scaleX: { duration: T.timerIn, delay: T.timerInDelay, ease: EASE_TIMER_IN },
                opacity: { duration: T.timerFadeIn, delay: T.timerInDelay, ease: EASE_FADE },
              }}
              style={{
                position: 'absolute', left: 0, right: 0, top: 42, height: 2,
                borderRadius: 1000, overflow: 'hidden',
                transformOrigin: 'left',
                background: 'color-mix(in srgb, var(--c-fab-text) 15%, transparent)',
              }}
            >
              <span
                {...drain}
                style={{
                  ...drain.style,
                  position: 'absolute', inset: 0, display: 'block',
                  borderRadius: 1000,
                  background: 'var(--c-fab-hairline-timer-fill)',
                }}
              />
            </motion.span>
          )}
        </motion.span>
      </motion.button>

      {/* X dismiss badge — the untimed variant's only way out. Per the refined
       * spec it tucks into the pill's top-right corner (top 0, right 2): an
       * 18px disc — 14px glyph in 2px padding — filled with c-fab-text, no
       * border. */}
      {timer === 'none' && (
        <motion.button
          // Pure scale pop from 0 (no opacity track in the comp), gated on
          // `expanded` — the badge belongs to the pill phase, not the circle.
          // On exit it ducks out fast and ungated so no stray X rides the
          // width collapse.
          initial={{ scale: 0 }}
          animate={{ scale: expanded && !exiting ? 1 : 0 }}
          transition={exiting
            ? { duration: 0.2, ease: EASE_FADE }
            : { duration: T.closeIn, delay: T.closeInDelay, ease: EASE_CLOSE_IN }}
          onClick={(e) => { e.stopPropagation(); dismiss() }}
          style={{
            position: 'absolute', top: 0, right: 2,
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--c-fab-text)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', pointerEvents: 'auto', padding: 2,
          }}
        >
          <CloseIcon size={14} color="var(--c-fab-surface)" />
        </motion.button>
      )}
    </motion.div>
  )
}
