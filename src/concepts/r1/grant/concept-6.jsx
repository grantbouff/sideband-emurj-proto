import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useAnimation } from 'framer-motion'
import { THEMES } from '../../../themes'
import DefaultSheet from '../../../components/DefaultSheet'
import '../../../components/ControlPanel.css'

// ─── Defaults ────────────────────────────────────────────────────────────────
const D = {
  theme:          'darker',
  question:       'Did you find the sizing info you needed?',
  startDelay:     600,
  condenseDelay:  3000,
  condenseSpeed:  480,
  enterDuration:  500,
  exitDuration:   280,
  pulseCount:     3,
  pulseColor:     '#000000',
  pulseOpacity:   35,
  disappearTimer: 0,
  shadowOpacity:  0,
  modalTheme:     'dark',
  posX:           949,
  posY:           270,
}

const DOT            = 18
const PILL_GAP       = 6    // gap between pill bottom and dot top
const PULSE_DURATION = 1.4
const PULSE_GAP      = 0.5

const EASE_ENTER = [0.16, 1, 0.3, 1]
const EASE_MORPH = [0.45, 0, 0.15, 1]
// ─────────────────────────────────────────────────────────────────────────────

// ─── Icons ───────────────────────────────────────────────────────────────────
const QuestionMark = ({ color = 'white' }) => (
  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.87805 7.8933V10H1.96341V7.8933H3.87805ZM0 3.37893C0.00813007 2.88646 0.0813008 2.43502 0.219512 2.02462C0.365854 1.61423 0.565041 1.25855 0.817073 0.957592C1.07724 0.656635 1.38618 0.424077 1.7439 0.259918C2.10976 0.0866393 2.51626 0 2.96341 0C3.54065 0 4.02032 0.0911992 4.40244 0.273598C4.79268 0.446876 5.10569 0.665755 5.34146 0.930232C5.57724 1.19471 5.7439 1.48199 5.84146 1.79207C5.94715 2.09302 6 2.37574 6 2.64022C6 3.07798 5.94715 3.43821 5.84146 3.72093C5.7439 4.00365 5.61789 4.24533 5.46341 4.44596C5.31707 4.6466 5.15041 4.81988 4.96341 4.9658C4.78455 5.1026 4.61382 5.24396 4.45122 5.38988C4.28862 5.52668 4.14228 5.68627 4.01219 5.86867C3.89024 6.05107 3.81301 6.27907 3.78049 6.55267V7.0725H2.13415V6.45691C2.15854 6.06475 2.22358 5.73643 2.32927 5.47196C2.44309 5.20748 2.57317 4.98404 2.71951 4.80164C2.86585 4.61012 3.02032 4.44596 3.18293 4.30917C3.34553 4.17237 3.49593 4.03557 3.63415 3.89877C3.77236 3.76197 3.88211 3.61149 3.96341 3.44733C4.05285 3.28317 4.0935 3.07798 4.08537 2.83174C4.08537 2.41222 3.99187 2.10214 3.80488 1.9015C3.62602 1.70087 3.37398 1.60055 3.04878 1.60055C2.82927 1.60055 2.63821 1.65071 2.47561 1.75103C2.32114 1.84222 2.19106 1.9699 2.08537 2.13406C1.9878 2.2891 1.91463 2.47606 1.86585 2.69494C1.81707 2.9047 1.79268 3.13269 1.79268 3.37893H0Z" fill={color}/>
  </svg>
)

