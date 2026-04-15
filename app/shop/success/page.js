import Link from 'next/link'

export const metadata = {
  title: 'Order Confirmed — Elevate Salon',
}

export default function SuccessPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        {/* Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(76,175,128,0.1)',
            border: '1px solid rgba(76,175,128,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
            fontSize: '28px',
          }}
        >
          ✓
        </div>

        <p
          style={{
            fontSize: '11px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '12px',
          }}
        >
          Order Confirmed
        </p>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: '300',
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            marginBottom: '16px',
          }}
        >
          Thank you.
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
            marginBottom: '40px',
          }}
        >
          Your order has been placed successfully. You'll receive a confirmation
          email shortly.
        </p>

        <Link
          href="/shop"
          style={{
            display: 'inline-block',
            background: 'var(--gold)',
            color: '#000',
            textDecoration: 'none',
            borderRadius: '8px',
            padding: '13px 32px',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
