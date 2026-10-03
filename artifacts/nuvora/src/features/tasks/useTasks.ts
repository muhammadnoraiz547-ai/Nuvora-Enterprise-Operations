'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListTasksApiTasksGetParams, TaskCreate, TaskUpdate } from '@/lib/tasks-api';
import { archiveTask, createTask, listTasks, updateTask } from '@/lib/tasks-api';
import { getActiveOrganizationId } from '@/lib/api-client-config';

export function useTasks(filters: ListTasksApiTasksGetParams) {
  const organizationId = getActiveOrganizationId();
  return useQuery({
    queryKey: ['tasks', organizationId, filters],
    queryFn: () => listTasks(filters),
    retry: 1,
  });
}

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['tasks', getActiveOrganizationId()] });
}

export function useCreateTask() {
  const invalidateTasks = useInvalidateTasks();
  return useMutation({
    mutationFn: (payload: TaskCreate) => createTask(payload),
    onSuccess: invalidateTasks,
  });
}

export function useUpdateTask() {
  const invalidateTasks = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: TaskUpdate }) => updateTask(taskId, payload),
    onSuccess: invalidateTasks,
  });
}

export function useArchiveTask() {
  const invalidateTasks = useInvalidateTasks();
  return useMutation({
    mutationFn: (taskId: string) => archiveTask(taskId),
    onSuccess: invalidateTasks,
  });
}