import { useState, useEffect } from 'react'
import { getTopBooks, getTopMembers, TopBook, TopMember } from '../services/api'
import './Reports.css'

function Reports() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [topBooks, setTopBooks] = useState<TopBook[]>([])
  const [topMembers, setTopMembers] = useState<TopMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReports = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }
      const [books, members] = await Promise.all([
        getTopBooks(params),
        getTopMembers(params),
      ])
      setTopBooks(books)
      setTopMembers(members)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleReset = () => {
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Statistik Peminjaman</h1>
        <div className="filter-bar">
          <label>
            Dari:
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </label>
          <label>
            Sampai:
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </label>
          <button onClick={fetchReports} disabled={loading} className="apply-btn">
            {loading ? 'Loading...' : 'Terapkan'}
          </button>
          <button onClick={handleReset} className="reset-btn" disabled={loading}>
            Reset
          </button>
        </div>
        {error && <p className="error-msg">{error}</p>}
      </div>

      <div className="reports-grid">
        <section className="report-section">
          <h2>Buku Paling Banyak Dipinjam</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Judul</th>
                <th>Pengarang</th>
                <th>Kategori</th>
                <th>Jumlah Pinjam</th>
              </tr>
            </thead>
            <tbody>
              {topBooks.length === 0 ? (
                <tr><td colSpan={5} className="empty">Tidak ada data</td></tr>
              ) : (
                topBooks.map((book, index) => (
                  <tr key={book.book_id}>
                    <td>{index + 1}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.category}</td>
                    <td><span className="count-badge">{book.borrow_count}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="report-section">
          <h2>Anggota Paling Banyak Meminjam</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Tipe</th>
                <th>Jumlah Pinjam</th>
              </tr>
            </thead>
            <tbody>
              {topMembers.length === 0 ? (
                <tr><td colSpan={5} className="empty">Tidak ada data</td></tr>
              ) : (
                topMembers.map((member, index) => (
                  <tr key={member.member_id}>
                    <td>{index + 1}</td>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.membership_type}</td>
                    <td><span className="count-badge">{member.borrow_count}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}

export default Reports
