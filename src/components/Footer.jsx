import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, AtSign } from 'lucide-react'
import logo from '../assets/logo.png'

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logo}
                alt="PraShree Arts mandala logo"
                className="h-12 w-12 object-contain invert brightness-200"
              />
              <h3 className="font-display text-h3 text-white">PraShree Arts</h3>
            </div>
            <p className="text-white/60 text-small leading-relaxed">
              Handcrafted art by Monica Prakash. Mandala Art Therapy, Janur Art,
              and bespoke creations that bring balance and calm.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-small uppercase tracking-label text-white/80 mb-4">
              Explore
            </h4>
            <ul className="space-y-2 list-none p-0">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Monica' },
                { to: '/products', label: 'Artworks & Products' },
                { to: '/learn', label: 'Learn with Monica' },
                { to: '/blog', label: 'Blog' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/60 hover:text-white text-small transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio */}
          <div>
            <h4 className="text-small uppercase tracking-label text-white/80 mb-4">
              Studio
            </h4>
            <ul className="space-y-2 list-none p-0">
              {[
                { to: '/products', label: 'The Collection' },
                { to: '/sacred-geometry', label: 'Sacred Geometry' },
                { to: '/workshops', label: 'Upcoming Workshops' },
                { to: '/events', label: 'PraShree Events' },
                { to: '/contact', label: 'Bespoke Orders' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/60 hover:text-white text-small transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-small uppercase tracking-label text-white/80 mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 list-none p-0">
              <li className="flex items-center gap-3 text-small">
                <Phone size={16} className="shrink-0 text-white/60" />
                <a
                  href="tel:+919353464363"
                  className="text-white/60 hover:text-white transition-colors no-underline"
                >
                  +91 93534 64363
                </a>
              </li>
              <li className="flex items-center gap-3 text-small">
                <Mail size={16} className="shrink-0 text-white/60" />
                <a
                  href="mailto:info@prashreearts.com"
                  className="text-white/60 hover:text-white transition-colors no-underline"
                >
                  info@prashreearts.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-small">
                <AtSign size={16} className="shrink-0 text-white/60" />
                <a
                  href="https://instagram.com/prashreearts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors no-underline"
                >
                  @prashreearts
                </a>
              </li>
              <li className="flex items-start gap-3 text-small text-white/60">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <span>NeeRav Arts Village, Bengaluru</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-small">
            &copy; {new Date().getFullYear()} PraShree Arts. All rights reserved.
          </p>
          <p className="text-white/40 text-small">
            Creative Director at NeeRav Arts Village
          </p>
        </div>
      </div>
    </footer>
  )
}
