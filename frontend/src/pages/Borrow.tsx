import { useState, useEffect, useMemo } from 'react'
import { getMembers, getBooks, borrowBatch, Member, Book } from '../services/api'
import './Borrow.css'

type Step = 'select-member' | 'select-books'

const DUE_OPTIONS = [
  { label: '7 hari', value: 7 },
  { label: '14 hari', value: 14 },
  { label: '21 hari', value: 21 },
  { label: '30 hari', value: 30 },
]

function Borrow() {
  const [step, setStep] = useState<Step>('select-member')
  const [members, setMembers] = useState<Member[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [cart, setCart] = useState<Book[]>([])
  const [dueDays, setDueDays] = useState(14)
  const [memberSearch, setMemberSearch] = useState('')
  const [bookSearch, setBookSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getMembers(),
      getBooks({ status: 'available' }),
    ])
      .then(([m, b]) => {
        setMembers(m)
        setBooks(b)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [])

  const filteredMembers = useMemo(() =>
    members.filter(m =>
      m.status === 'active' &&
      (m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
       m.email.toLowerCase().includes(memberSearch.toLowerCase()))
    ),
    [members, memberSearch]
  )

  const filteredBooks = useMemo(() =>
    books.filter(b =>
      b.status === 'available' &&
      !cart.some(c => c.id === b.id) &&
      (b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
       b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
       b.category.toLowerCase().includes(bookSearch.toLowerCase()))
    ),
    [books, bookSearch, cart]
  )

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member)
    setCart([])
    setStep('select-books')
    setError('')
  }

  const addToCart = (book: Book) => {
    setCart(prev => [...prev, book])
  }

  const removeFromCart = (bookId: number) => {
    setCart(prev => prev.filter(b => b.id !== bookId))
  }

  const handleSubmit = async () => {
    if (!selectedMember || cart.length === 0) return
    setSubmitting(true)
    setError('')
    try {
      const result = await borrowBatch(selectedMember.id, cart.map(b => b.id), dueDays)
      setSuccess(result.message)
      setBooks(prev => prev.filter(b => !cart.some(c => c.id === b.id)))
      setCart([])
      setStep('select-member')
      setSelectedMember(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal meminjam buku')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="borrow-page"><p className="borrow-loading">Memuat data...</p></div>
  }

  return (
    <div className="borrow-page">
      <div className="borrow-header">
        <h1>Peminjaman Buku</h1>
        <div className="borrow-steps">
          <div className={`borrow-step ${step === 'select-member' ? 'active' : 'done'}`}>
            <span className="step-num">1</span>
            <span>Pilih Member</span>
          </div>
          <div className="step-divider" />
          <div className={`borrow-step ${step === 'select-books' ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span>Pilih Buku</span>
          </div>
        </div>
      </div>

      {success && (
        <div className="borrow-success">
          {success}
          <button className="success-dismiss" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {error && <div className="borrow-error">{error}</div>}

      {step === 'select-member' && (
        <div className="member-select-panel">
          <div className="panel-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama atau email member..."
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="member-list">
            {filteredMembers.length === 0 ? (
              <p className="borrow-empty">Tidak ada member aktif ditemukan.</p>
            ) : (
              filteredMembers.map(member => (
                <button
                  key={member.id}
                  className="member-card"
                  onClick={() => handleSelectMember(member)}
                >
                  <div className="member-card-avatar">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-card-info">
                    <div className="member-card-name">{member.name}</div>
                    <div className="member-card-meta">{member.email} · {member.membership_type}</div>
                  </div>
                  <div className="member-card-books">
                    <span>{member.books_count}</span>
                    <small>dipinjam</small>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {step === 'select-books' && selectedMember && (
        <div className="borrow-workspace">
          <div className="selected-member-bar">
            <div className="selected-member-info">
              <div className="selected-member-avatar">
                {selectedMember.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="selected-member-name">{selectedMember.name}</div>
                <div className="selected-member-meta">{selectedMember.membership_type} · {selectedMember.email}</div>
              </div>
            </div>
            <button className="change-member-btn" onClick={() => { setStep('select-member'); setCart([]) }}>
              Ganti Member
            </button>
          </div>

          <div className="borrow-columns">
            <div className="books-panel">
              <div className="panel-title">Buku Tersedia ({filteredBooks.length})</div>
              <div className="panel-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari judul, pengarang, kategori..."
                  value={bookSearch}
                  onChange={e => setBookSearch(e.target.value)}
                />
              </div>

              <div className="book-list">
                {filteredBooks.length === 0 ? (
                  <p className="borrow-empty">Tidak ada buku tersedia.</p>
                ) : (
                  filteredBooks.map(book => (
                    <div key={book.id} className="book-item">
                      <div className="book-item-info">
                        <div className="book-item-title">{book.title}</div>
                        <div className="book-item-meta">{book.author} · {book.category}</div>
                      </div>
                      <button
                        className="add-to-cart-btn"
                        onClick={() => addToCart(book)}
                        title="Tambah ke keranjang"
                      >
                        +
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="cart-panel">
              <div className="panel-title">
                Keranjang
                {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
              </div>

              {cart.length === 0 ? (
                <div className="cart-empty">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <p>Belum ada buku dipilih</p>
                </div>
              ) : (
                <div className="cart-items">
                  {cart.map(book => (
                    <div key={book.id} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-title">{book.title}</div>
                        <div className="cart-item-author">{book.author}</div>
                      </div>
                      <button className="remove-from-cart-btn" onClick={() => removeFromCart(book.id)}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="cart-footer">
                <div className="due-selector">
                  <label>Jatuh tempo:</label>
                  <div className="due-options">
                    {DUE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        className={`due-option ${dueDays === opt.value ? 'active' : ''}`}
                        onClick={() => setDueDays(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="submit-borrow-btn"
                  onClick={handleSubmit}
                  disabled={cart.length === 0 || submitting}
                >
                  {submitting ? 'Memproses...' : `Pinjam ${cart.length > 0 ? `${cart.length} Buku` : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Borrow
