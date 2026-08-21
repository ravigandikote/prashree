import { useEffect, useReducer, useState } from 'react'
import SEO from '../components/SEO'
import Button from '../components/Button'
import Stepper from '../components/studio/Stepper'
import { STEPS } from '../lib/mandala/steps'
import StudioCanvas from '../components/studio/StudioCanvas'
import {
  PaperPanel, CentrePanel, CirclesPanel, LinesPanel, GuidesToggles,
} from '../components/studio/ControlPanels'
import { initialStudioState, studioReducer } from '../lib/mandala/state'

const INTRO_KEY = 'prashree_studio_intro_seen'

export default function Studio() {
  const [state, dispatch] = useReducer(studioReducer, undefined, () => initialStudioState())
  const [step, setStep] = useState('paper')
  const [zoom, setZoom] = useState(1)
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem(INTRO_KEY))

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
        <Stepper active={step} onSelect={setStep} />

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
                The pattern library arrives in the next stage of the studio —
                for now, download your base and fill it by hand with pen.
              </p>
            )}
            {step === 'export' && (
              <p className="text-small text-graphite">
                Export arrives in the next stage — PDF at true print size,
                with or without the construction guides.
              </p>
            )}

            <div className="pt-4 border-t border-mist">
              <p className="text-[10px] uppercase tracking-label text-graphite mb-2">Guides</p>
              <GuidesToggles state={state} dispatch={dispatch} />
            </div>
          </aside>

          {/* Stage */}
          <StudioCanvas state={state} dispatch={dispatch} zoom={zoom} setZoom={setZoom} />
        </div>
      </div>

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
