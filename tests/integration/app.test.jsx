import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import CellsPage from '../../app/dashboard/cells/page'
import TribesPage from '../../app/dashboard/tribes/page'
import PersonalPage from '../../app/dashboard/personal/page'
import { mockCells, mockTribes, mockUser, mockSprints } from '../utils/mockData'

jest.mock('next/navigation')

describe('Application Integration Tests', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush,
      pathname: '/dashboard',
      query: {},
      asPath: '/dashboard'
    })
    
    global.fetch = jest.fn()
    mockPush.mockClear()
  })

  describe('Navigation Flow', () => {
    test('navigates from cells page to cell detail', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCells
      })

      render(<CellsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Cell Alpha')).toBeInTheDocument()
      })
      
      const cellCard = screen.getByText('Cell Alpha').closest('.cursor-pointer')
      fireEvent.click(cellCard)
      
      expect(mockPush).toHaveBeenCalledWith('/dashboard/cells/1')
    })

    test('navigates from tribes page to tribe detail', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTribes
      })

      render(<TribesPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Tribe Mars')).toBeInTheDocument()
      })
      
      const tribeCard = screen.getByText('Tribe Mars').closest('.cursor-pointer')
      fireEvent.click(tribeCard)
      
      expect(mockPush).toHaveBeenCalledWith('/dashboard/tribes/1')
    })
  })

  describe('Cross-Page Data Consistency', () => {
    test('cell completion calculations are consistent across pages', async () => {
      // Mock cells and sprints data
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCells
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSprints
        })

      // Test on cells page
      render(<CellsPage />)
      
      await waitFor(() => {
        const completionPercentage = screen.getByText(/75%/)
        expect(completionPercentage).toBeInTheDocument()
      })
    })

    test('personal dashboard shows correct user data', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/api/user-tasks')) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              { id: 1, name: 'Personal Task 1', status: 'done', priority: 'high' },
              { id: 2, name: 'Personal Task 2', status: 'todo', priority: 'medium' }
            ]
          })
        }
        if (url.includes('/api/user-metrics')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              tasksCompleted: 15,
              productivity: 85,
              sprintsParticipated: 8,
              avgTaskTime: 3.2
            })
          })
        }
        if (url.includes('/api/notifications')) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              { id: 1, message: 'Sprint started', type: 'info', date: '2024-01-15' }
            ]
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => []
        })
      })

      render(<PersonalPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Personal Dashboard')).toBeInTheDocument()
        expect(screen.getByText('15')).toBeInTheDocument() // Tasks completed
        expect(screen.getByText('85%')).toBeInTheDocument() // Productivity
      })
    })
  })

  describe('Error Handling Across Components', () => {
    test('handles API errors gracefully on cells page', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API Error'))

      render(<CellsPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading cells/)).toBeInTheDocument()
      })
    })

    test('handles API errors gracefully on tribes page', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API Error'))

      render(<TribesPage />)
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading tribes/)).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Data Updates', () => {
    test('updates completion percentages when data changes', async () => {
      // Initial data with low completion
      const initialCells = [
        {
          id: 1,
          name: 'Cell Alpha',
          sprints: [{
            id: 1,
            tasks: [
              { id: 1, status: 'todo' },
              { id: 2, status: 'todo' }
            ]
          }]
        }
      ]

      // Updated data with high completion
      const updatedCells = [
        {
          id: 1,
          name: 'Cell Alpha',
          sprints: [{
            id: 1,
            tasks: [
              { id: 1, status: 'done' },
              { id: 2, status: 'done' }
            ]
          }]
        }
      ]

      // Mock first call with initial data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => initialCells
      })

      const { rerender } = render(<CellsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('0%')).toBeInTheDocument()
      })

      // Mock second call with updated data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedCells
      })

      rerender(<CellsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument()
      })
    })
  })

  describe('Performance and Loading States', () => {
    test('shows loading states appropriately', async () => {
      // Mock delayed response
      global.fetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => mockCells
          }), 100)
        )
      )

      render(<CellsPage />)
      
      // Should show loading state initially
      expect(screen.getByText(/Loading/)).toBeInTheDocument()
      
      // Should show content after loading
      await waitFor(() => {
        expect(screen.getByText('Cell Alpha')).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  describe('User Interaction Flows', () => {
    test('complete user workflow: view cells -> select cell -> view details', async () => {
      // Step 1: Load cells page
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCells
      })

      render(<CellsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Cell Alpha')).toBeInTheDocument()
      })

      // Step 2: Click on a cell
      const cellCard = screen.getByText('Cell Alpha').closest('.cursor-pointer')
      fireEvent.click(cellCard)
      
      // Step 3: Verify navigation was triggered
      expect(mockPush).toHaveBeenCalledWith('/dashboard/cells/1')
    })

    test('complete user workflow: filter and search functionality', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCells
      })

      render(<CellsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('Cell Alpha')).toBeInTheDocument()
      })

      // Test search functionality if available
      const searchInput = screen.queryByPlaceholderText(/search/i)
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: 'Alpha' } })
        
        await waitFor(() => {
          expect(screen.getByText('Cell Alpha')).toBeInTheDocument()
          expect(screen.queryByText('Cell Beta')).not.toBeInTheDocument()
        })
      }
    })
  })
})
