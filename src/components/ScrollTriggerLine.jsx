import { useRef, useState, useEffect } from 'react'

export default function ScrollTriggerLine({ value, onChange }) {
  const [scrollY, setScrollY] = useState(0)
  const startRef = useRef(null)

  // Mirror the iframe's scroll position so the line moves with the page
  useEffect(() => {
    const iframe = document.querySelector('iframe')
    const win = iframe?.contentWindow
    if (!win) return
    const onScroll = () => setScrollY(win.scrollY)
    win.addEventListener('scroll', onScroll, { passive: true })
    setScrollY(win.scrollY)
    return () => win.removeEventListener('scroll', onScroll)
  }, [])

  const onMouseDown = (e) => {
    e.preventDefault()
    startRef.current = { y: e.clientY, val: value }

    const iframe = document.querySelector('iframe')
    const docHeight = iframe?.contentWindow?.document?.documentElement?.scrollHeight ?? 9999

    // Prevent the iframe from stealing mousemove events during drag
    if (iframe) iframe.style.pointerEvents = 'none'

    const onMove = (e) => {
      if (!startRef.current) return
      const next = Math.round(
        Math.max(0, Math.min(docHeight, startRef.current.val + (e.clientY - startRef.current.y)))
      )
      onChange(next)
    }

    const onUp = () => {
      if (iframe) iframe.style.pointerEvents = ''
      startRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Visual position tracks with page scroll — feels like the line is on the page
  const top = value - scrollY

  return (
    <div style={{
      position: 'fixed',
      top,
      left: 0,
      right: 0,
      height: 2,
      background: '#FF3B30',
      boxShadow: '0 0 6px rgba(255,59,48,0.5)',
      zIndex: 9998,
      pointerEvents: 'none',
    }}>
      <div
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          left: 0,
          top: -11,
          height: 24,
          paddingRight: 10,
          paddingLeft: 8,
          background: '#FF3B30',
          borderRadius: '0 6px 6px 0',
          cursor: 'ns-resize',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
          <rect y="0" width="8" height="2" rx="1" fill="rgba(255,255,255,0.7)" />
          <rect y="5" width="8" height="2" rx="1" fill="rgba(255,255,255,0.7)" />
          <rect y="10" width="8" height="2" rx="1" fill="rgba(255,255,255,0.7)" />
        </svg>
        <span style={{
          color: '#fff',
          fontSize: 11,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}>
          {value}px
        </span>
      </div>
    </div>
  )
}
