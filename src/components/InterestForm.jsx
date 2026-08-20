import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { Field, Input, Textarea } from './Form'
import Button from './Button'
import { createInterest } from '../lib/supabase'
import { MandalaOrnament } from './UI'

const INDIAN_PHONE = /^(\+91[-\s]?)?[6-9]\d{9}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Express-interest form for a product. Creates an `interests` record;
 * Monica follows up personally — no online payment.
 */
export default function InterestForm({ product, onDone }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Please tell us your name.'
    if (!INDIAN_PHONE.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Please enter a valid Indian mobile number.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Please enter a valid email, or leave it blank.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      // product.id is only a DB uuid once the catalogue is seeded; in
      // fallback mode it's the slug — record the name in the message instead.
      const linked = UUID.test(product?.id || '')
      const note = form.message.trim()
      await createInterest({
        product_id: linked ? product.id : null,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        city: form.city.trim() || null,
        message: !linked && product?.name
          ? `[${product.name}] ${note}`.trim()
          : note || null,
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-10"
      >
        <div className="flex justify-center"><MandalaOrnament /></div>
        <h3 className="font-display text-h3 text-ink mt-4 flex items-center justify-center gap-2">
          <Check size={18} aria-hidden="true" /> Thank you
        </h3>
        <p className="text-graphite mt-2 max-w-sm mx-auto">
          Your interest has been noted. Monica will reach out to you personally.
        </p>
        {onDone && (
          <Button variant="link" className="mt-6" onClick={onDone}>
            Close
          </Button>
        )}
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Name" htmlFor="int-name" required>
          <Input
            id="int-name" name="name" autoComplete="name"
            value={form.name} onChange={handleChange} required
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-small text-charcoal mt-1">{errors.name}</p>}
        </Field>
        <Field label="Phone" htmlFor="int-phone" required hint="Indian mobile number">
          <Input
            id="int-phone" name="phone" type="tel" autoComplete="tel"
            value={form.phone} onChange={handleChange} required
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p className="text-small text-charcoal mt-1">{errors.phone}</p>}
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Email" htmlFor="int-email">
          <Input
            id="int-email" name="email" type="email" autoComplete="email"
            value={form.email} onChange={handleChange}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-small text-charcoal mt-1">{errors.email}</p>}
        </Field>
        <Field label="City" htmlFor="int-city">
          <Input
            id="int-city" name="city" autoComplete="address-level2"
            value={form.city} onChange={handleChange}
          />
        </Field>
      </div>
      <Field label="Message" htmlFor="int-message">
        <Textarea
          id="int-message" name="message" rows={4}
          value={form.message} onChange={handleChange}
          placeholder="Anything you'd like Monica to know — size, occasion, customisation…"
        />
      </Field>

      {errors.submit && <p className="text-small text-charcoal">{errors.submit}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : 'Express interest'}
      </Button>
    </form>
  )
}

/** Modal wrapper around the form */
export function InterestModal({ open, onClose, product }) {
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
          aria-label={`Express interest in ${product?.name || 'this artwork'}`}
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
              <p className="text-small uppercase tracking-label text-graphite">
                Express interest
              </p>
              {product?.name && (
                <h3 className="font-display text-h3 text-ink mt-1">{product.name}</h3>
              )}
            </div>
            <InterestForm product={product} onDone={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
