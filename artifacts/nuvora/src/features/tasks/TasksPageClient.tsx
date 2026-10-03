'use client';

import { useDeferredValue, useState } from 'react';
import { AlertTriangle, Archive, ArrowDownUp, Eye, Plus, Search } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { getActiveOrganizationId } from '@/lib/api-client-config';
import type { TaskCreate, TaskResponse, TaskStatus, TaskUpdate } from '@/lib/tasks-api';
import { useArchiveTask, useCreateTask, useTasks, useUpdateTask } from './useTasks';
import TaskForm from './TaskForm';
import type { TaskFormValues } from './task-form-schema';

const statuses: Array<{ value: TaskStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'TODO', label: 'To do' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'The task request failed. Try again.';
}

function taskStatusClass(status: TaskStatus): string {
  if (status === 'COMPLETED') return 'success';
  if (status === 'BLOCKED') return 'danger';
  if (status === 'IN_PROGRESS') return 'info';
  if (status === 'CANCELLED') return '';
  return 'warning';
}

function labelStatus(status: TaskStatus): string {
  return statuses.find((option) => option.value === status)?.label ?? status;
}

function toPayload(values: TaskFormValues): Omit<TaskCreate, 'status'> & { status?: TaskStatus } {
  return {
    title: values.title,
    description: values.description.trim() || null,
    category: values.category.trim() || null,
    priority: values.priority,
    due_at: values.due_date ? `${values.due_date}T00:00:00.000Z` : null,
    assignee_user_id: values.assignee_user_id || null,
    site_id: values.site_id || null,
    department_id: values.department_id || null,
    status: values.status,
  };
}

