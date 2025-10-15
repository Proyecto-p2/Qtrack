import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PersonalPage from '../../app/dashboard/personal/page'
import { mockPersonalTask, mockMetrics } from '../utils/mockData'
import { mockFetch } from '../utils/testHelpers'

// Mock de useSession
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }
    },
    status: 'authenticated'
  })
}))

// Mock de recharts
jest.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />
}))

describe('PersonalPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders personal dashboard with user info', async () => {
    global.fetch = mockFetch({ 
      tasks: [mockPersonalTask], 
      metrics: [mockMetrics] 
    })
    
    render(<PersonalPage />)
    
    expect(screen.getByText('Dashboard Personal')).toBeInTheDocument()
    expect(screen.getByText('Bienvenido de vuelta, Test User')).toBeInTheDocument()
  })

  test('loads and displays personal tasks', async () => {
    const mockTasks = [
      mockPersonalTask,
      { ...mockPersonalTask, id: 2, title: 'Another Task', status: 'in_progress' }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tasks: mockTasks })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ metrics: [mockMetrics] })
      })

    render(<PersonalPage />)

    await waitFor(() => {
      expect(screen.getByText('Personal Task')).toBeInTheDocument()
      expect(screen.getByText('Another Task')).toBeInTheDocument()
    })
  })

  test('displays task statistics correctly', async () => {
    const mockTasks = [
      { ...mockPersonalTask, status: 'done' },
      { ...mockPersonalTask, id: 2, status: 'in_progress' },
      { ...mockPersonalTask, id: 3, status: 'todo' },
      { ...mockPersonalTask, id: 4, status: 'blocked' }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tasks: mockTasks })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ metrics: [] })
      })

    render(<PersonalPage />)

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument() // Total tasks
      expect(screen.getByText('1')).toBeInTheDocument() // Completed tasks
      expect(screen.getByText('25.0%')).toBeInTheDocument() // Completion rate
    })
  })

  test('filters tasks by status', async () => {
    const mockTasks = [
      { ...mockPersonalTask, title: 'Done Task', status: 'done' },
      { ...mockPersonalTask, id: 2, title: 'In Progress Task', status: 'in_progress' },
      { ...mockPersonalTask, id: 3, title: 'Todo Task', status: 'todo' }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tasks: mockTasks })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ metrics: [] })
      })

    render(<PersonalPage />)

    await waitFor(() => {
      expect(screen.getByText('Done Task')).toBeInTheDocument()
      expect(screen.getByText('In Progress Task')).toBeInTheDocument()
      expect(screen.getByText('Todo Task')).toBeInTheDocument()
    })

    // Click on "En Progreso" tab
    const inProgressTab = screen.getByText('En Progreso')
    fireEvent.click(inProgressTab)

    expect(screen.getByText('In Progress Task')).toBeInTheDocument()
    expect(screen.queryByText('Done Task')).not.toBeInTheDocument()
    expect(screen.queryByText('Todo Task')).not.toBeInTheDocument()
  })

  test('displays metrics and charts', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tasks: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ metrics: [mockMetrics] })
      })

    render(<PersonalPage />)

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  test('calculates story points correctly', async () => {
    const mockTasks = [
      { ...mockPersonalTask, story_points: 5, status: 'done' },
      { ...mockPersonalTask, id: 2, story_points: 3, status: 'done' },
      { ...mockPersonalTask, id: 3, story_points: 8, status: 'in_progress' }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tasks: mockTasks })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ metrics: [] })
      })

    render(<PersonalPage />)

    await waitFor(() => {
      // Total story points: 5 + 3 + 8 = 16
      // Completed story points: 5 + 3 = 8
      expect(screen.getByText('16')).toBeInTheDocument() // Total story points
      expect(screen.getByText('8')).toBeInTheDocument() // Completed story points
    })
  })

  test('shows task priority distribution', async () => {
    const mockTasks = [
      { ...mockPersonalTask, priority: 'critical' },
      { ...mockPersonalTask, id: 2, priority: 'high' },
      { ...mockPersonalTask, id: 3, priority: 'medium' },
      { ...mockPersonalTask, id: 4, priority: 'low' }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tasks: mockTasks })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ metrics: [] })
      })

    render(<PersonalPage />)

    await waitFor(() => {
      expect(screen.getByText('Crítica')).toBeInTheDocument()
      expect(screen.getByText('Alta')).toBeInTheDocument()
      expect(screen.getByText('Media')).toBeInTheDocument()
      expect(screen.getByText('Baja')).toBeInTheDocument()
    })
  })

  test('displays time tracking information', async () => {
    const taskWithHours = {
      ...mockPersonalTask,
      estimated_hours: 10,
      actual_hours: 8
    }

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tasks: [taskWithHours] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ metrics: [] })
      })

    render(<PersonalPage />)

    await waitFor(() => {
      expect(screen.getByText('10h')).toBeInTheDocument() // Estimated hours
      expect(screen.getByText('8h')).toBeInTheDocument() // Actual hours
    })
  })

  test('handles API errors gracefully', async () => {
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ metrics: [] })
      })

    render(<PersonalPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard Personal')).toBeInTheDocument()
    })

    // Should not crash and should show empty state
  })

  test('displays performance trends', async () => {
    const mockMetricsWithTrend = [
      { ...mockMetrics, quarter: '2024-Q1', completion_rate: 0.8 },
      { ...mockMetrics, id: 2, quarter: '2024-Q2', completion_rate: 0.9 }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tasks: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ metrics: mockMetricsWithTrend })
      })

    render(<PersonalPage />)

    await waitFor(() => {
      expect(screen.getByText('Tendencia de Rendimiento')).toBeInTheDocument()
    })
  })
})
