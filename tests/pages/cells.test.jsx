import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CellsPage from '../../app/dashboard/cells/page'
import { mockCell, mockTribe, mockUser, mockSprint } from '../utils/mockData'
import { mockFetch } from '../utils/testHelpers'

// Mock de Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('CellsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders cells page with title', async () => {
    global.fetch = mockFetch({ cells: [] })
    
    render(<CellsPage />)
    
    expect(screen.getByText('Gestión de Células')).toBeInTheDocument()
    expect(screen.getByText('Nueva Célula')).toBeInTheDocument()
  })

  test('loads and displays cells data', async () => {
    const mockCells = [mockCell]
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: mockCells })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tribes: [mockTribe] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [mockUser] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [mockSprint] })
      })

    render(<CellsPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Cell')).toBeInTheDocument()
    })

    expect(screen.getByText('Test Tribe')).toBeInTheDocument()
    expect(screen.getByText('Test Coach')).toBeInTheDocument()
  })

  test('calculates completion percentage correctly', async () => {
    const cellWithTasks = {
      ...mockCell,
      sprints: [{
        ...mockSprint,
        tasks: [
          { id: 1, name: 'Task 1', status: 'done' },
          { id: 2, name: 'Task 2', status: 'done' },
          { id: 3, name: 'Task 3', status: 'todo' }
        ]
      }]
    }

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [cellWithTasks] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tribes: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: cellWithTasks.sprints })
      })

    render(<CellsPage />)

    await waitFor(() => {
      // 2 de 3 tareas completadas = 67%
      expect(screen.getByText('67%')).toBeInTheDocument()
    })
  })

  test('opens create cell dialog', async () => {
    global.fetch = mockFetch({ cells: [], tribes: [], users: [] })
    
    render(<CellsPage />)
    
    const newCellButton = screen.getByText('Nueva Célula')
    fireEvent.click(newCellButton)

    await waitFor(() => {
      expect(screen.getByText('Crear Nueva Célula')).toBeInTheDocument()
    })
  })

  test('filters cells by search term', async () => {
    const mockCells = [
      { ...mockCell, name: 'Frontend Cell' },
      { ...mockCell, id: 2, name: 'Backend Cell' }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: mockCells })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tribes: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ sprints: [] })
      })

    render(<CellsPage />)

    await waitFor(() => {
      expect(screen.getByText('Frontend Cell')).toBeInTheDocument()
      expect(screen.getByText('Backend Cell')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar por nombre de célula o tribu...')
    fireEvent.change(searchInput, { target: { value: 'Frontend' } })

    expect(screen.getByText('Frontend Cell')).toBeInTheDocument()
    expect(screen.queryByText('Backend Cell')).not.toBeInTheDocument()
  })

  test('navigates to cell detail page', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [mockCell] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tribes: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [] })
      })

    render(<CellsPage />)

    await waitFor(() => {
      const cellLink = screen.getByText('Test Cell')
      fireEvent.click(cellLink)
    })

    expect(mockPush).toHaveBeenCalledWith('/dashboard/cells/1')
  })

  test('shows completion statistics', async () => {
    const mockCells = [
      {
        ...mockCell,
        sprints: [{
          ...mockSprint,
          tasks: [
            { id: 1, name: 'Task 1', status: 'done' },
            { id: 2, name: 'Task 2', status: 'done' }
          ]
        }]
      },
      {
        ...mockCell,
        id: 2,
        name: 'Cell 2',
        sprints: [{
          ...mockSprint,
          id: 2,
          tasks: [
            { id: 3, name: 'Task 3', status: 'done' },
            { id: 4, name: 'Task 4', status: 'todo' }
          ]
        }]
      }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: mockCells })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tribes: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ sprints: [] })
      })

    render(<CellsPage />)

    await waitFor(() => {
      expect(screen.getByText('Total Células')).toBeInTheDocument()
      expect(screen.getByText('Cumplimiento Promedio')).toBeInTheDocument()
      expect(screen.getByText('Células sobre Meta')).toBeInTheDocument()
      expect(screen.getByText('Estado General')).toBeInTheDocument()
    })
  })

  test('deletes cell with confirmation', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [mockCell] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tribes: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Cell deleted' })
      })

    window.confirm = jest.fn(() => true)

    render(<CellsPage />)

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: '' }) // Trash icon button
      fireEvent.click(deleteButton)
    })

    expect(window.confirm).toHaveBeenCalledWith('¿Deseas eliminar la célula "Test Cell"?')
  })
})