const ThumbsUpIcon = ({ color = 'currentColor' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.9572 2.03472L7.48558 7.50632C7.12015 7.87175 6.91274 8.37546 6.91274 8.89891V18.7656C6.91274 19.852 7.80163 20.7409 8.88805 20.7409H17.7769C18.5671 20.7409 19.2782 20.2668 19.5942 19.5458L22.814 12.0298C23.6436 10.0742 22.2115 7.90138 20.0881 7.90138H14.5078L15.4461 3.37793C15.5448 2.8841 15.3967 2.38039 15.0411 2.02484C14.4584 1.452 13.53 1.452 12.9572 2.03472ZM2.96213 20.7409C4.04855 20.7409 4.93743 19.852 4.93743 18.7656V10.8643C4.93743 9.77792 4.04855 8.88904 2.96213 8.88904C1.87571 8.88904 0.986816 9.77792 0.986816 10.8643V18.7656C0.986816 19.852 1.87571 20.7409 2.96213 20.7409Z" fill={color}/>
  </svg>
)

const ThumbsDownIcon = ({ color = 'currentColor' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.0599 21.1339L16.5216 15.6623C16.8871 15.2969 17.0945 14.7932 17.0945 14.2697V4.40304C17.0945 3.31662 16.2056 2.42773 15.1192 2.42773H6.24017C5.45004 2.42773 4.73893 2.90181 4.43276 3.6228L1.213 11.1388C0.373499 13.0944 1.8056 15.2672 3.92905 15.2672H9.5093L8.57103 19.7907C8.47226 20.2845 8.62041 20.7882 8.97597 21.1438C9.55868 21.7166 10.4871 21.7166 11.0599 21.1339ZM21.055 2.42773C19.9686 2.42773 19.0797 3.31662 19.0797 4.40304V12.3043C19.0797 13.3907 19.9686 14.2796 21.055 14.2796C22.1414 14.2796 23.0303 13.3907 23.0303 12.3043V4.40304C23.0303 3.31662 22.1414 2.42773 21.055 2.42773Z" fill={color}/>
  </svg>
)
// ─────────────────────────────────────────────────────────────────────────────


// ─── Hotspot ─────────────────────────────────────────────────────────────────
function Hotspot({
  theme, question, startDelay, condenseDelay, condenseSpeed,
  enterDuration, exitDuration, pulseCount, pulseColor, pulseOpacity,
  disappearTimer, shadowOpacity, editMode, posX, posY, onPositionChange,
  onRate, onDismiss, onContextMenu,
}) {
  const t = THEMES[theme] ?? THEMES.darker

  // Position via motion values so drag offset accumulates without fighting CSS left/top.
  // Anchored at fixed 0,0 — x/y carry the full viewport position.
  const mx = useMotionValue(posX ?? window.innerWidth  * 0.42)
  const my = useMotionValue(posY ?? window.innerHeight * 0.38)

  // phase: 'hidden' → 'expanded' → 'condensed' → 'dismissed'
  const [phase, setPhase]           = useState('hidden')
  const [hovered, setHovered]       = useState(false)
  const [pulseReady, setPulseReady] = useState(false)
  const [pulseDone, setPulseDone]   = useState(false)
  const [responded, setResponded]   = useState(null)
  const dismissedRef = useRef(false)

  const dismiss = () => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    setPhase('dismissed')
    onDismiss?.()
  }

  // 1 – appear after startDelay
  useEffect(() => {
    const id = setTimeout(() => setPhase('expanded'), startDelay)
    return () => clearTimeout(id)
  }, [startDelay])

  // 2 – condense after condenseDelay from when expanded
  useEffect(() => {
    if (phase !== 'expanded') return
    const id = setTimeout(() => setPhase('condensed'), condenseDelay)
    return () => clearTimeout(id)
  }, [phase, condenseDelay])

  // 3 – start pulse after condense animation finishes
  useEffect(() => {
    if (phase !== 'condensed') return
    const id = setTimeout(() => setPulseReady(true), condenseSpeed * 0.5)
    return () => clearTimeout(id)
  }, [phase, condenseSpeed])

  // 4 – mark pulse done via timeout
  useEffect(() => {
    if (!pulseReady || pulseDone || pulseCount <= 0) return
    const totalMs = (PULSE_DURATION + PULSE_GAP) * pulseCount * 1000 - PULSE_GAP * 1000
    const id = setTimeout(() => setPulseDone(true), totalMs)
    return () => clearTimeout(id)
  }, [pulseReady, pulseCount, pulseDone])

  // 5 – disappear timer (from first appearance)
  useEffect(() => {
    if (!disappearTimer || disappearTimer <= 0) return
    const id = setTimeout(dismiss, startDelay + disappearTimer * 1000)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDelay, disappearTimer])

  const condensed  = phase === 'condensed'

  // 6 – dot scale: initial grow uses condenseSpeed; hover uses a fast transition
  const dotAnim = useAnimation()
  useEffect(() => {
    if (phase !== 'condensed') return
    dotAnim.start({ scale: 1, transition: { duration: condenseSpeed / 1000, ease: EASE_MORPH } })
  }, [phase, condenseSpeed])
  useEffect(() => {
    if (!condensed) return
    dotAnim.start({ scaleX: hovered ? (DOT + 8) / DOT : 1, transition: { duration: 0.18, ease: EASE_MORPH } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered])
  const showPill   = phase === 'expanded' || (condensed && hovered && !responded)
  const showThumbs = condensed && hovered && !responded

  const shadow     = `drop-shadow(0 4px 20px rgba(0,0,0,${(shadowOpacity / 100).toFixed(2)}))`
  const thumbsBg   = t.fabBg
  const thumbsIcon = t.fabLabel
  const dividerCol = t.chipBorder

  const handleRate = (vote) => {
    if (responded !== null) return
    setResponded(vote)
    onRate?.()
    dismiss()
  }

  return (
    <AnimatePresence>
      {phase !== 'hidden' && phase !== 'dismissed' && (
        <motion.div
          key="hotspot"
          drag={editMode}
          dragMomentum={false}
          dragElastic={0}
          onPointerDown={e => editMode && e.currentTarget.setPointerCapture(e.pointerId)}
          onDragEnd={() => onPositionChange?.(mx.get(), my.get())}
          onContextMenu={e => { e.preventDefault(); onContextMenu?.() }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: exitDuration / 1000, ease: EASE_MORPH } }}
          transition={{ duration: enterDuration / 1000, ease: EASE_ENTER }}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            x: mx,
            y: my,
            width: DOT,
            height: DOT,
            zIndex: 50,
            pointerEvents: 'auto',
            cursor: editMode ? 'grab' : 'default',
            userSelect: 'none',
            overflow: 'visible',
          }}
        >
          {/* ── Pulse ring ── */}
          <AnimatePresence>
            {condensed && pulseReady && !pulseDone && (
              <motion.div
                key="pulse"
                initial={{ scale: 1, opacity: pulseOpacity / 100 }}
                animate={{ scale: [1, 2.8, 2.8], opacity: [pulseOpacity / 100, 0, 0] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: PULSE_DURATION,
                  ease: 'easeOut',
                  repeat: Math.max(0, pulseCount - 1),
                  repeatDelay: PULSE_GAP,
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: pulseColor,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
            )}
          </AnimatePresence>

          {/* ── Question pill ── */}
          <div style={{
            position: 'absolute',
            bottom: DOT + PILL_GAP,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}>
            <AnimatePresence>
              {showPill && (
                <motion.div
                  key="pill"
                  initial={{ opacity: 0, y: 8, clipPath: 'inset(0 50% 0 50% round 100px)' }}
                  animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0% round 100px)' }}
                  exit={{ opacity: 0, y: 8, clipPath: 'inset(0 50% 0 50% round 100px)', transition: { duration: Math.max(0.05, enterDuration / 1000 - 0.05), ease: EASE_ENTER } }}
                  transition={{ duration: enterDuration / 1000, ease: EASE_ENTER }}
                  style={{ background: t.fabBg, borderRadius: 100, padding: '8px 14px', whiteSpace: 'nowrap', filter: shadow }}
                >
                  <p style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, color: t.fabLabel, lineHeight: 1.2, textAlign: 'center' }}>{question}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Edit-mode drag indicator ── */}
          <AnimatePresence>
            {editMode && (
              <motion.div
                key="edit-ring"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  inset: -5,
                  borderRadius: '50%',
                  border: '1.5px dashed rgba(255,255,255,0.55)',
                  pointerEvents: 'none',
                  zIndex: 4,
                }}
              />
            )}
          </AnimatePresence>

          {/* ── Dot ── */}
          <motion.div
            onMouseEnter={() => !editMode && condensed && setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            initial={{ scale: 4 / DOT }}
            animate={dotAnim}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: t.fabBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: shadow,
              zIndex: 1,
              cursor: condensed ? 'default' : 'grab',
            }}
          >
            <motion.span
              animate={{ opacity: condensed && !hovered ? 1 : 0 }}
              transition={condensed
                ? { duration: hovered ? 0.15 : 0.28, ease: 'easeOut', delay: hovered ? 0 : condenseSpeed / 1000 * 0.05 }
                : { duration: 0 }
              }
              style={{ display: 'flex', opacity: 0 }}
            >
              <QuestionMark color={t.fabLabel} />
            </motion.span>
          </motion.div>

          {/* ── Thumbs mini-pill + Thanks — static wrapper centers on dot ── */}
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 3,
              pointerEvents: 'auto',
            }}
          >
            <AnimatePresence>
              {showThumbs && (
                <motion.div
                  key="thumbs"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.14 } }}
                  transition={{ duration: 0.18, ease: EASE_ENTER }}
                  style={{
                    background: thumbsBg,
                    borderRadius: 100,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    filter: shadow,
                    cursor: 'default',
                  }}
                >
                  <ThumbsBtn onClick={() => handleRate('up')} theme={t}>
                    <ThumbsUpIcon color={thumbsIcon} />
                  </ThumbsBtn>
                  <div style={{ width: 1, height: '100%', background: dividerCol, flexShrink: 0 }} />
                  <ThumbsBtn onClick={() => handleRate('down')} theme={t}>
                    <ThumbsDownIcon color={thumbsIcon} />
                  </ThumbsBtn>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ThumbsBtn({ onClick, theme: t, children }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      animate={{ scale: pressed ? 0.82 : 1, background: (hovered || pressed) ? t.chipBg : 'transparent' }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      style={{ width: 27, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, borderRadius: 4, outline: 'none' }}
    >
      {children}
    </motion.button>
  )
}
// ─────────────────────────────────────────────────────────────────────────────


