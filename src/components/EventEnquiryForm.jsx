import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, MessageCircle } from 'lucide-react'
import { Field, Input, Select, Textarea } from './Form'
import Button from './Button'
import { createEnquiry } from '../lib/supabase'
import { MandalaOrnament } from './UI'
import { eventsContent, whatsappLink } from '../data/events'

const INDIAN_PHONE = /^(\+91[-\s]?)?[6-9]\d{9}$/

/**
 * Event décor enquiry: saves to the enquiries table (kind 'event') so it
 * lands in /admin, then offers a prefilled WhatsApp continuation.
 */
export default function EventEnquiryForm() {
  const [form, setForm] = useState({
    name: '', phone: '', occasion: '', date: '', venue: '', guests: '', notes: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const summary = () =>
    `Hi PraShree Events, I'd like décor for a ${form.occasion || 'celebration'}` +
    `${form.date ? ` on ${form.date}` : ''}${form.venue ? ` at ${form.venue}` : ''}` +
    `${form.guests ? ` (~${form.guests} guests)` : ''}. — ${form.name}`

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Please tell us your name.'
    if (!INDIAN_PHONE.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Please enter a valid Indian mobile number.'
    if (!form.occasion) errs.occasion = 'Pick the occasion.'
    if (!form.date) errs.date = 'Pick a date — a rough one is fine.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await createEnquiry({
        kind: 'event',
        name: form.name.trim(),
        phone: form.phone.trim(),
        subject: `Event décor: ${form.occasion}`,
        message: form.notes.trim() || `${form.occasion} décor enquiry`,
        event_date: form.date || null,
        venue: form.venue.trim() || null,
        guest_count: form.guests ? parseInt(form.guests) : null,
      })
      setDone(true)
    } catch {
      setErrors({ submit: 'Something went wrong — please try again, or message us on WhatsApp directly.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
        <div className="flex justify-center"><MandalaOrnament /></div>
        <h3 className="font-display text-h3 text-ink mt-4 flex items-center justify-center gap-2">
          <Check size={18} aria-hidden="true" /> Enquiry received
        </h3>
        <p className="text-graphite mt-2 max-w-sm mx-auto">
          Monica will call you to talk through the occasion. Want to keep the
          conversation going right now?
        </p>
        <div className="mt-6">
          <Button href={whatsappLink(summary())} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={14} aria-hidden="true" /> Continue on WhatsApp
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Name" htmlFor="ev-name" required>
          <Input id="ev-name" name="name" autoComplete="name" value={form.name} onChange={handleChange} required aria-invalid={!!errors.name} />
          {errors.name && <p className="text-small text-charcoal mt-1">{errors.name}</p>}
        </Field>
        <Field label="Phone" htmlFor="ev-phone" required hint="Indian mobile number">
          <Input id="ev-phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} required aria-invalid={!!errors.phone} />
          {errors.phone && <p className="text-small text-charcoal mt-1">{errors.phone}</p>}
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Occasion" htmlFor="ev-occasion" required>
          <Select id="ev-occasion" name="occasion" value={form.occasion} onChange={handleChange} required aria-invalid={!!errors.occasion}>
            <option value="">Choose…</option>
            {eventsContent.occasions.map((o) => (
              <option key={o.name} value={o.name}>{o.name}</option>
            ))}
            <option value="Something else">Something else</option>
          </Select>
          {errors.occasion && <p className="text-small text-charcoal mt-1">{errors.occasion}</p>}
        </Field>
        <Field label="Date" htmlFor="ev-date" required>
          <Input id="ev-date" name="date" type="date" value={form.date} onChange={handleChange} required aria-invalid={!!errors.date} />
          {errors.date && <p className="text-small text-charcoal mt-1">{errors.date}</p>}
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Venue / area" htmlFor="ev-venue">
          <Input id="ev-venue" name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Club house, Kalyan Nagar" />
        </Field>
        <Field label="Guest count" htmlFor="ev-guests">
          <Input id="ev-guests" name="guests" type="number" min="1" max="5000" value={form.guests} onChange={handleChange} />
        </Field>
      </div>
      <Field label="Notes" htmlFor="ev-notes">
        <Textarea id="ev-notes" name="notes" rows={4} value={form.notes} onChange={handleChange} placeholder="Theme, colours you love, anything already booked…" />
      </Field>

      {errors.submit && <p className="text-small text-charcoal">{errors.submit}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send enquiry'}
        </Button>
        <Button
          variant="outline"
          href={whatsappLink("Hi PraShree Events, I'd like décor for an upcoming celebration.")}
          target="_blank" rel="noopener noreferrer"
        >
          <MessageCircle size={14} aria-hidden="true" /> Or WhatsApp us
        </Button>
      </div>
    </form>
  )
}
