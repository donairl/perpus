import { FormEvent, useState } from 'react'
import './BorrowBookModal.css'
import * as api from '../services/api'

type MembershipTypeOption = 'Basic' | 'Premium' | 'VIP'
type MemberStatusOption = 'active' | 'inactive' | 'expired'

interface AddMemberModalProps {
  onClose: () => void
  onCreate: (member: api.NewMemberRequest) => Promise<void>
}

function AddMemberModal({ onClose, onCreate }: AddMemberModalProps) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    membership_type: 'Basic' as MembershipTypeOption,
    status: 'active' as MemberStatusOption,
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const trimmedName = formState.name.trim()
    const trimmedEmail = formState.email.trim()
    const trimmedPhone = formState.phone.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPhone) {
      setError('All fields are required')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    try {
      await onCreate({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        membership_type: formState.membership_type,
        status: formState.status,
      })
      onClose()
      setFormState({
        name: '',
        email: '',
        phone: '',
        membership_type: 'Basic',
        status: 'active',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to add member')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Member</h2>
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
              <label htmlFor="memberName">Name</label>
              <input
                id="memberName"
                type="text"
                value={formState.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="e.g. John Doe"
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="memberEmail">Email</label>
              <input
                id="memberEmail"
                type="email"
                value={formState.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="e.g. john@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="memberPhone">Phone</label>
              <input
                id="memberPhone"
                type="tel"
                value={formState.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
                placeholder="e.g. (555) 123-4567"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="memberType">Membership Type</label>
              <select
                id="memberType"
                value={formState.membership_type}
                onChange={(event) => handleChange('membership_type', event.target.value as MembershipTypeOption)}
              >
                <option value="Basic">Basic</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="memberStatus">Status</label>
              <select
                id="memberStatus"
                value={formState.status}
                onChange={(event) => handleChange('status', event.target.value as MemberStatusOption)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="button-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="button-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddMemberModal
