import { useState } from 'react'
import './ControlPanel.css'

const THEMES = ['lighter', 'light', 'dark', 'darker']

function ThemePicker({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={styles.fieldLabel}>{label}</p>
      <div style={{ display: 'flex', gap: 4 }}>
        {THEMES.map(t => (
          <button
            key={t}
            onClick={() => onChange(t)}
            style={{
              ...styles.chip,
              background: value === t ? '#fff' : 'transparent',
              color:      value === t ? '#000' : '#666',
              borderColor: value === t ? '#fff' : '#2e2e2e',
            }}
          >
            {t}
          </button>
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
        <span style={styles.fieldLabel}>{label}</span>
        <span style={styles.value}>{display}</span>
      </div>
      <input
        type="range"
        className="cp-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export default function ControlPanel({ config, onChange, onClose }) {
  const [saved, setSaved] = useState(false)

  const set = (key, val) => onChange({ ...config, [key]: val })

  const handleSave = async () => {
    const body = {
      fabTheme:      config.fabTheme,
      modalTheme:    config.modalTheme,
      condenseDelay:  config.condenseDelay,
      enterDuration:  config.enterDuration,
      exitDuration:   config.exitDuration,
      morphDuration:  config.morphDuration,
      shadowOpacity:  config.shadowOpacity,
      dismissTimer:  config.dismissTimer === 0 ? null : config.dismissTimer,
    }
    await fetch('/dev/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>Controls</span>
        <button style={styles.closeBtn} onClick={onClose}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div style={styles.divider} />

      {/* Theme pickers */}
      <ThemePicker
        label="FAB Theme"
        value={config.fabTheme}
        onChange={v => set('fabTheme', v)}
      />
      <ThemePicker
        label="Modal Theme"
        value={config.modalTheme}
        onChange={v => set('modalTheme', v)}
      />

      <div style={styles.divider} />

      {/* Shadow */}
      <SliderRow
        label="Shadow"
        value={config.shadowOpacity}
        min={0} max={80} step={1}
        unit="%"
        onChange={v => set('shadowOpacity', v)}
      />

      <div style={styles.divider} />

      {/* Timing sliders */}
      <SliderRow
        label="Condense delay"
        value={config.condenseDelay}
        min={0} max={8000} step={100}
        unit="ms"
        onChange={v => set('condenseDelay', v)}
      />
      <SliderRow
        label="Condense speed"
        value={config.morphDuration}
        min={50} max={1200} step={50}
        unit="ms"
        onChange={v => set('morphDuration', v)}
      />
      <SliderRow
        label="Entrance"
        value={config.enterDuration}
        min={50} max={1200} step={50}
        unit="ms"
        onChange={v => set('enterDuration', v)}
      />
      <SliderRow
        label="Exit"
        value={config.exitDuration}
        min={50} max={1200} step={50}
        unit="ms"
        onChange={v => set('exitDuration', v)}
      />
      <SliderRow
        label="Dismiss timer"
        value={config.dismissTimer ?? 0}
        min={0} max={30} step={1}
        unit="s"
        onChange={v => set('dismissTimer', v === 0 ? null : v)}
      />

      <div style={{ ...styles.divider, marginBottom: 12 }} />

      {/* Save */}
      <button style={styles.saveBtn} onClick={handleSave}>
        {saved ? 'Saved ✓' : 'Save defaults'}
      </button>
    </div>
  )
}

const styles = {
  panel: {
    position: 'fixed',
    top: 20,
    right: 20,
    width: 268,
    background: '#111111',
    borderRadius: 16,
    border: '1px solid #222',
    padding: '14px 16px 16px',
    zIndex: 9999,
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
    fontFamily: 'Inter, sans-serif',
    pointerEvents: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e0e0e0',
    letterSpacing: '0.01em',
  },
  closeBtn: {
    width: 22,
    height: 22,
    background: '#222',
    border: 'none',
    borderRadius: '50%',
    color: '#888',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    background: '#1e1e1e',
    margin: '0 -16px 14px',
  },
  fieldLabel: {
    margin: 0,
    fontSize: 11,
    fontWeight: 500,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 6,
  },
  value: {
    fontSize: 11,
    fontWeight: 500,
    color: '#aaa',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.02em',
  },
  chip: {
    padding: '3px 8px',
    borderRadius: 5,
    border: '1px solid',
    fontSize: 11,
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },
  saveBtn: {
    width: '100%',
    padding: '9px 0',
    background: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },
}
