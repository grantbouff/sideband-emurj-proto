/* Rated interstitial timing — the one knob.
 *
 * INTERSTITIAL_HOLD is how long (seconds, from the snack bar tap) the rated
 * interstitial stays up before it morphs into the question card. The comp's
 * value is 1.755s (Figma 4835:30279: 2.263s tap → 4.018s exit).
 *
 * Read by FlowRunner (when to clear the interstitial) and Sheet (the scrim's
 * fade is timed to land as the card finishes growing). Keep it at or above
 * ~1.4s: the thumb's wind-up-and-settle in RatedInterstitial runs 1.382s, and
 * a shorter hold starts the morph before the thumb has come to rest.
 */
export const INTERSTITIAL_HOLD = 1.755
