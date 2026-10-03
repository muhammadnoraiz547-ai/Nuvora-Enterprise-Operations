import { z } from 'zod';
import type { TaskPriority, TaskStatus } from '@workspace/api-client-react';

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Enter a task title.').max(240, 'Title must be 240 characters or fewer.'),
  description: z.string().max(10000, 'Description must be 10,000 characters or fewer.'),
  category: z.string().max(100, 'Category must be 100 characters or fewer.'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED']),
  due_date: z.string().refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Enter a valid due date.'),
  assignee_user_id: z.string().refine((value) => !value || z.string().uuid().safeParse(value).success, 'Enter a valid user ID.'),
  site_id: z.string().refine((value) => !value || z.string().uuid().safeParse(value).success, 'Enter a valid site ID.'),
  department_id: z.string().refine((value) => !value || z.string().uuid().safeParse(value).success, 'Enter a valid department ID.'),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type { TaskPriority, TaskStatus };