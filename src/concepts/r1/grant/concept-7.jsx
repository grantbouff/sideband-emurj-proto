import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DefaultSheet from '../../../components/DefaultSheet'
import ScrollTriggerLine from '../../../components/ScrollTriggerLine'
import '../../../components/ControlPanel.css'
import { THEMES } from '../../../themes'
import { loadConceptConfig, saveConceptConfig, currentConcept } from '../../../components/conceptConfig'

// ─── Defaults ─────────────────────────────────────────────────────────
const WIDGET_THEME    = 'darker'
const MODAL_THEME        = 'darker'
const SHADOW_OPACITY  = 40
const SCROLL_TRIGGER  = 0
const START_DELAY     = 1200
const ENTER_DURATION  = 500
const DEFAULT_HEADING = 'Are you happy with your search results?'
const DEFAULT_BODY    = 'This is some text asking you about the results'
const CARD_WIDTH      = 292
// ──────────────────────────────────────────────────────────────────────

const EASE_OUT = [0.16, 1, 0.3, 1]

// ─── Icons ────────────────────────────────────────────────────────────
const ThumbsUpIcon = ({ size = 25, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12.9572 2.03472L7.48558 7.50632C7.12015 7.87175 6.91274 8.37546 6.91274 8.89891V18.7656C6.91274 19.852 7.80163 20.7409 8.88805 20.7409H17.7769C18.5671 20.7409 19.2782 20.2668 19.5942 19.5458L22.814 12.0298C23.6436 10.0742 22.2115 7.90138 20.0881 7.90138H14.5078L15.4461 3.37793C15.5448 2.8841 15.3967 2.38039 15.0411 2.02484C14.4584 1.452 13.53 1.452 12.9572 2.03472ZM2.96213 20.7409C4.04855 20.7409 4.93743 19.852 4.93743 18.7656V10.8643C4.93743 9.77792 4.04855 8.88904 2.96213 8.88904C1.87571 8.88904 0.986816 9.77792 0.986816 10.8643V18.7656C0.986816 19.852 1.87571 20.7409 2.96213 20.7409Z" fill={color} />
  </svg>
)

const ThumbsDownIcon = ({ size = 25, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11.0599 21.1339L16.5216 15.6623C16.8871 15.2969 17.0945 14.7932 17.0945 14.2697V4.40304C17.0945 3.31662 16.2056 2.42773 15.1192 2.42773H6.24017C5.45004 2.42773 4.38893 2.90181 4.43276 3.6228L1.213 11.1388C0.373499 13.0944 1.8056 15.2672 3.92905 15.2672H9.5093L8.57103 19.7907C8.47226 20.2845 8.62041 20.7882 8.97597 21.1438C9.55868 21.7166 10.4871 21.7166 11.0599 21.1339ZM21.055 2.42773C19.9686 2.42773 19.0797 3.31662 19.0797 4.40304V12.3043C19.0797 13.3907 19.9686 14.2796 21.055 14.2796C22.1414 14.2796 23.0303 13.3907 23.0303 12.3043V4.40304C23.0303 3.31662 22.1414 2.42773 21.055 2.42773Z" fill={color} />
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
  </svg>
)
// ──────────────────────────────────────────────────────────────────────

function Concept7Card({
  theme         = 'darker',
  shadowOpacity = 40,
  startDelay    = 0,
  scrollTrigger = 0,
  enterDuration = 500,
  cardWidth     = 376,
  heading,
  body,
  onOpen,
  onDismiss,
  onContextMenu,
}) {
  const t = THEMES[theme] ?? THEMES.darker
  const [scrollReady, setScrollReady] = useState(() => window.innerHeight >= scrollTrigger)

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

  if (!scrollReady) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: enterDuration / 1000, delay: startDelay / 1000, ease: EASE_OUT }}
      layoutId="fab-surface"
      style={{
        position: 'fixed', bottom: 32, left: 16,
        width: cardWidth, maxWidth: 'calc(100vw - 32px)',
        background: t.sheetBg,
        borderRadius: 28,
        overflow: 'hidden',
        paddingTop: 32,
        zIndex: 50,
        pointerEvents: 'auto',
        boxShadow: `0 8px 48px rgba(0,0,0,${(shadowOpacity / 100).toFixed(2)})`,
      }}
      onContextMenu={e => { e.preventDefault(); onContextMenu?.() }}
    >
      {/* Header — close button, sits over content */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 50,
        background: t.sheetBg, overflow: 'hidden',
      }}>
        <button
          style={{
            position: 'absolute', top: 10, right: 16,
            width: 40, height: 40, borderRadius: 4,
            background: 'transparent', border: 'none',
            cursor: 'pointer', color: t.closeColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'auto',
          }}
          onClick={onDismiss}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Text content */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '16px 8px 8px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600,
          color: t.heading, lineHeight: 1.2,
          width: 228, margin: 0,
        }}>
          {heading}
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 400,
          color: t.body, lineHeight: 1.3,
          width: 244, maxWidth: 280, margin: 0,
        }}>
          {body}
        </p>
      </div>

      {/* Thumb buttons */}
      <div style={{
        display: 'flex', gap: 24,
        alignItems: 'center', justifyContent: 'center',
        padding: '16px 0 32px',
      }}>
        <button
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: t.sheetBg,
            border: `0.778px solid ${t.chipBorder}`,
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          onClick={onOpen}
        >
          <ThumbsUpIcon size={25} color={t.heading} />
        </button>
        <button
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: t.sheetBg,
            border: `0.778px solid ${t.chipBorder}`,
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          onClick={onOpen}
        >
          <ThumbsDownIcon size={25} color={t.heading} />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Control Panel ────────────────────────────────────────────────────
