'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { TaskResponse } from '@/lib/tasks-api';
import { taskFormSchema, type TaskFormValues } from './task-form-schema';

interface TaskFormProps {
  task?: TaskResponse;
  submitting: boolean;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

const statuses = [
  ['TODO', 'To do'],
  ['IN_PROGRESS', 'In progress'],
  ['BLOCKED', 'Blocked'],
  ['COMPLETED', 'Completed'],
  ['CANCELLED', 'Cancelled'],
] as const;

export default function TaskForm({ task, submitting, error, onCancel, onSubmit }: TaskFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      category: task?.category ?? '',
      priority: task?.priority ?? 'MEDIUM',
      status: task?.status ?? 'TODO',
      due_date: task?.due_at?.slice(0, 10) ?? '',
      assignee_user_id: task?.assignee_user_id ?? '',
      site_id: task?.site_id ?? '',
      department_id: task?.department_id ?? '',
    },
  });

  return (
    <div className="detail-overlay" onMouseDown={(event) => event.target === event.currentTarget && !submitting && onCancel()}>
      <section
        className="detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        style={{ width: 'min(520px,100%)' }}
      >
        <div className="drawer-head">
          <div>
            <div className="detail-label">{task ? 'EDIT TASK' : 'NEW TASK'}</div>
            <h2 id="task-form-title" className="detail-title">{task ? 'Update task' : 'Create task'}</h2>
          </div>
          <button className="icon-button" onClick={onCancel} disabled={submitting} aria-label="Close task form">×</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-grid">
            <div className="form-field full">
              <label htmlFor="task-title">Title</label>
              <input id="task-title" className="field" maxLength={240} {...register('title')} aria-invalid={Boolean(errors.title)} />
              {errors.title && <span className="row-meta" role="alert">{errors.title.message}</span>}
            </div>
            <div className="form-field full">
              <label htmlFor="task-description">Description</label>
              <textarea id="task-description" className="field" {...register('description')} aria-invalid={Boolean(errors.description)} />
              {errors.description && <span className="row-meta" role="alert">{errors.description.message}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="task-category">Area</label>
              <input id="task-category" className="field" {...register('category')} aria-invalid={Boolean(errors.category)} />
              {errors.category && <span className="row-meta" role="alert">{errors.category.message}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" className="select" {...register('priority')}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="task-due-date">Due date</label>
              <input id="task-due-date" type="date" className="field" {...register('due_date')} aria-invalid={Boolean(errors.due_date)} />
              {errors.due_date && <span className="row-meta" role="alert">{errors.due_date.message}</span>}
            </div>
            {task && (
              <div className="form-field">
                <label htmlFor="task-status">Status</label>
                <select id="task-status" className="select" {...register('status')}>
                  {statuses.filter(([value]) => value === task.status || task.allowed_status_transitions.includes(value)).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
              </div>
            )}
            <div className="form-field full">
              <label htmlFor="task-assignee">Assignee user ID</label>
              <input id="task-assignee" className="field" {...register('assignee_user_id')} aria-invalid={Boolean(errors.assignee_user_id)} />
              {errors.assignee_user_id && <span className="row-meta" role="alert">{errors.assignee_user_id.message}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="task-site">Site ID</label>
              <input id="task-site" className="field" {...register('site_id')} aria-invalid={Boolean(errors.site_id)} />
              {errors.site_id && <span className="row-meta" role="alert">{errors.site_id.message}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="task-department">Department ID</label>
              <input id="task-department" className="field" {...register('department_id')} aria-invalid={Boolean(errors.department_id)} />
              {errors.department_id && <span className="row-meta" role="alert">{errors.department_id.message}</span>}
            </div>
          </div>
          {error && <div className="notice" role="alert" style={{ marginTop: 14 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
            <button type="button" className="btn" onClick={onCancel} disabled={submitting}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={submitting} aria-busy={submitting}>
              {submitting ? 'Saving…' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
          <div className="panel-caption" style={{ marginTop: 14 }}>Changes are saved to the organization workspace.</div>
        </form>
      </section>
    </div>
  );
}