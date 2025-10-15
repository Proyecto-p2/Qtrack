// Datos de prueba para los tests
export const mockUser = {
  id: '1',
  usuario: 'testuser',
  nombre: 'Test User',
  correo: 'test@example.com',
  rol: 'admin'
}

export const mockCell = {
  id: 1,
  name: 'Test Cell',
  tribeName: 'Test Tribe',
  agileCoachName: 'Test Coach',
  agile_coach_user_id: '1',
  memberCount: 5,
  costPerSprint: 10000,
  status: 'active',
  sprints: []
}

export const mockTribe = {
  id: 1,
  name: 'Test Tribe',
  leadName: 'Test Leader',
  lead_user_id: '1',
  description: 'Test tribe description',
  createdAt: '2023-01-01T00:00:00.000Z'
}

export const mockTask = {
  id: 1,
  name: 'Test Task',
  status: 'todo'
}

export const mockSprint = {
  id: 1,
  cellId: 1,
  name: 'Sprint 1',
  quarter: '2024-Q1',
  startDate: '2024-01-01',
  endDate: '2024-01-14',
  plannedPoints: 20,
  committedPoints: 18,
  deliveredPoints: 15,
  status: 'active',
  tasks: [mockTask]
}

export const mockPersonalTask = {
  id: 1,
  title: 'Personal Task',
  description: 'Test description',
  story_points: 5,
  status: 'todo',
  priority: 'medium',
  sprint_name: 'Sprint 1',
  cell_name: 'Test Cell',
  estimated_hours: 8,
  actual_hours: 6,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

export const mockMetrics = {
  id: 1,
  user_id: '1',
  sprint_name: 'Sprint 1',
  quarter: '2024-Q1',
  cell_name: 'Test Cell',
  tribe_name: 'Test Tribe',
  tasks_assigned: 10,
  tasks_completed: 8,
  tasks_in_progress: 2,
  tasks_todo: 0,
  tasks_blocked: 0,
  story_points_assigned: 50,
  story_points_completed: 40,
  estimated_hours: 80,
  actual_hours: 75,
  completion_rate: 0.8,
  avg_completion_time: 24,
  created_at: '2024-01-01T00:00:00.000Z'
}

export const mockQConfig = {
  id: 1,
  quarter: 'Q1',
  year: 2024,
  sprintsPerQ: 6,
  sprintDuration: 2,
  startDate: '2024-01-01',
  endDate: '2024-03-31',
  isActive: true
}
