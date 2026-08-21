import { STEPS } from '../../lib/mandala/steps'

export default function Stepper({ active, onSelect }) {
  return (
    <nav aria-label="Construction steps" className="border-b border-mist bg-white overflow-x-auto">
      <ol className="flex list-none p-0 m-0 min-w-max">
        {STEPS.map((step, i) => (
          <li key={step.id}>
            <button
              onClick={() => onSelect(step.id)}
              aria-current={active === step.id ? 'step' : undefined}
              className={`px-4 md:px-6 py-3 text-small uppercase tracking-label border-b-2 -mb-px transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 whitespace-nowrap ${
                active === step.id
                  ? 'text-ink border-ink'
                  : 'text-graphite border-transparent hover:text-ink'
              }`}
            >
              <span className="text-ash mr-1.5">{i + 1}</span>
              {step.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
