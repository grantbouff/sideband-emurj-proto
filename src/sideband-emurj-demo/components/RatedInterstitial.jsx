import { motion } from 'framer-motion'
import { ThumbsUpIcon, ThumbsDownIcon } from './icons'

/* RatedInterstitial — the small sheet's content between rating from an
 * in-page entry (snack bar) and the full question card. Per the interstitial
 * comp (Figma 4835:30279, "interstitial message" 4835:30319): the picked
 * thumb as a 56px active badge on a 94px halo, then the rated message at
 * 22/120%.
 *
 * Timings are the comp's, rebased so 0 is the tap (comp t=2.263s):
 *   badge group   scale 0.5→1           0 → 0.504
 *   thumb         rotate 25→−10→−8→0    0 → 1.382 (wind-up, overshoot, settle)
 *   halo          holds at 5% (the comp fades it out; kept, per review)
 *   text          y 16→0                0 → 0.504
 * The sheet surface fades itself in around this (see Sheet `interstitial`).
 */
const EASE_IN_OUT = [0.5, 0, 0.5, 1]

export default function RatedInterstitial({ kind, message }) {
  const Icon = kind === 'negative' ? ThumbsDownIcon : ThumbsUpIcon
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        // 30 = the comp's 22 message inset + the badge group's 8; 7 closes
        // the 219.5 card height under the text block's own 24.
        padding: '30px 1px 7px',
      }}
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.504, ease: EASE_IN_OUT }}
        style={{
          position: 'relative', width: 94, height: 94, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Halo — text-primary at 5%, scaling in with the group. */}
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: 1000,
            background: 'var(--text-primary)', opacity: 0.05,
          }}
        />
        <motion.div
          initial={{ rotate: 25 }}
          animate={{ rotate: [25, -10, -8, 0] }}
          transition={{
            duration: 1.382,
            times: [0, 0.4595, 0.5384, 1],
            ease: [[0.834, 0.105, 0.395, 0.93], EASE_IN_OUT, [0.389, 0.196, 0.456, 0.88]],
          }}
          style={{
            position: 'relative', width: 56, height: 56, borderRadius: 1000,
            background: 'var(--c-toggle-surface-active)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon size={24} color="var(--c-toggle-text-on-active)" />
        </motion.div>
      </motion.div>

      {/* Tucks 8px up under the badge group, as drawn. */}
      <motion.div
        initial={{ y: 16 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.504, ease: [0.363, 0.021, 0.34, 0.962] }}
        style={{
          marginTop: -8, padding: '20px 16px 24px', width: '100%',
          boxSizing: 'border-box', textAlign: 'center',
        }}
      >
        <h2
          className="sb-heading-interstitial"
          style={{ margin: 0, color: 'var(--text-primary)', textWrap: 'balance' }}
        >
          {message}
        </h2>
      </motion.div>
    </div>
  )
}
