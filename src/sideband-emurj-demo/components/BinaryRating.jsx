import { useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUpIcon, ThumbsDownIcon } from './icons'

/* BinaryRating — two 56×56 thumb buttons. Selecting one marks it active
 * (c-toggle-surface-active) and fires onRate('positive'|'negative').
 * pressed tracked on pointer down so active-pressed is exercised too.
 */
function ThumbButton({ kind, active, onRate }) {
  const [pressed, setPressed] = useState(false)
  const Icon = kind === 'positive' ? ThumbsUpIcon : ThumbsDownIcon

  const surface = active
    ? (pressed ? 'var(--c-toggle-surface-active-pressed)' : 'var(--c-toggle-surface-active)')
    : (pressed ? 'var(--c-toggle-surface-pressed)' : 'var(--c-toggle-surface-default)')
  const color = active ? 'var(--c-toggle-text-on-active)' : 'var(--c-toggle-text-default)'
  // Active states drop the hairline in favour of the filled surface.
  const border = `1.111px solid ${active ? surface : 'var(--c-button-surface-ghosted-border)'}`

  return (
    <motion.button
      onClick={() => onRate?.(kind)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      // Press dip from the comp's "Button group" track, scoped to the button
      // that was actually selected so the unpicked thumb stays put.
      animate={active ? { scale: [1, 0.9, 1] } : { scale: 1 }}
      transition={{ duration: 0.24, times: [0, 0.39, 1], ease: [0.5, 0, 0.5, 1] }}
      style={{
        width: 56, height: 56, borderRadius: 1000, boxSizing: 'border-box',
        background: surface, border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0, pointerEvents: 'auto',
        transition: 'background 0.12s ease, border-color 0.12s ease',
      }}
    >
      <Icon size={25} color={color} />
    </motion.button>
  )
}

/* PopBurst — the celebratory dot ring from the Figma comp, as the design's
 * single flattened 136×139 vector (all sixteen dots in one layer). Fills are
 * the asset's #E0E0E0 routed through currentColor so the token
 * (--surface-tertiary, ≈ that grey in the light themes) themes it.
 * Motion is the comp's `pop` track (3022:14071 timeline): scale keyframes
 * are the baked decel curve verbatim — from 0.56, where the ring hugs the
 * thumb, so the burst erupts from behind the button — and opacity holds at
 * full strength for ~80% of the run, then ducks to zero fast. The 0.09s
 * delay lands it at the bottom of the press dip.
 */
const POP_PATHS = [
  'M11.7225 47.4651C10.5636 50.598 7.08446 52.1982 3.95158 51.0394C0.818688 49.8805 -0.781574 46.4013 0.37729 43.2685C1.53615 40.1356 5.01531 38.5353 8.14819 39.6942C11.2811 40.853 12.8813 44.3322 11.7225 47.4651Z',
  'M135.103 93.1045C133.944 96.2373 130.465 97.8376 127.332 96.6787C124.199 95.5199 122.599 92.0407 123.758 88.9078C124.917 85.775 128.396 84.1747 131.529 85.3336C134.662 86.4924 136.262 89.9716 135.103 93.1045Z',
  'M97.2029 8.14819C96.0441 11.2811 92.5649 12.8813 89.4321 11.7225C86.2992 10.5636 84.6989 7.08446 85.8578 3.95158C87.0166 0.818688 90.4958 -0.781574 93.6287 0.37729C96.7615 1.53615 98.3618 5.01531 97.2029 8.14819Z',
  'M50.5154 134.364C49.3566 137.496 45.8774 139.097 42.7445 137.938C39.6117 136.779 38.0114 133.3 39.1703 130.167C40.3291 127.034 43.8083 125.434 46.9412 126.593C50.074 127.751 51.6743 131.231 50.5154 134.364Z',
  'M43.5481 13.7252C40.5134 15.1211 36.9217 13.7925 35.5259 10.7578C34.13 7.72304 35.4586 4.13136 38.4933 2.73551C41.528 1.33967 45.1197 2.66824 46.5156 5.70297C47.9114 8.73769 46.5828 12.3294 43.5481 13.7252Z',
  'M98.5202 133.239C95.4854 134.635 91.8937 133.306 90.4979 130.272C89.1021 127.237 90.4306 123.645 93.4654 122.249C96.5001 120.854 100.092 122.182 101.488 125.217C102.883 128.252 101.555 131.843 98.5202 133.239Z',
  'M131.792 46.367C128.757 47.7628 125.165 46.4343 123.769 43.3995C122.374 40.3648 123.702 36.7731 126.737 35.3773C129.772 33.9814 133.363 35.31 134.759 38.3447C136.155 41.3795 134.826 44.9712 131.792 46.367Z',
  'M9.5317 102.602C6.49697 103.998 2.90528 102.669 1.50944 99.6343C0.113591 96.5996 1.44217 93.0079 4.47689 91.6121C7.51162 90.2162 11.1033 91.5448 12.4992 94.5795C13.895 97.6143 12.5664 101.206 9.5317 102.602Z',
  'M26.2467 34.1067C25.1682 35.382 23.26 35.5415 21.9848 34.463C20.7095 33.3845 20.55 31.4764 21.6285 30.2011C22.707 28.9259 24.6151 28.7663 25.8904 29.8449C27.1657 30.9234 27.3252 32.8315 26.2467 34.1067Z',
  'M109.782 104.755C108.703 106.03 106.795 106.19 105.52 105.111C104.245 104.033 104.085 102.125 105.164 100.85C106.242 99.5743 108.15 99.4148 109.426 100.493C110.701 101.572 110.86 103.48 109.782 104.755Z',
  'M104.226 27.5894C103.148 28.8647 101.24 29.0242 99.9643 27.9457C98.689 26.8672 98.5295 24.9591 99.608 23.6838C100.687 22.4085 102.595 22.249 103.87 23.3275C105.145 24.406 105.305 26.3141 104.226 27.5894Z',
  'M31.9527 113.048C30.8742 114.323 28.9661 114.483 27.6908 113.404C26.4156 112.326 26.2561 110.418 27.3346 109.143C28.4131 107.867 30.3212 107.708 31.5964 108.786C32.8717 109.865 33.0312 111.773 31.9527 113.048Z',
  'M63.6926 17.0738C62.0282 17.2129 60.5662 15.9765 60.4271 14.3121C60.2879 12.6477 61.5244 11.1857 63.1887 11.0466C64.8531 10.9074 66.3151 12.1439 66.4543 13.8083C66.5934 15.4726 65.357 16.9347 63.6926 17.0738Z',
  'M72.8081 126.101C71.1437 126.24 69.6817 125.003 69.5425 123.339C69.4034 121.675 70.6398 120.213 72.3042 120.073C73.9686 119.934 75.4306 121.171 75.5697 122.835C75.7089 124.5 74.4724 125.962 72.8081 126.101Z',
  'M123.446 67.6055C121.781 67.7446 120.319 66.5082 120.18 64.8438C120.041 63.1794 121.277 61.7174 122.942 61.5783C124.606 61.4392 126.068 62.6756 126.207 64.34C126.346 66.0044 125.11 67.4664 123.446 67.6055Z',
  'M11.9105 76.9297C10.2461 77.0689 8.78409 75.8324 8.64496 74.1681C8.50583 72.5037 9.74228 71.0417 11.4066 70.9025C13.071 70.7634 14.533 71.9998 14.6722 73.6642C14.8113 75.3286 13.5749 76.7906 11.9105 76.9297Z',
]

function PopBurst() {
  return (
    <motion.div
      initial={{ scale: 0.56, opacity: 1 }}
      animate={{
        scale: [0.56, 0.793, 0.932, 0.987, 1.029, 1.064, 1.086, 1.096, 1.099],
        // Full strength for ~80% of the burst, then a fast duck to zero.
        opacity: [1, 1, 0],
      }}
      transition={{
        scale: {
          duration: 0.8, delay: 0.09, ease: 'linear',
          times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
        },
        opacity: { duration: 0.8, delay: 0.09, times: [0, 0.8, 1], ease: [0.5, 0, 0.5, 1] },
      }}
      style={{
        position: 'absolute', left: '50%', top: '50%', width: 0, height: 0,
        zIndex: -1,  // behind the thumb, above the sheet surface
        pointerEvents: 'none',
        color: 'var(--surface-tertiary)',
      }}
    >
      <svg
        width={136}
        height={139}
        viewBox="0 0 136 139"
        fill="none"
        style={{ position: 'absolute', left: -68, top: -69.5 }}
      >
        {POP_PATHS.map((d, i) => <path key={i} d={d} fill="currentColor" />)}
      </svg>
    </motion.div>
  )
}

export default function BinaryRating({ value, onRate }) {
  return (
    <div
      style={{
        display: 'flex', gap: 24, justifyContent: 'center',
        padding: '16px 0',  // + the input slot's own 16px bottom = 32 as drawn
      }}
    >
      {/* isolation scopes the burst's z-index:-1 to THIS wrapper — without
          it the burst resolves against the sheet overlay's stacking context
          and paints underneath the sheet's opaque surface. */}
      <div style={{ position: 'relative', isolation: 'isolate' }}>
        {value === 'positive' && <PopBurst />}
        <ThumbButton kind="positive" active={value === 'positive'} onRate={onRate} />
      </div>
      <ThumbButton kind="negative" active={value === 'negative'} onRate={onRate} />
    </div>
  )
}
