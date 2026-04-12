import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import RazorpayButton from '../components/RazorpayButton'
import { useCart } from '../context/CartContext'
import { createOrder, updateOrderPayment } from '../lib/supabase'
import { generateOrderNumber } from '../lib/razorpay'
import toast from 'react-hot-toast'

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalAmount } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    try {
      const orderNumber = generateOrderNumber()
      const orderData = {
        order_number: orderNumber,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: form.address,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.sale_price || item.price,
          quantity: item.quantity,
        })),
        total_amount: totalAmount,
        payment_status: 'pending',
        status: 'received',
      }

      await createOrder(orderData)
      toast.success(`Order ${orderNumber} created! Proceeding to payment...`)
      // In production: create Razorpay order, then open checkout
    } catch {
      toast.error('Failed to create order. Please try again.')
    }
  }

  const handlePaymentSuccess = async (response) => {
    try {
      await updateOrderPayment(response.razorpay_order_id, {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        payment_status: 'paid',
      })
      clearCart()
      toast.success('Payment successful! Order confirmed.')
    } catch {
      toast.error('Payment recorded but order update failed. Contact us.')
    }
  }

  if (items.length === 0) {
    return (
      <>
        <SEO title="Cart" path="/cart" />
        <section className="py-24 bg-white">
          <div className="max-w-md mx-auto px-4 text-center">
            <ShoppingBag size={48} className="mx-auto text-light" />
            <h1 className="font-display text-2xl font-bold text-primary mt-6">
              Your Cart is Empty
            </h1>
            <p className="text-muted mt-3">
              Discover beautiful handcrafted art by Monica Prakash.
            </p>
            <Link
              to="/categories"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium tracking-wide hover:bg-secondary transition-colors no-underline"
            >
              Browse Art
            </Link>
          </div>
        </section>
      </>
    )
  }

  const inputClasses =
    'w-full px-4 py-3 bg-white border border-border text-secondary focus:outline-none focus:border-primary transition-colors placeholder:text-muted/50 text-sm'

  return (
    <>
      <SEO title="Cart" path="/cart" />

      <section className="py-12 bg-white min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl font-bold text-primary">
              Your Cart
            </h1>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 text-muted hover:text-primary text-sm no-underline transition-colors"
            >
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const imageUrl =
                  item.images?.[0] ||
                  `https://placehold.co/200x200/1a1a1a/ffffff?text=${encodeURIComponent(item.name)}`
                const price = item.sale_price || item.price

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-4 p-4 border border-border"
                  >
                    <Link to={`/products/${item.slug}`} className="shrink-0">
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-24 h-24 object-cover bg-lighter"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.slug}`}
                        className="font-display font-semibold text-primary no-underline hover:text-accent transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted mt-1">
                        &#8377;{price.toLocaleString('en-IN')} each
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-lighter transition-colors cursor-pointer bg-transparent border-0"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-lighter transition-colors cursor-pointer bg-transparent border-0"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-primary">
                            &#8377;{(price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted hover:text-red-600 transition-colors cursor-pointer bg-transparent border-0 p-1"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Order Summary */}
            <div>
              <div className="border border-border p-6 sticky top-24">
                <h2 className="font-display text-xl font-semibold text-primary mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>Subtotal ({items.length} items)</span>
                    <span>&#8377;{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="h-px bg-border my-4" />
                  <div className="flex justify-between text-lg font-semibold text-primary">
                    <span>Total</span>
                    <span>&#8377;{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {!showCheckout ? (
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full mt-6 py-3 px-6 bg-primary text-white font-medium tracking-wide hover:bg-secondary transition-colors cursor-pointer border-0"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <form onSubmit={handleCheckout} className="mt-6 space-y-3">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name *"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email *"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone *"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                    <textarea
                      name="address"
                      placeholder="Shipping Address *"
                      required
                      rows={3}
                      value={form.address}
                      onChange={handleChange}
                      className={`${inputClasses} resize-none`}
                    />

                    <RazorpayButton
                      amount={totalAmount}
                      customerName={form.name}
                      customerEmail={form.email}
                      customerPhone={form.phone}
                      onSuccess={handlePaymentSuccess}
                      label="Pay"
                    />
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
