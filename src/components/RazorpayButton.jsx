import { loadRazorpayScript, openRazorpayCheckout } from '../lib/razorpay'
import toast from 'react-hot-toast'

export default function RazorpayButton({
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
  disabled = false,
  label = 'Pay Now',
  className = '',
}) {
  const handlePayment = async () => {
    try {
      await loadRazorpayScript()

      const response = await openRazorpayCheckout({
        amount,
        orderId,
        customerName,
        customerEmail,
        customerPhone,
      })

      toast.success('Payment successful!')
      onSuccess?.(response)
    } catch (error) {
      if (error.message === 'Payment cancelled by user') {
        toast('Payment cancelled', { icon: 'ℹ️' })
      } else {
        toast.error(error.message || 'Payment failed')
      }
      onFailure?.(error)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={disabled}
      className={`
        w-full py-3 px-6 bg-primary text-white font-medium tracking-wide
        hover:bg-secondary transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer border-0
        ${className}
      `}
    >
      {label} — &#8377;{amount?.toLocaleString('en-IN')}
    </button>
  )
}
