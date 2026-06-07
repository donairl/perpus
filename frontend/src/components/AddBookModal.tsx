import { FormEvent, useMemo, useState } from 'react'
import './BorrowBookModal.css'

type BookStatusOption = 'available' | 'borrowed' | 'reserved'

export interface NewBookPayload {
  title: string
  author: string
  isbn: string
  category: string
  copies: number
  status: BookStatusOption
}

interface AddBookModalProps {
  onClose: () => void
  onCreate: (book: NewBookPayload) => Promise<void>
  categories: string[]
}

function AddBookModal({ onClose, onCreate, categories }: AddBookModalProps) {
  const [formState, setFormState] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    copies: '1',
    status: 'available' as BookStatusOption,
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const normalizedCategories = useMemo(
    () => Array.from(new Set(categories.filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [categories]
  )

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const trimmedTitle = formState.title.trim()
    const trimmedAuthor = formState.author.trim()
    const trimmedIsbn = formState.isbn.trim()
    const trimmedCategory = formState.category.trim()

    if (!trimmedTitle || !trimmedAuthor || !trimmedIsbn || !trimmedCategory) {
      setError('All fields are required')
      return
    }

    const copiesValue = parseInt(formState.copies, 10)
    if (Number.isNaN(copiesValue) || copiesValue < 1) {
      setError('Copies must be at least 1')
      return
    }

    setIsSubmitting(true)
    try {
      await onCreate({
        title: trimmedTitle,
        author: trimmedAuthor,
        isbn: trimmedIsbn,
        category: trimmedCategory,
        copies: copiesValue,
        status: formState.status,
      })
      onClose()
      setFormState({
        title: '',
        author: '',
        isbn: '',
        category: '',
        copies: '1',
        status: 'available',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to add book')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Book</h2>
          <button className="close-button" onClick={onClose} type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="bookTitle">Title</label>
              <input
                id="bookTitle"
                type="text"
                value={formState.title}
                onChange={(event) => handleChange('title', event.target.value)}
                placeholder="e.g. The Pragmatic Programmer"
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bookAuthor">Author</label>
              <input
                id="bookAuthor"
                type="text"
                value={formState.author}
                onChange={(event) => handleChange('author', event.target.value)}
                placeholder="e.g. Andrew Hunt"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bookIsbn">ISBN</label>
              <input
                id="bookIsbn"
                type="text"
                value={formState.isbn}
                onChange={(event) => handleChange('isbn', event.target.value)}
                placeholder="e.g. 9780201616224"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bookCategory">Category</label>
              <input
                id="bookCategory"
                type="text"
                value={formState.category}
                onChange={(event) => handleChange('category', event.target.value)}
                placeholder="e.g. Software Engineering"
                list="bookCategoryOptions"
                required
              />
              {normalizedCategories.length > 0 && (
                <datalist id="bookCategoryOptions">
                  {normalizedCategories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="bookCopies">Copies</label>
              <input
                id="bookCopies"
                type="number"
                min="1"
                value={formState.copies}
                onChange={(event) => handleChange('copies', event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bookStatus">Status</label>
              <select
                id="bookStatus"
                value={formState.status}
                onChange={(event) => handleChange('status', event.target.value as BookStatusOption)}
              >
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="button-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="button-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddBookModal

