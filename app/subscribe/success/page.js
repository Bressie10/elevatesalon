import Link from 'next/link'

export const metadata = {
  title: 'Subscribed — Elevate Salon',
}

export default function SubscribeSuccessPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'var(--font-geist-sans)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <nav
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '0 24px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface)',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '13px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            fontWeight: '500',
            textDecoration: 'none',
          }}
        >
          Elevate Salon
        </Link>
        <Link
          href="/shop"
          style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}
        >
          Shop
        </Link>
      </nav>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(76,175,128,0.12)',
            border: '1px solid var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            marginBottom: '24px',
          }}
        >
          ✓
        </div>

        <h1
          style={{
            fontSize: 'clamp(22px, 5vw, 36px)',
            fontWeight: '300',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}
        >
          You're subscribed
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-muted)',
            maxWidth: '420px',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          Your bundle is confirmed. You'll receive an invoice by email on your chosen billing day
          each month. Check your inbox — Stripe will send payment instructions.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/account"
            style={{
              background: 'var(--gold)',
              color: '#000',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Manage my subscription
          </Link>
          <Link
            href="/shop"
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-2)',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '12px',
              letterSpacing: '0.05em',
              textDecoration: 'none',
            }}
          >
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  )
}
