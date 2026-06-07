import { useState } from 'react'
import './Dashboard.css'

function Dashboard() {
  const [stats] = useState({
    totalBooks: 1247,
    borrowedBooks: 328,
    activeMembers: 456,
    overdueBooks: 23
  })

  const [recentActivities] = useState([
    { id: 1, type: 'borrow', member: 'John Doe', book: 'The Great Gatsby', time: '2 hours ago' },
    { id: 2, type: 'return', member: 'Jane Smith', book: '1984', time: '3 hours ago' },
    { id: 3, type: 'new', member: 'Bob Johnson', book: 'To Kill a Mockingbird', time: '5 hours ago' },
    { id: 4, type: 'borrow', member: 'Alice Williams', book: 'Pride and Prejudice', time: '6 hours ago' },
    { id: 5, type: 'return', member: 'Charlie Brown', book: 'The Catcher in the Rye', time: '1 day ago' }
  ])

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening in your library today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Books</h3>
            <p className="stat-number">{stats.totalBooks}</p>
            <span className="stat-change positive">+12% from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Borrowed Books</h3>
            <p className="stat-number">{stats.borrowedBooks}</p>
            <span className="stat-change positive">+8% from last week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Active Members</h3>
            <p className="stat-number">{stats.activeMembers}</p>
            <span className="stat-change positive">+5% from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Overdue Books</h3>
            <p className="stat-number">{stats.overdueBooks}</p>
            <span className="stat-change negative">-15% from last week</span>
          </div>
        </div>
      </div>

      <div className="recent-activities">
        <div className="section-header">
          <h2>Recent Activities</h2>
          <button className="view-all-button">View All</button>
        </div>

        <div className="activities-list">
          {recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className={`activity-indicator ${activity.type}`}>
                {activity.type === 'borrow' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="3" y2="12" />
                  </svg>
                )}
                {activity.type === 'return' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 14 4 9 9 4" />
                    <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                  </svg>
                )}
                {activity.type === 'new' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </div>
              <div className="activity-content">
                <p className="activity-text">
                  <strong>{activity.member}</strong>
                  {activity.type === 'borrow' && ' borrowed '}
                  {activity.type === 'return' && ' returned '}
                  {activity.type === 'new' && ' added '}
                  <em>{activity.book}</em>
                </p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard