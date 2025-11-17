import { useState, useEffect, useCallback } from 'react'
import './BorrowBookModal.css'
import * as api from '../services/api'

interface BorrowBookModalProps {
  book: {
    id: number
    title: string
    author: string
  }
  onClose: () => void
  onBorrow: (bookId: number, memberId: number, dueDays: number) => Promise<void>
}

function BorrowBookModal({ book, onClose, onBorrow }: BorrowBookModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<api.Member[]>([])
  const [selectedMember, setSelectedMember] = useState<api.Member | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [dueDays, setDueDays] = useState(14)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Debounced search function
  const searchMembers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    try {
      const results = await api.getMembers({ search: query })
      setSearchResults(results)
      setShowResults(true)
    } catch (err) {
      console.error('Failed to search members:', err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMembers(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, searchMembers])

  const handleMemberSelect = (member: api.Member) => {
    setSelectedMember(member)
    setSearchTerm(`${member.name} (${member.email})`)
    setShowResults(false)
    setError('')
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    // If user clears the search, also clear selection
    if (!value.trim()) {
      setSelectedMember(null)
      setSearchResults([])
      setShowResults(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedMember) {
      setError('Please select a member')
      return
    }

    setIsLoading(true)
    try {
      await onBorrow(book.id, selectedMember.id, dueDays)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to borrow book')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Borrow Book</h2>
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
              <label htmlFor="memberSearch">Search Member</label>
              <div className="search-input-container">
                <input
                  type="text"
                  id="memberSearch"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by name or email..."
                  autoComplete="off"
                  required
                />
                {isSearching && (
                  <div className="search-loading">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6V12L16 14" />
                    </svg>
                  </div>
                )}
                {showResults && searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.slice(0, 5).map(member => (
                      <div
                        key={member.id}
                        className="search-result-item"
                        onClick={() => handleMemberSelect(member)}
                      >
                        <div className="member-info">
                          <div className="member-name">{member.name}</div>
                          <div className="member-details">
                            {member.email} • {member.membership_type} • {member.books_count} books
                          </div>
                        </div>
                        <div className={`status-badge ${member.status}`}>
                          {member.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showResults && searchResults.length === 0 && !isSearching && searchTerm.trim() && (
                  <div className="search-results">
                    <div className="no-results">No members found</div>
                  </div>
                )}
              </div>
              {selectedMember && (
                <div className="selected-member">
                  <div className="member-avatar">
                    {selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="member-details">
                    <div className="member-name">{selectedMember.name}</div>
                    <div className="member-email">{selectedMember.email}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="dueDays">Loan Period (days)</label>
              <select
                id="dueDays"
                value={dueDays}
                onChange={(e) => setDueDays(parseInt(e.target.value))}
              >
                <option value="7">7 days</option>
                <option value="14">14 days (default)</option>
                <option value="21">21 days</option>
                <option value="30">30 days</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="button-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="button-primary" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Borrow Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BorrowBookModal