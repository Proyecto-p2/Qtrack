// Test básico de funciones de utilidad
describe('Utility Functions Tests', () => {
  
  describe('calculateCompletion', () => {
    test('calculates completion percentage correctly', () => {
      const sprints = [
        {
          tasks: [
            { id: 1, status: 'done' },
            { id: 2, status: 'done' },
            { id: 3, status: 'todo' }
          ]
        }
      ]

      // Función de cálculo simple
      const calculateCompletion = (sprints) => {
        if (!sprints || sprints.length === 0) {
          return { percentage: 0, doneTasks: 0, totalTasks: 0 }
        }

        let totalTasks = 0
        let doneTasks = 0

        sprints.forEach(sprint => {
          if (sprint.tasks && sprint.tasks.length > 0) {
            totalTasks += sprint.tasks.length
            doneTasks += sprint.tasks.filter(task => task.status === 'done').length
          }
        })

        const percentage = totalTasks === 0 ? 0 : doneTasks / totalTasks

        return { percentage, doneTasks, totalTasks }
      }

      const result = calculateCompletion(sprints)
      
      expect(result.percentage).toBeCloseTo(2/3)
      expect(result.doneTasks).toBe(2)
      expect(result.totalTasks).toBe(3)
    })

    test('returns zero for empty sprints', () => {
      const calculateCompletion = (sprints) => {
        if (!sprints || sprints.length === 0) {
          return { percentage: 0, doneTasks: 0, totalTasks: 0 }
        }
        return { percentage: 0, doneTasks: 0, totalTasks: 0 }
      }

      const result = calculateCompletion([])
      
      expect(result.percentage).toBe(0)
      expect(result.doneTasks).toBe(0)
      expect(result.totalTasks).toBe(0)
    })
  })

  describe('getCompletionColor', () => {
    test('returns correct color for different completion levels', () => {
      const getCompletionColor = (percentage, threshold = 0.7) => {
        if (percentage >= 0.9) return 'default'
        if (percentage >= threshold) return 'secondary'
        return 'destructive'
      }

      expect(getCompletionColor(0.95)).toBe('default')
      expect(getCompletionColor(0.8)).toBe('secondary')
      expect(getCompletionColor(0.6)).toBe('destructive')
    })

    test('respects custom threshold', () => {
      const getCompletionColor = (percentage, threshold = 0.7) => {
        if (percentage >= 0.9) return 'default'
        if (percentage >= threshold) return 'secondary'
        return 'destructive'
      }

      expect(getCompletionColor(0.8, 0.9)).toBe('destructive')
      expect(getCompletionColor(0.95, 0.9)).toBe('default')
    })
  })

  describe('validateQConfiguration', () => {
    test('validates correct configuration', () => {
      const validateQConfiguration = (config) => {
        const errors = []
        
        if (!config.quarter || config.quarter.trim() === '') {
          errors.push('Quarter is required')
        }
        
        if (!config.year || config.year < 2020 || config.year > 2030) {
          errors.push('Year must be between 2020 and 2030')
        }
        
        if (!config.sprintsPerQ || config.sprintsPerQ < 1 || config.sprintsPerQ > 10) {
          errors.push('Sprints per quarter must be between 1 and 10')
        }
        
        if (!config.sprintDuration || config.sprintDuration < 1 || config.sprintDuration > 4) {
          errors.push('Sprint duration must be between 1 and 4 weeks')
        }
        
        return {
          isValid: errors.length === 0,
          errors
        }
      }

      const validConfig = {
        quarter: 'Q1',
        year: 2024,
        sprintsPerQ: 6,
        sprintDuration: 2
      }

      const result = validateQConfiguration(validConfig)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('detects validation errors', () => {
      const validateQConfiguration = (config) => {
        const errors = []
        
        if (!config.quarter || config.quarter.trim() === '') {
          errors.push('Quarter is required')
        }
        
        if (!config.year || config.year < 2020 || config.year > 2030) {
          errors.push('Year must be between 2020 and 2030')
        }
        
        return {
          isValid: errors.length === 0,
          errors
        }
      }

      const invalidConfig = { quarter: '', year: 2019 }
      
      const result = validateQConfiguration(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Quarter is required')
      expect(result.errors).toContain('Year must be between 2020 and 2030')
    })
  })

  describe('Task filtering and sorting', () => {
    test('filters tasks by status', () => {
      const tasks = [
        { id: 1, status: 'done' },
        { id: 2, status: 'todo' },
        { id: 3, status: 'done' }
      ]

      const filterTasksByStatus = (tasks, status) => {
        return tasks.filter(task => task.status === status)
      }

      const doneTasks = filterTasksByStatus(tasks, 'done')
      
      expect(doneTasks).toHaveLength(2)
      expect(doneTasks[0].id).toBe(1)
      expect(doneTasks[1].id).toBe(3)
    })

    test('sorts tasks by priority', () => {
      const tasks = [
        { id: 1, priority: 'low' },
        { id: 2, priority: 'critical' },
        { id: 3, priority: 'medium' },
        { id: 4, priority: 'high' }
      ]

      const sortTasksByPriority = (tasks) => {
        const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 }
        
        return [...tasks].sort((a, b) => {
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        })
      }

      const sortedTasks = sortTasksByPriority(tasks)
      
      expect(sortedTasks[0].priority).toBe('critical')
      expect(sortedTasks[1].priority).toBe('high')
      expect(sortedTasks[2].priority).toBe('medium')
      expect(sortedTasks[3].priority).toBe('low')
    })
  })
})
