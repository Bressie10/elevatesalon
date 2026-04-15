'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeaders() {
  // Cookie is sent automatically; pass it as auth header too for belt-and-suspenders
  return { 'Content-Type': 'application/json' }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  // Layout
  shell: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontFamily: 'var(--font-geist-sans)',
  },
  header: {
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    padding: '0 24px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerLogo: {
    fontSize: '13px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--gold)',
    fontWeight: '500',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  section: { marginBottom: '48px' },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '11px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },

  // Cards
  productCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  productCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
  },
  productImg: {
    width: '52px',
    height: '52px',
    objectFit: 'cover',
    borderRadius: '6px',
    background: 'var(--surface-2)',
    flexShrink: 0,
  },
  productImgPlaceholder: {
    width: '52px',
    height: '52px',
    background: 'var(--surface-2)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-dim)',
    fontSize: '20px',
    flexShrink: 0,
  },
  productInfo: { flex: 1, minWidth: 0 },
  productName: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--text)',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  productDesc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
    letterSpacing: '0.05em',
  },

  // Variants table
  variantsWrap: {
    borderTop: '1px solid var(--border)',
    padding: '12px 20px 16px',
    background: 'var(--bg)',
  },
  variantRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid var(--border)',
    fontSize: '13px',
  },

  // Buttons
  btnGold: {
    background: 'var(--gold)',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background 0.15s',
    whiteSpace: 'nowrap',
  },
  btnOutline: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-2)',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, color 0.15s',
    whiteSpace: 'nowrap',
  },
  btnDanger: {
    background: 'transparent',
    color: 'var(--error)',
    border: '1px solid var(--error)',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    opacity: 0.8,
    whiteSpace: 'nowrap',
  },
  btnSmall: {
    padding: '5px 10px',
    fontSize: '11px',
  },

  // Form / Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '24px',
  },
  modal: {
    background: 'var(--surface)',
    border: '1px solid var(--border-2)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '520px',
    padding: '28px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '24px',
    color: 'var(--text)',
  },
  field: { marginBottom: '16px' },
  label: {
    display: 'block',
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    background: 'var(--surface-2)',
    border: '1px solid var(--border-2)',
    borderRadius: '6px',
    padding: '10px 14px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    background: 'var(--surface-2)',
    border: '1px solid var(--border-2)',
    borderRadius: '6px',
    padding: '10px 14px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: 'inherit',
  },
  formRow: { display: 'flex', gap: '12px' },
  errText: { color: 'var(--error)', fontSize: '13px', marginTop: '8px' },
  successText: { color: 'var(--success)', fontSize: '13px', marginTop: '8px' },
  input: { background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '9px 14px', color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: '36px',
        height: '20px',
        background: checked ? 'var(--gold)' : 'var(--border-2)',
        borderRadius: '10px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          left: checked ? '19px' : '3px',
          width: '14px',
          height: '14px',
          background: '#fff',
          borderRadius: '50%',
          transition: 'left 0.2s',
        }}
      />
    </button>
  )
}

// ─── Product Form Modal ────────────────────────────────────────────────────────

