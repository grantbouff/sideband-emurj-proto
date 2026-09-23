/* Shared FAB motion — the TriggerFAB's timeline, in its own module so the
 * Snackbar's FAB-style entrance runs on exactly the same values.
 */

/* Motion from the Figma "Trigger FAB" timeline (node 3247:7309). That comp is a
 * 10s loop, so only the curves and the offsets *within* entry/exit are taken
 * from it — the hold length is `dismissTimer`, not the comp's 7s.
 */
export const EASE_ENTER = [0.649, 0.058, 0.125, 1] // FAB + avatar scale-in, width expand
export const EASE_COLLAPSE = [0.678, 0.17, 0.696, 0.998] // width collapse on exit
export const EASE_FADE = [0.5, 0, 0.5, 1] // label in/out
export const EASE_AVATAR_OUT = [0.5, 0, 1, 0.6]
export const EASE_GROUP_OUT = [0.362, 0.095, 0.497, 0.933]
// Hairline track grow-in, from the hairline comp (node 3579:3082).
export const EASE_TIMER_IN = [0.65, 0.06, 0.207, 0.986]
// X badge pop-in, from the dismiss comp (node 3655:18908).
export const EASE_CLOSE_IN = [0, 0.6, 0, 1]

export const EXPAND = 0.893

// Same shadow, alpha 0 — keeping every other component identical lets framer
// tween it as a pure opacity fade instead of interpolating geometry.
export const SHADOW = '0 4px 32px rgba(0,0,0,0.16)'
export const SHADOW_NONE = '0 4px 32px rgba(0,0,0,0)'

// Seconds, rebased so the FAB's own scale-in starts at 0 (the comp's 0.26s lead
// is `startDelay` here).
export const T = {
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