export default function TasksPageClient() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [assigneeId, setAssigneeId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [archiveTask, setArchiveTask] = useState<TaskResponse | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const query = useTasks({
    page,
    page_size: pageSize,
    sort_by: 'updated_at',
    sort_order: sortOrder,
    search: deferredSearch.trim() || undefined,
    status: status ? [status] : undefined,
    priority: priority ? priority as TaskCreate['priority'] : undefined,
    assignee_id: assigneeId.trim() || undefined,
    site_id: siteId.trim() || undefined,
    department_id: departmentId.trim() || undefined,
  });
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const archiveMutation = useArchiveTask();
  const submitting = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setFeedback(null);
    createMutation.reset();
    updateMutation.reset();
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEdit = (task: TaskResponse) => {
    setFeedback(null);
    createMutation.reset();
    updateMutation.reset();
    setEditingTask(task);
    setFormOpen(true);
  };

  const saveTask = async (values: TaskFormValues) => {
    try {
      const payload = toPayload(values);
      if (editingTask) {
        const updatePayload: TaskUpdate = { ...payload, status: values.status };
        await updateMutation.mutateAsync({ taskId: editingTask.id, payload: updatePayload });
        setFeedback({ kind: 'success', message: 'Task updated.' });
      } else {
        const { status: _status, ...createPayload } = payload;
        await createMutation.mutateAsync(createPayload);
        setFeedback({ kind: 'success', message: 'Task created.' });
      }
      setFormOpen(false);
      setEditingTask(null);
    } catch {
      setFeedback({ kind: 'error', message: 'Task could not be saved. Review the fields and try again.' });
    }
  };

  const confirmArchive = async () => {
    if (!archiveTask) return;
    try {
      await archiveMutation.mutateAsync(archiveTask.id);
      setFeedback({ kind: 'success', message: 'Task archived.' });
      setArchiveTask(null);
    } catch {
      setFeedback({ kind: 'error', message: 'Task could not be archived. Try again.' });
    }
  };

  const tasks = query.data?.items ?? [];

  return (
    <main className="page-wrap">
      <div className="page-heading">
        <div>
          <div className="eyebrow">WORKSPACE</div>
          <h1 className="page-title">Tasks</h1>
          <div className="page-subtitle">Shared commitments with a clear owner, deadline and current state.</div>
        </div>
        <div className="heading-actions">
          <button className="btn" onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} data-testid="button-sort-tasks">
            <ArrowDownUp size={14} /> {sortOrder === 'desc' ? 'Recently updated' : 'Oldest updated'}
          </button>
          <button className="btn btn-primary" onClick={openCreate} data-testid="button-create-task">
            <Plus size={15} /> Create task
          </button>
        </div>
      </div>

      {feedback && <div className={`notice ${feedback.kind === 'success' ? 'accent' : ''}`} role={feedback.kind === 'error' ? 'alert' : 'status'} style={{ marginBottom: 14 }}>{feedback.message}</div>}

      <section className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={14} />
            <input className="field" aria-label="Search tasks" placeholder="Search tasks…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} data-testid="input-search-tasks" />
          </div>
          <select className="select" aria-label="Filter tasks by status" value={status} onChange={(event) => { setStatus(event.target.value as TaskStatus | ''); setPage(1); }} data-testid="select-task-status">
            {statuses.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
          <select className="select" aria-label="Filter tasks by priority" value={priority} onChange={(event) => { setPriority(event.target.value); setPage(1); }} data-testid="select-task-priority">
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <details className="task-scope-filters">
            <summary className="btn btn-small">Scope filters</summary>
            <div className="toolbar" style={{ padding: 8 }}>
              <input className="field" aria-label="Filter tasks by assignee ID" placeholder="Assignee ID" value={assigneeId} onChange={(event) => { setAssigneeId(event.target.value); setPage(1); }} />
              <input className="field" aria-label="Filter tasks by site ID" placeholder="Site ID" value={siteId} onChange={(event) => { setSiteId(event.target.value); setPage(1); }} />
              <input className="field" aria-label="Filter tasks by department ID" placeholder="Department ID" value={departmentId} onChange={(event) => { setDepartmentId(event.target.value); setPage(1); }} />
            </div>
          </details>
          <button className="btn btn-small" onClick={() => { setSearch(''); setStatus(''); setPriority(''); setAssigneeId(''); setSiteId(''); setDepartmentId(''); setPage(1); }} data-testid="button-clear-task-filters">
            Clear filters
          </button>
        </div>

        {query.isPending ? (
          <div className="panel-pad" role="status" aria-label="Loading tasks" data-testid="tasks-loading">
            {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} style={{ height: 22, marginBottom: 14 }} />)}
          </div>
        ) : query.isError ? (
          <div className="empty-state" role="alert" data-testid="tasks-error">
            <div className="empty-symbol"><AlertTriangle size={18} /></div>
            <div className="empty-title">Tasks could not be loaded</div>
            <div className="empty-copy">{errorMessage(query.error)}</div>
            <button className="btn btn-primary btn-small" onClick={() => void query.refetch()} disabled={query.isFetching} data-testid="button-retry-tasks">
              {query.isFetching ? 'Retrying…' : 'Retry'}
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state" data-testid="tasks-empty">
            <div className="empty-symbol"><Search size={18} /></div>
            <div className="empty-title">{search || status || priority || assigneeId || siteId || departmentId ? 'No tasks match these filters' : 'No tasks yet'}</div>
            <div className="empty-copy">{search || status || priority || assigneeId || siteId || departmentId ? 'Adjust the filters or search another term.' : 'Create a task to make the next commitment visible.'}</div>
            {!(search || status || priority || assigneeId || siteId || departmentId) && <button className="btn btn-primary btn-small" onClick={openCreate}>Create task</button>}
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Task</th><th>Assignee</th><th>Area</th><th>Due date</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} data-testid={`row-task-${task.id}`}>
                      <td><div className="record-title">{task.title}<div className="record-sub">{task.id}</div></div></td>
                      <td>{task.assignee_display_name ?? 'Unassigned'}</td>
                      <td>{task.category ?? '—'}</td>
                      <td>{task.due_at ? new Date(task.due_at).toISOString().slice(0, 10) : '—'}</td>
                      <td><span className={`pill ${task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'info'}`}>{task.priority.toLowerCase()}</span></td>
                      <td><span className={`pill ${taskStatusClass(task.status)}`}>{labelStatus(task.status)}</span></td>
                      <td><div className="row-actions">
                        <button className="icon-button" title="View task details" aria-label={`View ${task.title}`} onClick={() => setSelectedTask(task)} data-testid={`button-view-task-${task.id}`}><Eye size={14} /></button>
                        <button className="btn btn-small" onClick={() => openEdit(task)} data-testid={`button-edit-task-${task.id}`}>Edit</button>
                        <button className="icon-button" title="Archive task" aria-label={`Archive ${task.title}`} onClick={() => { setFeedback(null); archiveMutation.reset(); setArchiveTask(task); }} data-testid={`button-archive-task-${task.id}`}><Archive size={14} /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>Showing {tasks.length ? (page - 1) * pageSize + 1 : 0}–{(page - 1) * pageSize + tasks.length} of {query.data?.total ?? tasks.length} tasks</span>
              <div className="pagination-actions">
                <button className="icon-button" aria-label="Previous task page" disabled={page <= 1 || query.isFetching} onClick={() => setPage(page - 1)} data-testid="button-prev-tasks">‹</button>
                <span style={{ padding: '5px 6px' }}>{page} / {Math.max(1, Math.ceil((query.data?.total ?? 0) / pageSize))}</span>
                <button className="icon-button" aria-label="Next task page" disabled={page >= Math.ceil((query.data?.total ?? 0) / pageSize) || query.isFetching} onClick={() => setPage(page + 1)} data-testid="button-next-tasks">›</button>
              </div>
            </div>
          </>
        )}
      </section>

      {formOpen && <TaskForm
        task={editingTask ?? undefined}
        submitting={submitting}
        error={createMutation.isError || updateMutation.isError ? errorMessage(createMutation.error ?? updateMutation.error) : null}
        onCancel={() => { if (!submitting) { setFormOpen(false); setEditingTask(null); } }}
        onSubmit={saveTask}
      />}

      {selectedTask && <div className="detail-overlay" onMouseDown={(event) => event.target === event.currentTarget && setSelectedTask(null)}>
        <aside className="detail-drawer" role="dialog" aria-modal="true" aria-labelledby="task-detail-title">
          <div className="drawer-head">
            <div>
              <div className="detail-label">TASK · {selectedTask.id}</div>
              <h2 id="task-detail-title" className="detail-title">{selectedTask.title}</h2>
              <span className={`pill ${taskStatusClass(selectedTask.status)}`}>{labelStatus(selectedTask.status)}</span>
            </div>
            <button className="icon-button" onClick={() => setSelectedTask(null)} aria-label="Close task details">×</button>
          </div>
          <section className="detail-section"><h3>Task details</h3>
            <div className="detail-line"><span>Description</span><span>{selectedTask.description || '—'}</span></div>
            <div className="detail-line"><span>Priority</span><span>{selectedTask.priority.toLowerCase()}</span></div>
            <div className="detail-line"><span>Area</span><span>{selectedTask.category || '—'}</span></div>
            <div className="detail-line"><span>Assignee</span><span>{selectedTask.assignee_display_name || 'Unassigned'}</span></div>
            <div className="detail-line"><span>Due date</span><span>{selectedTask.due_at ? new Date(selectedTask.due_at).toISOString().slice(0, 10) : '—'}</span></div>
            <div className="detail-line"><span>Created by</span><span>{selectedTask.creator_display_name}</span></div>
            <div className="detail-line"><span>Created</span><span>{new Date(selectedTask.created_at).toISOString().slice(0, 10)}</span></div>
            <div className="detail-line"><span>Updated</span><span>{new Date(selectedTask.updated_at).toISOString().slice(0, 10)}</span></div>
          </section>
          <section className="detail-section"><h3>Organization context</h3>
            <div className="detail-line"><span>Organization</span><span>{selectedTask.organization_id}</span></div>
            <div className="detail-line"><span>Site</span><span>{selectedTask.site_id ?? 'Organization-wide'}</span></div>
            <div className="detail-line"><span>Department</span><span>{selectedTask.department_id ?? 'Organization-wide'}</span></div>
          </section>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button className="btn btn-primary" onClick={() => { openEdit(selectedTask); setSelectedTask(null); }}>Edit task</button>
            <button className="btn" onClick={() => setSelectedTask(null)}>Close</button>
          </div>
        </aside>
      </div>}

      <AlertDialog open={archiveTask !== null} onOpenChange={(open) => { if (!open && !archiveMutation.isPending) setArchiveTask(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this task?</AlertDialogTitle>
            <AlertDialogDescription>{archiveTask?.title} will be removed from normal task lists. Its history will be preserved.</AlertDialogDescription>
          </AlertDialogHeader>
          {archiveMutation.isError && <div className="notice" role="alert">{errorMessage(archiveMutation.error)}</div>}
          <AlertDialogFooter>
            <AlertDialogCancel className="btn" disabled={archiveMutation.isPending}>Cancel</AlertDialogCancel>
            <button className="btn btn-danger" onClick={() => void confirmArchive()} disabled={archiveMutation.isPending} aria-busy={archiveMutation.isPending} data-testid="button-confirm-archive-task">
              {archiveMutation.isPending ? 'Archiving…' : 'Archive task'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}