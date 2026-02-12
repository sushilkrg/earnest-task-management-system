import { Request, Response } from "express";
import { TaskService } from "../services/task.service";
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from "../types/task.types";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export class TaskController {
  static createTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const input: CreateTaskInput = req.body;

    const task = await TaskService.createTask(userId, input);

    res
      .status(201)
      .json(ApiResponse.created(task, "Task created successfully"));
  });

  static getTasks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    // req.query values are strings; coerce them safely
    const { page, limit, status, priority, search, sortBy, sortOrder } =
      req.query as any;

    const filters: TaskFilters = {
      status,
      priority,
      search,
      sortBy,
      sortOrder,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };

    const result = await TaskService.getTasks(userId, filters);

    res.status(200).json(ApiResponse.success(result));
  });

  static updateTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    // Narrow id to string
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const input: UpdateTaskInput = req.body;

    const task = await TaskService.updateTask(userId, id, input);

    res
      .status(200)
      .json(ApiResponse.success(task, "Task updated successfully"));
  });

  static deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    // Narrow id to string
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    await TaskService.deleteTask(userId, id);

    res
      .status(200)
      .json(ApiResponse.success(null, "Task deleted successfully"));
  });

  static getTaskById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const task = await TaskService.getTaskById(userId, id);

    res.status(200).json(ApiResponse.success(task));
  });

  static toggleTaskStatus = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user!.id;

      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;

      const task = await TaskService.toggleTaskStatus(userId, id);

      res
        .status(200)
        .json(ApiResponse.success(task, "Task status toggled successfully"));
    },
  );
}
