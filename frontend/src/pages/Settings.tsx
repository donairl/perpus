import { useState, useEffect } from 'react'
import { getSettings, updateSetting, AppSetting } from '../services/api'
import './Settings.css'

const formatRp = (val: string) => {
  const n = Number(val)
  return isNaN(n) ? val : new Intl.NumberFormat('id-ID').format(n)
}

function Settings() {
  const [settings, setSettings] = useState<AppSetting[]>([])
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSettings()
      .then(s => {
        setSettings(s)
        const init: Record<string, string> = {}
        s.forEach(x => { init[x.key] = x.value })
        setEditing(init)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (key: string) => {
    setSaving(p => ({ ...p, [key]: true }))
    setError('')
    try {
      const updated = await updateSetting(key, editing[key])
      setSettings(prev => prev.map(s => s.key === key ? updated : s))
      setSaved(p => ({ ...p, [key]: true }))
      setTimeout(() => setSaved(p => ({ ...p, [key]: false })), 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(p => ({ ...p, [key]: false }))
    }
  }

  const isDirty = (key: string) => {
    const original = settings.find(s => s.key === key)?.value
    return original !== editing[key]
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Pengaturan</h1>
        <p className="settings-subtitle">Konfigurasi sistem perpustakaan</p>
      </div>

      {error && <div className="settings-error">{error}</div>}

      {loading ? (
        <p className="settings-empty">Memuat pengaturan...</p>
      ) : (
        <div className="settings-card">
          <div className="settings-section-title">Pengaturan Denda</div>
          {settings.map(s => (
            <div key={s.key} className="setting-row">
              <div className="setting-info">
                <div className="setting-label">{s.label}</div>
                <div className="setting-key">{s.key}</div>
              </div>
              <div className="setting-control">
                <div className="setting-input-wrap">
                  {s.key === 'late_fee_rate' && <span className="input-prefix">Rp</span>}
                  <input
                    type="number"
                    min="0"
                    value={editing[s.key] ?? s.value}
                    onChange={e => setEditing(p => ({ ...p, [s.key]: e.target.value }))}
                    className="setting-input"
                  />
                </div>
                {s.key === 'late_fee_rate' && editing[s.key] && (
                  <span className="setting-preview">= Rp {formatRp(editing[s.key])}/hari</span>
                )}
                <button
                  className={`save-btn ${saved[s.key] ? 'saved' : ''}`}
                  onClick={() => handleSave(s.key)}
                  disabled={saving[s.key] || !isDirty(s.key)}
                >
                  {saving[s.key] ? 'Menyimpan...' : saved[s.key] ? '✓ Tersimpan' : 'Simpan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Settings
