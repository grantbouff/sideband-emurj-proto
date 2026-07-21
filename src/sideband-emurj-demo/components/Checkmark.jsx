import { motion } from 'framer-motion'
import { CheckIcon } from './icons'

/* Checkmark — end-state media. A 120px halo of text-primary at 5% with a 66px
 * disc of text-primary centred in it, check drawn in the inverted text colour.
 */
export default function Checkmark({ size = 120 }) {
  const disc = size * 0.55  // 66 of 120, per the Figma component

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: disc, height: disc, borderRadius: '50%',
        background: 'var(--text-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CheckIcon size={disc * 0.5} color="var(--text-inverted)" />
      </div>
    </motion.div>
  )
}
