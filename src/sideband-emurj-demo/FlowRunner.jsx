import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import TriggerFAB from './components/TriggerFAB'
import BottomBar from './components/BottomBar'
import Sheet from './components/Sheet'
import BinaryRating from './components/BinaryRating'
import AnswerChip from './components/AnswerChip'
import TextField from './components/TextField'
import Button from './components/Button'
import Checkmark from './components/Checkmark'

/* FlowRunner — interprets a declarative flow config.
 *
 * Shared skeleton: entry → binary rating → positive/negative branch → chips →
 * open text → thank-you. `entry.type` picks TriggerFAB / BottomBar / direct Sheet;
 * step `type` picks the input slot; a `{ branch }` step resolves to its positive
 * or negative array once the binary sentiment is known.
 *
 * Independent theming: the entry and the modal render inside separate
 * `data-theme` subtrees (display:contents wrappers), so e.g. a lighter FAB can
 * sit over a dark sheet — the sheet's mode never leaks into the FAB.
 */

// Delay before any entry point appears, so the prototype never fires the
// instant the page loads. Overridable per config via entry.startDelay.
const START_DELAY = 1500

// How long the binary step holds its rated-feedback message before the flow
// advances to the next sheet (the bottom bar's rated hold, minus the dismiss).
const RATED_HOLD_MS = 2000

// Flatten config.steps into a concrete list, expanding the branch step.
function resolveSteps(steps, sentiment) {
  const out = []
  for (const step of steps) {
    if (step.branch) {
      const arm = sentiment === 'negative' ? step.branch.negative : step.branch.positive
      out.push(...(arm || []))
    } else {
      out.push(step)
    }
  }
  return out
}

