import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import AppShell from './components/AppShell';
import ResourcePage from './components/ResourcePage';
import { DataProvider } from './data/context';
import Dashboard from './pages/Dashboard';
import { LoginPage, OnboardingPage } from './pages/AccessPages';
import { IntelligencePage, InsightsPage, ReportsPage } from './pages/Intelligence';
import { ActivityPage, ApprovalsPage, TasksPage } from './pages/WorkspacePages';
import { AuditPage, IntegrationsPage, ModulesPage, OrganizationSettings, RolesPage, UsersPage, VerificationPage } from './pages/GovernanceSettings';

const queryClient=new QueryClient();
function WithShell({children}:{children:ReactNode}){return <AppShell>{children}</AppShell>}
const DashboardRoute=()=> <WithShell><Dashboard/></WithShell>;
const TasksRoute=()=> <WithShell><TasksPage/></WithShell>;
const ActivityRoute=()=> <WithShell><ActivityPage/></WithShell>;
const ApprovalsRoute=()=> <WithShell><ApprovalsPage/></WithShell>;
const EmployeesRoute=()=> <WithShell><ResourcePage eyebrow="PEOPLE" title="Employees" subtitle="A current directory with clear team and site context." collection="employees" columns={[{key:'name',label:'Employee'},{key:'title',label:'Role'},{key:'department',label:'Department'},{key:'team',label:'Team'},{key:'location',label:'Site'},{key:'status',label:'Status'}]} createLabel="Add employee" fields={['name','title','department','team','email','location','manager','startDate']}/></WithShell>;
const TeamsRoute=()=> <WithShell><ResourcePage eyebrow="PEOPLE" title="Teams" subtitle="See how groups are organized across departments." collection="teams" columns={[{key:'name',label:'Team'},{key:'department',label:'Department'},{key:'lead',label:'Team lead'},{key:'members',label:'People'},{key:'status',label:'Status'}]} createLabel="Create team" fields={['name','department','lead','members']}/></WithShell>;
const DepartmentsRoute=()=> <WithShell><ResourcePage eyebrow="PEOPLE" title="Departments" subtitle="Organization-wide functions and their operating leads." collection="departments" columns={[{key:'name',label:'Department'},{key:'head',label:'Department lead'},{key:'teamCount',label:'Teams'},{key:'employeeCount',label:'People'},{key:'status',label:'Status'}]} createLabel="Add department" fields={['name','head','teamCount','employeeCount']}/></WithShell>;
const AttendanceRoute=()=> <WithShell><ResourcePage eyebrow="PEOPLE" title="Attendance" subtitle="A site-aware view of today’s working arrangements." collection="attendance" columns={[{key:'employee',label:'Employee'},{key:'team',label:'Team'},{key:'schedule',label:'Arrangement'},{key:'attendance',label:'Today'},{key:'status',label:'Record state'}]} createLabel="Add attendance record" fields={['employee','team','schedule','attendance']}/></WithShell>;
const PerformanceRoute=()=> <WithShell><ResourcePage eyebrow="PEOPLE" title="Performance" subtitle="Manager check-in cadence and current review notes." collection="performance" columns={[{key:'employee',label:'Employee'},{key:'role',label:'Role'},{key:'team',label:'Team'},{key:'rating',label:'Check-in'},{key:'checkIn',label:'Date'},{key:'status',label:'State'}]} createLabel="Add check-in" fields={['employee','role','team','rating','checkIn']}/></WithShell>;
const ProcessesRoute=()=> <WithShell><ResourcePage eyebrow="OPERATIONS" title="Processes" subtitle="Repeatable workflows with an owner and visible progress." collection="workflows" columns={[{key:'name',label:'Workflow'},{key:'owner',label:'Owner'},{key:'steps',label:'Steps'},{key:'completion',label:'Progress %'},{key:'cadence',label:'Cadence'},{key:'status',label:'Status'}]} createLabel="Create process" fields={['name','owner','steps','completion','cadence']}/></WithShell>;
const InventoryRoute=()=> <WithShell><ResourcePage eyebrow="OPERATIONS" title="Inventory" subtitle="Track shared supplies with reorder thresholds and site context." collection="inventory" columns={[{key:'name',label:'Item'},{key:'sku',label:'SKU'},{key:'category',label:'Category'},{key:'quantity',label:'On hand'},{key:'reorderPoint',label:'Reorder at'},{key:'site',label:'Site'},{key:'status',label:'Status'}]} createLabel="Add inventory item" fields={['name','sku','category','quantity','reorderPoint','unit','site','vendor']}/></WithShell>;
const AssetsRoute=()=> <WithShell><ResourcePage eyebrow="OPERATIONS" title="Assets" subtitle="A shared register of important equipment and workplace systems." collection="assets" columns={[{key:'name',label:'Asset'},{key:'category',label:'Category'},{key:'serial',label:'Reference'},{key:'assignedTo',label:'Assigned to'},{key:'site',label:'Site'},{key:'lastService',label:'Last service'},{key:'status',label:'Status'}]} createLabel="Register asset" fields={['name','category','serial','assignedTo','site','lastService']}/></WithShell>;
const MaintenanceRoute=()=> <WithShell><ResourcePage eyebrow="OPERATIONS" title="Maintenance" subtitle="Service status and follow-up for equipment across your sites." collection="assets" columns={[{key:'name',label:'Equipment'},{key:'category',label:'Type'},{key:'site',label:'Site'},{key:'lastService',label:'Last service'},{key:'assignedTo',label:'Owner'},{key:'status',label:'Service state'}]} createLabel="Schedule service" fields={['name','category','site','lastService','assignedTo']}/></WithShell>;
const DocumentsRoute=()=> <WithShell><ResourcePage eyebrow="MANAGEMENT" title="Documents" subtitle="Shared policies, standards and working references." collection="documents" columns={[{key:'name',label:'Document'},{key:'category',label:'Area'},{key:'owner',label:'Owner'},{key:'updated',label:'Updated'},{key:'access',label:'Access'},{key:'status',label:'Status'}]} createLabel="Add document" fields={['name','category','owner','updated','access']}/></WithShell>;
const ExpensesRoute=()=> <WithShell><ResourcePage eyebrow="MANAGEMENT" title="Expenses" subtitle="Expense records and decisions, with transparent demo behavior." collection="expenses" columns={[{key:'name',label:'Expense'},{key:'owner',label:'Submitted by'},{key:'category',label:'Category'},{key:'amount',label:'Amount'},{key:'submitted',label:'Submitted'},{key:'status',label:'Status'}]} createLabel="Add expense" fields={['name','owner','category','amount','submitted']}/></WithShell>;
const IntelligenceRoute=()=> <WithShell><IntelligencePage/></WithShell>;
const InsightsRoute=()=> <WithShell><InsightsPage/></WithShell>;
const ReportsRoute=()=> <WithShell><ReportsPage/></WithShell>;
const AuditRoute=()=> <WithShell><AuditPage/></WithShell>;
const VerificationRoute=()=> <WithShell><VerificationPage/></WithShell>;
const OrganizationRoute=()=> <WithShell><OrganizationSettings/></WithShell>;
const UsersRoute=()=> <WithShell><UsersPage/></WithShell>;
const RolesRoute=()=> <WithShell><RolesPage/></WithShell>;
const ModulesRoute=()=> <WithShell><ModulesPage/></WithShell>;
const IntegrationsRoute=()=> <WithShell><IntegrationsPage/></WithShell>;
function Router(){
 const [location,setLocation]=useLocation();
 useEffect(()=>{if(location==='/')setLocation('/dashboard')},[location,setLocation]);
 return <ErrorBoundary resetKey={location}><Switch>
  <Route path="/login" component={LoginPage}/>
  <Route path="/onboarding" component={OnboardingPage}/>
  <Route path="/dashboard" component={DashboardRoute}/>
  <Route path="/workspace/tasks" component={TasksRoute}/>
  <Route path="/workspace/activity" component={ActivityRoute}/>
  <Route path="/workspace/approvals" component={ApprovalsRoute}/>
  <Route path="/people/employees" component={EmployeesRoute}/>
  <Route path="/people/teams" component={TeamsRoute}/>
  <Route path="/people/departments" component={DepartmentsRoute}/>
  <Route path="/people/attendance" component={AttendanceRoute}/>
  <Route path="/people/performance" component={PerformanceRoute}/>
  <Route path="/operations/processes" component={ProcessesRoute}/>
  <Route path="/operations/inventory" component={InventoryRoute}/>
  <Route path="/operations/assets" component={AssetsRoute}/>
  <Route path="/operations/maintenance" component={MaintenanceRoute}/>
  <Route path="/management/documents" component={DocumentsRoute}/>
  <Route path="/management/expenses" component={ExpensesRoute}/>
  <Route path="/intelligence/ai" component={IntelligenceRoute}/>
  <Route path="/intelligence/insights" component={InsightsRoute}/>
  <Route path="/intelligence/reports" component={ReportsRoute}/>
  <Route path="/governance/audit" component={AuditRoute}/>
  <Route path="/governance/verification" component={VerificationRoute}/>
  <Route path="/settings/organization" component={OrganizationRoute}/>
  <Route path="/settings/users" component={UsersRoute}/>
  <Route path="/settings/roles" component={RolesRoute}/>
  <Route path="/settings/modules" component={ModulesRoute}/>
  <Route path="/settings/integrations" component={IntegrationsRoute}/>
  <Route component={NotFound}/>
 </Switch></ErrorBoundary>;
}
function App(){
 return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><DataProvider><Router/></DataProvider></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>;
}
export default App;