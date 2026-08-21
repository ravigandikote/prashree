import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
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
const Studio = lazy(() => import('./pages/Studio'))

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminInterests = lazy(() => import('./pages/admin/AdminInterests'))
const AdminEnquiries = lazy(() => import('./pages/admin/AdminEnquiries'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'))
const AdminTemplates = lazy(() => import('./pages/admin/AdminTemplates'))

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
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
                <Route path="/studio" element={<Studio />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />

                <Route path="/workshops" element={<Navigate to="/learn" replace />} />
                {/* Connections is parked for now (page kept in src/pages) */}
                <Route path="/connections" element={<Navigate to="/about" replace />} />

                {/* Legacy routes from the shop era */}
                <Route path="/categories" element={<Navigate to="/products" replace />} />
                <Route path="/categories/:slug" element={<Navigate to="/products" replace />} />
                <Route path="/cart" element={<Navigate to="/products" replace />} />
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
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  )
}
