export const API_BASE_URL = 'http://localhost:8000'

let authToken: string | null = null

export const setAuthToken = (token: string) => {
  authToken = token
  localStorage.setItem('authToken', token)
}

export const getAuthToken = () => {
  if (!authToken) {
    authToken = localStorage.getItem('authToken')
  }
  return authToken
}

export const clearAuthToken = () => {
  authToken = null
  localStorage.removeItem('authToken')
}

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

// Helper function to handle API responses and token expiration
const handleApiResponse = async (response: Response) => {
  if (response.status === 401) {
    // Token expired or invalid - clear it and redirect to login
    clearAuthToken()
    window.location.href = '/login'
    throw new Error('Authentication expired. Please login again.')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response
}

export type BookStatus = 'available' | 'borrowed' | 'reserved'

export interface Book {
  id: number
  title: string
  author: string
  isbn: string
  category: string
  status: BookStatus
  copies: number
  created_at?: string
  updated_at?: string | null
}

export interface NewBookRequest {
  title: string
  author: string
  isbn: string
  category: string
  copies: number
  status?: BookStatus
}

export type MemberStatus = 'active' | 'inactive' | 'expired'
export type MembershipType = 'Basic' | 'Premium' | 'VIP'

export interface Member {
  id: number
  name: string
  email: string
  phone: string
  membership_type: MembershipType
  status: MemberStatus
  books_count: number
  join_date: string
  created_at?: string
  updated_at?: string | null
}

export interface NewMemberRequest {
  name: string
  email: string
  phone: string
  membership_type?: MembershipType
  status?: MemberStatus
}

export interface UpdateMemberRequest {
  name?: string
  email?: string
  phone?: string
  membership_type?: MembershipType
  status?: MemberStatus
  books_count?: number
}

// Auth API
export const login = async (username: string, password: string) => {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)
  
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error('Login failed')
  }
  
  const data = await response.json()
  setAuthToken(data.access_token)
  return data
}

// Books API
export const getBooks = async (
  params?: { category?: string; status?: string; search?: string }
): Promise<Book[]> => {
  const queryParams = new URLSearchParams()
  if (params?.category) queryParams.append('category', params.category)
  if (params?.status) queryParams.append('status', params.status)
  if (params?.search) queryParams.append('search', params.search)
  
  const response = await fetch(`${API_BASE_URL}/api/books?${queryParams}`, {
    headers: getHeaders(),
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch books')
  }
  
  return response.json()
}

export const createBook = async (book: NewBookRequest): Promise<Book> => {
  const response = await fetch(`${API_BASE_URL}/api/books`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(book),
  })

  await handleApiResponse(response)
  return response.json()
}

// Members API
export const getMembers = async (
  params?: { status?: string; search?: string }
): Promise<Member[]> => {
  const queryParams = new URLSearchParams()
  if (params?.status) queryParams.append('status', params.status)
  if (params?.search) queryParams.append('search', params.search)

  const response = await fetch(`${API_BASE_URL}/api/members?${queryParams}`, {
    headers: getHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch members')
  }

  return response.json()
}

export const getMember = async (memberId: number): Promise<Member> => {
  const response = await fetch(`${API_BASE_URL}/api/members/${memberId}`, {
    headers: getHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail || 'Failed to fetch member')
  }

  return response.json()
}

export const createMember = async (member: NewMemberRequest): Promise<Member> => {
  const response = await fetch(`${API_BASE_URL}/api/members`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(member),
  })

  await handleApiResponse(response)
  return response.json()
}

export const updateMember = async (memberId: number, member: UpdateMemberRequest): Promise<Member> => {
  const response = await fetch(`${API_BASE_URL}/api/members/${memberId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(member),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail || 'Failed to update member')
  }

  return response.json()
}

export const deleteMember = async (memberId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/members/${memberId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail || 'Failed to delete member')
  }
}

export const getMembersStats = async () => {
  const response = await fetch(`${API_BASE_URL}/api/members/stats/summary`, {
    headers: getHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch members stats')
  }

  return response.json()
}

// Transactions API
export const borrowBook = async (bookId: number, memberId: number, dueDays: number = 14) => {
  const response = await fetch(`${API_BASE_URL}/api/transactions/borrow`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      book_id: bookId,
      member_id: memberId,
      due_days: dueDays,
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to borrow book')
  }
  
  return response.json()
}

export const returnBook = async (bookId: number, memberId: number) => {
  const response = await fetch(`${API_BASE_URL}/api/transactions/return`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      book_id: bookId,
      member_id: memberId,
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to return book')
  }
  
  return response.json()
}

export const getTransactions = async (params?: { book_id?: number; member_id?: number }) => {
  const queryParams = new URLSearchParams()
  if (params?.book_id) queryParams.append('book_id', params.book_id.toString())
  if (params?.member_id) queryParams.append('member_id', params.member_id.toString())
  
  const response = await fetch(`${API_BASE_URL}/api/transactions?${queryParams}`, {
    headers: getHeaders(),
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch transactions')
  }
  
  return response.json()
}

export const getActiveBorrows = async () => {
  const response = await fetch(`${API_BASE_URL}/api/transactions/active-borrows`, {
    headers: getHeaders(),
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch active borrows')
  }
  
  return response.json()
}

export const checkApiHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error('API health check failed')
  }

  return response.json()
}

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getHeaders(),
    })
    return response.ok
  } catch {
    return false
  }
}