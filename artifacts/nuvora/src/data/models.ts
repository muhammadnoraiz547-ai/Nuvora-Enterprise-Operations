export type Status = 'Active' | 'Pending' | 'In progress' | 'Complete' | 'At risk' | 'Approved' | 'Rejected' | 'Draft' | 'Scheduled' | 'Low stock' | 'Connected' | 'Not connected';
export interface BaseRecord { id: string; organizationId: string; siteId?: string; name: string; status?: Status; updatedAt?: string; }
export interface Organization extends BaseRecord { legalName: string; industry: string; timezone: string; }
export interface Site extends BaseRecord { city: string; region: string; siteLead: string; }
export interface Department extends BaseRecord { head: string; teamCount: number; employeeCount: number; }
export interface Team extends BaseRecord { department: string; lead: string; members: number; }
export interface Employee extends BaseRecord { title: string; department: string; team: string; email: string; location: string; manager: string; startDate: string; }
export interface Task extends BaseRecord { owner: string; dueDate: string; priority: string; category: string; }
export interface Asset extends BaseRecord { category: string; serial: string; assignedTo: string; site: string; lastService: string; }
export interface InventoryItem extends BaseRecord { sku: string; category: string; quantity: number; reorderPoint: number; unit: string; site: string; vendor: string; }
export interface Document extends BaseRecord { category: string; owner: string; updated: string; access: string; }
export interface Approval extends BaseRecord { type: string; requester: string; submitted: string; amount: string; approver: string; }
export interface Vendor extends BaseRecord { contact: string; email: string; category: string; }
export interface Workflow extends BaseRecord { owner: string; steps: number; completion: number; cadence: string; }
export interface KPI extends BaseRecord { value: string; change: string; target: string; trend: number[]; }
export interface AuditEvent extends BaseRecord { actor: string; action: string; target: string; timestamp: string; source: string; }
export interface Insight extends BaseRecord { category: string; summary: string; confidence: string; sourceRecords: string[]; createdAt: string; }
export interface ActivityRecord extends BaseRecord { actor: string; action: string; target: string; time: string; }
export interface ExpenseRecord extends BaseRecord { owner: string; category: string; amount: string; submitted: string; }
export interface AttendanceRecord extends BaseRecord { employee: string; team: string; schedule: string; attendance: string; }
export interface PerformanceRecord extends BaseRecord { employee: string; role: string; team: string; rating: string; checkIn: string; }
export interface ReportRecord extends BaseRecord { category: string; owner: string; period: string; modified: string; }
export interface UserRecord extends BaseRecord { email: string; role: string; lastActive: string; }
export interface RoleRecord extends BaseRecord { users: number; permissions: string; scope: string; }
export interface ModuleRecord extends BaseRecord { description: string; enabled: boolean; }
export interface IntegrationRecord extends BaseRecord { description: string; state: string; }
export interface AppData {
 organization: Organization; sites: Site[]; departments: Department[]; teams: Team[]; employees: Employee[]; tasks: Task[]; assets: Asset[];
 inventory: InventoryItem[]; documents: Document[]; approvals: Approval[]; vendors: Vendor[]; workflows: Workflow[]; kpis: KPI[];
 audit: AuditEvent[]; insights: Insight[]; activity: ActivityRecord[]; expenses: ExpenseRecord[]; attendance: AttendanceRecord[];
 performance: PerformanceRecord[]; reports: ReportRecord[]; users: UserRecord[]; roles: RoleRecord[]; modules: ModuleRecord[]; integrations: IntegrationRecord[];
}
export type CollectionKey = Exclude<keyof AppData, 'organization' | 'sites'>;