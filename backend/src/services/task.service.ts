import { prisma } from '../config/database';
import { CreateTaskInput, UpdateTaskInput, TaskFilters, PaginatedResponse } from '../types/task.types';
import { Task } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

export class TaskService {
  static async createTask(userId: string, input: CreateTaskInput): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        ...input,
        userId,
      },
    });

    return task;
  }

  static async getTasks(userId: string, filters: TaskFilters): Promise<PaginatedResponse<Task>> {
    const {
      status,
      priority,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getTaskById(userId: string, taskId: string): Promise<Task> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    return task;
  }

  static async updateTask(userId: string, taskId: string, input: UpdateTaskInput): Promise<Task> {
    const task = await this.getTaskById(userId, taskId);

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: input,
    });

    return updatedTask;
  }

  static async deleteTask(userId: string, taskId: string): Promise<void> {
    const task = await this.getTaskById(userId, taskId);

    await prisma.task.delete({
      where: { id: task.id },
    });
  }

  static async toggleTaskStatus(userId: string, taskId: string): Promise<Task> {
    const task = await this.getTaskById(userId, taskId);

    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: { status: newStatus },
    });

    return updatedTask;
  }
}
