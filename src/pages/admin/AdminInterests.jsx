import { useEffect, useState } from 'react'
import { Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import { getInterests, updateInterest, getProducts } from '../../lib/supabase'
import { StatusBadge, statusSelectClasses } from './adminUi'
import toast from 'react-hot-toast'

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'called', label: 'Called' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'closed', label: 'Closed' },
]

export default function AdminInterests() {
  const [interests, setInterests] = useState([])
  const [products, setProducts] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [notesDraft, setNotesDraft] = useState('')

  const load = () => {
    getInterests().then((data) => setInterests(data || [])).catch(() => {})
    getProducts().then((data) => setProducts(data || [])).catch(() => {})
  }
  useEffect(load, [])

  const handleStatus = async (id, status) => {
    try {
      await updateInterest(id, { status })
      setInterests((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
      toast.success('Status updated')
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    }
  }

  const saveNotes = async (id) => {
    try {
      await updateInterest(id, { admin_notes: notesDraft })
      setInterests((prev) =>
        prev.map((i) => (i.id === id ? { ...i, admin_notes: notesDraft } : i))
      )
      toast.success('Notes saved')
    } catch (err) {
      toast.error(err.message || 'Failed to save notes')
    }
  }

  const filtered = interests.filter(
    (i) =>
      (statusFilter === 'all' || i.status === statusFilter) &&
      (productFilter === 'all' || i.product_id === productFilter)
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-h2 text-ink">Interest requests</h1>
        <div className="flex flex-wrap gap-3">
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className={statusSelectClasses}
            aria-label="Filter by product"
          >
            <option value="all">All products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="flex gap-1">
            {[{ value: 'all', label: 'All' }, ...STATUSES].map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-1.5 text-small transition-colors cursor-pointer border ${
                  statusFilter === s.value
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-graphite border-mist hover:border-ink'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-mist divide-y divide-mist">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div key={item.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-medium text-ink">{item.name}</p>
                    <StatusBadge value={item.status} labels={STATUSES} />
                    {item.products?.name && (
                      <span className="text-small text-graphite">
                        · {item.products.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-small text-graphite flex-wrap">
                    <a
                      href={`tel:${item.phone}`}
                      className="inline-flex items-center gap-1.5 text-ink no-underline hover:underline underline-offset-4"
                    >
                      <Phone size={13} aria-hidden="true" /> {item.phone}
                    </a>
                    {item.email && (
                      <a
                        href={`mailto:${item.email}`}
                        className="inline-flex items-center gap-1.5 text-graphite no-underline hover:text-ink"
                      >
                        <Mail size={13} aria-hidden="true" /> {item.email}
                      </a>
                    )}
                    {item.city && <span>{item.city}</span>}
                    <span className="text-ash">
                      {new Date(item.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                  {item.message && (
                    <p className="text-small text-graphite mt-2 max-w-2xl">{item.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatus(item.id, e.target.value)}
                    className={statusSelectClasses}
                    aria-label={`Status for ${item.name}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setExpanded(expanded === item.id ? null : item.id)
                      setNotesDraft(item.admin_notes || '')
                    }}
                    className="p-1.5 text-graphite hover:text-ink cursor-pointer bg-transparent border-0"
                    aria-label="Toggle notes"
                  >
                    {expanded === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expanded === item.id && (
                <div className="mt-3 pl-0 sm:pl-4 border-l-0 sm:border-l border-mist">
                  <label className="block text-small text-graphite mb-1" htmlFor={`notes-${item.id}`}>
                    Notes
                  </label>
                  <textarea
                    id={`notes-${item.id}`}
                    rows={3}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="w-full border border-mist p-2 text-small focus:outline-none focus:border-ink"
                  />
                  <button
                    onClick={() => saveNotes(item.id)}
                    className="mt-2 px-4 py-1.5 bg-ink text-white text-small hover:bg-charcoal transition-colors cursor-pointer border-0"
                  >
                    Save notes
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-graphite text-small">
            No interest requests{statusFilter !== 'all' || productFilter !== 'all' ? ' match these filters' : ' yet'}.
          </div>
        )}
      </div>
    </div>
  )
}
