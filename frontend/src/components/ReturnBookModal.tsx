import { useState, useEffect } from 'react'
import { getActiveBorrows } from '../services/api'
import './BorrowBookModal.css'

interface ActiveBorrow {
  transaction_id: number
  book_id: number
  member_id: number
  member_name: string
  borrow_date: string
  due_date: string | null
  is_overdue: boolean
}

interface ReturnBookModalProps {
  book: { id: number; title: string; author: string }
  onClose: () => void
  onReturn: (bookId: number, memberId: number) => Promise<void>
}

function ReturnBookModal({ book, onClose, onReturn }: ReturnBookModalProps) {
  const [borrower, setBorrower] = useState<ActiveBorrow | null>(null)
  const [loadingBorrower, setLoadingBorrower] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getActiveBorrows()
      .then(borrows => {
        const found = borrows.find((b: ActiveBorrow) => b.book_id === book.id)
        setBorrower(found ?? null)
      })
      .catch(() => setFetchError('Gagal memuat data peminjam'))
      .finally(() => setLoadingBorrower(false))
  }, [book.id])

  const handleReturn = async () => {
    if (!borrower) return
    setIsLoading(true)
    setError('')
    try {
      await onReturn(book.id, borrower.member_id)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to return book')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Kembalikan Buku</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="book-info-box">
            <h3>{book.title}</h3>
            <p>by {book.author}</p>
          </div>

          {loadingBorrower && (
            <p style={{ color: '#a0aec0', textAlign: 'center', padding: '16px' }}>Memuat data peminjam...</p>
          )}

          {fetchError && (
            <div className="error-message">{fetchError}</div>
          )}

          {!loadingBorrower && !fetchError && !borrower && (
            <div className="error-message">Tidak ditemukan peminjam aktif untuk buku ini.</div>
          )}

          {borrower && (
            <div className="borrower-info-card">
              <div className="borrower-avatar">
                {borrower.member_name.charAt(0).toUpperCase()}
              </div>
              <div className="borrower-details">
                <div className="borrower-name">{borrower.member_name}</div>
                <div className="borrower-meta">
                  <span>Dipinjam: {formatDate(borrower.borrow_date)}</span>
                  {borrower.due_date && (
                    <span className={borrower.is_overdue ? 'overdue-label' : ''}>
                      {' '}· Jatuh tempo: {formatDate(borrower.due_date)}
                      {borrower.is_overdue && ' ⚠ Terlambat'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && <div className="error-message" style={{ marginTop: '12px' }}>{error}</div>}

          <div className="modal-actions">
            <button type="button" className="button-secondary" onClick={onClose}>
              Batal
            </button>
            <button
              className="button-primary"
              onClick={handleReturn}
              disabled={!borrower || isLoading || loadingBorrower}
            >
              {isLoading ? 'Memproses...' : 'Konfirmasi Pengembalian'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReturnBookModal
