import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Task, PaginatedResponse, TaskFilters, TaskStatus, TaskPriority } from '@/lib/types';
import toast from 'react-hot-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await api.get<{ data: PaginatedResponse<Task> }>(`/tasks?${params}`);
      setTasks(response.data.data.data);
      setPagination(response.data.data.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
  }) => {
    try {
      const response = await api.post<{ data: Task }>('/tasks', taskData);
      toast.success('Task created successfully');
      fetchTasks();
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
      throw error;
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const response = await api.patch<{ data: Task }>(`/tasks/${id}`, taskData);
      toast.success('Task updated successfully');
      fetchTasks();
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update task');
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
      throw error;
    }
  };

  const toggleTaskStatus = async (id: string) => {
    try {
      const response = await api.post<{ data: Task }>(`/tasks/${id}/toggle`);
      toast.success('Task status updated');
      fetchTasks();
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle task status');
      throw error;
    }
  };

  const updateFilters = (newFilters: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const changePage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return {
    tasks,
    loading,
    pagination,
    filters,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    updateFilters,
    changePage,
    refetch: fetchTasks,
  };
};