function PanelSlider({ label, value, min, max, step, unit, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={P.label}>{label}</span>
        <span style={P.value}>{value}{unit}</span>
      </div>
      <input type="range" className="cp-slider" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  )
}

function PanelThemePicker({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ ...P.label, marginBottom: 6 }}>{label}</p>
      <div style={{ display: 'flex', gap: 4 }}>
        {['lighter', 'light', 'dark', 'darker'].map(t => (
          <button key={t} onClick={() => onChange(t)} style={{
            padding: '3px 7px', borderRadius: 5, border: '1px solid',
            fontSize: 11, fontWeight: 500, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
            background: value === t ? '#fff' : 'transparent',
            color: value === t ? '#000' : '#666',
            borderColor: value === t ? '#fff' : '#2e2e2e',
          }}>
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}

function PanelTextField({ label, value, onChange, rows }) {
  const base = {
    width: '100%', padding: '7px 8px',
    background: '#1a1a1a', border: '1px solid #2e2e2e',
    borderRadius: 6, color: '#e0e0e0',
    fontSize: 12, fontFamily: 'Inter, sans-serif', lineHeight: 1.4,
    outline: 'none', boxSizing: 'border-box',
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ ...P.label, marginBottom: 6 }}>{label}</p>
      {rows
        ? <textarea value={value} rows={rows} onChange={e => onChange(e.target.value)} style={{ ...base, resize: 'none' }} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} style={base} />
      }
    </div>
  )
}

