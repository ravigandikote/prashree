import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Send } from 'lucide-react'
import SEO from '../components/SEO'
import { SectionHeading } from '../components/UI'
import toast from 'react-hot-toast'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    // In production, send to Supabase or an external email service
    try {
      await new Promise((r) => setTimeout(r, 1000)) // simulate
      toast.success('Message sent! We will get back to you soon.')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClasses = `
    w-full px-4 py-3 bg-white border border-border text-secondary
    focus:outline-none focus:border-primary transition-colors
    placeholder:text-muted/50 font-body text-sm
  `

  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with PraShree Arts. Enquire about artworks, workshops, custom orders, or event decorations by Monica Prakash."
        path="/contact"
      />

      {/* ── Header ── */}
      <section className="py-16 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Get in Touch"
            subtitle="Have a question about our art, workshops, or custom orders? We'd love to hear from you."
          />
        </div>
      </section>

      {/* ── Contact Content ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-16">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 space-y-8"
            >
              <div>
                <h3 className="font-display text-xl font-semibold text-primary">
                  PraShree Arts
                </h3>
                <p className="text-muted text-sm mt-2 leading-relaxed">
                  Handcrafted art and therapeutic workshops by Monica Prakash.
                  Available for custom orders, events, and residential workshops
                  at NeeRav Arts Village.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="tel:9353464363"
                  className="flex items-center gap-4 text-secondary hover:text-primary transition-colors no-underline group"
                >
                  <div className="w-10 h-10 border border-border group-hover:border-primary flex items-center justify-center transition-colors">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-medium">+91 93534 64363</p>
                  </div>
                </a>

                <a
                  href="mailto:info@prashreearts.com"
                  className="flex items-center gap-4 text-secondary hover:text-primary transition-colors no-underline group"
                >
                  <div className="w-10 h-10 border border-border group-hover:border-primary flex items-center justify-center transition-colors">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium">info@prashreearts.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 text-secondary">
                  <div className="w-10 h-10 border border-border flex items-center justify-center">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider">Location</p>
                    <p className="text-sm font-medium">NeeRav Arts Village</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-3"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name *"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address *"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject *"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
                <textarea
                  name="message"
                  placeholder="Your Message *"
                  required
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                  className={`${inputClasses} resize-none`}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-medium tracking-wide hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer border-0"
                >
                  <Send size={16} />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
