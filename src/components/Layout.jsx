import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'

export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-3 focus:left-3 focus:bg-ink focus:text-white focus:px-4 focus:py-2 focus:no-underline text-small"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
