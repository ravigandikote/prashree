import { useEffect, useReducer, useState } from 'react'
import SEO from '../components/SEO'
import Button from '../components/Button'
import Stepper from '../components/studio/Stepper'
import ExportDialog from '../components/studio/ExportDialog'
import { STEPS } from '../lib/mandala/steps'
import StudioCanvas from '../components/studio/StudioCanvas'
import {
  PaperPanel, CentrePanel, CirclesPanel, LinesPanel, GuidesToggles,
} from '../components/studio/ControlPanels'
import TemplatesPanel from '../components/studio/TemplatesPanel'
import PatternPanel from '../components/studio/PatternPanel'
import { initialStudioState, historyReducer, initialHistory } from '../lib/mandala/state'
import { autosave, readAutosave, clearAutosave } from '../lib/mandala/templates'

const INTRO_KEY = 'prashree_studio_intro_seen'

export default function Studio() {
  const [history, dispatch] = useReducer(historyReducer, undefined, () => initialHistory(initialStudioState()))
  const state = history.present
  const [selectedRing, setSelectedRing] = useState(null)
  const [step, setStep] = useState('paper')
  const [zoom, setZoom] = useState(1)
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem(INTRO_KEY))
  const [showExport, setShowExport] = useState(false)
  const [resume, setResume] = useState(() => (localStorage.getItem(INTRO_KEY) ? readAutosave() : null))

  /* autosave the working state every few seconds */
  useEffect(() => {
    const id = setTimeout(() => autosave(state), 3000)
    return () => clearTimeout(id)
  }, [state])

  /* undo/redo keyboard shortcuts */
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      e.preventDefault()
      dispatch({ type: e.shiftKey ? 'REDO' : 'UNDO' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!showIntro) localStorage.setItem(INTRO_KEY, '1')
  }, [showIntro])

  const startGuided = () => {
    dispatch({ type: 'LOAD_STATE', state: initialStudioState('a4p') })
    setShowIntro(false)
    setStep('circles')
  }

  return (
    <>
      <SEO
        title="Mandala Studio — Draw a Mandala Step by Step"
        description="Construct a mandala the way it's taught on paper: centre, concentric circles, radial guide lines, then patterns — free in your browser, with true-size printable PDF downloads. By PraShree Arts, Bengaluru."
        path="/studio"
        keywords={[
          'mandala maker online', 'mandala generator', 'draw a mandala step by step',
          'mandala grid template printable', 'mandala practice sheets', 'learn mandala art',
        ]}
      />

      <div className="flex flex-col h-[calc(100vh-5rem)] min-h-[480px]">
        <div className="flex items-center border-b border-mist bg-white">
          <div className="flex-1 min-w-0 [&>nav]:border-b-0">
            <Stepper active={step} onSelect={setStep} />
          </div>
          <button
            onClick={() => setShowExport(true)}
            aria-label="Open download options"
            data-testid="studio-download"
            className="shrink-0 mx-3 my-2 px-4 py-2 bg-ink text-white text-small uppercase tracking-label border-0 cursor-pointer hover:bg-charcoal transition-colors"
          >
            Download
          </button>
        </div>

        {resume && (
          <div className="flex items-center justify-center gap-3 bg-paper border-b border-mist px-4 py-2 text-small text-graphite">
            <span>
              You have unsaved work from{' '}
              {new Date(resume.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} —
            </span>
            <button
              onClick={() => { dispatch({ type: 'LOAD_STATE', state: resume.config }); setResume(null) }}
              className="text-ink underline underline-offset-4 bg-transparent border-0 cursor-pointer p-0 text-small"
            >
              resume where you left off
            </button>
            <button
              onClick={() => { clearAutosave(); setResume(null) }}
              className="text-ash hover:text-ink bg-transparent border-0 cursor-pointer p-0 text-small"
            >
              dismiss
            </button>
          </div>
        )}

        <div className="flex flex-1 min-h-0 flex-col md:flex-row">
          {/* Controls */}
          <aside className="md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-mist bg-white overflow-y-auto p-5 space-y-6 max-h-[45vh] md:max-h-none">
            <div>
              <h1 className="font-display text-h3 text-ink">
                {STEPS.find((s) => s.id === step)?.label}
              </h1>
              <p className="text-small text-ash mt-0.5">
                {stepHint(step)}
              </p>
            </div>

            {step === 'paper' && <PaperPanel state={state} dispatch={dispatch} />}
            {step === 'centre' && <CentrePanel state={state} dispatch={dispatch} />}
            {step === 'circles' && <CirclesPanel state={state} dispatch={dispatch} />}
            {step === 'lines' && <LinesPanel state={state} dispatch={dispatch} />}
            {step === 'patterns' && (
              <p className="text-small text-graphite">
                Pick a ring — on the paper or in the panel — then a pattern.
                It repeats across every sector. Undo with Ctrl/Cmd+Z.
              </p>
            )}
            {step === 'export' && (
              <div className="space-y-4">
                <p className="text-small text-graphite">
                  Print at 100% for true-size guides — then keep working on
                  screen, or by hand with pen. Both are the real thing.
                </p>
                <button
                  onClick={() => setShowExport(true)}
                  className="px-4 py-2 bg-ink text-white text-small uppercase tracking-label border-0 cursor-pointer hover:bg-charcoal transition-colors"
                >
                  Open download options
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-mist">
              <p className="text-[10px] uppercase tracking-label text-graphite mb-2">Guides</p>
              <GuidesToggles state={state} dispatch={dispatch} />
            </div>

            <div className="pt-4 border-t border-mist">
              <p className="text-[10px] uppercase tracking-label text-graphite mb-3">Base templates</p>
              <TemplatesPanel state={state} dispatch={dispatch} />
            </div>
          </aside>

          {/* Stage */}
          <StudioCanvas
            state={state}
            dispatch={dispatch}
            zoom={zoom}
            setZoom={setZoom}
            selectedRing={selectedRing}
            onSelectRing={setSelectedRing}
          />

          {/* Pattern library — right on desktop */}
          {step === 'patterns' && (
            <aside className="md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-mist bg-white overflow-y-auto p-5 max-h-[45vh] md:max-h-none">
              <PatternPanel
                state={state}
                dispatch={dispatch}
                selectedRing={selectedRing}
                onSelectRing={setSelectedRing}
              />
            </aside>
          )}
        </div>
      </div>

      <ExportDialog open={showExport} onClose={() => setShowExport(false)} state={state} />

      {/* First-visit intro */}
      {showIntro && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4"
          role="dialog" aria-modal="true" aria-label="Welcome to the Mandala Studio"
          onClick={() => setShowIntro(false)}
        >
          <div className="bg-white max-w-md p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-small uppercase tracking-label text-graphite mb-3">Mandala Studio</p>
            <h2 className="font-display text-h2 text-ink">Built the way it's drawn</h2>
            <p className="text-graphite text-small mt-4">
              Find the centre. Draw concentric circles. Add radial guide lines.
              Then fill the rings, on screen or by hand — the same construction
              Monica teaches on paper.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={startGuided}>Start with a guided base</Button>
              <Button variant="outline" onClick={() => setShowIntro(false)}>
                Blank paper
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function stepHint(step) {
  switch (step) {
    case 'paper': return 'Choose the sheet you would tape to the desk.'
    case 'centre': return 'Every mandala begins at a single point.'
    case 'circles': return 'Concentric guides — the skeleton of the rings.'
    case 'lines': return 'Divide the rings into sectors for symmetry.'
    case 'patterns': return 'Fill ring by ring, sector by sector.'
    case 'export': return 'Print at 100% for true-size guides.'
    default: return ''
  }
}
