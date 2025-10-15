import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import QConfiguration from '../../app/dashboard/q-configuration/page'
import { mockQConfig } from '../utils/mockData'
import { mockFetch } from '../utils/testHelpers'

// Mock de useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

describe('QConfiguration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders Q configuration page with title', async () => {
    global.fetch = mockFetch(mockQConfig)
    
    render(<QConfiguration />)
    
    expect(screen.getByText('Configuración de Q')).toBeInTheDocument()
  })

  test('loads existing configuration', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQConfig)
      })

    render(<QConfiguration />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Q1')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2024')).toBeInTheDocument()
      expect(screen.getByDisplayValue('6')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    })
  })

  test('validates quarter field', async () => {
    global.fetch = mockFetch(mockQConfig)
    
    render(<QConfiguration />)

    await waitFor(() => {
      const quarterSelect = screen.getByRole('combobox')
      fireEvent.click(quarterSelect)
    })

    const q2Option = screen.getByText('Q2')
    fireEvent.click(q2Option)

    expect(screen.getByText('Q2')).toBeInTheDocument()
  })

  test('validates year input', async () => {
    global.fetch = mockFetch(mockQConfig)
    
    render(<QConfiguration />)

    await waitFor(() => {
      const yearInput = screen.getByLabelText('Año')
      fireEvent.change(yearInput, { target: { value: '2019' } })
      fireEvent.blur(yearInput)
    })

    expect(screen.getByText('El año debe estar entre 2020 y 2030')).toBeInTheDocument()
  })

  test('validates sprints per quarter', async () => {
    global.fetch = mockFetch(mockQConfig)
    
    render(<QConfiguration />)

    await waitFor(() => {
      const sprintsSelect = screen.getByRole('combobox')
      fireEvent.click(sprintsSelect)
    })

    const option4 = screen.getByText('4')
    fireEvent.click(option4)

    expect(screen.getByText('4')).toBeInTheDocument()
  })

  test('validates sprint duration', async () => {
    global.fetch = mockFetch(mockQConfig)
    
    render(<QConfiguration />)

    await waitFor(() => {
      const durationSelect = screen.getByRole('combobox')
      fireEvent.click(durationSelect)
    })

    const option3 = screen.getByText('3 semanas')
    fireEvent.click(option3)

    expect(screen.getByText('3 semanas')).toBeInTheDocument()
  })

  test('validates date range', async () => {
    global.fetch = mockFetch(mockQConfig)
    
    render(<QConfiguration />)

    await waitFor(() => {
      const startDateInput = screen.getByLabelText('Fecha de Inicio')
      const endDateInput = screen.getByLabelText('Fecha de Fin')

      fireEvent.change(startDateInput, { target: { value: '2024-03-01' } })
      fireEvent.change(endDateInput, { target: { value: '2024-02-01' } })
      fireEvent.blur(endDateInput)
    })

    expect(screen.getByText('La fecha de fin debe ser posterior a la fecha de inicio')).toBeInTheDocument()
  })

  test('calculates end date automatically', async () => {
    global.fetch = mockFetch(mockQConfig)
    
    render(<QConfiguration />)

    await waitFor(() => {
      const startDateInput = screen.getByLabelText('Fecha de Inicio')
      const sprintsSelect = screen.getByRole('combobox')
      const durationSelect = screen.getByRole('combobox')

      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } })
      
      fireEvent.click(sprintsSelect)
      const option4 = screen.getByText('4')
      fireEvent.click(option4)

      fireEvent.click(durationSelect)
      const duration2 = screen.getByText('2 semanas')
      fireEvent.click(duration2)
    })

    // Should calculate end date as start + (4 sprints * 2 weeks) = 8 weeks later
    await waitFor(() => {
      const endDateInput = screen.getByLabelText('Fecha de Fin')
      expect(endDateInput.value).toBe('2024-02-26')
    })
  })

  test('saves configuration successfully', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQConfig)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Configuration saved' })
      })
    
    render(<QConfiguration />)

    await waitFor(() => {
      const saveButton = screen.getByText('Guardar Configuración')
      fireEvent.click(saveButton)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/q-configuration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"quarter":"Q1"')
    })
  })

  test('prevents saving invalid configuration', async () => {
    global.fetch = mockFetch(mockQConfig)
    
    render(<QConfiguration />)

    await waitFor(() => {
      const yearInput = screen.getByLabelText('Año')
      fireEvent.change(yearInput, { target: { value: '' } })
      
      const saveButton = screen.getByText('Guardar Configuración')
      fireEvent.click(saveButton)
    })

    expect(screen.getByText('Por favor, completa todos los campos correctamente')).toBeInTheDocument()
  })

  test('displays configuration preview', async () => {
    global.fetch = mockFetch(mockQConfig)
    
    render(<QConfiguration />)

    await waitFor(() => {
      expect(screen.getByText('Vista Previa de Configuración')).toBeInTheDocument()
      expect(screen.getByText('Trimestre: Q1 2024')).toBeInTheDocument()
      expect(screen.getByText('6 sprints de 2 semanas cada uno')).toBeInTheDocument()
    })
  })

  test('shows sprint dates preview', async () => {
    global.fetch = mockFetch(mockQConfig)
    
    render(<QConfiguration />)

    await waitFor(() => {
      expect(screen.getByText('Cronograma de Sprints')).toBeInTheDocument()
      expect(screen.getByText('Sprint 1')).toBeInTheDocument()
      expect(screen.getByText('Sprint 2')).toBeInTheDocument()
    })
  })

  test('resets form when reset button clicked', async () => {
    global.fetch = mockFetch(mockQConfig)
    
    render(<QConfiguration />)

    await waitFor(() => {
      const yearInput = screen.getByLabelText('Año')
      fireEvent.change(yearInput, { target: { value: '2025' } })
      
      const resetButton = screen.getByText('Restablecer')
      fireEvent.click(resetButton)
    })

    expect(screen.getByDisplayValue('2024')).toBeInTheDocument()
  })

  test('handles API errors gracefully', async () => {
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))

    render(<QConfiguration />)

    await waitFor(() => {
      expect(screen.getByText('Configuración de Q')).toBeInTheDocument()
    })

    // Should show default form even when API fails
    expect(screen.getByLabelText('Año')).toBeInTheDocument()
  })

  test('validates overlapping quarters', async () => {
    const existingConfig = {
      ...mockQConfig,
      startDate: '2024-01-01',
      endDate: '2024-03-31'
    }

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(existingConfig)
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ 
          error: 'Quarter overlaps with existing configuration' 
        })
      })
    
    render(<QConfiguration />)

    await waitFor(() => {
      const startDateInput = screen.getByLabelText('Fecha de Inicio')
      fireEvent.change(startDateInput, { target: { value: '2024-02-01' } })
      
      const saveButton = screen.getByText('Guardar Configuración')
      fireEvent.click(saveButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Error al guardar la configuración')).toBeInTheDocument()
    })
  })

  test('shows active configuration badge', async () => {
    const activeConfig = { ...mockQConfig, isActive: true }
    global.fetch = mockFetch(activeConfig)
    
    render(<QConfiguration />)

    await waitFor(() => {
      expect(screen.getByText('Configuración Activa')).toBeInTheDocument()
    })
  })
})
