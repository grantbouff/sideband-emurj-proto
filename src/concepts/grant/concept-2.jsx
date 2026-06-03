import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import DefaultSheet from '../../components/DefaultSheet'
import FAB from '../../components/FAB'
import ControlPanel from '../../components/ControlPanel'
import ScrollTriggerLine from '../../components/ScrollTriggerLine'

// ─── Defaults — overwritten by "Save defaults" in the control panel ───
const FAB_THEME          = 'darker'
const MODAL_THEME        = 'darker'
const FAB_SHADOW_OPACITY = 13
const FAB_SCROLL_TRIGGER = 0
const FAB_START_DELAY    = 1600
const FAB_CONDENSE_DELAY = 2500
const FAB_MORPH_DURATION = 450
const FAB_ENTER_DURATION = 1000
const FAB_EXIT_DURATION  = 300
const FAB_DISMISS_TIMER  = null
// ──────────────────────────────────────────────────────────────────────

export default function Concept2({ page }) {
  const [open, setOpen] = useState(false)
  const [fabDismissed, setFabDismissed] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [config, setConfig] = useState({
    fabTheme:      FAB_THEME,
    modalTheme:    MODAL_THEME,
    shadowOpacity: FAB_SHADOW_OPACITY,
    scrollTrigger: FAB_SCROLL_TRIGGER,
    startDelay:    FAB_START_DELAY,
    condenseDelay: FAB_CONDENSE_DELAY,
    morphDuration: FAB_MORPH_DURATION,
    enterDuration: FAB_ENTER_DURATION,
    exitDuration:  FAB_EXIT_DURATION,
    dismissTimer:  FAB_DISMISS_TIMER,
  })

  return (
    <>
      <AnimatePresence>
        {!open && !fabDismissed && (
          <FAB
            key="fab"
            theme={config.fabTheme}
            shadowOpacity={config.shadowOpacity}
            scrollTrigger={config.scrollTrigger}
            startDelay={config.startDelay}
            condenseDelay={config.condenseDelay}
            morphDuration={config.morphDuration}
            enterDuration={config.enterDuration}
            exitDuration={config.exitDuration}
            dismissTimer={config.dismissTimer}
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
