const {
  calculateCompletion,
  getCompletionColor,
  calculateSprintMetrics,
  formatDateRange,
  validateQConfiguration,
  filterTasksByStatus,
  filterTasksByPriority,
  sortTasksByPriority
} = require('../utils/testHelpers')
const { mockSprint, mockTask, mockQConfig } = require('../utils/mockData')

describe('Utility Functions', () => {
  describe('calculateCompletion', () => {
    test('calculates completion percentage correctly', () => {
      const sprints = [
        {
          ...mockSprint,
          tasks: [
            { id: 1, name: 'Task 1', status: 'done' },
            { id: 2, name: 'Task 2', status: 'done' },
            { id: 3, name: 'Task 3', status: 'todo' }
          ]
        }
      ]

      const result = calculateCompletion(sprints)
      
      expect(result.percentage).toBe(2/3)
      expect(result.doneTasks).toBe(2)
      expect(result.totalTasks).toBe(3)
    })

    test('returns zero for empty sprints', () => {
      const result = calculateCompletion([])
      
      expect(result.percentage).toBe(0)
      expect(result.doneTasks).toBe(0)
      expect(result.totalTasks).toBe(0)
    })

    test('handles sprints without tasks', () => {
      const sprints = [{ ...mockSprint, tasks: [] }]
      
      const result = calculateCompletion(sprints)
      
      expect(result.percentage).toBe(0)
      expect(result.doneTasks).toBe(0)
      expect(result.totalTasks).toBe(0)
    })
  })

  describe('getCompletionColor', () => {
    test('returns correct color for excellent completion', () => {
      expect(getCompletionColor(0.95)).toBe('default')
      expect(getCompletionColor(0.9)).toBe('default')
    })

    test('returns correct color for good completion', () => {
      expect(getCompletionColor(0.8)).toBe('secondary')
      expect(getCompletionColor(0.7)).toBe('secondary')
    })

    test('returns correct color for poor completion', () => {
      expect(getCompletionColor(0.6)).toBe('destructive')
      expect(getCompletionColor(0.3)).toBe('destructive')
    })

    test('respects custom threshold', () => {
      expect(getCompletionColor(0.8, 0.9)).toBe('destructive')
      expect(getCompletionColor(0.95, 0.9)).toBe('default')
    })
  })

  describe('calculateSprintMetrics', () => {
    test('calculates sprint metrics correctly', () => {
      const sprint = {
        ...mockSprint,
        tasks: [
          { id: 1, name: 'Task 1', status: 'done' },
          { id: 2, name: 'Task 2', status: 'todo' }
        ],
        plannedPoints: 20,
        deliveredPoints: 15
      }

      const result = calculateSprintMetrics(sprint)
      
      expect(result.completion).toBe(0.5)
      expect(result.velocity).toBe(15)
      expect(result.burndown).toBe(5)
    })

    test('handles sprint without tasks', () => {
      const sprint = { ...mockSprint, tasks: [] }
      
      const result = calculateSprintMetrics(sprint)
      
      expect(result.completion).toBe(0)
      expect(result.velocity).toBe(0)
      expect(result.burndown).toBe(0)
    })
  })

  describe('formatDateRange', () => {
    test('formats date range correctly', () => {
      const start = '2024-01-01'
      const end = '2024-01-14'
      
      const result = formatDateRange(start, end)
      
      expect(result).toMatch(/1\/1\/2024 - 1\/14\/2024/)
    })

    test('handles different date formats', () => {
      const start = '2024-12-25'
      const end = '2024-12-31'
      
      const result = formatDateRange(start, end)
      
      expect(result).toMatch(/12\/25\/2024 - 12\/31\/2024/)
    })
  })

  describe('validateQConfiguration', () => {
    test('validates correct configuration', () => {
      const result = validateQConfiguration(mockQConfig)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('detects missing quarter', () => {
      const config = { ...mockQConfig, quarter: '' }
      
      const result = validateQConfiguration(config)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Quarter is required')
    })

    test('detects invalid year', () => {
      const config = { ...mockQConfig, year: 2019 }
      
      const result = validateQConfiguration(config)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Year must be between 2020 and 2030')
    })

    test('detects invalid sprints per quarter', () => {
      const config = { ...mockQConfig, sprintsPerQ: 0 }
      
      const result = validateQConfiguration(config)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Sprints per quarter must be between 1 and 10')
    })

    test('detects invalid sprint duration', () => {
      const config = { ...mockQConfig, sprintDuration: 5 }
      
      const result = validateQConfiguration(config)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Sprint duration must be between 1 and 4 weeks')
    })

    test('detects invalid date range', () => {
      const config = {
        ...mockQConfig,
        startDate: '2024-03-01',
        endDate: '2024-02-01'
      }
      
      const result = validateQConfiguration(config)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('End date must be after start date')
    })
  })

  describe('filterTasksByStatus', () => {
    const tasks = [
      { id: 1, name: 'Task 1', status: 'done' },
      { id: 2, name: 'Task 2', status: 'todo' },
      { id: 3, name: 'Task 3', status: 'done' },
      { id: 4, name: 'Task 4', status: 'in_progress' }
    ]

    test('filters tasks by done status', () => {
      const result = filterTasksByStatus(tasks, 'done')
      
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(3)
    })

    test('filters tasks by todo status', () => {
      const result = filterTasksByStatus(tasks, 'todo')
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(2)
    })

    test('returns empty array for non-existent status', () => {
      const result = filterTasksByStatus(tasks, 'blocked')
      
      expect(result).toHaveLength(0)
    })
  })

  describe('filterTasksByPriority', () => {
    const tasks = [
      { id: 1, name: 'Task 1', priority: 'critical' },
      { id: 2, name: 'Task 2', priority: 'high' },
      { id: 3, name: 'Task 3', priority: 'medium' },
      { id: 4, name: 'Task 4', priority: 'low' }
    ]

    test('filters tasks by critical priority', () => {
      const result = filterTasksByPriority(tasks, 'critical')
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    test('filters tasks by medium priority', () => {
      const result = filterTasksByPriority(tasks, 'medium')
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(3)
    })
  })

  describe('sortTasksByPriority', () => {
    const tasks = [
      { id: 1, name: 'Task 1', priority: 'low' },
      { id: 2, name: 'Task 2', priority: 'critical' },
      { id: 3, name: 'Task 3', priority: 'medium' },
      { id: 4, name: 'Task 4', priority: 'high' }
    ]

    test('sorts tasks by priority correctly', () => {
      const result = sortTasksByPriority(tasks)
      
      expect(result[0].priority).toBe('critical')
      expect(result[1].priority).toBe('high')
      expect(result[2].priority).toBe('medium')
      expect(result[3].priority).toBe('low')
    })

    test('does not mutate original array', () => {
      const originalOrder = [...tasks]
      sortTasksByPriority(tasks)
      
      expect(tasks).toEqual(originalOrder)
    })
  })
})