// ─── Control Panel ───────────────────────────────────────────────────────────
const CP_THEMES = ['lighter', 'light', 'dark', 'darker']

function ThemePicker({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={cp.fieldLabel}>{label}</p>
      <div style={{ display: 'flex', gap: 4 }}>
        {CP_THEMES.map(t => (
          <button key={t} onClick={() => onChange(t)} style={{
            ...cp.chip,
            background:  value === t ? '#fff' : 'transparent',
            color:       value === t ? '#000' : '#666',
            borderColor: value === t ? '#fff' : '#2e2e2e',
          }}>{t}</button>
        ))}
      </div>
    </div>
  )
}

function SliderRow({ label, value, min, max, step, unit, onChange }) {
  const display = unit === 's' && value === 0 ? 'off' : `${value}${unit}`
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={cp.fieldLabel}>{label}</span>
        <span style={cp.value}>{display}</span>
      </div>
      <input type="range" className="cp-slider"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  )
}

function ColorRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <span style={cp.fieldLabel}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          position: 'relative', width: 24, height: 20,
          borderRadius: 4, border: '1px solid #333',
          overflow: 'hidden', cursor: 'pointer', background: value,
        }}>
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{
              position: 'absolute', inset: '-4px',
              width: 'calc(100% + 8px)', height: 'calc(100% + 8px)',
              opacity: 0, cursor: 'pointer',
            }}
          />
        </div>
        <span style={{ ...cp.value, fontFamily: 'monospace', fontSize: 10 }}>{value}</span>
      </div>
    </div>
  )
}

