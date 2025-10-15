import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TribesPage from '../../app/dashboard/tribes/page'
import { mockTribe, mockUser, mockCell, mockSprint } from '../utils/mockData'
import { mockFetch } from '../utils/testHelpers'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('TribesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders tribes page with title', async () => {
    global.fetch = mockFetch({ tribes: [] })
    
    render(<TribesPage />)
    
    expect(screen.getByText('Gestión de Tribus')).toBeInTheDocument()
    expect(screen.getByText('Nueva Tribu')).toBeInTheDocument()
  })

  test('loads and displays tribes data', async () => {
    const mockTribes = [mockTribe]
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tribes: mockTribes })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [mockUser] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })

    render(<TribesPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Tribe')).toBeInTheDocument()
    })

    expect(screen.getByText('Test Leader')).toBeInTheDocument()
  })

  test('calculates tribe completion with cells data', async () => {
    const cellWithTasks = {
      ...mockCell,
      tribeName: 'Test Tribe',
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
        json: () => Promise.resolve({ tribes: [mockTribe] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [cellWithTasks] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: cellWithTasks.sprints })
      })

    render(<TribesPage />)

    await waitFor(() => {
      // 2 de 3 tareas completadas = 67%
      expect(screen.getByText('67%')).toBeInTheDocument()
    })
  })

  test('opens create tribe dialog', async () => {
    global.fetch = mockFetch({ tribes: [], users: [] })
    
    render(<TribesPage />)
    
    const newTribeButton = screen.getByText('Nueva Tribu')
    fireEvent.click(newTribeButton)

    await waitFor(() => {
      expect(screen.getByText('Crear Nueva Tribu')).toBeInTheDocument()
    })
  })

  test('filters tribes by search term', async () => {
    const mockTribes = [
      { ...mockTribe, name: 'Digital Tribe' },
      { ...mockTribe, id: 2, name: 'Analytics Tribe' }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tribes: mockTribes })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })

    render(<TribesPage />)

    await waitFor(() => {
      expect(screen.getByText('Digital Tribe')).toBeInTheDocument()
      expect(screen.getByText('Analytics Tribe')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar por nombre o líder...')
    fireEvent.change(searchInput, { target: { value: 'Digital' } })

    expect(screen.getByText('Digital Tribe')).toBeInTheDocument()
    expect(screen.queryByText('Analytics Tribe')).not.toBeInTheDocument()
  })

  test('navigates to tribe detail page', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tribes: [mockTribe] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })

    render(<TribesPage />)

    await waitFor(() => {
      const tribeLink = screen.getByText('Test Tribe')
      fireEvent.click(tribeLink)
    })

    expect(mockPush).toHaveBeenCalledWith('/dashboard/tribes/1')
  })

  test('shows completion statistics', async () => {
    const mockTribes = [mockTribe]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tribes: mockTribes })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })

    render(<TribesPage />)

    await waitFor(() => {
      expect(screen.getByText('Total Tribus')).toBeInTheDocument()
      expect(screen.getByText('Cumplimiento Promedio')).toBeInTheDocument()
      expect(screen.getByText('Tribus sobre Meta')).toBeInTheDocument()
      expect(screen.getByText('Estado General')).toBeInTheDocument()
    })
  })

  test('displays completion distribution', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tribes: [mockTribe] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })

    render(<TribesPage />)

    await waitFor(() => {
      expect(screen.getByText('Rendimiento por Cumplimiento')).toBeInTheDocument()
      expect(screen.getByText('🟢 Excelente (90%+):')).toBeInTheDocument()
      expect(screen.getByText('🟡 Bueno (70-89%):')).toBeInTheDocument()
      expect(screen.getByText('🔴 Necesita Mejora (<70%):')).toBeInTheDocument()
    })
  })

  test('creates new tribe successfully', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tribes: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [mockUser] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { insertId: 1 } })
      })

    render(<TribesPage />)

    const newTribeButton = screen.getByText('Nueva Tribu')
    fireEvent.click(newTribeButton)

    await waitFor(() => {
      const nameInput = screen.getByLabelText('Nombre')
      const createButton = screen.getByText('Crear Tribu')

      fireEvent.change(nameInput, { target: { value: 'New Tribe' } })
      fireEvent.click(createButton)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/tribes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Tribe',
        leadUserId: '',
        leadName: '',
        description: ''
      })
    })
  })

  test('deletes tribe with confirmation', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tribes: [mockTribe] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Tribe deleted' })
      })

    window.confirm = jest.fn(() => true)

    render(<TribesPage />)

    await waitFor(() => {
      const deleteButton = screen.getByText('Eliminar')
      fireEvent.click(deleteButton)
    })

    expect(window.confirm).toHaveBeenCalledWith('¿Deseas eliminar la tribu "Test Tribe"?')
  })
})
