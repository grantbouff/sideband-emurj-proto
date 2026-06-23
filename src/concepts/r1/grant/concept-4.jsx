import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import DefaultSheet from '../../../components/DefaultSheet'
import ControlPanel from '../../../components/ControlPanel'
import ScrollTriggerLine from '../../../components/ScrollTriggerLine'
import { THEMES } from '../../../themes'

// ─── Defaults — overwritten by "Save defaults" in the control panel ───
const FAB_THEME          = 'darker'
const MODAL_THEME        = 'darker'
const FAB_SHADOW_OPACITY = 13
const FAB_SCROLL_TRIGGER = 0
const FAB_START_DELAY    = 1600
const FAB_CONDENSE_DELAY = 3000   // hold time before auto-condensing
const FAB_MORPH_DURATION = 750    // expand / condense speed
const FAB_ENTER_DURATION = 750    // radiate-in duration
const FAB_EXIT_DURATION  = 300
const FAB_DISMISS_TIMER  = null
// ──────────────────────────────────────────────────────────────────────

const EASE_IO  = [0.87, 0, 0.13, 1]
const EASE_OUT = [0.16, 1, 0.3, 1]
const sleep = ms => new Promise(r => setTimeout(r, ms))

// ─── Inline SVGs ──────────────────────────────────────────────────────
const EmurjLogo = ({ fill = '#000' }) => (
  <svg viewBox="0 0 41.0724 6.24" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: 41.6, height: 6.24, display: 'block' }}>
    <path d="M37.26 4.90286L37.987 4.98075H38.2986C38.6996 4.98075 38.9895 4.89853 39.1683 4.73409C39.3501 4.56965 39.441 4.29271 39.441 3.90325V0.411096C39.441 0.298585 39.4799 0.201942 39.5578 0.121165C39.6386 0.0403884 39.7352 0 39.8477 0H40.6526C40.7709 0 40.8704 0.0403884 40.9512 0.121165C41.032 0.201942 41.0724 0.298585 41.0724 0.411096V3.89026C41.0724 4.62879 40.8272 5.2 40.3367 5.60389C39.8463 6.00488 39.1813 6.20538 38.3418 6.20538H37.1172C37.0047 6.20538 36.908 6.16644 36.8273 6.08855C36.7494 6.00777 36.7104 5.91113 36.7104 5.79861V5.30963C36.7104 5.19712 36.7479 5.10192 36.8229 5.02402C36.9008 4.94325 36.9989 4.90286 37.1172 4.90286H37.26Z" fill={fill}/>
    <path d="M34.8341 6.01931C34.8341 6.14336 34.7605 6.20538 34.6134 6.20538H33.5748C33.4652 6.20538 33.3441 6.16644 33.2114 6.08855C33.0815 6.00777 32.982 5.91113 32.9128 5.79861L32.1771 4.64755C31.8742 4.17443 31.5078 3.93787 31.078 3.93787H30.0221V5.79861C30.0221 5.91113 29.9817 6.00777 29.9009 6.08855C29.8231 6.16644 29.7279 6.20538 29.6153 6.20538H28.8018C28.6893 6.20538 28.5927 6.16644 28.5119 6.08855C28.4311 6.00777 28.3907 5.91113 28.3907 5.79861V0.411096C28.3907 0.298585 28.4297 0.201942 28.5075 0.121165C28.5854 0.0403884 28.6806 0 28.7932 0H32.3632C33.0238 0 33.5647 0.17742 33.9859 0.532261C34.41 0.887102 34.6221 1.36599 34.6221 1.96893C34.6221 2.80843 34.0783 3.33492 32.9907 3.54841C33.1638 3.61187 33.3239 3.7215 33.471 3.87728C33.6181 4.03018 33.7869 4.25376 33.9773 4.54802L34.7649 5.79861C34.811 5.87939 34.8341 5.95296 34.8341 6.01931ZM30.0221 2.71323H31.8656C32.1627 2.71323 32.4238 2.65409 32.6488 2.53581C32.8767 2.41753 32.9907 2.22857 32.9907 1.96893C32.9907 1.70929 32.8767 1.52033 32.6488 1.40205C32.4238 1.28377 32.1627 1.22463 31.8656 1.22463H30.0221V2.71323Z" fill={fill}/>
    <path d="M19.2272 3.75179V0.411096C19.2272 0.298585 19.2661 0.201942 19.344 0.121165C19.4248 0.0403884 19.5243 0 19.6426 0H20.4518C20.5614 0 20.6566 0.0403884 20.7374 0.121165C20.8182 0.201942 20.8586 0.298585 20.8586 0.411096V3.76045C20.8586 4.18452 20.9509 4.50042 21.1355 4.70813C21.323 4.91584 21.6115 5.0197 22.001 5.0197H22.6934C23.0828 5.0197 23.3699 4.91584 23.5545 4.70813C23.742 4.50042 23.8358 4.18452 23.8358 3.76045V0.411096C23.8358 0.298585 23.8747 0.201942 23.9526 0.121165C24.0334 0.0403884 24.13 0 24.2425 0H25.0474C25.1657 0 25.2652 0.0403884 25.346 0.121165C25.4268 0.201942 25.4672 0.298585 25.4672 0.411096V3.75179C25.4672 4.54225 25.2349 5.15529 24.7705 5.5909C24.306 6.02364 23.6281 6.24 22.7366 6.24H21.9577C21.0634 6.24 20.384 6.02364 19.9195 5.5909C19.458 5.15529 19.2272 4.54225 19.2272 3.75179Z" fill={fill}/>
    <path d="M8.37597 5.78996V0.41975C8.37597 0.30147 8.41492 0.201942 8.49281 0.121165C8.5707 0.0403884 8.6659 0 8.77841 0H10.5396C10.6521 0 10.7589 0.0403884 10.8599 0.121165C10.9608 0.201942 11.0286 0.298585 11.0632 0.411096L12.3398 4.10663L13.6164 0.411096C13.651 0.298585 13.7188 0.201942 13.8197 0.121165C13.9207 0.0403884 14.0275 0 14.14 0H15.9012C16.0137 0 16.1075 0.0403884 16.1825 0.121165C16.2604 0.201942 16.2993 0.30147 16.2993 0.41975V5.78996C16.2993 5.90824 16.2589 6.00777 16.1781 6.08855C16.1002 6.16644 16.005 6.20538 15.8925 6.20538H15.1136C15.0011 6.20538 14.9045 6.16644 14.8237 6.08855C14.7458 6.00777 14.7068 5.90824 14.7068 5.78996V1.56216L13.1793 5.81592C13.1389 5.92266 13.0682 6.01498 12.9673 6.09287C12.8663 6.16788 12.7595 6.20538 12.647 6.20538H12.0282C11.9157 6.20538 11.809 6.16788 11.708 6.09287C11.6099 6.01498 11.5392 5.92266 11.496 5.81592L9.97275 1.56216V5.78996C9.97275 5.90824 9.93236 6.00777 9.85159 6.08855C9.7737 6.16644 9.67849 6.20538 9.56598 6.20538H8.78707C8.67455 6.20538 8.57791 6.16644 8.49713 6.08855C8.41636 6.00777 8.37597 5.90824 8.37597 5.78996Z" fill={fill}/>
    <path d="M0 5.78996V0.402441C0 0.289931 0.0403884 0.19473 0.121165 0.116838C0.201942 0.0389459 0.298585 0 0.411096 0H5.4005C5.51301 0 5.60821 0.0403884 5.6861 0.121165C5.76688 0.201942 5.80727 0.298585 5.80727 0.411096V0.817864C5.80727 0.930375 5.76688 1.02702 5.6861 1.1078C5.60821 1.18569 5.51301 1.22463 5.4005 1.22463H1.6314V2.48388H4.87689C4.98941 2.48388 5.08461 2.52427 5.1625 2.60505C5.24327 2.68294 5.28366 2.77814 5.28366 2.89065V3.29742C5.28366 3.40993 5.24327 3.50658 5.1625 3.58735C5.08461 3.66524 4.98941 3.70419 4.87689 3.70419H1.6314V4.98075H5.39185C5.50147 4.98075 5.59523 5.0197 5.67312 5.09759C5.75101 5.17548 5.78996 5.27068 5.78996 5.38319V5.79861C5.78996 5.91113 5.74957 6.00777 5.6688 6.08855C5.58802 6.16644 5.49137 6.20538 5.37886 6.20538H0.411096C0.298585 6.20538 0.201942 6.16644 0.121165 6.08855C0.0403884 6.00777 0 5.90824 0 5.78996Z" fill={fill}/>
  </svg>
)

const XIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path d="M1 1L7 7M7 1L1 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
// ──────────────────────────────────────────────────────────────────────

function Concept4FAB({
  theme          = 'darker',
  shadowOpacity  = 13,
  startDelay     = 0,
  scrollTrigger  = 0,
  holdDelay      = 3000,
  radiateDuration = 750,
  expandDuration  = 750,
  onOpen,
  onDismiss,
  onContextMenu,
}) {
  const t = THEMES[theme] ?? THEMES.darker

  const containerCtrl  = useAnimation()
  const ringCtrl       = useAnimation()
  const pillScaleCtrl  = useAnimation()
  const logoCtrl       = useAnimation()
  const textCtrl       = useAnimation()
  const badgeCtrl      = useAnimation()

  const [scrollReady, setScrollReady] = useState(() => window.innerHeight >= scrollTrigger)
  const cancelRef = useRef(false)

  useEffect(() => {
    if (window.innerHeight >= scrollTrigger) { setScrollReady(true); return }
    setScrollReady(false)
    const iframe = document.querySelector('iframe')
    const win = iframe?.contentWindow
    if (!win) return
    const check = () => {
      if (win.scrollY + win.innerHeight >= scrollTrigger) setScrollReady(true)
    }
    win.addEventListener('scroll', check, { passive: true })
    check()
    return () => win.removeEventListener('scroll', check)
  }, [scrollTrigger])

  useEffect(() => {
    if (!scrollReady) return
    cancelRef.current = false

    const RADIATE_S = radiateDuration / 1000
    const EXPAND_S  = expandDuration / 1000

    const run = async () => {
      // ── Set initial state (container hidden, inner elements at their small scales) ──
      containerCtrl.set({ opacity: 0, x: 0, width: 68 })
      ringCtrl.set({ scale: 0, opacity: 1 })
      pillScaleCtrl.set({ scale: 0 })
      logoCtrl.set({ scale: 0, width: 64, height: 64, x: 0, y: 0 })
      textCtrl.set({ opacity: 0 })
      badgeCtrl.set({ opacity: 0, y: 20 })

      await sleep(startDelay)
      if (cancelRef.current) return

      // Make container visible right as the radiate starts
      containerCtrl.set({ opacity: 1 })

      // ── Phase 1: Radiate in — ring leads, bg second, logo third ───────────
      // Ring: expands to full size then fades away
      ringCtrl.start({
        scale: 1.0,
        opacity: 0,
        transition: {
          scale:   { duration: RADIATE_S, ease: EASE_OUT },
          opacity: { duration: RADIATE_S * 0.35, delay: RADIATE_S * 0.65, ease: 'linear' },
        },
      })
      // Black background: starts slightly behind the ring
      pillScaleCtrl.start({
        scale: 1.0,
        transition: { duration: RADIATE_S, delay: RADIATE_S * 0.08, ease: EASE_OUT },
      })
      // Logo circle: starts slightly behind the background
      logoCtrl.start({
        scale: 1.0,
        transition: { duration: RADIATE_S, delay: RADIATE_S * 0.15, ease: EASE_OUT },
      })

      await sleep(radiateDuration)
      if (cancelRef.current) return

      // ── Phase 2: 250 ms pause — settled as condensed pill ─────────────────
      await sleep(250)
      if (cancelRef.current) return

      // ── Phase 3: Expand (C3's condense reversed, anchored at left:16) ─────
      // No x translation needed — FAB is already at its final left position
      containerCtrl.start({ width: 314, transition: { duration: EXPAND_S, ease: EASE_IO } })
      logoCtrl.start({ width: 48, height: 48, x: 8, y: 8, scale: [1, 1.07, 1], transition: { duration: EXPAND_S, ease: EASE_IO } })
      textCtrl.start({ opacity: 1, transition: { duration: 0.375, delay: EXPAND_S * 0.35, ease: EASE_IO } })
      badgeCtrl.start({
        opacity: 1, y: 0,
        transition: { duration: EXPAND_S * 0.5, delay: EXPAND_S * 0.5, ease: EASE_IO },
      })

      await sleep(expandDuration)
      if (cancelRef.current) return

      // ── Phase 4: Hold ──────────────────────────────────────────────────────
      await sleep(holdDelay)
      if (cancelRef.current) return

      // ── Phase 5: Condense (same as C3) ────────────────────────────────────
      containerCtrl.start({ width: 68, transition: { duration: EXPAND_S, ease: EASE_IO } })
      logoCtrl.start({ width: 64, height: 64, x: 0, y: 0, scale: [1, 0.93, 1], transition: { duration: EXPAND_S, ease: EASE_IO } })
      textCtrl.start({ opacity: 0, transition: { duration: 0.3, ease: EASE_IO } })
    }

    run()
    return () => { cancelRef.current = true }
  }, [scrollReady])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={containerCtrl}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      style={{
        position: 'fixed', bottom: 32, left: 16,
        height: 68, zIndex: 50, pointerEvents: 'auto',
      }}
      onContextMenu={e => { e.preventDefault(); onContextMenu?.() }}
    >
      {/* Ring — radiates out ahead of the pill, then fades away */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={ringCtrl}
        style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '1.5px solid rgba(0,0,0,0.18)',
          pointerEvents: 'none', zIndex: 4,
        }}
      />

      {/* Black pill — scales in during radiate, expands via container width after */}
      <motion.button
        initial={{ scale: 0 }}
        animate={pillScaleCtrl}
        style={{
          position: 'absolute', inset: 0,
          background: t.fabBg, border: 'none', borderRadius: 34,
          overflow: 'hidden', cursor: 'pointer',
          boxShadow: `0 4px 32px rgba(0,0,0,${(shadowOpacity / 100).toFixed(2)})`,
        }}
        onClick={onOpen}
      >
        <motion.p
          animate={textCtrl}
          style={{
            position: 'absolute', left: 70, top: '50%',
            transform: 'translateY(-50%)',
            margin: 0, fontFamily: 'Inter, sans-serif',
            fontSize: 14, fontWeight: 600, color: t.fabLabel,
            whiteSpace: 'nowrap', pointerEvents: 'none',
          }}
        >
          Do the new arrivals interest you?
        </motion.p>
      </motion.button>

      {/* Logo circle — scales in last, then shrinks slightly during expand */}
      <motion.div
        initial={{ scale: 0 }}
        animate={logoCtrl}
        style={{
          position: 'absolute', left: 2, top: 2,
          borderRadius: '50%', background: '#FFFFFF',
          overflow: 'hidden', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 2, pointerEvents: 'none',
        }}
      >
        <EmurjLogo fill="#000000" />
      </motion.div>

      {/* Dismiss badge — flies in during expand, follows right edge via CSS right:-10 */}
      <motion.div
        animate={badgeCtrl}
        style={{
          position: 'absolute', right: -10, top: -12,
          width: 20, height: 20, zIndex: 3,
        }}
      >
        <button
          style={{
            position: 'absolute', inset: 0,
            background: t.badgeBg, border: `1.5px solid ${t.badgeBorder}`,
            borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={e => { e.stopPropagation(); onDismiss?.() }}
        >
          <XIcon />
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Concept4({ page }) {
  const [open, setOpen] = useState(false)
  const [fabDismissed, setFabDismissed] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [config, setConfig] = useState({
    fabTheme:      FAB_THEME,
    modalTheme:    MODAL_THEME,
    shadowOpacity: FAB_SHADOW_OPACITY,
    scrollTrigger: FAB_SCROLL_TRIGGER,
    startDelay:    FAB_START_DELAY,
    condenseDelay: FAB_CONDENSE_DELAY,   // maps to holdDelay
    morphDuration: FAB_MORPH_DURATION,   // maps to expandDuration
    enterDuration: FAB_ENTER_DURATION,   // maps to radiateDuration
    exitDuration:  FAB_EXIT_DURATION,
    dismissTimer:  FAB_DISMISS_TIMER,
  })

  return (
    <>
      <AnimatePresence>
        {!open && !fabDismissed && (
          <Concept4FAB
            key="fab"
            theme={config.fabTheme}
            shadowOpacity={config.shadowOpacity}
            scrollTrigger={config.scrollTrigger}
            startDelay={config.startDelay}
            holdDelay={config.condenseDelay}
            radiateDuration={config.enterDuration}
            expandDuration={config.morphDuration}
            onOpen={() => setOpen(true)}
            onDismiss={() => setFabDismissed(true)}
            onContextMenu={() => setShowPanel(true)}
          />
        )}
        {open && (
          <DefaultSheet
            key="sheet"
            theme={config.modalTheme}
            onClose={() => { setOpen(false); setFabDismissed(true) }}
            onNext={() => { setOpen(false); setFabDismissed(true) }}
          />
        )}
      </AnimatePresence>
      {showPanel && (
        <>
          <ScrollTriggerLine
            value={config.scrollTrigger}
            onChange={v => setConfig(c => ({ ...c, scrollTrigger: v }))}
          />
          <ControlPanel
            config={config}
            onChange={setConfig}
            onClose={() => setShowPanel(false)}
          />
        </>
      )}
    </>
  )
}
