// Utilidades helper para los tests
export const mockFetch = (data, status = 200) => {
  return jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    })
  )
}

export const mockFetchError = (error = 'Network error') => {
  return jest.fn(() => Promise.reject(new Error(error)))
}

export const createMockComponent = (displayName) => {
  const MockComponent = (props) => {
    return React.createElement('div', {
      'data-testid': displayName,
      ...props
    })
  }
  MockComponent.displayName = displayName
  return MockComponent
}

export const waitForAsync = async () => {
  await new Promise(resolve => setTimeout(resolve, 0))
}

export const setupMockDate = (dateString = '2024-01-01T00:00:00.000Z') => {
  const mockDate = new Date(dateString)
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate)
  return mockDate
}

export const cleanupMockDate = () => {
  global.Date.mockRestore?.()
}

// Funciones de cálculo que se testean
export const calculateCompletion = (sprints) => {
  if (!sprints || sprints.length === 0) {
    return { percentage: 0, doneTasks: 0, totalTasks: 0 }
  }

  let totalTasks = 0
  let doneTasks = 0
  
  sprints.forEach(sprint => {
    if (sprint.tasks) {
      totalTasks += sprint.tasks.length
      doneTasks += sprint.tasks.filter(task => task.status === 'done').length
    }
  })

  return {
    percentage: totalTasks > 0 ? doneTasks / totalTasks : 0,
    doneTasks,
    totalTasks
  }
}

export const getCompletionColor = (completion, threshold = 0.7) => {
  if (completion >= 0.9) return 'default'
  if (completion >= threshold) return 'secondary'
  return 'destructive'
}

export const calculateSprintMetrics = (sprint) => {
  if (!sprint.tasks) return { completion: 0, velocity: 0, burndown: 0 }
  
  const totalTasks = sprint.tasks.length
  const doneTasks = sprint.tasks.filter(task => task.status === 'done').length
  const completion = totalTasks > 0 ? doneTasks / totalTasks : 0
  
  return {
    completion,
    velocity: sprint.deliveredPoints || 0,
    burndown: (sprint.plannedPoints || 0) - (sprint.deliveredPoints || 0)
  }
}

export const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString()
  const end = new Date(endDate).toLocaleDateString()
  return `${start} - ${end}`
}

export const validateQConfiguration = (config) => {
  const errors = []
  
  if (!config.quarter) errors.push('Quarter is required')
  if (!config.year || config.year < 2020 || config.year > 2030) {
    errors.push('Year must be between 2020 and 2030')
  }
  if (!config.sprintsPerQ || config.sprintsPerQ < 1 || config.sprintsPerQ > 10) {
    errors.push('Sprints per quarter must be between 1 and 10')
  }
  if (!config.sprintDuration || config.sprintDuration < 1 || config.sprintDuration > 4) {
    errors.push('Sprint duration must be between 1 and 4 weeks')
  }
  if (!config.startDate) errors.push('Start date is required')
  if (!config.endDate) errors.push('End date is required')
  
  if (config.startDate && config.endDate) {
    const start = new Date(config.startDate)
    const end = new Date(config.endDate)
    if (start >= end) {
      errors.push('End date must be after start date')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Funciones de filtrado
export const filterTasksByStatus = (tasks, status) => {
  return tasks.filter(task => task.status === status)
}

export const filterTasksByPriority = (tasks, priority) => {
  return tasks.filter(task => task.priority === priority)
}

export const sortTasksByPriority = (tasks) => {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}
