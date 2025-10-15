import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SprintsPage from '../../app/dashboard/sprints/page'
import { mockSprint, mockCell, mockPersonalTask } from '../utils/mockData'
import { mockFetch } from '../utils/testHelpers'

describe('SprintsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders sprints page with title', async () => {
    global.fetch = mockFetch({ 
      sprints: [], 
      cells: [], 
      userTasks: [] 
    })
    
    render(<SprintsPage />)
    
    expect(screen.getByText('Gestión de Sprints')).toBeInTheDocument()
  })

  test('loads and displays sprints data', async () => {
    const mockSprints = [mockSprint]
    const mockCells = [mockCell]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: mockSprints })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: mockCells })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ userTasks: [] })
      })

    render(<SprintsPage />)

    await waitFor(() => {
      expect(screen.getByText('Sprint 1')).toBeInTheDocument()
    })

    expect(screen.getByText('Test Cell')).toBeInTheDocument()
    expect(screen.getByText('2024-Q1')).toBeInTheDocument()
  })

  test('filters sprints by quarter', async () => {
    const mockSprints = [
      { ...mockSprint, quarter: '2024-Q1' },
      { ...mockSprint, id: 2, name: 'Sprint 2', quarter: '2024-Q2' }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: mockSprints })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ userTasks: [] })
      })

    render(<SprintsPage />)

    await waitFor(() => {
      expect(screen.getByText('Sprint 1')).toBeInTheDocument()
      expect(screen.getByText('Sprint 2')).toBeInTheDocument()
    })

    // Find and click quarter filter
    const quarterSelect = screen.getByRole('combobox')
    fireEvent.click(quarterSelect)
    
    const q1Option = screen.getByText('2024-Q1')
    fireEvent.click(q1Option)

    expect(screen.getByText('Sprint 1')).toBeInTheDocument()
    expect(screen.queryByText('Sprint 2')).not.toBeInTheDocument()
  })

  test('displays sprint statistics', async () => {
    const sprintWithStats = {
      ...mockSprint,
      plannedPoints: 20,
      deliveredPoints: 15,
      tasks: [
        { id: 1, name: 'Task 1', status: 'done' },
        { id: 2, name: 'Task 2', status: 'todo' }
      ]
    }

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [sprintWithStats] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ userTasks: [] })
      })

    render(<SprintsPage />)

    await waitFor(() => {
      expect(screen.getByText('20')).toBeInTheDocument() // Planned points
      expect(screen.getByText('15')).toBeInTheDocument() // Delivered points
      expect(screen.getByText('75%')).toBeInTheDocument() // Completion percentage
    })
  })

  test('shows sprint status badges', async () => {
    const mockSprints = [
      { ...mockSprint, status: 'active' },
      { ...mockSprint, id: 2, name: 'Sprint 2', status: 'completed' },
      { ...mockSprint, id: 3, name: 'Sprint 3', status: 'planning' }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: mockSprints })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ userTasks: [] })
      })

    render(<SprintsPage />)

    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument()
      expect(screen.getByText('completed')).toBeInTheDocument()
      expect(screen.getByText('planning')).toBeInTheDocument()
    })
  })

  test('displays user tasks in sprint', async () => {
    const mockUserTasks = [
      {
        ...mockPersonalTask,
        id: 1,
        title: 'User Task 1',
        status: 'in_progress',
        priority: 'high',
        story_points: 5
      }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [mockSprint] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ userTasks: mockUserTasks })
      })

    render(<SprintsPage />)

    await waitFor(() => {
      expect(screen.getByText('User Task 1')).toBeInTheDocument()
    })

    expect(screen.getByText('5')).toBeInTheDocument() // Story points
  })

  test('calculates sprint velocity', async () => {
    const sprintWithVelocity = {
      ...mockSprint,
      deliveredPoints: 18,
      plannedPoints: 20
    }

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [sprintWithVelocity] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ userTasks: [] })
      })

    render(<SprintsPage />)

    await waitFor(() => {
      expect(screen.getByText('18')).toBeInTheDocument() // Delivered points
      expect(screen.getByText('90%')).toBeInTheDocument() // Velocity percentage
    })
  })

  test('shows burndown chart data', async () => {
    const sprintWithBurndown = {
      ...mockSprint,
      plannedPoints: 20,
      deliveredPoints: 15,
      tasks: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Task ${i + 1}`,
        status: i < 7 ? 'done' : 'todo'
      }))
    }

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [sprintWithBurndown] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ userTasks: [] })
      })

    render(<SprintsPage />)

    await waitFor(() => {
      expect(screen.getByText('70%')).toBeInTheDocument() // Task completion
    })
  })

  test('filters sprints by cell', async () => {
    const mockSprints = [
      { ...mockSprint, cellId: 1 },
      { ...mockSprint, id: 2, name: 'Sprint 2', cellId: 2 }
    ]

    const mockCells = [
      { ...mockCell, id: 1, name: 'Cell 1' },
      { ...mockCell, id: 2, name: 'Cell 2' }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: mockSprints })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: mockCells })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ userTasks: [] })
      })

    render(<SprintsPage />)

    await waitFor(() => {
      expect(screen.getByText('Sprint 1')).toBeInTheDocument()
      expect(screen.getByText('Sprint 2')).toBeInTheDocument()
    })
  })

  test('handles sprint status changes', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [mockSprint] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ userTasks: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Sprint updated' })
      })

    render(<SprintsPage />)

    await waitFor(() => {
      const statusButton = screen.getByRole('button', { name: /active/i })
      fireEvent.click(statusButton)
    })

    // Should make API call to update sprint status
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/sprints'),
      expect.objectContaining({
        method: 'PUT'
      })
    )
  })

  test('displays empty state when no sprints', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ userTasks: [] })
      })

    render(<SprintsPage />)

    await waitFor(() => {
      expect(screen.getByText('No hay sprints disponibles')).toBeInTheDocument()
    })
  })
})