function Concept7Panel({ config, onChange, onClose }) {
  const [saved, setSaved] = useState(false)
  const set = (key, val) => onChange({ ...config, [key]: val })

  const handleSave = async () => {
    const [user, conceptId] = currentConcept()
    const body = { user, conceptId, ...config }
    saveConceptConfig(body)
    try {
      await fetch('/dev/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div style={P.panel}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>Controls</span>
        <button onClick={onClose} style={{ width: 22, height: 22, background: '#222', border: 'none', borderRadius: '50%', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      </div>

      <div style={P.divider} />
      <PanelTextField label="Heading" value={config.heading} onChange={v => set('heading', v)} />
      <PanelTextField label="Body" value={config.body} onChange={v => set('body', v)} rows={3} />

      <div style={P.divider} />
      <PanelThemePicker label="Card Theme" value={config.fabTheme} onChange={v => set('fabTheme', v)} />
      <PanelThemePicker label="Modal Theme" value={config.modalTheme} onChange={v => set('modalTheme', v)} />

      <div style={P.divider} />
      <PanelSlider label="Width" value={config.cardWidth} min={280} max={560} step={4} unit="px" onChange={v => set('cardWidth', v)} />
      <PanelSlider label="Shadow" value={config.shadowOpacity} min={0} max={80} step={1} unit="%" onChange={v => set('shadowOpacity', v)} />

      <div style={P.divider} />
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={P.label}>Scroll trigger</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <input type="number" min={0} max={window.innerHeight} value={config.scrollTrigger}
              onChange={e => set('scrollTrigger', Math.max(0, Math.min(window.innerHeight, Number(e.target.value) || 0)))}
              style={{ width: 52, padding: '3px 6px', background: '#222', border: '1px solid #333', borderRadius: 5, color: '#e0e0e0', fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 500, textAlign: 'right', outline: 'none' }}
            />
            <span style={P.value}>px</span>
          </div>
        </div>
        <p style={{ ...P.label, marginTop: 4, marginBottom: 0, opacity: 0.4 }}>drag red line on page</p>
      </div>
      <PanelSlider label="Start delay" value={config.startDelay} min={0} max={5000} step={100} unit="ms" onChange={v => set('startDelay', v)} />
      <PanelSlider label="Entrance" value={config.enterDuration} min={100} max={1200} step={50} unit="ms" onChange={v => set('enterDuration', v)} />

      <div style={{ ...P.divider, marginBottom: 12 }} />
      <button onClick={handleSave} style={{ width: '100%', padding: '9px 0', background: '#fff', color: '#000', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
        {saved ? 'Saved ✓' : 'Save defaults'}
      </button>
    </div>
  )
}

const P = {
  panel: {
    position: 'fixed', top: 20, right: 20, width: 268,
    background: '#111111', borderRadius: 16, border: '1px solid #222',
    padding: '14px 16px 16px', zIndex: 9999,
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
    fontFamily: 'Inter, sans-serif', pointerEvents: 'auto',
    maxHeight: '90vh', overflowY: 'auto',
  },
  divider: { height: 1, background: '#1e1e1e', margin: '0 -16px 14px' },
  label: { margin: 0, fontSize: 11, fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' },
  value: { fontSize: 11, fontWeight: 500, color: '#aaa', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' },
}

// ─── Page ─────────────────────────────────────────────────────────────
export default function Concept7({ page }) {
  const [open, setOpen]           = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showPanel, setShowPanel]  = useState(false)
  const [config, setConfig]        = useState(() => loadConceptConfig({
    fabTheme:      WIDGET_THEME,
    modalTheme:    MODAL_THEME,
    shadowOpacity: SHADOW_OPACITY,
    scrollTrigger: SCROLL_TRIGGER,
    startDelay:    START_DELAY,
    enterDuration: ENTER_DURATION,
    heading:       DEFAULT_HEADING,
    body:          DEFAULT_BODY,
    cardWidth:     CARD_WIDTH,
  }))

  return (
    <>
      <AnimatePresence>
        {!open && !dismissed && (
          <Concept7Card
            key="card"
            theme={config.fabTheme}
            shadowOpacity={config.shadowOpacity}
            scrollTrigger={config.scrollTrigger}
            startDelay={config.startDelay}
            enterDuration={config.enterDuration}
            heading={config.heading}
            body={config.body}
            cardWidth={config.cardWidth}
            onOpen={() => setOpen(true)}
            onDismiss={() => setDismissed(true)}
            onContextMenu={() => setShowPanel(true)}
          />
        )}
        {open && (
          <DefaultSheet
            key="sheet"
            theme={config.modalTheme}
            slideIn={false}
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
          <Concept7Panel
            config={config}
            onChange={setConfig}
            onClose={() => setShowPanel(false)}
          />
        </>
      )}
    </>
  )
}
