import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DefaultSheet from '../../../components/DefaultSheet'
import ControlPanel from '../../../components/ControlPanel'
import ScrollTriggerLine from '../../../components/ScrollTriggerLine'
import { THEMES } from '../../../themes'

// ─── Defaults — overwritten by "Save defaults" in the control panel ───
const BANNER_THEME          = 'lighter'
const MODAL_THEME        = 'darker'
const BANNER_SHADOW_OPACITY = 13
const BANNER_SCROLL_TRIGGER = 0
const BANNER_START_DELAY    = 700
const BANNER_ENTER_DURATION = 800
const BANNER_EXIT_DURATION  = 550
const BANNER_DISMISS_TIMER  = 10
// ──────────────────────────────────────────────────────────────────────

const EASE_IO  = [0.87, 0, 0.13, 1]
const EASE_OUT = [0.16, 1, 0.3, 1]

// ─── Inline SVGs ──────────────────────────────────────────────────────
const ThumbsUpIcon = ({ color = 'currentColor' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.9572 2.03472L7.48558 7.50632C7.12015 7.87175 6.91274 8.37546 6.91274 8.89891V18.7656C6.91274 19.852 7.80163 20.7409 8.88805 20.7409H17.7769C18.5671 20.7409 19.2782 20.2668 19.5942 19.5458L22.814 12.0298C23.6436 10.0742 22.2115 7.90138 20.0881 7.90138H14.5078L15.4461 3.37793C15.5448 2.8841 15.3967 2.38039 15.0411 2.02484C14.4584 1.452 13.53 1.452 12.9572 2.03472ZM2.96213 20.7409C4.04855 20.7409 4.93743 19.852 4.93743 18.7656V10.8643C4.93743 9.77792 4.04855 8.88904 2.96213 8.88904C1.87571 8.88904 0.986816 9.77792 0.986816 10.8643V18.7656C0.986816 19.852 1.87571 20.7409 2.96213 20.7409Z" fill={color} />
  </svg>
)

const ThumbsDownIcon = ({ color = 'currentColor' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.0599 21.1339L16.5216 15.6623C16.8871 15.2969 17.0945 14.7932 17.0945 14.2697V4.40304C17.0945 3.31662 16.2056 2.42773 15.1192 2.42773H6.24017C5.45004 2.42773 4.73893 2.90181 4.43276 3.6228L1.213 11.1388C0.373499 13.0944 1.8056 15.2672 3.92905 15.2672H9.5093L8.57103 19.7907C8.47226 20.2845 8.62041 20.7882 8.97597 21.1438C9.55868 21.7166 10.4871 21.7166 11.0599 21.1339ZM21.055 2.42773C19.9686 2.42773 19.0797 3.31662 19.0797 4.40304V12.3043C19.0797 13.3907 19.9686 14.2796 21.055 14.2796C22.1414 14.2796 23.0303 13.3907 23.0303 12.3043V4.40304C23.0303 3.31662 22.1414 2.42773 21.055 2.42773Z" fill={color} />
  </svg>
)
// ──────────────────────────────────────────────────────────────────────

function RateButton({ theme: t, onClick, children }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      animate={{
        scale: pressed ? 0.88 : 1,
        background: pressed ? t.chipBg : hovered ? t.chipBg : 'transparent',
        borderColor: pressed ? t.chipBorder : hovered ? t.chipBorder : t.chipBorder,
      }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      style={{
        width: 36, minWidth: 44, height: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${t.chipBorder}`,
        borderRadius: 18,
        cursor: 'pointer',
        padding: 0,
        outline: 'none',
      }}
    >
      {children}
    </motion.button>
  )
}

function Concept5Banner({
  theme = 'lighter',
  shadowOpacity = 13,
  startDelay = 1600,
  scrollTrigger = 0,
  enterDuration = 400,
  exitDuration = 300,
  dismissTimer = null,
  onRate,
  onDismiss,
  onContextMenu,
}) {
  const t = THEMES[theme] ?? THEMES.lighter
  const [scrollReady, setScrollReady] = useState(
    () => scrollTrigger <= 0 || window.innerHeight >= scrollTrigger
  )

  useEffect(() => {
    if (scrollTrigger <= 0 || window.innerHeight >= scrollTrigger) {
      setScrollReady(true)
      return
    }
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

  if (!scrollReady) return null

  const timerDelay = startDelay / 1000 + enterDuration / 1000

  return (
    <motion.div
      initial={{ y: 64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 64, opacity: 0, transition: { duration: exitDuration / 1000, ease: EASE_IO } }}
      transition={{ delay: startDelay / 1000, duration: enterDuration / 1000, ease: EASE_OUT }}
      onContextMenu={e => { e.preventDefault(); onContextMenu?.() }}
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: 48,
        background: t.sheetBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingLeft: 24, paddingRight: 24,
        boxShadow: `0 -4px 32px rgba(0,0,0,${(shadowOpacity / 100).toFixed(2)})`,
        zIndex: 50,
        fontFamily: 'Inter, sans-serif',
        pointerEvents: 'auto',
      }}
    >
      {/* Question text */}
      <p style={{
        margin: 0,
        fontSize: 14,
        fontWeight: 400,
        color: t.fabLabel,
        whiteSpace: 'nowrap',
      }}>
        Did you find what sizing info you needed?
      </p>

      {/* Rate buttons */}
      <div style={{ display: 'flex', gap: 4 }}>
        {[
          { Icon: ThumbsUpIcon, vote: 'up' },
          { Icon: ThumbsDownIcon, vote: 'down' },
        ].map(({ Icon, vote }) => (
          <RateButton key={vote} theme={t} onClick={() => onRate?.(vote)}>
            <Icon color={t.fabLabel} />
          </RateButton>
        ))}
      </div>

      {/* Dismiss */}
      <div style={{
        position: 'absolute',
        right: 25,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
            fontSize: 14,
            fontWeight: 400,
            color: t.body,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Not Now
        </button>

        {/* Timer line — track always visible; dark bar shrinks to 0 if dismissTimer is set */}
        <div style={{ position: 'relative', width: '100%', height: 1, marginTop: 2 }}>
          <div style={{ position: 'absolute', inset: 0, background: t.chipBorder }} />
          <motion.div
            initial={{ scaleX: 1 }}
            animate={dismissTimer ? { scaleX: 0 } : false}
            transition={dismissTimer ? { duration: dismissTimer, ease: 'linear', delay: timerDelay } : {}}
            onAnimationComplete={dismissTimer ? onDismiss : undefined}
            style={{
              position: 'absolute',
              inset: 0,
              background: t.body,
              transformOrigin: 'left',
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Concept5({ page }) {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [config, setConfig] = useState({
    fabTheme:      BANNER_THEME,
    modalTheme:    MODAL_THEME,
    shadowOpacity: BANNER_SHADOW_OPACITY,
    scrollTrigger: BANNER_SCROLL_TRIGGER,
    startDelay:    BANNER_START_DELAY,
    condenseDelay: 3000,
    morphDuration: 750,
    enterDuration: BANNER_ENTER_DURATION,
    exitDuration:  BANNER_EXIT_DURATION,
    dismissTimer:  BANNER_DISMISS_TIMER,
  })

  return (
    <>
      <AnimatePresence>
        {!open && !dismissed && (
          <Concept5Banner
            key="banner"
            theme={config.fabTheme}
            shadowOpacity={config.shadowOpacity}
            startDelay={config.startDelay}
            scrollTrigger={config.scrollTrigger}
            enterDuration={config.enterDuration}
            exitDuration={config.exitDuration}
            dismissTimer={config.dismissTimer}
            onRate={() => setOpen(true)}
            onDismiss={() => setDismissed(true)}
            onContextMenu={() => setShowPanel(true)}
          />
        )}
        {open && (
          <DefaultSheet
            key="sheet"
            theme={config.modalTheme}
            enterDelay={config.exitDuration / 2 / 1000}
            onClose={() => { setOpen(false); setDismissed(true) }}
            onNext={() => { setOpen(false); setDismissed(true) }}
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
