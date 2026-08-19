import { Link, Outlet, useLocation, Navigate } from 'react-router-dom'
import { Inbox, MessageSquare, Package, Grid3X3, Image, FileText, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../../components/UI'

const sidebarLinks = [
  { to: '/admin', label: 'Interests', icon: Inbox, exact: true },
  { to: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/posts', label: 'Blog', icon: FileText },
  { to: '/admin/categories', label: 'Categories', icon: Grid3X3 },
  { to: '/admin/media', label: 'Media', icon: Image },
]

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-paper flex">
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
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted hover:text-ink transition-colors w-full cursor-pointer bg-transparent border-0"
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
      <div className="flex-1 min-w-0">
        {/* Mobile top nav */}
        <div className="lg:hidden bg-white border-b border-border sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/admin" className="no-underline font-display text-lg text-primary">
              PraShree Admin
            </Link>
            <button
              onClick={signOut}
              className="text-sm text-muted hover:text-ink cursor-pointer bg-transparent border-0 flex items-center gap-1.5"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
          <nav className="flex gap-1 px-2 pb-2 overflow-x-auto" aria-label="Admin sections">
            {sidebarLinks.map((link) => {
              const isActive = link.exact
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 text-sm whitespace-nowrap no-underline transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-muted hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
