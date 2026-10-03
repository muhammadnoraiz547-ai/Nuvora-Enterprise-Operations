import '@/lib/api-client-config';
import {
  archiveTaskApiTasksTaskIdDelete,
  createTaskApiTasksPost,
  listTasksApiTasksGet,
  updateTaskApiTasksTaskIdPatch,
  type ListTasksApiTasksGetParams,
  type TaskCreate,
  type TaskResponse,
  type TaskUpdate,
} from '@workspace/api-client-react';
import { getOrganizationHeaders } from '@/lib/api-client-config';

export type { ListTasksApiTasksGetParams, TaskCreate, TaskResponse, TaskUpdate };
export type TaskStatus = TaskResponse['status'];

export function listTasks(params: ListTasksApiTasksGetParams): Promise<import('@workspace/api-client-react').TaskListResponse> {
  return listTasksApiTasksGet(params, { headers: getOrganizationHeaders() });
}

export function createTask(payload: TaskCreate): Promise<TaskResponse> {
  return createTaskApiTasksPost(payload, { headers: getOrganizationHeaders() });
}

export function updateTask(taskId: string, payload: TaskUpdate): Promise<TaskResponse> {
  return updateTaskApiTasksTaskIdPatch(taskId, payload, { headers: getOrganizationHeaders() });
}

export function archiveTask(taskId: string): Promise<void> {
  return archiveTaskApiTasksTaskIdDelete(taskId, { headers: getOrganizationHeaders() });
}