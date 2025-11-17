import { useState } from 'react'
import './Membership.css'

interface Member {
  id: number
  name: string
  email: string
  phone: string
  membershipType: 'Basic' | 'Premium' | 'VIP'
  joinDate: string
  status: 'active' | 'inactive' | 'expired'
  booksCount: number
}

function Membership() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [members] = useState<Member[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '(555) 123-4567', membershipType: 'Premium', joinDate: '2023-01-15', status: 'active', booksCount: 3 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '(555) 234-5678', membershipType: 'VIP', joinDate: '2023-02-20', status: 'active', booksCount: 5 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '(555) 345-6789', membershipType: 'Basic', joinDate: '2023-03-10', status: 'active', booksCount: 1 },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', phone: '(555) 456-7890', membershipType: 'Premium', joinDate: '2023-04-05', status: 'active', booksCount: 2 },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', phone: '(555) 567-8901', membershipType: 'Basic', joinDate: '2022-12-01', status: 'expired', booksCount: 0 },
    { id: 6, name: 'Diana Prince', email: 'diana@example.com', phone: '(555) 678-9012', membershipType: 'VIP', joinDate: '2023-05-12', status: 'active', booksCount: 4 },
  ])

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    expired: members.filter(m => m.status === 'expired').length,
  }

  return (
    <div className="membership-page">
      <div className="membership-header">
        <div>
          <h1>Membership Management</h1>
          <p>Manage library members and their subscriptions</p>
        </div>
        <button className="add-member-button">
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
                  <span className={`membership-badge ${member.membershipType.toLowerCase()}`}>
                    {member.membershipType}
                  </span>
                </td>
                <td>{new Date(member.joinDate).toLocaleDateString()}</td>
                <td>
                  <span className="books-count">{member.booksCount} {member.booksCount === 1 ? 'book' : 'books'}</span>
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
                    <button className="icon-button" title="Edit">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="icon-button" title="Delete">
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

        {filteredMembers.length === 0 && (
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
    </div>
  )
}

export default Membership