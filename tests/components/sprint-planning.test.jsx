import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SprintPlanning from '../../components/sprint-planning'
import { mockSprint, mockCell, mockQConfig } from '../utils/mockData'
import { mockFetch } from '../utils/testHelpers'

// Mock de useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

describe('SprintPlanning', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders sprint planning with title', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockQConfig])
      })
    
    render(<SprintPlanning />)
    
    expect(screen.getByText('Planificación de Sprints')).toBeInTheDocument()
  })

  test('loads cells and quarters data', async () => {
    const mockCells = [mockCell]
    const mockQuarters = [mockQConfig]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: mockCells })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuarters)
      })

    render(<SprintPlanning />)

    await waitFor(() => {
      expect(screen.getByText('Test Cell')).toBeInTheDocument()
      expect(screen.getByText('2024-Q1')).toBeInTheDocument()
    })
  })

  test('selects active quarter by default', async () => {
    const activeQuarter = { ...mockQConfig, isActive: true }
    
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([activeQuarter])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [] })
      })

    render(<SprintPlanning />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('2024-Q1')).toBeInTheDocument()
    })
  })

  test('generates sprints for selected cells', async () => {
    const mockCells = [mockCell]
    const mockQuarters = [mockQConfig]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: mockCells })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuarters)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          message: 'Sprints generated successfully',
          sprintsCreated: 6
        })
      })

    render(<SprintPlanning />)

    await waitFor(() => {
      const generateButton = screen.getByText('Generar Sprints')
      fireEvent.click(generateButton)
    })

    // Should open generation dialog
    expect(screen.getByText('Generar Sprints Automáticamente')).toBeInTheDocument()

    // Select cell and confirm
    const cellCheckbox = screen.getByRole('checkbox')
    fireEvent.click(cellCheckbox)

    const confirmButton = screen.getByText('Generar')
    fireEvent.click(confirmButton)

    expect(global.fetch).toHaveBeenCalledWith('/api/sprints/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"cellIds":[1]')
    })
  })

  test('displays existing sprints in table', async () => {
    const mockSprints = [
      {
        ...mockSprint,
        cellName: 'Test Cell',
        committedPoints: 18,
        deliveredPoints: 15
      }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockQConfig])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: mockSprints })
      })

    render(<SprintPlanning />)

    await waitFor(() => {
      expect(screen.getByText('Sprint 1')).toBeInTheDocument()
      expect(screen.getByText('Test Cell')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument() // Planned points
      expect(screen.getByText('18')).toBeInTheDocument() // Committed points
      expect(screen.getByText('15')).toBeInTheDocument() // Delivered points
    })
  })

  test('edits sprint committed points', async () => {
    const mockSprints = [mockSprint]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockQConfig])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: mockSprints })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Sprint updated' })
      })

    render(<SprintPlanning />)

    await waitFor(() => {
      const editButton = screen.getByText('Editar')
      fireEvent.click(editButton)
    })

    const pointsInput = screen.getByDisplayValue('18')
    fireEvent.change(pointsInput, { target: { value: '20' } })

    const saveButton = screen.getByText('Guardar')
    fireEvent.click(saveButton)

    expect(global.fetch).toHaveBeenCalledWith('/api/sprints/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"committedPoints":20')
    })
  })

  test('filters sprints by cell', async () => {
    const mockSprints = [
      { ...mockSprint, cellId: 1, cellName: 'Cell 1' },
      { ...mockSprint, id: 2, cellId: 2, cellName: 'Cell 2' }
    ]

    const mockCells = [
      { ...mockCell, id: 1, name: 'Cell 1' },
      { ...mockCell, id: 2, name: 'Cell 2' }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: mockCells })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockQConfig])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: mockSprints })
      })

    render(<SprintPlanning />)

    await waitFor(() => {
      expect(screen.getByText('Cell 1')).toBeInTheDocument()
      expect(screen.getByText('Cell 2')).toBeInTheDocument()
    })

    // Filter by Cell 1
    const cellFilter = screen.getByRole('combobox')
    fireEvent.click(cellFilter)
    
    const cell1Option = screen.getByText('Cell 1')
    fireEvent.click(cell1Option)

    expect(screen.getByText('Cell 1')).toBeInTheDocument()
    expect(screen.queryByText('Cell 2')).not.toBeInTheDocument()
  })

  test('shows sprint status with proper styling', async () => {
    const mockSprints = [
      { ...mockSprint, status: 'planning' },
      { ...mockSprint, id: 2, status: 'active' },
      { ...mockSprint, id: 3, status: 'completed' }
    ]

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockQConfig])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: mockSprints })
      })

    render(<SprintPlanning />)

    await waitFor(() => {
      expect(screen.getByText('planning')).toBeInTheDocument()
      expect(screen.getByText('active')).toBeInTheDocument()
      expect(screen.getByText('completed')).toBeInTheDocument()
    })
  })

  test('validates sprint dates', async () => {
    const invalidSprint = {
      ...mockSprint,
      startDate: '2024-02-01',
      endDate: '2024-01-15' // End before start
    }

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockQConfig])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [invalidSprint] })
      })

    render(<SprintPlanning />)

    await waitFor(() => {
      expect(screen.getByText('Fechas inválidas')).toBeInTheDocument()
    })
  })

  test('calculates sprint velocity correctly', async () => {
    const sprintWithVelocity = {
      ...mockSprint,
      plannedPoints: 20,
      deliveredPoints: 16
    }

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockQConfig])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [sprintWithVelocity] })
      })

    render(<SprintPlanning />)

    await waitFor(() => {
      expect(screen.getByText('80%')).toBeInTheDocument() // Velocity: 16/20
    })
  })

  test('shows loading state during generation', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [mockCell] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockQConfig])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [] })
      })
      .mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Generated' })
          }), 100)
        )
      )

    render(<SprintPlanning />)

    await waitFor(() => {
      const generateButton = screen.getByText('Generar Sprints')
      fireEvent.click(generateButton)
    })

    const cellCheckbox = screen.getByRole('checkbox')
    fireEvent.click(cellCheckbox)

    const confirmButton = screen.getByText('Generar')
    fireEvent.click(confirmButton)

    expect(screen.getByText('Generando...')).toBeInTheDocument()
  })

  test('handles generation errors', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cells: [mockCell] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockQConfig])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sprints: [] })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Generation failed' })
      })

    render(<SprintPlanning />)

    await waitFor(() => {
      const generateButton = screen.getByText('Generar Sprints')
      fireEvent.click(generateButton)
    })

    const cellCheckbox = screen.getByRole('checkbox')
    fireEvent.click(cellCheckbox)

    const confirmButton = screen.getByText('Generar')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('Error al generar sprints')).toBeInTheDocument()
    })
  })
})
