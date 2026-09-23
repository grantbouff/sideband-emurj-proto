import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { EmurjAvatar, CloseIcon } from './icons'
import BinaryRatingNative from './BinaryRatingNative'
import { EASE_ENTER, EASE_FADE, EASE_CLOSE_IN, T } from './fabMotion'

/* Snackbar — the "Snackbar Native" entry point (Figma 4455:14466).
 *
 * Reads like the TriggerFAB pill but behaves differently: the bar itself is a
 * plain container, not a button. The only interactive parts are the two
 * thumbs, and rating from them is what opens the flow. Per the interstitial
 * comp (Figma 4835:30279, drawn on the bottom bar): the tap fires `onRate` at
 * once — the rated interstitial sheet appears over the page — and the bar
 * doesn't morph or light a thumb; it silently fades out in place, then calls
 * `onFaded` so the flow can unmount it.
 *
 * Geometry per Figma: 64 tall, 10 pad, 10 gap, 40 avatar, CTA at Button Label
 * (14/1.4/600) taking the leftover width and wrapping to two lines, then a
 * 4-gap pair of 44px Filled thumbs. Drop shadow 0 4 40 @ 20%. Hugs its
 * content on desktop (capped at the component's 364); full width less the
 * 16 gutters on mobile.
 *
 * entrance:
 *   'expand' — the TriggerFAB's staged entry, on its exact timings
 *              (fabMotion): a 64px circle scales in, the avatar follows, then
 *              the bar widens left→right, the CTA fading in behind the clip
 *              edge and the thumbs popping in at the far end as it lands.
 *   'rise'   — the whole bar rises 24px and fades in.
 * The content row is laid out at the bar's final width from the start and
 * clipped by the widening surface, so nothing re-wraps mid-expansion.
 *
 * timer (Figma `Timer?`):
 *   'none'       — static; dismiss via the X badge.
 *   'background' — the surface drains left→right off a ghosted underlay.
 *   'hairline'   — 2px brand hairline drains under the CTA.
 * Both drains are the shared sb-timer-drain, so hovering the bar pauses them
 * and the drain's animationend IS the auto-dismiss.
 */

const EASE_OUT = [0.55, 0, 0.55, 0.2]
const EXIT_MS = 320
// The post-rating fade, from the comp's bar track (2.644→3.217s against a
// 2.263s tap): it waits for the interstitial to land, then goes.
const RATED_FADE = { delay: 0.381, duration: 0.573, ease: [0.076, 0.296, 0.5, 1] }
// 'rise' entrance — borrowed from the bar's rise in the interstitial comp
// (4835:30281: 0.745s on the FAB's enter curve). Opacity runs shorter on a
// plain ease-in-out so the bar is solid before it finishes settling.
const RISE = {
  y: { duration: 0.745, ease: EASE_ENTER },
  opacity: { duration: 0.5, ease: EASE_FADE },
}
// 'rise' starts its drain from mount; 'expand' from the widening (T.drainDelay).
const RISE_DRAIN_DELAY = 0.8
// Thumbs pop in one after the other, this far apart.
const THUMB_STAGGER = 0.06

// Geometry. The circle phase is the full 64 height; the fixed chrome is
// everything in the row but the CTA: pads 10+10, avatar 40, two 10 gaps,
// thumbs 44+4+44.
const HEIGHT = 64
const AVATAR = 40
const CHROME = 10 + AVATAR + 10 + 10 + 92 + 10
const DESKTOP_MAX = 364

