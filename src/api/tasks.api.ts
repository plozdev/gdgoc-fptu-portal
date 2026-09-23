import { api } from './client';

export interface QueryTasksParams {
  tenureId?: string;
  departmentCode?: string;
  departmentId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: string;
  deadline: string;
  gemsReward?: number;
  departmentCode?: string;
  departmentId?: string;
  tenureId: string;
  assigneeIds?: string[];
  eventId?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}

export const tasksApi = {
  getTasks: (params?: QueryTasksParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const queryString = query.toString();
    return api.get(`/api/tasks${queryString ? `?${queryString}` : ''}`);
  },

  getTask: (id: string) => api.get(`/api/tasks/${id}`),

  createTask: (dto: CreateTaskDto) => api.post('/api/tasks', dto),

  updateTask: (id: string, dto: UpdateTaskDto) =>
    api.put(`/api/tasks/${id}`, dto),

  updateStatus: (
    id: string,
    dto: { status: string; submissionUrl?: string; feedback?: string },
  ) => api.patch(`/api/tasks/${id}/status`, dto),

  submitTask: (id: string, dto: { submissionUrl: string }) =>
    api.post(`/api/tasks/${id}/submit`, dto),

  approveTask: (id: string, dto?: { feedback?: string }) =>
    api.post(`/api/tasks/${id}/approve`, dto || {}),

  rejectTask: (id: string, dto: { feedback: string }) =>
    api.post(`/api/tasks/${id}/reject`, dto),

  deleteTask: (id: string) => api.delete(`/api/tasks/${id}`),
};
