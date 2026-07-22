import { useMemo, useState } from 'react'
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

  // 'sheet' entry opens immediately; others wait for interaction.
  const [opened, setOpened] = useState(entryType === 'sheet')
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
        startDelay={config.entry.startDelay ?? 400}
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
        ratedTimer={config.entry.ratedTimer ?? 4}
        startDelay={config.entry.startDelay ?? 400}
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
          onRate={(kind) => { setSentiment(kind); advance() }}
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
              // the long-form text step.
              onToggle={() => {
                setAnswer(key, opt.value)
                if (opt.type === 'other') advance()
                else toggle(opt.value)
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
          placeholder={step.placeholder || 'Type your answer…'}
        />
      )
      footer = <Button level="primary" styleVariant="compact" icon onClick={advance} />
    } else if (step.type === 'end') {
      if (step.media === 'checkmark') media = <Checkmark />
      footer = <Button level="primary" styleVariant="fill" onClick={close}>Done</Button>
    }
  }

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
              heading={step.heading}
              body={step.body}
              media={media}
              footer={footer}
              onClose={close}
              slideIn={entryType === 'sheet'}
            >
              {slot}
            </Sheet>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
