import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { Field, Input, Textarea } from './Form'
import Button from './Button'
import { createEnquiry } from '../lib/supabase'
import { MandalaOrnament } from './UI'

const INDIAN_PHONE = /^(\+91[-\s]?)?[6-9]\d{9}$/

/**
 * General enquiry form writing to the `enquiries` table.
 * kind: 'contact' | 'booking' | 'decor'; a fixed `subject` (e.g. a workshop
 * title) locks the subject field, otherwise the visitor types one.
 */
export default function EnquiryForm({ kind = 'contact', subject, onDone, submitLabel = 'Send message' }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: subject || '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Please tell us your name.'
    if (!form.message.trim()) errs.message = 'Please write a short message.'
    if (!form.phone.trim() && !form.email.trim())
      errs.phone = 'Please share a phone number or an email so Monica can reach you.'
    if (form.phone && !INDIAN_PHONE.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Please enter a valid Indian mobile number.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Please enter a valid email.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await createEnquiry({
        kind,
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        subject: form.subject.trim() || null,
        message: form.message.trim(),
      })
      setDone(true)
    } catch {
      setErrors({ submit: 'Something went wrong — please try again, or call us directly.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
        <div className="flex justify-center"><MandalaOrnament /></div>
        <h3 className="font-display text-h3 text-ink mt-4 flex items-center justify-center gap-2">
          <Check size={18} aria-hidden="true" /> Message received
        </h3>
        <p className="text-graphite mt-2 max-w-sm mx-auto">
          Thank you — Monica will get back to you soon.
        </p>
        {onDone && (
          <Button variant="link" className="mt-6" onClick={onDone}>Close</Button>
        )}
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Name" htmlFor="enq-name" required>
          <Input id="enq-name" name="name" autoComplete="name" value={form.name} onChange={handleChange} required aria-invalid={!!errors.name} />
          {errors.name && <p className="text-small text-charcoal mt-1">{errors.name}</p>}
        </Field>
        <Field label="Phone" htmlFor="enq-phone">
          <Input id="enq-phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} aria-invalid={!!errors.phone} />
          {errors.phone && <p className="text-small text-charcoal mt-1">{errors.phone}</p>}
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Email" htmlFor="enq-email">
          <Input id="enq-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-small text-charcoal mt-1">{errors.email}</p>}
        </Field>
        <Field label="Subject" htmlFor="enq-subject">
          <Input id="enq-subject" name="subject" value={form.subject} onChange={handleChange} readOnly={!!subject} className={subject ? 'text-graphite' : ''} />
        </Field>
      </div>
      <Field label="Message" htmlFor="enq-message" required>
        <Textarea id="enq-message" name="message" rows={5} value={form.message} onChange={handleChange} required aria-invalid={!!errors.message} />
        {errors.message && <p className="text-small text-charcoal mt-1">{errors.message}</p>}
      </Field>

      {errors.submit && <p className="text-small text-charcoal">{errors.submit}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : submitLabel}
      </Button>
    </form>
  )
}

/** Modal wrapper, e.g. for booking a workshop from /learn */
export function EnquiryModal({ open, onClose, kind = 'booking', subject, title = 'Enquire' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/60 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={subject ? `${title}: ${subject}` : title}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white w-full max-w-lg p-8 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <p className="text-small uppercase tracking-label text-graphite">{title}</p>
              {subject && <h3 className="font-display text-h3 text-ink mt-1">{subject}</h3>}
            </div>
            <EnquiryForm kind={kind} subject={subject} onDone={onClose} submitLabel="Send enquiry" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