function TextRow({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={cp.fieldLabel}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          display: 'block', width: '100%', marginTop: 6,
          padding: '4px 6px',
          background: '#222', border: '1px solid #333', borderRadius: 5,
          color: '#e0e0e0', fontSize: 11, fontWeight: 500,
          fontFamily: 'Inter, sans-serif', outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

function HotspotControlPanel({ config, onChange, onClose }) {
  const [saved, setSaved] = useState(false)
  const set = (k, v) => onChange({ ...config, [k]: v })

  const handleSave = async () => {
    const [,, user, conceptId] = window.location.pathname.split('/')
    await fetch('/dev/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, conceptId, ...config }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div style={cp.panel}>
      <div style={cp.header}>
        <span style={cp.title}>Controls</span>
        <button style={cp.closeBtn} onClick={onClose}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div style={cp.divider} />

      <ThemePicker label="Hotspot theme" value={config.theme}      onChange={v => set('theme', v)} />
      <ThemePicker label="Modal theme"  value={config.modalTheme} onChange={v => set('modalTheme', v)} />
      <TextRow     label="Question"     value={config.question}   onChange={v => set('question', v)} />

      <div style={cp.divider} />

      <SliderRow label="Shadow"        value={config.shadowOpacity} min={0}   max={80}  step={1}   unit="%" onChange={v => set('shadowOpacity', v)} />
      <ColorRow  label="Pulse color"   value={config.pulseColor}    onChange={v => set('pulseColor', v)} />
      <SliderRow label="Pulse opacity" value={config.pulseOpacity}  min={0}   max={100} step={1}   unit="%" onChange={v => set('pulseOpacity', v)} />
      <SliderRow label="Pulse count"   value={config.pulseCount}    min={0}   max={8}   step={1}   unit="×" onChange={v => set('pulseCount', v)} />

      <div style={cp.divider} />

      <SliderRow label="Start delay"     value={config.startDelay}     min={0}   max={5000}  step={100} unit="ms" onChange={v => set('startDelay', v)} />
      <SliderRow label="Condense delay"  value={config.condenseDelay}  min={500} max={10000} step={100} unit="ms" onChange={v => set('condenseDelay', v)} />
      <SliderRow label="Condense speed"  value={config.condenseSpeed}  min={100} max={1200}  step={50}  unit="ms" onChange={v => set('condenseSpeed', v)} />
      <SliderRow label="Entrance"        value={config.enterDuration}  min={50}  max={1200}  step={50}  unit="ms" onChange={v => set('enterDuration', v)} />
      <SliderRow label="Exit"            value={config.exitDuration}   min={50}  max={1200}  step={50}  unit="ms" onChange={v => set('exitDuration', v)} />
      <SliderRow label="Disappear timer" value={config.disappearTimer ?? 0} min={0} max={60} step={1} unit="s" onChange={v => set('disappearTimer', v)} />

      <div style={{ ...cp.divider, marginBottom: 12 }} />

      <button style={{ ...cp.saveBtn, width: '100%' }} onClick={handleSave}>
        {saved ? 'Saved ✓' : 'Save defaults'}
      </button>
    </div>
  )
}

const cp = {
  panel: {
    position: 'fixed', top: 20, right: 20, width: 268,
    background: '#111111', borderRadius: 16, border: '1px solid #222',
    padding: '14px 16px 16px', zIndex: 9999,
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
    fontFamily: 'Inter, sans-serif', pointerEvents: 'auto',
  },
  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title:      { fontSize: 13, fontWeight: 600, color: '#e0e0e0', letterSpacing: '0.01em' },
  closeBtn:   { width: 22, height: 22, background: '#222', border: 'none', borderRadius: '50%', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  divider:    { height: 1, background: '#1e1e1e', margin: '0 -16px 14px' },
  fieldLabel: { margin: 0, marginBottom: 6, fontSize: 11, fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' },
  value:      { fontSize: 11, fontWeight: 500, color: '#aaa', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' },
  chip:       { padding: '3px 8px', borderRadius: 5, border: '1px solid', fontSize: 11, fontWeight: 500, fontFamily: 'Inter, sans-serif', cursor: 'pointer', letterSpacing: '0.02em' },
  saveBtn:    { padding: '9px 0', background: '#fff', color: '#000', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer', letterSpacing: '0.02em' },
}
// ─────────────────────────────────────────────────────────────────────────────


// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Concept6() {
  const [showPanel, setShowPanel] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [config, setConfig]       = useState({ ...D })

  const handlePositionChange = (x, y) => {
    setConfig(c => ({ ...c, posX: Math.round(x), posY: Math.round(y) }))
  }

  return (
    <>
      <Hotspot
        theme={config.theme}
        question={config.question}
        startDelay={config.startDelay}
        condenseDelay={config.condenseDelay}
        condenseSpeed={config.condenseSpeed}
        enterDuration={config.enterDuration}
        exitDuration={config.exitDuration}
        pulseCount={config.pulseCount}
        pulseColor={config.pulseColor}
        pulseOpacity={config.pulseOpacity}
        disappearTimer={config.disappearTimer}
        shadowOpacity={config.shadowOpacity}
        editMode={showPanel}
        posX={config.posX}
        posY={config.posY}
        onPositionChange={handlePositionChange}
        onRate={() => setModalOpen(true)}
        onDismiss={() => {}}
        onContextMenu={() => setShowPanel(true)}
      />
      <AnimatePresence>
        {modalOpen && (
          <DefaultSheet
            key="sheet"
            theme={config.modalTheme}
            onClose={() => setModalOpen(false)}
            onNext={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>
      {showPanel && (
        <HotspotControlPanel
          config={config}
          onChange={setConfig}
          onClose={() => setShowPanel(false)}
        />
      )}
    </>
  )
}
