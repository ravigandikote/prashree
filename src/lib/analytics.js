/**
 * Google Analytics 4, loaded only after the visitor accepts cookies.
 *
 * The measurement ID comes from VITE_GA_MEASUREMENT_ID (set it in Vercel →
 * Settings → Environment Variables, then redeploy — Vite bakes env vars in at
 * build time). With no ID every function here is a no-op, so local dev and
 * preview builds never send traffic to the live property.
 *
 * Page views are sent by hand from <Analytics /> because this is a single-page
 * app: gtag's automatic page_view only fires on the first load, not on the
 * client-side navigations react-router does.
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || ''

export const analyticsConfigured = Boolean(GA_ID)

let loaded = false

function gtag(...args) {
  if (!window.dataLayer) return
  window.dataLayer.push(args)
}

/** Injects the gtag script once. Safe to call repeatedly. */
export function loadAnalytics() {
  if (!analyticsConfigured || loaded || typeof document === 'undefined') return
  loaded = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  gtag('js', new Date())
  // page views are sent per route change instead
  gtag('config', GA_ID, { send_page_view: false })
}

export function trackPageView(path, title) {
  if (!loaded) return
  gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  })
}

/** Custom events — enquiries, interest forms, catalogue downloads. */
export function trackEvent(name, params = {}) {
  if (!loaded) return
  gtag('event', name, params)
}
