import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ConsentProvider } from './context/ConsentContext'
import { SoundProvider } from './context/SoundContext'
import Layout from './components/Layout'
import Analytics from './components/Analytics'
import CookieConsent from './components/CookieConsent'
import { LoadingSpinner } from './components/UI'

/* ── Lazy-loaded pages for code splitting ── */
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Learn = lazy(() => import('./pages/Learn'))
const Contact = lazy(() => import('./pages/Contact'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const SacredGeometry = lazy(() => import('./pages/SacredGeometry'))
const WorkshopEvents = lazy(() => import('./pages/WorkshopEvents'))
const Events = lazy(() => import('./pages/Events'))
const Studio = lazy(() => import('./pages/Studio'))
const StudioHub = lazy(() => import('./pages/StudioHub'))
const SoundHealing = lazy(() => import('./pages/SoundHealing'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Placement = lazy(() => import('./pages/Placement'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const NotFound = lazy(() => import('./pages/NotFound'))

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminInterests = lazy(() => import('./pages/admin/AdminInterests'))
const AdminEnquiries = lazy(() => import('./pages/admin/AdminEnquiries'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'))
const AdminTemplates = lazy(() => import('./pages/admin/AdminTemplates'))
const AdminWorkshops = lazy(() => import('./pages/admin/AdminWorkshops'))
const AdminPlacement = lazy(() => import('./pages/admin/AdminPlacement'))
const AdminSounds = lazy(() => import('./pages/admin/AdminSounds'))
// dev-only lab for the sound engine — the route is registered only under `vite dev`
const SoundLab = import.meta.env.DEV ? lazy(() => import('./pages/dev/SoundLab')) : null

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ConsentProvider>
          <BrowserRouter>
            <SoundProvider>
            <Analytics />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1f1f1f',
                  color: '#fff',
                  fontSize: '14px',
                },
              }}
            />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/learn" element={<Learn />} />
                  <Route path="/sacred-geometry" element={<SacredGeometry />} />
                  <Route path="/studio" element={<StudioHub />} />
                  <Route path="/studio/mandala" element={<Studio />} />
                  <Route path="/studio/sound-healing" element={<SoundHealing />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/placement" element={<Placement />} />
                  {SoundLab && <Route path="/dev/sound" element={<SoundLab />} />}
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />

                  <Route path="/workshops" element={<WorkshopEvents />} />
                  <Route path="/events" element={<Events />} />
                  {/* Connections is parked for now (page kept in src/pages) */}
                  <Route path="/connections" element={<Navigate to="/about" replace />} />

                  {/* Legacy routes from the shop era */}
                  <Route path="/categories" element={<Navigate to="/products" replace />} />
                  <Route path="/categories/:slug" element={<Navigate to="/products" replace />} />
                  <Route path="/cart" element={<Navigate to="/products" replace />} />

                  {/* Anything else — custom 404, inside the site chrome */}
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminInterests />} />
                  <Route path="enquiries" element={<AdminEnquiries />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="posts" element={<AdminPosts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="templates" element={<AdminTemplates />} />
                  <Route path="workshops" element={<AdminWorkshops />} />
                  <Route path="placement" element={<AdminPlacement />} />
                  <Route path="sounds" element={<AdminSounds />} />
                </Route>
              </Routes>
            </Suspense>
            <CookieConsent />
            </SoundProvider>
          </BrowserRouter>
        </ConsentProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
