import { useState, useEffect, useMemo } from 'react'
import { getFines, getFineSummary, createFine, payFine, getMembers, getBooks, Fine, FineSummary, Member, Book } from '../services/api'
import './Fines.css'

type FilterTab = 'all' | 'unpaid' | 'paid' | 'late' | 'lost' | 'damage'

const FINE_TYPE_LABEL: Record<string, string> = {
  late: 'Keterlambatan',
  lost: 'Kehilangan',
  damage: 'Kerusakan',
}

const formatRp = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

function Fines() {
  const [fines, setFines] = useState<Fine[]>([])
  const [summary, setSummary] = useState<FineSummary | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [payingId, setPayingId] = useState<number | null>(null)

  // Modal form state
  const [form, setForm] = useState({ member_id: '', book_id: '', fine_type: 'lost' as 'lost' | 'damage', amount: '', reason: '' })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const load = async () => {
    try {
      const [f, s] = await Promise.all([getFines(), getFineSummary()])
      setFines(f)
      setSummary(s)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    Promise.all([getMembers(), getBooks()]).then(([m, b]) => {
      setMembers(m)
      setBooks(b)
    })
  }, [])

  const filtered = useMemo(() => {
    if (activeTab === 'all') return fines
    if (activeTab === 'unpaid') return fines.filter(f => f.status === 'unpaid')
    if (activeTab === 'paid') return fines.filter(f => f.status === 'paid')
    return fines.filter(f => f.fine_type === activeTab)
  }, [fines, activeTab])

  const handlePay = async (id: number) => {
    setPayingId(id)
    try {
      await payFine(id)
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setPayingId(null)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.member_id) { setFormError('Pilih member'); return }
    if (!form.amount || Number(form.amount) <= 0) { setFormError('Nominal harus lebih dari 0'); return }
    setFormLoading(true)
    try {
      await createFine({
        member_id: Number(form.member_id),
        book_id: form.book_id ? Number(form.book_id) : undefined,
        fine_type: form.fine_type,
        amount: Number(form.amount),
        reason: form.reason || undefined,
      })
      setShowModal(false)
      setForm({ member_id: '', book_id: '', fine_type: 'lost', amount: '', reason: '' })
      await load()
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setFormLoading(false)
    }
  }

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'unpaid', label: 'Belum Lunas' },
    { key: 'paid', label: 'Lunas' },
    { key: 'late', label: 'Keterlambatan' },
    { key: 'lost', label: 'Kehilangan' },
    { key: 'damage', label: 'Kerusakan' },
  ]

  return (
    <div className="fines-page">
      <div className="fines-header">
        <h1>Manajemen Denda</h1>
        <button className="add-fine-btn" onClick={() => setShowModal(true)}>+ Tambah Denda</button>
      </div>

      {summary && (
        <div className="fine-summary-bar">
          <div className="summary-card summary-unpaid">
            <div className="summary-count">{summary.total_unpaid}</div>
            <div className="summary-label">Belum Lunas</div>
            <div className="summary-amount">{formatRp(summary.amount_unpaid)}</div>
          </div>
          <div className="summary-card summary-paid">
            <div className="summary-count">{summary.total_paid}</div>
            <div className="summary-label">Lunas</div>
            <div className="summary-amount">{formatRp(summary.amount_paid)}</div>
          </div>
        </div>
      )}

      {error && <div className="fines-error">{error}</div>}

      <div className="fine-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`fine-tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >{t.label}</button>
        ))}
      </div>

      <div className="fine-table-wrap">
        {loading ? (
          <p className="fines-empty">Memuat data...</p>
        ) : filtered.length === 0 ? (
          <p className="fines-empty">Tidak ada data denda.</p>
        ) : (
          <table className="fine-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Buku</th>
                <th>Tipe</th>
                <th>Keterangan</th>
                <th>Nominal</th>
                <th>Tgl Dibuat</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id}>
                  <td className="cell-primary">{f.member_name}</td>
                  <td className="cell-secondary">{f.book_title ?? '-'}</td>
                  <td>
                    <span className={`fine-type-badge fine-type-${f.fine_type}`}>
                      {FINE_TYPE_LABEL[f.fine_type]}
                    </span>
                  </td>
                  <td className="cell-secondary">{f.reason ?? '-'}</td>
                  <td className="fine-amount">{formatRp(f.amount)}</td>
                  <td className="cell-secondary">{formatDate(f.created_at)}</td>
                  <td>
                    <span className={`fine-status-badge ${f.status}`}>
                      {f.status === 'unpaid' ? 'Belum Lunas' : 'Lunas'}
                    </span>
                  </td>
                  <td>
                    {f.status === 'unpaid' && (
                      <button
                        className="pay-btn"
                        onClick={() => handlePay(f.id)}
                        disabled={payingId === f.id}
                      >
                        {payingId === f.id ? '...' : 'Tandai Lunas'}
                      </button>
                    )}
                    {f.status === 'paid' && f.paid_at && (
                      <span className="paid-date">{formatDate(f.paid_at)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tambah Denda</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Member *</label>
                  <select value={form.member_id} onChange={e => setForm(p => ({ ...p, member_id: e.target.value }))} required>
                    <option value="">-- Pilih Member --</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Buku (opsional)</label>
                  <select value={form.book_id} onChange={e => setForm(p => ({ ...p, book_id: e.target.value }))}>
                    <option value="">-- Pilih Buku --</option>
                    {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipe Denda *</label>
                  <select value={form.fine_type} onChange={e => setForm(p => ({ ...p, fine_type: e.target.value as 'lost' | 'damage' }))}>
                    <option value="lost">Kehilangan</option>
                    <option value="damage">Kerusakan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nominal (Rp) *</label>
                  <input type="number" min="1" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="Contoh: 50000" required />
                </div>
                <div className="form-group">
                  <label>Keterangan</label>
                  <input type="text" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Deskripsi kerusakan / kehilangan" />
                </div>
                {formError && <div className="error-message">{formError}</div>}
                <div className="modal-actions">
                  <button type="button" className="button-secondary" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="button-primary" disabled={formLoading}>
                    {formLoading ? 'Menyimpan...' : 'Simpan Denda'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Fines
