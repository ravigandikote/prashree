import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import SEO from '../../components/SEO'

export default function AdminLogin() {
  const { user, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO title="Admin Login" path="/admin/login" />

      <section className="min-h-[80vh] flex items-center justify-center bg-surface">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-white border border-border p-8">
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-bold text-primary">
                PraShree Arts
              </h1>
              <p className="text-muted text-sm mt-2">Admin Dashboard</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-border text-secondary focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="admin@prashreearts.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-border text-secondary focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white font-medium tracking-wide hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer border-0"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
