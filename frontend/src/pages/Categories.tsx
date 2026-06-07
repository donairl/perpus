import { useState, useEffect } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from '../services/api'
import './Categories.css'

function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Add modal
  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [addDesc, setAddDesc] = useState('')
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  // Edit modal
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editError, setEditError] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')
    if (!addName.trim()) { setAddError('Nama kategori wajib diisi'); return }
    setAddLoading(true)
    try {
      await createCategory({ name: addName.trim(), description: addDesc.trim() || undefined })
      setShowAdd(false)
      setAddName('')
      setAddDesc('')
      await load()
    } catch (e: any) {
      setAddError(e.message)
    } finally {
      setAddLoading(false)
    }
  }

  const openEdit = (cat: Category) => {
    setEditTarget(cat)
    setEditName(cat.name)
    setEditDesc(cat.description ?? '')
    setEditError('')
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return
    setEditError('')
    if (!editName.trim()) { setEditError('Nama kategori wajib diisi'); return }
    setEditLoading(true)
    try {
      await updateCategory(editTarget.id, { name: editName.trim(), description: editDesc.trim() || undefined })
      setEditTarget(null)
      await load()
    } catch (e: any) {
      setEditError(e.message)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus kategori ini?')) return
    setDeletingId(id)
    try {
      await deleteCategory(id)
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div>
          <h1>Manajemen Kategori</h1>
          <p className="categories-subtitle">Kelola kategori buku perpustakaan</p>
        </div>
        <button className="add-cat-btn" onClick={() => { setShowAdd(true); setAddError('') }}>
          + Tambah Kategori
        </button>
      </div>

      {error && <div className="cat-error">{error}</div>}

      <div className="cat-table-wrap">
        {loading ? (
          <p className="cat-empty">Memuat data...</p>
        ) : categories.length === 0 ? (
          <p className="cat-empty">Belum ada kategori. Tambah kategori untuk mulai mengelola buku.</p>
        ) : (
          <table className="cat-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nama Kategori</th>
                <th>Deskripsi</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat.id}>
                  <td className="cat-num">{i + 1}</td>
                  <td className="cat-name">{cat.name}</td>
                  <td className="cat-desc">{cat.description ?? <span className="cat-none">—</span>}</td>
                  <td className="cat-date">
                    {new Date(cat.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="cat-actions">
                    <button className="edit-btn" onClick={() => openEdit(cat)}>Edit</button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id}
                    >
                      {deletingId === cat.id ? '...' : 'Hapus'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="cat-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="cat-modal" onClick={e => e.stopPropagation()}>
            <div className="cat-modal-header">
              <h2>Tambah Kategori</h2>
              <button className="cat-close" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <form onSubmit={handleAdd} className="cat-form">
              <div className="cat-form-group">
                <label>Nama Kategori *</label>
                <input
                  type="text"
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  placeholder="Contoh: Fiksi, Sains, Sejarah..."
                  autoFocus
                  required
                />
              </div>
              <div className="cat-form-group">
                <label>Deskripsi</label>
                <input
                  type="text"
                  value={addDesc}
                  onChange={e => setAddDesc(e.target.value)}
                  placeholder="Deskripsi singkat (opsional)"
                />
              </div>
              {addError && <div className="cat-form-error">{addError}</div>}
              <div className="cat-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={addLoading}>
                  {addLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="cat-modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="cat-modal" onClick={e => e.stopPropagation()}>
            <div className="cat-modal-header">
              <h2>Edit Kategori</h2>
              <button className="cat-close" onClick={() => setEditTarget(null)}>×</button>
            </div>
            <form onSubmit={handleEdit} className="cat-form">
              <div className="cat-form-group">
                <label>Nama Kategori *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="cat-form-group">
                <label>Deskripsi</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Deskripsi singkat (opsional)"
                />
              </div>
              {editError && <div className="cat-form-error">{editError}</div>}
              <div className="cat-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditTarget(null)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={editLoading}>
                  {editLoading ? 'Menyimpan...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories
