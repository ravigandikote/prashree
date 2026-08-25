import { useEffect, useState } from 'react'
import { Phone, Mail } from 'lucide-react'
import { getEnquiries, updateEnquiry } from '../../lib/supabase'
import { StatusBadge, statusSelectClasses } from './adminUi'
import toast from 'react-hot-toast'

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
]

const KINDS = ['all', 'contact', 'booking', 'decor', 'event']

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [filter, setFilter] = useState('all')
  const [kindFilter, setKindFilter] = useState('all')

  useEffect(() => {
    getEnquiries().then((data) => setEnquiries(data || [])).catch(() => {})
  }, [])

  const handleStatus = async (id, status) => {
    try {
      await updateEnquiry(id, { status })
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))
      toast.success('Status updated')
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    }
  }

  const filtered = enquiries.filter(
    (e) =>
      (filter === 'all' || e.status === filter) &&
      (kindFilter === 'all' || e.kind === kindFilter)
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-h2 text-ink">Enquiries</h1>
        <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          {KINDS.map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={`px-3 py-1.5 text-small capitalize transition-colors cursor-pointer border ${
                kindFilter === k
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white text-graphite border-mist hover:border-ink'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {[{ value: 'all', label: 'All' }, ...STATUSES].map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 text-small transition-colors cursor-pointer border ${
                filter === s.value
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
            <div key={item.id} className="p-4 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-medium text-ink">{item.name}</p>
                  <StatusBadge value={item.status} labels={STATUSES} />
                  <span className="text-small text-ash uppercase tracking-wider">{item.kind}</span>
                </div>
                {item.subject && (
                  <p className="text-small text-charcoal mt-1 font-medium">{item.subject}</p>
                )}
                <div className="flex items-center gap-4 mt-1.5 text-small text-graphite flex-wrap">
                  {item.phone && (
                    <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1.5 text-ink no-underline hover:underline underline-offset-4">
                      <Phone size={13} aria-hidden="true" /> {item.phone}
                    </a>
                  )}
                  {item.email && (
                    <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 text-graphite no-underline hover:text-ink">
                      <Mail size={13} aria-hidden="true" /> {item.email}
                    </a>
                  )}
                  <span className="text-ash">
                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
                {(item.event_date || item.venue || item.guest_count) && (
                  <p className="text-small text-charcoal mt-1.5">
                    {[
                      item.event_date &&
                        new Date(item.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                      item.venue,
                      item.guest_count && `${item.guest_count} guests`,
                    ].filter(Boolean).join(' · ')}
                  </p>
                )}
                <p className="text-small text-graphite mt-2 max-w-2xl whitespace-pre-line">{item.message}</p>
              </div>
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
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-graphite text-small">
            No enquiries{filter !== 'all' ? ` with status "${filter}"` : ' yet'}.
          </div>
        )}
      </div>
    </div>
  )
}
