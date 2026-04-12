import { useEffect, useState } from 'react'
import { Package, ShoppingCart, Grid3X3, DollarSign } from 'lucide-react'
import { getCategories, getProducts, getOrders } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ categories: 0, products: 0, orders: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    Promise.all([getCategories(), getProducts(), getOrders()])
      .then(([cats, prods, orders]) => {
        const revenue = (orders || [])
          .filter((o) => o.payment_status === 'paid')
          .reduce((sum, o) => sum + Number(o.total_amount), 0)
        setStats({
          categories: cats?.length || 0,
          products: prods?.length || 0,
          orders: orders?.length || 0,
          revenue,
        })
        setRecentOrders((orders || []).slice(0, 5))
      })
      .catch(() => { })
  }, [])

  const statCards = [
    { label: 'Categories', value: stats.categories, icon: Grid3X3, color: 'text-blue-600' },
    { label: 'Products', value: stats.products, icon: Package, color: 'text-green-600' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, color: 'text-purple-600' },
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-amber-600' },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary mb-8">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-primary mt-1">{s.value}</p>
              </div>
              <s.icon size={24} className={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-primary">
            Recent Orders
          </h2>
        </div>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted font-medium">Order #</th>
                  <th className="text-left p-3 text-muted font-medium">Customer</th>
                  <th className="text-left p-3 text-muted font-medium">Amount</th>
                  <th className="text-left p-3 text-muted font-medium">Payment</th>
                  <th className="text-left p-3 text-muted font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-mono text-xs">{order.order_number}</td>
                    <td className="p-3">{order.customer_name}</td>
                    <td className="p-3">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-xs ${order.payment_status === 'paid'
                          ? 'bg-green-50 text-green-700'
                          : order.payment_status === 'failed'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-xs bg-lighter text-secondary">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted text-sm">
            No orders yet. Orders will appear here once customers start purchasing.
          </div>
        )}
      </div>
    </div>
  )
}