function ProductModal({ product, onClose, onSaved }) {
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')
  const [active, setActive] = useState(product?.active ?? true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const isEdit = !!product

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (!res.ok) return setError(data.error)
    setImageUrl(data.url)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return setError('Name is required')
    setSaving(true)
    setError('')

    const payload = { name: name.trim(), description: description.trim(), image_url: imageUrl, active }
    const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) return setError(data.error)
    onSaved(data)
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <h2 style={s.modalTitle}>{isEdit ? 'Edit Product' : 'New Product'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Name *</label>
            <input
              style={s.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pomade Deluxe"
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Description</label>
            <textarea
              style={s.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short product description…"
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Product Image</label>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="preview"
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  border: '1px solid var(--border)',
                  display: 'block',
                }}
              />
            )}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                style={{ ...s.input, flex: 1 }}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://… or upload below"
              />
              <button
                type="button"
                style={{ ...s.btnOutline, ...s.btnSmall, whiteSpace: 'nowrap' }}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
            </div>
          </div>

          <div style={{ ...s.field, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Toggle checked={active} onChange={setActive} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {active ? 'Active (visible in shop)' : 'Inactive (hidden from shop)'}
            </span>
          </div>

          {error && <p style={s.errText}>{error}</p>}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" style={s.btnOutline} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={s.btnGold} disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Variant Form Modal ────────────────────────────────────────────────────────

function VariantModal({ variant, productId, onClose, onSaved }) {
  const [label, setLabel] = useState(variant?.label ?? '')
  const [price, setPrice] = useState(variant?.price ?? '')
  const [inStock, setInStock] = useState(variant?.in_stock ?? true)
  const [stockQty, setStockQty] = useState(variant?.stock_quantity ?? 99)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!variant

  async function handleSubmit(e) {
    e.preventDefault()
    if (!label.trim()) return setError('Label is required')
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) return setError('Enter a valid price')
    const stockNum = parseInt(stockQty, 10)
    if (isNaN(stockNum) || stockNum < 0) return setError('Enter a valid stock quantity')
    setSaving(true)
    setError('')

    const payload = { label: label.trim(), price: priceNum, in_stock: inStock, stock_quantity: stockNum, product_id: productId }
    const url = isEdit ? `/api/admin/variants/${variant.id}` : '/api/admin/variants'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) return setError(data.error)
    onSaved(data)
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <h2 style={s.modalTitle}>{isEdit ? 'Edit Variant' : 'New Variant'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Label *</label>
            <input
              style={s.input}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. 100ml, Travel Size, Bundle"
              required
            />
          </div>

          <div style={s.formRow}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Price (EUR) *</label>
              <input
                style={s.input}
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Stock quantity *</label>
              <input
                style={s.input}
                type="number"
                min="0"
                step="1"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                placeholder="99"
                required
              />
            </div>
          </div>

          <div style={{ ...s.field, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Toggle checked={inStock} onChange={setInStock} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {inStock ? 'In stock' : 'Out of stock'}
            </span>
          </div>

          {error && <p style={s.errText}>{error}</p>}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" style={s.btnOutline} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={s.btnGold} disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Update Variant' : 'Create Variant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  // Subscription data
  const [subData, setSubData] = useState(null)
  const [subLoading, setSubLoading] = useState(true)
  const [subError, setSubError] = useState('')

  // Orders
  const [orderData, setOrderData] = useState(null) // { orders, stats, fulfillment }
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderType, setOrderType] = useState('all') // all | shop | subscription
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  // Modals
  const [productModal, setProductModal] = useState(null)
  const [variantModal, setVariantModal] = useState(null)

  const router = useRouter()
  const searchTimer = useRef(null)

  async function load() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/products')
    if (!res.ok) { setError('Failed to load products'); setLoading(false); return }
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  async function loadSubData() {
    setSubLoading(true)
    setSubError('')
    const res = await fetch('/api/admin/subscriptions')
    if (!res.ok) { setSubError('Failed to load subscription data'); setSubLoading(false); return }
    setSubData(await res.json())
    setSubLoading(false)
  }

  async function loadOrders(search = orderSearch, type = orderType) {
    setOrdersLoading(true)
    setOrdersError('')
    const params = new URLSearchParams({ type })
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/orders?${params}`)
    if (!res.ok) { setOrdersError('Failed to load orders'); setOrdersLoading(false); return }
    setOrderData(await res.json())
    setOrdersLoading(false)
  }

  useEffect(() => { load(); loadSubData(); loadOrders() }, [])

  function handleSearchChange(val) {
    setOrderSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => loadOrders(val, orderType), 350)
  }

  function handleTypeChange(type) {
    setOrderType(type)
    loadOrders(orderSearch, type)
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product and all its variants? This cannot be undone.')) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.ok) setProducts((p) => p.filter((x) => x.id !== id))
    else alert('Failed to delete product')
  }

  async function deleteVariant(productId, variantId) {
    if (!confirm('Delete this variant?')) return
    const res = await fetch(`/api/admin/variants/${variantId}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts((ps) =>
        ps.map((p) =>
          p.id === productId
            ? { ...p, variants: p.variants.filter((v) => v.id !== variantId) }
            : p
        )
      )
    } else {
      alert('Failed to delete variant')
    }
  }

  async function toggleVariantStock(productId, variant) {
    const res = await fetch(`/api/admin/variants/${variant.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ in_stock: !variant.in_stock }),
    })
    if (res.ok) {
      const updated = await res.json()
      setProducts((ps) =>
        ps.map((p) =>
          p.id === productId
            ? { ...p, variants: p.variants.map((v) => (v.id === variant.id ? updated : v)) }
            : p
        )
      )
    }
  }

  async function toggleProductActive(product) {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ active: !product.active }),
    })
    if (res.ok) {
      const updated = await res.json()
      setProducts((ps) => ps.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
    }
  }

  function onProductSaved(data) {
    setProducts((ps) => {
      const exists = ps.find((p) => p.id === data.id)
      if (exists) return ps.map((p) => (p.id === data.id ? { ...p, ...data } : p))
      return [{ ...data, variants: [] }, ...ps]
    })
    setProductModal(null)
  }

  function onVariantSaved(data) {
    const { productId } = variantModal
    setProducts((ps) =>
      ps.map((p) => {
        if (p.id !== productId) return p
        const exists = p.variants?.find((v) => v.id === data.id)
        const variants = exists
          ? p.variants.map((v) => (v.id === data.id ? data : v))
          : [...(p.variants ?? []), data]
        return { ...p, variants }
      })
    )
    setVariantModal(null)
  }

  return (
    <div style={s.shell}>
      {/* Header */}
      <header style={s.header}>
        <span style={s.headerLogo}>Elevate — Admin</span>
        <div style={s.headerRight}>
          <a href="/shop" target="_blank" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            View Shop ↗
          </a>
          <button style={s.btnOutline} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main style={s.main}>

        {/* ── Stats Row ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '36px' }}>
          {[
            { label: 'Total Orders',        value: orderData ? orderData.stats.totalOrders  : '—' },
            { label: 'Total Revenue',        value: orderData ? `€${(orderData.stats.totalRevenue / 100).toFixed(2)}` : '—' },
            { label: 'Subscription Orders',  value: orderData ? orderData.stats.subCount     : '—' },
            { label: 'Active Subscriptions', value: subData   ? subData.subscriptions.length  : '—' },
            { label: 'This Month (Sub)',     value: orderData ? orderData.stats.thisMonthSubOrders : '—' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 18px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>{stat.label}</p>
              <p style={{ fontSize: '22px', fontWeight: '300', color: 'var(--gold)', letterSpacing: '-0.01em' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Orders Section ─────────────────────────────────────────────────── */}
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>Orders</span>
            <button style={s.btnOutline} onClick={() => loadOrders()} disabled={ordersLoading}>Refresh</button>
          </div>

          {/* Search + filter bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input
              type="search"
              placeholder="Search by email…"
              value={orderSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{ ...s.input, flex: 1, minWidth: '200px', maxWidth: '340px' }}
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              {['all', 'shop', 'subscription'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-2)',
                    background: orderType === t ? 'var(--gold)' : 'transparent',
                    color: orderType === t ? '#000' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: orderType === t ? '600' : '400',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {t === 'all' ? 'All' : t === 'shop' ? 'Shop' : 'Subscription'}
                </button>
              ))}
            </div>
          </div>

          {ordersError && <p style={s.errText}>{ordersError}</p>}
          {ordersLoading && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>}

          {/* ── Fulfillment summary ──────────────────────────────────────── */}
          {!ordersLoading && orderData?.fulfillment?.length > 0 && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '10px', padding: '18px 20px', marginBottom: '20px' }}>
              <p style={{ ...s.sectionTitle, marginBottom: '12px' }}>
                Fulfillment — this month's subscription orders ({orderData.stats.thisMonthSubOrders})
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Total items to pack and ship across all subscription orders this month:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                {orderData.fulfillment.map((f) => (
                  <div key={f.item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text)' }}>{f.item}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gold)', marginLeft: '12px' }}>×{f.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Order list ───────────────────────────────────────────────── */}
          {!ordersLoading && orderData?.orders?.length === 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No orders found.
            </div>
          )}

          {!ordersLoading && orderData?.orders?.map((order) => {
            const isExpanded = expandedOrderId === order.id
            const isSub = !!order.subscription_id
            return (
              <div key={order.id} style={{ ...s.productCard, marginBottom: '8px' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', cursor: 'pointer', flexWrap: 'wrap' }}
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                >
                  {/* Type badge */}
                  <span style={{ ...s.badge, background: isSub ? 'rgba(61,216,205,0.1)' : 'rgba(88,88,88,0.15)', color: isSub ? 'var(--gold)' : 'var(--text-muted)', flexShrink: 0 }}>
                    {isSub ? 'Subscription' : 'Shop'}
                  </span>

                  {/* Email */}
                  <span style={{ flex: 1, fontSize: '13px', fontWeight: '500', minWidth: '160px', color: 'var(--text)' }}>
                    {order.email || <span style={{ color: 'var(--text-dim)' }}>No email</span>}
                  </span>

                  {/* Date */}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '90px' }}>
                    {new Date(order.created_at).toLocaleDateString('en-IE', { dateStyle: 'medium' })}
                  </span>

                  {/* Item count */}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '60px' }}>
                    {Array.isArray(order.items) ? `${order.items.reduce((s, i) => s + (i.quantity || 1), 0)} item${order.items.reduce((s, i) => s + (i.quantity || 1), 0) !== 1 ? 's' : ''}` : '—'}
                  </span>

                  {/* Total */}
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gold)', minWidth: '68px', textAlign: 'right' }}>
                    €{((order.total ?? 0) / 100).toFixed(2)}
                  </span>

                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{isExpanded ? '▲' : '▼'}</span>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '14px 18px 16px', background: 'var(--bg)' }}>
                    <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px' }}>Items</p>
                    {Array.isArray(order.items) && order.items.length > 0
                      ? order.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
                            <span>{item.description || 'Item'}</span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              ×{item.quantity}&nbsp;&nbsp;€{((item.amount_total ?? 0) / 100).toFixed(2)}
                            </span>
                          </div>
                        ))
                      : <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>No item detail.</p>
                    }
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Order ID: {order.stripe_session_id}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gold)' }}>Total: €{((order.total ?? 0) / 100).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {!ordersLoading && orderData && (
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '10px', textAlign: 'right' }}>
              Showing {orderData.orders.length} of {orderData.count} orders
            </p>
          )}
        </section>

        {/* Products Section */}
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>Products ({products.length})</span>
            <button style={s.btnGold} onClick={() => setProductModal('new')}>
              + Add Product
            </button>
          </div>

          {loading && (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
          )}

          {error && <p style={s.errText}>{error}</p>}

          {!loading && products.length === 0 && (
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '48px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <p style={{ marginBottom: '16px', fontSize: '15px' }}>No products yet</p>
              <button style={s.btnGold} onClick={() => setProductModal('new')}>
                Add your first product
              </button>
            </div>
          )}

          {products.map((product) => (
            <div key={product.id} style={s.productCard}>
              {/* Product header row */}
              <div style={s.productCardHeader}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={s.productImg} />
                ) : (
                  <div style={s.productImgPlaceholder}>✦</div>
                )}

                <div style={s.productInfo}>
                  <p style={s.productName}>{product.name}</p>
                  <p style={s.productDesc}>
                    {product.description || <span style={{ color: 'var(--text-dim)' }}>No description</span>}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span
                    style={{
                      ...s.badge,
                      background: product.active ? 'rgba(76,175,128,0.15)' : 'rgba(88,88,88,0.2)',
                      color: product.active ? 'var(--success)' : 'var(--text-muted)',
                    }}
                  >
                    {product.active ? 'Active' : 'Inactive'}
                  </span>

                  <Toggle
                    checked={product.active}
                    onChange={() => toggleProductActive(product)}
                  />

                  <button
                    style={s.btnOutline}
                    onClick={() =>
                      setExpandedId(expandedId === product.id ? null : product.id)
                    }
                  >
                    {expandedId === product.id ? 'Collapse' : `Variants (${product.variants?.length ?? 0})`}
                  </button>

                  <button
                    style={s.btnOutline}
                    onClick={() => setProductModal(product)}
                  >
                    Edit
                  </button>

                  <button style={s.btnDanger} onClick={() => deleteProduct(product.id)}>
                    Delete
                  </button>
                </div>
              </div>

              {/* Variants expanded */}
              {expandedId === product.id && (
                <div style={s.variantsWrap}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Variants
                    </span>
                    <button
                      style={{ ...s.btnGold, ...s.btnSmall }}
                      onClick={() => setVariantModal({ productId: product.id })}
                    >
                      + Add Variant
                    </button>
                  </div>

                  {!product.variants?.length && (
                    <p style={{ fontSize: '13px', color: 'var(--text-dim)', padding: '8px 0' }}>
                      No variants — add one to make this product purchasable.
                    </p>
                  )}

                  {product.variants?.map((v) => (
                    <div key={v.id} style={s.variantRow}>
                      <span style={{ flex: 1, color: 'var(--text)' }}>{v.label}</span>
                      <span style={{ color: 'var(--gold)', fontWeight: '500', minWidth: '60px' }}>
                        €{Number(v.price).toFixed(2)}
                      </span>
                      <span
                        style={{
                          ...s.badge,
                          background: v.in_stock ? 'rgba(76,175,128,0.12)' : 'rgba(224,82,82,0.12)',
                          color: v.in_stock ? 'var(--success)' : 'var(--error)',
                          minWidth: '72px',
                          justifyContent: 'center',
                        }}
                      >
                        {v.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <Toggle
                        checked={v.in_stock}
                        onChange={() => toggleVariantStock(product.id, v)}
                      />
                      <button
                        style={{ ...s.btnOutline, ...s.btnSmall }}
                        onClick={() => setVariantModal({ productId: product.id, variant: v })}
                      >
                        Edit
                      </button>
                      <button
                        style={{ ...s.btnDanger, ...s.btnSmall }}
                        onClick={() => deleteVariant(product.id, v.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ── Reserved Stock Section ──────────────────────────────────────── */}
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>Stock &amp; Reservations</span>
            <button style={s.btnOutline} onClick={loadSubData} disabled={subLoading}>
              Refresh
            </button>
          </div>

          {subLoading && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>}
          {subError && <p style={{ color: 'var(--error)', fontSize: '13px' }}>{subError}</p>}

          {!subLoading && subData && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px', gap: '12px', padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                {['Variant', 'Total Stock', 'Reserved', 'Available'].map((h) => (
                  <span key={h} style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</span>
                ))}
              </div>

              {subData.variants.length === 0 && (
                <p style={{ padding: '20px', fontSize: '13px', color: 'var(--text-dim)' }}>No variants found.</p>
              )}

              {subData.variants.map((v) => {
                const reserved = v.reserved_stock?.[0]?.quantity_reserved ?? 0
                const available = Math.max(0, v.stock_quantity - reserved)
                const lowStock = available < 3
                return (
                  <div
                    key={v.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 100px 100px',
                      gap: '12px',
                      padding: '12px 20px',
                      borderBottom: '1px solid var(--border)',
                      alignItems: 'center',
                      background: lowStock && available > 0 ? 'rgba(224,154,44,0.04)' : 'transparent',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '13px' }}>{v.products?.name} — {v.label}</span>
                      {lowStock && available > 0 && (
                        <span style={{ marginLeft: '8px', fontSize: '11px', color: '#e09a2c', fontWeight: '500' }}>
                          Low stock
                        </span>
                      )}
                      {available === 0 && (
                        <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--error)', fontWeight: '500' }}>
                          Sold out
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '13px' }}>{v.stock_quantity}</span>
                    <span style={{ fontSize: '13px', color: reserved > 0 ? 'var(--gold)' : 'var(--text-dim)' }}>{reserved}</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: available === 0 ? 'var(--error)' : available < 3 ? '#e09a2c' : 'var(--success)' }}>
                      {available}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Subscriptions Section ───────────────────────────────────────── */}
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>
              Active Subscriptions ({subData?.subscriptions?.length ?? '…'})
            </span>
          </div>

          {subLoading && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>}

          {!subLoading && subData?.subscriptions?.length === 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No active subscriptions yet.
            </div>
          )}

          {!subLoading && subData?.subscriptions?.map((sub) => {
            const monthlyTotal = sub.subscription_items.reduce(
              (sum, si) => sum + Number(si.variants?.price ?? 0) * si.quantity,
              0
            )
            const statusColor = { active: 'var(--success)', paused: '#e09a2c' }[sub.status] || 'var(--text-muted)'
            return (
              <div key={sub.id} style={{ ...s.productCard, marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>{sub.user_email}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Bills on the {sub.billing_day}{['st','nd','rd'][((sub.billing_day % 100 - 11) % 10 - 1)] || 'th'}
                      &nbsp;· since {new Date(sub.created_at).toLocaleDateString('en-IE', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <span style={{ ...s.badge, background: sub.status === 'active' ? 'rgba(76,175,128,0.15)' : 'rgba(224,154,44,0.15)', color: statusColor, textTransform: 'capitalize' }}>
                    {sub.status}
                  </span>
                  <span style={{ color: 'var(--gold)', fontWeight: '600', fontSize: '15px', minWidth: '70px', textAlign: 'right' }}>
                    €{monthlyTotal.toFixed(2)}/mo
                  </span>
                </div>

                {sub.subscription_items.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '10px 20px 14px', background: 'var(--bg)' }}>
                    {sub.subscription_items.map((si) => (
                      <div key={si.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', padding: '3px 0' }}>
                        <span>{si.variants?.products?.name} — {si.variants?.label}</span>
                        <span>×{si.quantity} &nbsp; €{(Number(si.variants?.price ?? 0) * si.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </section>

        {/* ── Monthly Orders Section ──────────────────────────────────────── */}
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>
              Subscription Orders This Month ({subData?.monthlyOrders?.length ?? '…'})
            </span>
          </div>

          {subLoading && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>}

          {!subLoading && subData?.monthlyOrders?.length === 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No subscription orders this month yet.
            </div>
          )}

          {!subLoading && subData?.monthlyOrders?.map((order) => (
            <div key={order.id} style={{ ...s.productCard, marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>{order.email}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(order.created_at).toLocaleDateString('en-IE', { dateStyle: 'medium' })}
                  </p>
                </div>
                <span style={{ ...s.badge, background: 'rgba(76,175,128,0.15)', color: 'var(--success)' }}>
                  Paid
                </span>
                <span style={{ color: 'var(--gold)', fontWeight: '600', fontSize: '15px', minWidth: '70px', textAlign: 'right' }}>
                  €{((order.total ?? 0) / 100).toFixed(2)}
                </span>
              </div>

              {Array.isArray(order.items) && order.items.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '10px 20px 14px', background: 'var(--bg)' }}>
                  <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>
                    Pack &amp; ship
                  </p>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', padding: '3px 0' }}>
                      <span>{item.description}</span>
                      <span>×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      </main>

      {/* Modals */}
      {productModal && (
        <ProductModal
          product={productModal === 'new' ? null : productModal}
          onClose={() => setProductModal(null)}
          onSaved={onProductSaved}
        />
      )}

      {variantModal && (
        <VariantModal
          variant={variantModal.variant ?? null}
          productId={variantModal.productId}
          onClose={() => setVariantModal(null)}
          onSaved={onVariantSaved}
        />
      )}
    </div>
  )
}