export default function FlowRunner({ config }) {
  const entryType = config.entry.type            // 'fab' | 'bottom-bar' | 'sheet'
  const entryTheme = config.theming?.fab?.theme || config.theming?.modal?.theme || 'lighter'
  const modalTheme = config.theming?.modal?.theme || 'lighter'

  // Every entry waits START_DELAY before appearing so the background page
  // registers first; 'sheet' then opens on its own, others wait for interaction.
  const startDelay = config.entry.startDelay ?? START_DELAY
  const [opened, setOpened] = useState(false)
  useEffect(() => {
    if (entryType !== 'sheet') return
    const t = setTimeout(() => setOpened(true), startDelay)
    return () => clearTimeout(t)
  }, [entryType, startDelay])
  const [dismissed, setDismissed] = useState(false)
  const [sentiment, setSentiment] = useState(null)   // 'positive' | 'negative'
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})

  const resolvedSteps = useMemo(() => resolveSteps(config.steps, sentiment), [config.steps, sentiment])
  const step = resolvedSteps[stepIndex]
  const isLast = stepIndex >= resolvedSteps.length - 1
  const progress = (stepIndex + 1) / resolvedSteps.length

  const showEntry = !opened && !dismissed
  const showSheet = opened && !dismissed && step

  const close = () => setDismissed(true)
  const advance = () => { if (isLast) close(); else setStepIndex((i) => i + 1) }

  // Auto-advance after a beat so the selection state is visible before the
  // step transition. Guarded so rapid taps can't skip a step.
  const advancePending = useRef(false)
  const scheduleAdvance = () => {
    if (advancePending.current) return
    advancePending.current = true
    setTimeout(() => { advancePending.current = false; advance() }, 250)
  }

  // Entry that carries the rating (bottom bar): set sentiment and skip the
  // leading binary step. Assumes steps[0] is the binary step by convention.
  const openWithRating = (kind) => {
    setSentiment(kind)
    setStepIndex(1)
    setOpened(true)
  }

  const setAnswer = (key, value) => setAnswers((a) => ({ ...a, [key]: value }))

  // ── Entry node ──────────────────────────────────────────────────────
  let entryNode = null
  if (entryType === 'fab') {
    entryNode = (
      <TriggerFAB
        ctaValue={config.entry.cta}
        timer={config.entry.timer || 'none'}
        dismissTimer={config.entry.dismissTimer ?? 8}
        startDelay={startDelay}
        onOpen={() => setOpened(true)}
        onDismiss={close}
      />
    )
  } else if (entryType === 'bottom-bar') {
    entryNode = (
      <BottomBar
        question={config.entry.cta}
        responses={config.entry.responses}
        dismissTimer={config.entry.dismissTimer ?? 12}
        ratedTimer={config.entry.ratedTimer ?? 3}
        startDelay={startDelay}
        onRate={setSentiment}
        onDismiss={close}
      />
    )
  }

  // ── Per-step input slot + footer ────────────────────────────────────
  let slot = null
  let footer = null
  let media = null

  if (step) {
    if (step.type === 'binary') {
      slot = (
        <BinaryRating
          value={sentiment}
          // With a configured response the sheet swaps the question for the
          // feedback message and holds so it can be read (the thumbs stay,
          // selection lit) before advancing; without one it advances straight
          // away. Guarded so a second tap during the hold can't re-rate.
          onRate={(kind) => {
            if (sentiment) return
            setSentiment(kind)
            if (step.responses?.[kind]) setTimeout(advance, RATED_HOLD_MS)
            else advance()
          }}
        />
      )
    } else if (step.type === 'chips') {
      const key = `chips-${stepIndex}`
      const multi = !!step.multi
      const sel = answers[key] ?? (multi ? [] : null)
      const isActive = (v) => (multi ? sel.includes(v) : sel === v)
      const toggle = (v) => {
        if (multi) setAnswer(key, sel.includes(v) ? sel.filter((x) => x !== v) : [...sel, v])
        else setAnswer(key, v)
      }
      // Figma caps the concise chip at 15 chars / 1 line; longer labels wrap
      // to two lines and look cramped in the pill. When a multi-option step
      // has any label over that budget, promote the whole step to the verbose
      // chip (full-width, left-aligned). Explicit step.styleVariant still wins.
      const CONCISE_MAX_CHARS = 15
      const chipOptions = step.options.filter((o) => o.type !== 'other')
      const autoVerbose = chipOptions.length > 1 &&
        chipOptions.some((o) => (o.label?.length ?? 0) > CONCISE_MAX_CHARS)
      const styleVariant = step.styleVariant || (autoVerbose ? 'verbose' : 'concise')
      const isVerbose = styleVariant === 'verbose'
      // Fixed-width columns so a lone chip on the last row keeps its size
      // instead of stretching across the grid.
      slot = (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isVerbose
            ? 'minmax(180px, 330px)'
            : 'repeat(2, minmax(0, 160px))',
          gap: 8,
          justifyContent: 'center',
          width: '100%', maxWidth: 512, margin: '0 auto',
        }}>
          {step.options.map((opt) => (
            <AnswerChip
              key={opt.value}
              label={opt.type === 'other' ? 'Other…' : opt.label}
              type={opt.type || 'chip'}
              styleVariant={styleVariant}
              active={isActive(opt.value)}
              // 'other' is a divert, not a toggle: record it and move on to
              // the long-form text step. Single-select picks also advance —
              // after a beat, so the active chip registers first.
              onToggle={() => {
                if (opt.type === 'other') {
                  setAnswer(key, opt.value)
                  advance()
                } else if (multi) {
                  toggle(opt.value)
                } else {
                  setAnswer(key, opt.value)
                  scheduleAdvance()
                }
              }}
            />
          ))}
        </div>
      )
      // Always enabled — answering is optional, Next doubles as skip.
      footer = <Button level="primary" styleVariant="compact" icon onClick={advance} />
    } else if (step.type === 'text') {
      const key = `text-${stepIndex}`
      slot = (
        <TextField
          multiline
          value={answers[key] || ''}
          onChange={(v) => setAnswer(key, v)}
          onSubmit={advance}
          placeholder={step.placeholder || 'Type your answer…'}
        />
      )
      footer = <Button level="primary" styleVariant="compact" icon onClick={advance} />
    } else if (step.type === 'end') {
      if (step.media === 'checkmark') media = <Checkmark />
      // Done drains like the background-timer FAB and auto-dismisses at empty.
      footer = (
        <Button level="primary" styleVariant="fill" onClick={close} timer={step.dismissTimer ?? 10}>
          Done
        </Button>
      )
    }
  }

  // While the rated binary step holds, the feedback message replaces the
  // question (and any body copy). The Sheet animates the swap itself.
  const ratedResponse =
    step?.type === 'binary' && sentiment ? step.responses?.[sentiment] : null

  // Map the step to the Figma Sheet Type variant: the opening binary rating is
  // the Start sheet (no progress track), the thank-you is End, questions are
  // In-Progress.
  const sheetVariant = step
    ? (step.type === 'binary' ? 'start' : step.type === 'end' ? 'end' : 'in-progress')
    : 'in-progress'

  return (
    <>
      {/* Entry subtree — its own theme. */}
      <div data-theme={entryTheme} style={{ display: 'contents' }}>
        {showEntry && entryNode}
      </div>

      {/* Modal subtree — its own theme. */}
      <div data-theme={modalTheme} style={{ display: 'contents' }}>
        <AnimatePresence>
          {showSheet && (
            <Sheet
              key="sheet"
              variant={sheetVariant}
              progress={progress}
              stepKey={stepIndex}
              eyebrow={step.eyebrow}
              heading={ratedResponse ?? step.heading}
              body={ratedResponse ? undefined : step.body}
              // Hold the question's height through the feedback swap — the
              // sheet shouldn't shrink for 2s and grow right back.
              lockHeight={!!ratedResponse}
              media={media}
              footer={footer}
              onClose={close}
              slideIn={entryType === 'sheet'}
              // When the FAB morphs into the sheet across themes, the sheet
              // starts on the FAB's surface colour and snaps to its own —
              // without this the dark pill would pop straight to white.
              morphFromTheme={entryType === 'fab' && entryTheme !== modalTheme ? entryTheme : null}
            >
              {slot}
            </Sheet>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
