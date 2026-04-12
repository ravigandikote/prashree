import { useEffect, useState } from 'react'
import { getOrders, updateOrderStatus } from '../../lib/supabase'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['received', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')

  const loadOrders = () => {
    getOrders()
      .then((data) => setOrders(data || []))
      .catch(() => { })
  }

  useEffect(() => { loadOrders() }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      toast.success('Order status updated')
      loadOrders()
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  const filtered = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">Orders</h1>
        <div className="flex gap-2">
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 text-xs capitalize transition-colors cursor-pointer border ${filter === s
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-muted border-border hover:border-primary'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-muted font-medium">Order #</th>
              <th className="text-left p-3 text-muted font-medium">Customer</th>
              <th className="text-left p-3 text-muted font-medium">Items</th>
              <th className="text-left p-3 text-muted font-medium">Amount</th>
              <th className="text-left p-3 text-muted font-medium">Payment</th>
              <th className="text-left p-3 text-muted font-medium">Status</th>
              <th className="text-left p-3 text-muted font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-lighter/50">
                  <td className="p-3 font-mono text-xs">{order.order_number}</td>
                  <td className="p-3">
                    <p className="font-medium text-primary">{order.customer_name}</p>
                    <p className="text-xs text-muted">{order.customer_email}</p>
                    {order.customer_phone && (
                      <p className="text-xs text-muted">{order.customer_phone}</p>
                    )}
                  </td>
                  <td className="p-3">
                    <ul className="space-y-0.5">
                      {(order.items || []).map((item, idx) => (
                        <li key={idx} className="text-xs text-muted">
                          {item.name} x{item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-3 font-medium">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-xs ${order.payment_status === 'paid' ? 'bg-green-50 text-green-700'
                        : order.payment_status === 'failed' ? 'bg-red-50 text-red-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="px-2 py-1 border border-border text-xs focus:outline-none focus:border-primary bg-white cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-xs text-muted">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted">
                  {filter === 'all' ? 'No orders yet.' : `No ${filter} orders.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
