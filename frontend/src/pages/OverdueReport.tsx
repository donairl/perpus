import { useState, useEffect } from 'react'
import { getOverdueReport, OverdueBorrow } from '../services/api'
import './OverdueReport.css'

function OverdueReport() {
  const [overdue, setOverdue] = useState<OverdueBorrow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getOverdueReport()
      .then(setOverdue)
      .catch(err => setError(err instanceof Error ? err.message : 'Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="overdue-page">
      <div className="overdue-page-header">
        <div>
          <h1>Laporan Keterlambatan</h1>
          <p className="overdue-subtitle">Member yang belum mengembalikan buku melewati jatuh tempo</p>
        </div>
        {!loading && (
          <span className={`overdue-total-badge ${overdue.length === 0 ? 'overdue-total-badge--ok' : ''}`}>
            {overdue.length === 0 ? 'Semua tepat waktu' : `${overdue.length} terlambat`}
          </span>
        )}
      </div>

      {error && <p className="overdue-error">{error}</p>}

      <div className="overdue-card">
        {loading ? (
          <p className="overdue-empty">Memuat data...</p>
        ) : overdue.length === 0 ? (
          <p className="overdue-empty">Tidak ada member yang terlambat mengembalikan buku.</p>
        ) : (
          <table className="overdue-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Kontak</th>
                <th>Buku</th>
                <th>Tgl Pinjam</th>
                <th>Jatuh Tempo</th>
                <th>Keterlambatan</th>
              </tr>
            </thead>
            <tbody>
              {overdue.map(item => (
                <tr key={item.transaction_id}>
                  <td>
                    <div className="cell-primary">{item.member_name}</div>
                    <div className="cell-secondary">{item.membership_type}</div>
                  </td>
                  <td>
                    <div className="cell-primary">{item.member_email}</div>
                    <div className="cell-secondary">{item.member_phone}</div>
                  </td>
                  <td>
                    <div className="cell-primary">{item.book_title}</div>
                    <div className="cell-secondary">{item.book_author}</div>
                  </td>
                  <td>{formatDate(item.borrow_date)}</td>
                  <td className="overdue-due-date">{formatDate(item.due_date)}</td>
                  <td><span className="overdue-days-badge">{item.days_overdue} hari</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default OverdueReport
