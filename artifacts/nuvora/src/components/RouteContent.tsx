'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AppShell from '@/components/AppShell';
import ResourcePage from '@/components/ResourcePage';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/screens/not-found';
import Dashboard from '@/screens/Dashboard';
import { LoginPage, OnboardingPage } from '@/screens/AccessPages';
import { IntelligencePage, InsightsPage, ReportsPage } from '@/screens/Intelligence';
import { ActivityPage, ApprovalsPage, TasksPage } from '@/screens/WorkspacePages';
import {
  AuditPage,
  IntegrationsPage,
  ModulesPage,
  RolesPage,
  UsersPage,
  VerificationPage,
} from '@/screens/GovernanceSettings';
import { OrganizationSettings } from '@/screens/OrganizationSettings';
import AccessControlPage from '@/screens/AccessControlPage';

const pages: Record<string, ReactNode> = {
  '/dashboard': <Dashboard />,
  '/workspace/tasks': <TasksPage />,
  '/workspace/activity': <ActivityPage />,
  '/workspace/approvals': <ApprovalsPage />,
  '/people/employees': <ResourcePage eyebrow="PEOPLE" title="Employees" subtitle="A current directory with clear team and site context." collection="employees" columns={[{ key: 'name', label: 'Employee' }, { key: 'title', label: 'Role' }, { key: 'department', label: 'Department' }, { key: 'team', label: 'Team' }, { key: 'location', label: 'Site' }, { key: 'status', label: 'Status' }]} createLabel="Add employee" fields={['name', 'title', 'department', 'team', 'email', 'location', 'manager', 'startDate']} />,
  '/people/teams': <ResourcePage eyebrow="PEOPLE" title="Teams" subtitle="See how groups are organized across departments." collection="teams" columns={[{ key: 'name', label: 'Team' }, { key: 'department', label: 'Department' }, { key: 'lead', label: 'Team lead' }, { key: 'members', label: 'People' }, { key: 'status', label: 'Status' }]} createLabel="Create team" fields={['name', 'department', 'lead', 'members']} />,
  '/people/departments': <ResourcePage eyebrow="PEOPLE" title="Departments" subtitle="Organization-wide functions and their operating leads." collection="departments" columns={[{ key: 'name', label: 'Department' }, { key: 'head', label: 'Department lead' }, { key: 'teamCount', label: 'Teams' }, { key: 'employeeCount', label: 'People' }, { key: 'status', label: 'Status' }]} createLabel="Add department" fields={['name', 'head', 'teamCount', 'employeeCount']} />,
  '/people/attendance': <ResourcePage eyebrow="PEOPLE" title="Attendance" subtitle="A site-aware view of today’s working arrangements." collection="attendance" columns={[{ key: 'employee', label: 'Employee' }, { key: 'team', label: 'Team' }, { key: 'schedule', label: 'Arrangement' }, { key: 'attendance', label: 'Today' }, { key: 'status', label: 'Record state' }]} createLabel="Add attendance record" fields={['employee', 'team', 'schedule', 'attendance']} />,
  '/people/performance': <ResourcePage eyebrow="PEOPLE" title="Performance" subtitle="Manager check-in cadence and current review notes." collection="performance" columns={[{ key: 'employee', label: 'Employee' }, { key: 'role', label: 'Role' }, { key: 'team', label: 'Team' }, { key: 'rating', label: 'Check-in' }, { key: 'checkIn', label: 'Date' }, { key: 'status', label: 'State' }]} createLabel="Add check-in" fields={['employee', 'role', 'team', 'rating', 'checkIn']} />,
  '/operations/processes': <ResourcePage eyebrow="OPERATIONS" title="Processes" subtitle="Repeatable workflows with an owner and visible progress." collection="workflows" columns={[{ key: 'name', label: 'Workflow' }, { key: 'owner', label: 'Owner' }, { key: 'steps', label: 'Steps' }, { key: 'completion', label: 'Progress %' }, { key: 'cadence', label: 'Cadence' }, { key: 'status', label: 'Status' }]} createLabel="Create process" fields={['name', 'owner', 'steps', 'completion', 'cadence']} />,
  '/operations/inventory': <ResourcePage eyebrow="OPERATIONS" title="Inventory" subtitle="Track shared supplies with reorder thresholds and site context." collection="inventory" columns={[{ key: 'name', label: 'Item' }, { key: 'sku', label: 'SKU' }, { key: 'category', label: 'Category' }, { key: 'quantity', label: 'On hand' }, { key: 'reorderPoint', label: 'Reorder at' }, { key: 'site', label: 'Site' }, { key: 'status', label: 'Status' }]} createLabel="Add inventory item" fields={['name', 'sku', 'category', 'quantity', 'reorderPoint', 'unit', 'site', 'vendor']} />,
  '/operations/assets': <ResourcePage eyebrow="OPERATIONS" title="Assets" subtitle="A shared register of important equipment and workplace systems." collection="assets" columns={[{ key: 'name', label: 'Asset' }, { key: 'category', label: 'Category' }, { key: 'serial', label: 'Reference' }, { key: 'assignedTo', label: 'Assigned to' }, { key: 'site', label: 'Site' }, { key: 'lastService', label: 'Last service' }, { key: 'status', label: 'Status' }]} createLabel="Register asset" fields={['name', 'category', 'serial', 'assignedTo', 'site', 'lastService']} />,
  '/operations/maintenance': <ResourcePage eyebrow="OPERATIONS" title="Maintenance" subtitle="Service status and follow-up for equipment across your sites." collection="assets" columns={[{ key: 'name', label: 'Equipment' }, { key: 'category', label: 'Type' }, { key: 'site', label: 'Site' }, { key: 'lastService', label: 'Last service' }, { key: 'assignedTo', label: 'Owner' }, { key: 'status', label: 'Service state' }]} createLabel="Schedule service" fields={['name', 'category', 'site', 'lastService', 'assignedTo']} />,
  '/management/documents': <ResourcePage eyebrow="MANAGEMENT" title="Documents" subtitle="Shared policies, standards and working references." collection="documents" columns={[{ key: 'name', label: 'Document' }, { key: 'category', label: 'Area' }, { key: 'owner', label: 'Owner' }, { key: 'updated', label: 'Updated' }, { key: 'access', label: 'Access' }, { key: 'status', label: 'Status' }]} createLabel="Add document" fields={['name', 'category', 'owner', 'updated', 'access']} />,
  '/management/expenses': <ResourcePage eyebrow="MANAGEMENT" title="Expenses" subtitle="Expense records and decisions, with transparent demo behavior." collection="expenses" columns={[{ key: 'name', label: 'Expense' }, { key: 'owner', label: 'Submitted by' }, { key: 'category', label: 'Category' }, { key: 'amount', label: 'Amount' }, { key: 'submitted', label: 'Submitted' }, { key: 'status', label: 'Status' }]} createLabel="Add expense" fields={['name', 'owner', 'category', 'amount', 'submitted']} />,
  '/intelligence/ai': <IntelligencePage />,
  '/intelligence/insights': <InsightsPage />,
  '/intelligence/reports': <ReportsPage />,
  '/governance/audit': <AuditPage />,
  '/governance/verification': <VerificationPage />,
  '/governance/access': <AccessControlPage />,
  '/settings/organization': <OrganizationSettings />,
  '/settings/users': <UsersPage />,
  '/settings/roles': <RolesPage />,
  '/settings/modules': <ModulesPage />,
  '/settings/integrations': <IntegrationsPage />,
};

export default function RouteContent({ path }: { path: string }) {
  const pathname = usePathname();
  const content = pages[path];
  const page = path === '/login'
    ? <LoginPage />
    : path === '/onboarding'
      ? <OnboardingPage />
      : content
        ? <AppShell>{content}</AppShell>
        : <NotFound />;

  return <ErrorBoundary resetKey={pathname}>{page}</ErrorBoundary>;
}