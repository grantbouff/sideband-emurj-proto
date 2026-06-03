import { useState } from 'react'
import DefaultSheet from '../../components/DefaultSheet'
import FAB from '../../components/FAB'
import ControlPanel from '../../components/ControlPanel'

// ─── Defaults — overwritten by "Save defaults" in the control panel ───
const FAB_THEME          = 'darker'
const MODAL_THEME        = 'darker'
const FAB_SHADOW_OPACITY = 13
const FAB_CONDENSE_DELAY = 3000
const FAB_MORPH_DURATION = 400
const FAB_ENTER_DURATION = 450
const FAB_EXIT_DURATION  = 300
const FAB_DISMISS_TIMER  = null
// ──────────────────────────────────────────────────────────────────────

export default function Concept1({ page }) {
  const [open, setOpen] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [config, setConfig] = useState({
    fabTheme:      FAB_THEME,
    modalTheme:    MODAL_THEME,
    shadowOpacity: FAB_SHADOW_OPACITY,
    condenseDelay: FAB_CONDENSE_DELAY,
    morphDuration: FAB_MORPH_DURATION,
    enterDuration: FAB_ENTER_DURATION,
    exitDuration:  FAB_EXIT_DURATION,
    dismissTimer:  FAB_DISMISS_TIMER,
  })

  return (
    <>
      <FAB
        theme={config.fabTheme}
        shadowOpacity={config.shadowOpacity}
        condenseDelay={config.condenseDelay}
        morphDuration={config.morphDuration}
        enterDuration={config.enterDuration}
        exitDuration={config.exitDuration}
        dismissTimer={config.dismissTimer}
        onOpen={() => setOpen(true)}
        isOpen={open}
        onContextMenu={() => setShowPanel(true)}
      />
      {open && (
        <DefaultSheet
          theme={config.modalTheme}
          onClose={() => setOpen(false)}
          onNext={() => setOpen(false)}
        />
      )}
      {showPanel && (
        <ControlPanel
          config={config}
          onChange={setConfig}
          onClose={() => setShowPanel(false)}
        />
      )}
    </>
  )
}
