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
  category_id?: number
  status: BookStatus
  copies: number
  created_at?: string
  updated_at?: string | null
}

export interface NewBookRequest {
  title: string
  author: string
  isbn: string
  category_id: number
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
export const borrowBatch = async (memberId: number, bookIds: number[], dueDays: number = 14) => {
  const response = await fetch(`${API_BASE_URL}/api/transactions/borrow-batch`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ member_id: memberId, book_ids: bookIds, due_days: dueDays }),
  })
  await handleApiResponse(response)
  return response.json()
}

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

export interface TopBook {
  book_id: number
  title: string
  author: string
  category: string
  borrow_count: number
}

export interface TopMember {
  member_id: number
  name: string
  email: string
  membership_type: string
  borrow_count: number
}

export const getTopBooks = async (params?: {
  start_date?: string
  end_date?: string
  limit?: number
}): Promise<TopBook[]> => {
  const queryParams = new URLSearchParams()
  if (params?.start_date) queryParams.append('start_date', params.start_date)
  if (params?.end_date) queryParams.append('end_date', params.end_date)
  if (params?.limit) queryParams.append('limit', params.limit.toString())

  const response = await fetch(`${API_BASE_URL}/api/reports/top-books?${queryParams}`, {
    headers: getHeaders(),
  })
  await handleApiResponse(response)
  return response.json()
}

export interface OverdueBorrow {
  transaction_id: number
  member_id: number
  member_name: string
  member_email: string
  member_phone: string
  membership_type: string
  book_id: number
  book_title: string
  book_author: string
  borrow_date: string
  due_date: string
  days_overdue: number
}

export const getOverdueReport = async (): Promise<OverdueBorrow[]> => {
  const response = await fetch(`${API_BASE_URL}/api/reports/overdue`, {
    headers: getHeaders(),
  })
  await handleApiResponse(response)
  return response.json()
}

export const getTopMembers = async (params?: {
  start_date?: string
  end_date?: string
  limit?: number
}): Promise<TopMember[]> => {
  const queryParams = new URLSearchParams()
  if (params?.start_date) queryParams.append('start_date', params.start_date)
  if (params?.end_date) queryParams.append('end_date', params.end_date)
  if (params?.limit) queryParams.append('limit', params.limit.toString())

  const response = await fetch(`${API_BASE_URL}/api/reports/top-members?${queryParams}`, {
    headers: getHeaders(),
  })
  await handleApiResponse(response)
  return response.json()
}

// Settings API
export interface AppSetting {
  key: string
  value: string
  label: string
}

export const getSettings = async (): Promise<AppSetting[]> => {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    headers: getHeaders(),
  })
  await handleApiResponse(response)
  return response.json()
}

export const updateSetting = async (key: string, value: string): Promise<AppSetting> => {
  const response = await fetch(`${API_BASE_URL}/api/settings/${key}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ value }),
  })
  await handleApiResponse(response)
  return response.json()
}

// Fines API
export type FineType = 'late' | 'lost' | 'damage'
export type FineStatus = 'unpaid' | 'paid'

export interface Fine {
  id: number
  member_id: number
  book_id: number | null
  transaction_id: number | null
  fine_type: FineType
  amount: number
  status: FineStatus
  reason: string | null
  paid_at: string | null
  created_at: string
  member_name: string
  book_title: string | null
}

export interface FineSummary {
  total_unpaid: number
  amount_unpaid: number
  total_paid: number
  amount_paid: number
}

export interface FineCreateRequest {
  member_id: number
  book_id?: number
  fine_type: 'lost' | 'damage'
  amount: number
  reason?: string
}

export const getFines = async (params?: {
  status?: string
  member_id?: number
  fine_type?: string
}): Promise<Fine[]> => {
  const queryParams = new URLSearchParams()
  if (params?.status) queryParams.append('status', params.status)
  if (params?.member_id) queryParams.append('member_id', params.member_id.toString())
  if (params?.fine_type) queryParams.append('fine_type', params.fine_type)
  const response = await fetch(`${API_BASE_URL}/api/fines?${queryParams}`, {
    headers: getHeaders(),
  })
  await handleApiResponse(response)
  return response.json()
}

export const createFine = async (data: FineCreateRequest): Promise<{ id: number; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/fines`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  await handleApiResponse(response)
  return response.json()
}

export const payFine = async (fineId: number): Promise<{ id: number; message: string; paid_at: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/fines/${fineId}/pay`, {
    method: 'PUT',
    headers: getHeaders(),
  })
  await handleApiResponse(response)
  return response.json()
}

export const getFineSummary = async (): Promise<FineSummary> => {
  const response = await fetch(`${API_BASE_URL}/api/fines/summary`, {
    headers: getHeaders(),
  })
  await handleApiResponse(response)
  return response.json()
}

// Categories API
export interface Category {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface CategoryCreateRequest {
  name: string
  description?: string
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    headers: getHeaders(),
  })
  await handleApiResponse(response)
  return response.json()
}

export const createCategory = async (data: CategoryCreateRequest): Promise<Category> => {
  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  await handleApiResponse(response)
  return response.json()
}

export const updateCategory = async (id: number, data: CategoryCreateRequest): Promise<Category> => {
  const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  await handleApiResponse(response)
  return response.json()
}

export const deleteCategory = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  await handleApiResponse(response)
}