export default function Snackbar({
  question,
  timer = 'background',
  dismissTimer = 8,
  startDelay = 400,
  entrance = 'expand',
  onRate,
  onFaded,
  onDismiss,
}) {
  const expandIn = entrance === 'expand'
  const [entered, setEntered] = useState(false)
  // Gates the width/CTA/thumbs stage; 'rise' is expanded from the start.
  const [expanded, setExpanded] = useState(!expandIn)
  // Once the entrance has landed, width changes (window resize) apply
  // instantly rather than replaying the 0.9s expansion.
  const [settled, setSettled] = useState(!expandIn)
  const [exiting, setExiting] = useState(false)
  const [rated, setRated] = useState(null)

  const [vw, setVw] = useState(() => window.innerWidth)
  useEffect(() => {
    const fn = () => setVw(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  const isWide = vw > 768

  useEffect(() => {
    const t1 = setTimeout(() => setEntered(true), startDelay)
    const t2 = expandIn && setTimeout(() => setExpanded(true), startDelay + T.expandDelay * 1000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [startDelay, expandIn])

  // The bar's final width: hug the CTA on one line up to the component's 364,
  // or span the viewport less the 16 gutters on mobile. The CTA's one-line
  // width comes off a hidden nowrap twin, watched with a ResizeObserver: the
  // first pass can land on the fallback face, and `document.fonts.ready` can
  // resolve before Inter has even been requested, so we re-measure whenever
  // the twin's width actually changes (i.e. when the real face swaps in).
  const measureRef = useRef(null)
  const [textW, setTextW] = useState(0)
  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return
    const measure = () => setTextW(el.getBoundingClientRect().width)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [question])
  const fullWidth = isWide
    ? Math.min(Math.ceil(textW) + CHROME, DESKTOP_MAX, vw - 32)
    : vw - 32

  const dismiss = () => {
    if (exiting || rated) return
    setExiting(true)
    setTimeout(() => onDismiss?.(), EXIT_MS)
  }

  const rate = (kind) => {
    if (rated || exiting) return
    setRated(kind)
    onRate?.(kind)
  }

  // Rating freezes the countdown where it stands — the bar is fading out under
  // the interstitial and must not fire its own dismiss on the way. The timer
  // layers mount with `expanded`, so the delay counts from the widening.
  const drain = {
    className: 'sb-timer-drain',
    onAnimationEnd: (e) => { if (e.animationName === 'sb-drain') dismiss() },
    style: {
      animationDuration: `${dismissTimer}s`,
      animationDelay: `${expandIn ? T.drainDelay : RISE_DRAIN_DELAY}s`,
      ...(rated ? { animationPlayState: 'paused' } : null),
      pointerEvents: 'none',
    },
  }

  // Wrapper states. 'expand' pops the whole group in on a uniform scale from
  // the circle's centre; 'rise' lifts and fades. Exit and the rated fade are
  // shared.
  const base = expandIn ? { scale: 1, opacity: 1, y: 0 } : { opacity: 1, y: 0 }
  const wrapperAnimate = exiting
    ? { ...base, opacity: 0, y: 16 }
    : rated ? { ...base, opacity: 0 } : base
  const wrapperTransition = exiting
    ? { duration: EXIT_MS / 1000, ease: EASE_OUT }
    : rated ? RATED_FADE
      : expandIn ? { scale: { duration: T.scaleIn, ease: EASE_ENTER } } : RISE

  // Staged pieces only animate for 'expand'; for 'rise' they start in place.
  const stage = (from, to, transition) => (expandIn
    ? { initial: from, animate: expanded ? to : from, transition }
    : { initial: false, animate: to })

  return (
    <>
      {/* One-line width probe for the CTA. */}
      <span
        ref={measureRef}
        aria-hidden
        className="sb-snackbar-label"
        style={{
          position: 'fixed', left: -9999, top: 0,
          visibility: 'hidden', whiteSpace: 'nowrap', pointerEvents: 'none',
        }}
      >
        {question}
      </span>

      {entered && (
        <motion.div
          initial={expandIn ? { scale: 0, opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          animate={wrapperAnimate}
          transition={wrapperTransition}
          onAnimationComplete={() => { if (rated) onFaded?.() }}
          style={{
            position: 'fixed', bottom: 16, left: 16, zIndex: 50,
            pointerEvents: 'none',
            // Scale from the circle's centre, so it pops in round.
            transformOrigin: `${HEIGHT / 2}px 50%`,
          }}
        >
          <motion.div
            role="group"
            aria-label={question}
            className="sb-timer-hover-scope"
            initial={false}
            animate={{ width: expanded ? fullWidth : HEIGHT }}
            transition={settled ? { duration: 0 } : { duration: T.expand, ease: EASE_ENTER }}
            onAnimationComplete={() => { if (expanded) setSettled(true) }}
            style={{
              position: 'relative', boxSizing: 'border-box',
              height: HEIGHT,
              // 32 = half the height: a circle while collapsed, a pill after.
              borderRadius: HEIGHT / 2,
              background: 'var(--c-fab-bar-surface)',
              border: '1px solid var(--c-fab-bar-border)',
              boxShadow: '0 4px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              // Once rated the bar is on its way out; the page takes clicks again.
              pointerEvents: rated ? 'none' : 'auto',
            }}
          >
            {timer === 'background' && expanded && (
              <>
                <div
                  style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'var(--c-fab-bar-ghosted-fill)',
                  }}
                />
                <div
                  {...drain}
                  style={{
                    ...drain.style,
                    position: 'absolute', inset: 0,
                    background: 'var(--c-fab-bar-surface)',
                  }}
                />
              </>
            )}

            {/* Content row at its final width, left-anchored and clipped by
                the widening surface. Figma's 10 pad is from the visual edge;
                the 1px border eats in. In the circle phase it sits 2px right
                so the 40 avatar centres in the 64 circle, easing home as the
                bar widens. */}
            <motion.div
              {...stage({ x: 2 }, { x: 0 }, { duration: T.expand, ease: EASE_ENTER })}
              style={{
                position: 'relative', boxSizing: 'border-box',
                width: fullWidth - 2, height: HEIGHT - 2, padding: 9,
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <motion.span
                initial={expandIn ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                transition={{ duration: T.avatarIn, delay: T.avatarInDelay, ease: EASE_ENTER }}
                style={{ display: 'flex', flexShrink: 0 }}
              >
                <EmurjAvatar size={AVATAR} />
              </motion.span>

              {/* Stretched to the full bar height so the hairline can sit on
                  the bar's bottom edge (6 up, per Figma) whether the CTA runs
                  one line or two; the text itself stays vertically centred.
                  Opacity tracks the widening, as on the FAB's label. */}
              <motion.div
                {...stage({ opacity: 0 }, { opacity: 1 }, { duration: T.labelIn, ease: EASE_FADE })}
                style={{
                  position: 'relative', flex: '1 1 auto', minWidth: 0,
                  alignSelf: 'stretch', margin: '-9px 0',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <p
                  className="sb-snackbar-label"
                  style={{ margin: 0, color: 'var(--c-fab-bar-text)', overflowWrap: 'break-word' }}
                >
                  {question}
                </p>

                {timer === 'hairline' && expanded && (
                  <span
                    style={{
                      position: 'absolute', left: 1, right: 3, bottom: 5, height: 2,
                      borderRadius: 1000, overflow: 'hidden', pointerEvents: 'none',
                      background: 'color-mix(in srgb, var(--c-fab-bar-text) 15%, transparent)',
                    }}
                  >
                    <span
                      {...drain}
                      style={{
                        ...drain.style,
                        position: 'absolute', inset: 0, display: 'block',
                        borderRadius: 1000,
                        background: 'var(--c-fab-bar-hairline-timer-fill)',
                      }}
                    />
                  </span>
                )}
              </motion.div>

              {/* No active state here: the comp shows the rating in the
                  interstitial's badge, while the bar's thumb just presses and
                  releases. On 'expand' each thumb pops in on the FAB's X-badge
                  timing — landing as the width settles — a beat apart. */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {['positive', 'negative'].map((kind, i) => (
                  <motion.div
                    key={kind}
                    {...stage({ scale: 0 }, { scale: 1 }, {
                      duration: T.closeIn,
                      delay: T.closeInDelay + i * THUMB_STAGGER,
                      ease: EASE_CLOSE_IN,
                    })}
                    style={{ display: 'flex' }}
                  >
                    <BinaryRatingNative kind={kind} disabled={!!rated} onRate={rate} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* X dismiss badge — the untimed variant's only way out. Figma parks
              it off the top-left corner (x −2, y −12): an 18px c-fab-bar/text
              disc with the glyph in c-fab-bar/surface. Outside the surface so
              its overflow clip can't cut it. Pops in with the bar's pill phase. */}
          {timer === 'none' && !rated && (
            <motion.button
              type="button"
              aria-label="Dismiss"
              onClick={dismiss}
              {...stage({ scale: 0 }, { scale: 1 }, {
                duration: T.closeIn, delay: T.closeInDelay, ease: EASE_CLOSE_IN,
              })}
              style={{
                position: 'absolute', top: -12, left: -2,
                width: 18, height: 18, borderRadius: '50%', padding: 2,
                background: 'var(--c-fab-bar-text)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', pointerEvents: 'auto',
              }}
            >
              <CloseIcon size={14} color="var(--c-fab-bar-surface)" />
            </motion.button>
          )}
        </motion.div>
      )}
    </>
  )
}
