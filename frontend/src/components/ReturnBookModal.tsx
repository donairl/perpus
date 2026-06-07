import { useState } from 'react'
import './BorrowBookModal.css'

interface ReturnBookModalProps {
  book: {
    id: number
    title: string
    author: string
  }
  onClose: () => void
  onReturn: (bookId: number, memberId: number) => Promise<void>
}

function ReturnBookModal({ book, onClose, onReturn }: ReturnBookModalProps) {
  const [memberId, setMemberId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!memberId) {
      setError('Please enter a member ID')
      return
    }

    setIsLoading(true)
    try {
      await onReturn(book.id, parseInt(memberId))
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to return book')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Return Book</h2>
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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="memberId">Member ID</label>
              <input
                type="number"
                id="memberId"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="Enter member ID who borrowed this book"
                required
                min="1"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="button-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="button-primary" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Return Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReturnBookModal