import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom'
import { LayoutDashboard, Package, Grid3X3, ShoppingCart, Image, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../../components/UI'

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Grid3X3 },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/media', label: 'Media', icon: Image },
]

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border shrink-0 hidden lg:block">
        <div className="sticky top-0">
          <div className="p-6 border-b border-border">
            <Link to="/admin" className="no-underline">
              <h2 className="font-display text-xl font-bold text-primary">
                PraShree Admin
              </h2>
            </Link>
            <p className="text-xs text-muted mt-1">{user.email}</p>
          </div>

          <nav className="p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = link.exact
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to)

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm no-underline transition-colors
                    ${isActive ? 'bg-primary text-white' : 'text-muted hover:text-primary hover:bg-lighter'}
                  `}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted hover:text-red-600 transition-colors w-full cursor-pointer bg-transparent border-0"
            >
              <LogOut size={16} />
              Sign Out
            </button>
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted hover:text-primary transition-colors no-underline mt-1"
            >
              View Site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
