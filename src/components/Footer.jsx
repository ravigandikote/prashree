import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      {/* Mandala-inspired top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl font-bold mb-4">
              PraShree Arts
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Handcrafted art by Monica Prakash. Mandala Art Therapy, Janur Art,
              and bespoke creations that bring balance and calm.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Monica' },
                { to: '/categories', label: 'Art Categories' },
                { to: '/workshops', label: 'Workshops' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/60 hover:text-white text-sm transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">
              Art Forms
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/categories/mandala-art', label: 'Mandala Art' },
                { to: '/categories/janur-art', label: 'Janur Art' },
                { to: '/categories/wall-arts', label: 'Wall Arts' },
                { to: '/categories/home-decor', label: 'Home Décor' },
                { to: '/categories/abstract-paintings', label: 'Abstract Paintings' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/60 hover:text-white text-sm transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/60 text-sm">
                <Phone size={16} className="shrink-0" />
                <a href="tel:9353464363" className="hover:text-white transition-colors no-underline text-white/60">
                  +91 93534 64363
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/60 text-sm">
                <Mail size={16} className="shrink-0" />
                <a href="mailto:info@prashreearts.com" className="hover:text-white transition-colors no-underline text-white/60">
                  info@prashreearts.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/60 text-sm">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <span>NeeRav Arts Village</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} PraShree Arts. All rights reserved.
          </p>
          <p className="text-white/40 text-sm">
            Creative Director at NeeRav Arts Village
          </p>
        </div>
      </div>
    </footer>
  )
}
