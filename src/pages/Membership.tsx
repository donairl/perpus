import { useState, useEffect } from 'react'
import './Membership.css'
import AddMemberModal from '../components/AddMemberModal'
import EditMemberModal from '../components/EditMemberModal'
import * as api from '../services/api'

type Member = api.Member

function Membership() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [members, setMembers] = useState<Member[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadMembers = async () => {
    try {
      const [membersData, statsData] = await Promise.all([
        api.getMembers(),
        api.getMembersStats(),
      ])
      setMembers(membersData)
      setStats({
        total: statsData.total_members,
        active: statsData.active,
        expired: statsData.expired,
      })
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  const handleAddMember = async (newMember: api.NewMemberRequest) => {
    try {
      await api.createMember(newMember)
      await loadMembers()
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to add member')
    }
  }

  const handleUpdateMember = async (memberId: number, updatedMember: api.UpdateMemberRequest) => {
    try {
      await api.updateMember(memberId, updatedMember)
      await loadMembers()
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to update member')
    }
  }

  const handleDeleteMember = async (memberId: number) => {
    if (!window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return
    }

    try {
      await api.deleteMember(memberId)
      await loadMembers()
    } catch (error: any) {
      alert(`Failed to delete member: ${error.message}`)
    }
  }

  const openEditModal = (member: Member) => {
    setSelectedMember(member)
    setShowEditModal(true)
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="membership-page">
      <div className="membership-header">
        <div>
          <h1>Membership Management</h1>
          <p>Manage library members and their subscriptions</p>
        </div>
        <button className="add-member-button" onClick={() => setShowAddModal(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Member
        </button>
      </div>

      <div className="membership-stats">
        <div className="stat-box">
          <h3>Total Members</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-box">
          <h3>Active Members</h3>
          <p className="stat-value" style={{ color: '#48bb78' }}>{stats.active}</p>
        </div>
        <div className="stat-box">
          <h3>Expired Members</h3>
          <p className="stat-value" style={{ color: '#f56565' }}>{stats.expired}</p>
        </div>
      </div>

      <div className="membership-controls">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filters">
          <button
            className={`status-button ${selectedStatus === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('all')}
          >
            All
          </button>
          <button
            className={`status-button ${selectedStatus === 'active' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('active')}
          >
            Active
          </button>
          <button
            className={`status-button ${selectedStatus === 'expired' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('expired')}
          >
            Expired
          </button>
        </div>
      </div>

      <div className="members-table">
        {isLoading ? (
          <div className="loading-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6V12L16 14" />
            </svg>
            <h3>Loading members...</h3>
          </div>
        ) : (
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Contact</th>
              <th>Membership</th>
              <th>Join Date</th>
              <th>Books</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => (
              <tr key={member.id}>
                <td>
                  <div className="member-info">
                    <div className="member-avatar">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="member-name">{member.name}</div>
                      <div className="member-id">ID: {member.id.toString().padStart(4, '0')}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div>{member.email}</div>
                    <div className="phone">{member.phone}</div>
                  </div>
                </td>
                <td>
                  <span className={`membership-badge ${member.membership_type.toLowerCase()}`}>
                    {member.membership_type}
                  </span>
                </td>
                <td>{new Date(member.join_date).toLocaleDateString()}</td>
                <td>
                  <span className="books-count">{member.books_count} {member.books_count === 1 ? 'book' : 'books'}</span>
                </td>
                <td>
                  <span className={`status-badge ${member.status}`}>
                    ● {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="icon-button" title="View Details">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button className="icon-button" title="Edit" onClick={() => openEditModal(member)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="icon-button" title="Delete" onClick={() => handleDeleteMember(member.id)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}

        {filteredMembers.length === 0 && !isLoading && (
          <div className="no-results">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3>No members found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onCreate={handleAddMember}
        />
      )}

      {showEditModal && selectedMember && (
        <EditMemberModal
          member={selectedMember}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateMember}
        />
      )}
    </div>
  )
}

export default Membership