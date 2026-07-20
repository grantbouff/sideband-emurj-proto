import { motion } from 'framer-motion'
import { CheckIcon } from './icons'

/* Checkmark — end-state celebrate media. Circle in element-celebrate-accent-01
 * with the check drawn in element-celebrate-accent-02.
 */
export default function Checkmark({ size = 80 }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'var(--element-celebrate-accent-01)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <CheckIcon size={size * 0.45} color="var(--element-celebrate-accent-02)" />
    </motion.div>
  )
}
