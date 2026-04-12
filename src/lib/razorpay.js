/**
 * Razorpay checkout integration for PraShree Arts.
 *
 * In production you would create the Razorpay order on a server
 * (Supabase Edge Function / Express API) and return the order_id
 * to the client. For this implementation we provide a client‑side
 * helper that opens the Razorpay modal and resolves with the
 * payment response.
 */

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXX'

/**
 * Load the Razorpay checkout script dynamically.
 * Returns a promise that resolves when the script is ready.
 */
export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.body.appendChild(script)
  })
}

/**
 * Open Razorpay checkout modal.
 *
 * @param {Object} params
 * @param {number} params.amount        – Amount in INR (will be converted to paise)
 * @param {string} params.orderId       – Razorpay order ID (from your server)
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {string} params.customerPhone
 * @param {string} [params.description] – Payment description
 * @returns {Promise<{razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string}>}
 */
export function openRazorpayCheckout({
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  description = 'PraShree Arts – Handcrafted Art',
}) {
  return new Promise((resolve, reject) => {
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      name: 'PraShree Arts',
      description,
      order_id: orderId,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      theme: {
        color: '#000000',
      },
      handler(response) {
        resolve(response)
      },
      modal: {
        ondismiss() {
          reject(new Error('Payment cancelled by user'))
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response) => {
      reject(new Error(response.error.description || 'Payment failed'))
    })
    rzp.open()
  })
}

/**
 * Create a Razorpay order via your backend.
 *
 * In production, replace this with an actual API call to your
 * Supabase Edge Function or Express endpoint that creates an
 * order using the Razorpay Orders API.
 *
 * POST /api/create-razorpay-order
 * Body: { amount, currency, receipt }
 * Returns: { id, amount, currency, ... }
 */
export async function createRazorpayOrder({ amount, receipt }) {
  // For demo/development: simulate order creation.
  // Replace with actual endpoint in production.
  const response = await fetch('/api/create-razorpay-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create Razorpay order')
  }

  return response.json()
}

/**
 * Generate a unique order number for PraShree Arts.
 */
export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PSA-${timestamp}-${random}`
}
