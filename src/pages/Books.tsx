import { useState, useEffect } from 'react'
import './Books.css'
import BorrowBookModal from '../components/BorrowBookModal'
import ReturnBookModal from '../components/ReturnBookModal'
import * as api from '../services/api'

interface Book {
  id: number
  title: string
  author: string
  isbn: string
  category: string
  status: 'available' | 'borrowed' | 'reserved'
  copies: number
}

function Books() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [books, setBooks] = useState<Book[]>([
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', category: 'Fiction', status: 'available', copies: 3 },
    { id: 2, title: '1984', author: 'George Orwell', isbn: '9780451524935', category: 'Fiction', status: 'borrowed', copies: 2 },
    { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', category: 'Fiction', status: 'available', copies: 4 },
    { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', category: 'Romance', status: 'available', copies: 2 },
    { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769488', category: 'Fiction', status: 'reserved', copies: 1 },
    { id: 6, title: 'Harry Potter', author: 'J.K. Rowling', isbn: '9780439708180', category: 'Fantasy', status: 'available', copies: 5 },
    { id: 7, title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', category: 'Fantasy', status: 'borrowed', copies: 3 },
    { id: 8, title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', category: 'Non-Fiction', status: 'available', copies: 2 },
  ])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)

  const loadBooks = async () => {
    try {
      const booksData = await api.getBooks()
      console.log('Books loaded from API:', booksData)
      setBooks(booksData)
    } catch (error) {
      console.error('Failed to load books:', error)
      // Keep using static data if API fails
    }
  }

  useEffect(() => {
    loadBooks()
  }, [])

  const handleBorrow = async (bookId: number, memberId: number, dueDays: number) => {
    try {
      const result = await api.borrowBook(bookId, memberId, dueDays)
      
      // Update book status locally
      setBooks(books.map(book => 
        book.id === bookId ? { ...book, status: 'borrowed' as const } : book
      ))
      
      // Optionally reload books from server to ensure sync
      await loadBooks()
      
      alert(`Book borrowed successfully! Due date: ${new Date(result.due_date).toLocaleDateString()}`)
    } catch (error: any) {
      throw new Error(error.message || 'Failed to borrow book')
    }
  }

  const handleReturn = async (bookId: number, memberId: number) => {
    try {
      const result = await api.returnBook(bookId, memberId)
      
      // Update book status locally
      setBooks(books.map(book => 
        book.id === bookId ? { ...book, status: 'available' as const } : book
      ))
      
      // Optionally reload books from server to ensure sync
      await loadBooks()
      
      const message = result.is_late 
        ? 'Book returned successfully! (Returned late)'
        : 'Book returned successfully!'
      alert(message)
    } catch (error: any) {
      throw new Error(error.message || 'Failed to return book')
    }
  }

  const openBorrowModal = (book: Book) => {
    setSelectedBook(book)
    setShowBorrowModal(true)
  }

  const openReturnModal = (book: Book) => {
    setSelectedBook(book)
    setShowReturnModal(true)
  }

  const categories = ['all', ...Array.from(new Set(books.map(book => book.category)))]

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm)
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="books-page">
      <div className="books-header">
        <div>
          <h1>Book Collection</h1>
          <p>Manage and browse your library's book inventory</p>
        </div>
        <button className="add-book-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Book
        </button>
      </div>

      <div className="books-controls">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="books-grid">
        {filteredBooks.map(book => (
          <div key={book.id} className="book-card">
            <div className="book-cover">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="book-author">{book.author}</p>
              <p className="book-isbn">ISBN: {book.isbn}</p>
              <div className="book-meta">
                <span className="book-category">{book.category}</span>
                <span className={`book-status ${book.status}`}>
                  {book.status === 'available' && '● Available'}
                  {book.status === 'borrowed' && '● Borrowed'}
                  {book.status === 'reserved' && '● Reserved'}
                </span>
              </div>
              <p className="book-copies">{book.copies} {book.copies === 1 ? 'copy' : 'copies'}</p>
            </div>
            <div className="book-actions">
              {book.status === 'available' && (
                <button 
                  className="action-button primary"
                  onClick={() => openBorrowModal(book)}
                >
                  Borrow
                </button>
              )}
              {book.status === 'borrowed' && (
                <button 
                  className="action-button return"
                  onClick={() => openReturnModal(book)}
                >
                  Return
                </button>
              )}
              <button className="action-button">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="no-results">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <h3>No books found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}

      {showBorrowModal && selectedBook && (
        <BorrowBookModal
          book={selectedBook}
          onClose={() => setShowBorrowModal(false)}
          onBorrow={handleBorrow}
        />
      )}

      {showReturnModal && selectedBook && (
        <ReturnBookModal
          book={selectedBook}
          onClose={() => setShowReturnModal(false)}
          onReturn={handleReturn}
        />
      )}
    </div>
  )
}

export default Books