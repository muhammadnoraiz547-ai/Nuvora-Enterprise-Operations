import type { AppData, CollectionKey, BaseRecord } from './models';

const storageKey = 'operations-flow-demo-v1';
const org = { id:'org-operations-flow', organizationId:'org-operations-flow', name:'Northstar Collective', legalName:'Northstar Collective Group', industry:'Professional services', timezone:'America/Chicago', status:'Active' as const };
const sites = [
 {id:'site-chi',organizationId:org.id,name:'Chicago Office',city:'Chicago',region:'Illinois',siteLead:'Mara Ellison',status:'Active' as const},
 {id:'site-den',organizationId:org.id,name:'Denver Studio',city:'Denver',region:'Colorado',siteLead:'Jonah Patel',status:'Active' as const},
 {id:'site-bos',organizationId:org.id,name:'Boston Hub',city:'Boston',region:'Massachusetts',siteLead:'Avery Chen',status:'Active' as const}
];
const seeded: AppData = {
 organization:org, sites,
 departments:[
  {id:'dep-ops',organizationId:org.id,name:'Operations',head:'Mara Ellison',teamCount:3,employeeCount:34,status:'Active'},
  {id:'dep-people',organizationId:org.id,name:'People & Culture',head:'Avery Chen',teamCount:2,employeeCount:18,status:'Active'},
  {id:'dep-fin',organizationId:org.id,name:'Finance',head:'Elliot Brooks',teamCount:2,employeeCount:12,status:'Active'},
  {id:'dep-strat',organizationId:org.id,name:'Strategy & Research',head:'Jonah Patel',teamCount:3,employeeCount:26,status:'Active'}
 ],
 teams:[
  {id:'team-fac',organizationId:org.id,name:'Workplace Experience',department:'Operations',lead:'Mara Ellison',members:12,status:'Active'},
  {id:'team-proc',organizationId:org.id,name:'Business Operations',department:'Operations',lead:'Luis Moreno',members:10,status:'Active'},
  {id:'team-people',organizationId:org.id,name:'People Operations',department:'People & Culture',lead:'Avery Chen',members:9,status:'Active'},
  {id:'team-research',organizationId:org.id,name:'Research',department:'Strategy & Research',lead:'Jonah Patel',members:14,status:'Active'},
  {id:'team-fin',organizationId:org.id,name:'Finance & Planning',department:'Finance',lead:'Elliot Brooks',members:8,status:'Active'}
 ],
 employees:[
  ['emp-01','Mara Ellison','Director, Operations','Operations','Workplace Experience','mara.ellison@northstar.co','Chicago Office','Elliot Brooks','2021-04-12'],
  ['emp-02','Avery Chen','People Partner','People & Culture','People Operations','avery.chen@northstar.co','Boston Hub','Alex Morgan','2022-06-20'],
  ['emp-03','Jonah Patel','Research Lead','Strategy & Research','Research','jonah.patel@northstar.co','Denver Studio','Alex Morgan','2020-10-05'],
  ['emp-04','Luis Moreno','Operations Manager','Operations','Business Operations','luis.moreno@northstar.co','Chicago Office','Mara Ellison','2023-02-13'],
  ['emp-05','Elliot Brooks','Finance Director','Finance','Finance & Planning','elliot.brooks@northstar.co','Chicago Office','Alex Morgan','2019-09-16'],
  ['emp-06','Alex Morgan','Chief Operating Officer','Executive','Leadership','alex.morgan@northstar.co','Chicago Office','—','2018-01-08'],
  ['emp-07','Priya Nair','Workplace Coordinator','Operations','Workplace Experience','priya.nair@northstar.co','Denver Studio','Mara Ellison','2023-11-06'],
  ['emp-08','Theo Martin','Senior Analyst','Strategy & Research','Research','theo.martin@northstar.co','Boston Hub','Jonah Patel','2022-03-21'],
  ['emp-09','Grace Kim','People Operations Specialist','People & Culture','People Operations','grace.kim@northstar.co','Chicago Office','Avery Chen','2024-01-15'],
  ['emp-10','Owen Foster','Financial Analyst','Finance','Finance & Planning','owen.foster@northstar.co','Denver Studio','Elliot Brooks','2023-06-12'],
  ['emp-11','Nadia Williams','Research Associate','Strategy & Research','Research','nadia.williams@northstar.co','Boston Hub','Jonah Patel','2024-02-26'],
  ['emp-12','Caleb Rivera','Facilities Specialist','Operations','Workplace Experience','caleb.rivera@northstar.co','Chicago Office','Mara Ellison','2021-12-01']
 ].map(([id,name,title,department,team,email,location,manager,startDate],i)=>({id,organizationId:org.id,siteId:sites[i%3].id,name,title,department,team,email,location,manager,startDate,status:'Active' as const})),
 tasks:[
  {id:'task-01',organizationId:org.id,name:'Review Q3 operating plan',owner:'Alex Morgan',dueDate:'2025-03-18',priority:'High',category:'Planning',status:'In progress'},
  {id:'task-02',organizationId:org.id,name:'Confirm Denver access schedule',owner:'Priya Nair',dueDate:'2025-03-19',priority:'Medium',category:'Workplace',status:'Pending'},
  {id:'task-03',organizationId:org.id,name:'Publish manager check-in guide',owner:'Avery Chen',dueDate:'2025-03-20',priority:'Medium',category:'People',status:'In progress'},
  {id:'task-04',organizationId:org.id,name:'Renew research data agreement',owner:'Jonah Patel',dueDate:'2025-03-21',priority:'High',category:'Governance',status:'At risk'},
  {id:'task-05',organizationId:org.id,name:'Reconcile February travel spend',owner:'Owen Foster',dueDate:'2025-03-24',priority:'Low',category:'Finance',status:'Complete'},
  {id:'task-06',organizationId:org.id,name:'Prepare Boston quarterly review',owner:'Theo Martin',dueDate:'2025-03-25',priority:'Medium',category:'Planning',status:'Pending'},
  {id:'task-07',organizationId:org.id,name:'Update vendor insurance files',owner:'Luis Moreno',dueDate:'2025-03-27',priority:'High',category:'Operations',status:'Pending'}
 ],
 assets:[
  {id:'ast-101',organizationId:org.id,siteId:'site-chi',name:'Conference room display · Cedar',category:'AV equipment',serial:'NS-AV-1048',assignedTo:'Workplace Experience',site:'Chicago Office',lastService:'2025-01-12',status:'Active'},
  {id:'ast-102',organizationId:org.id,siteId:'site-den',name:'Access control panel · West',category:'Building systems',serial:'NS-AC-2210',assignedTo:'Priya Nair',site:'Denver Studio',lastService:'2024-11-08',status:'At risk'},
  {id:'ast-103',organizationId:org.id,siteId:'site-bos',name:'Air quality monitor · 4F',category:'Facilities',serial:'NS-FM-0904',assignedTo:'Workplace Experience',site:'Boston Hub',lastService:'2025-02-19',status:'Active'},
  {id:'ast-104',organizationId:org.id,siteId:'site-chi',name:'Network switch · Floor 2',category:'IT equipment',serial:'NS-IT-3325',assignedTo:'Luis Moreno',site:'Chicago Office',lastService:'2024-12-02',status:'Scheduled'}
 ],
 inventory:[
  {id:'inv-01',organizationId:org.id,siteId:'site-chi',name:'Ergonomic chair, graphite',sku:'FUR-CH-008',category:'Furniture',quantity:6,reorderPoint:8,unit:'units',site:'Chicago Office',vendor:'Form & Field Supply',status:'Low stock'},
  {id:'inv-02',organizationId:org.id,siteId:'site-den',name:'USB-C docking station',sku:'IT-DO-114',category:'Technology',quantity:14,reorderPoint:6,unit:'units',site:'Denver Studio',vendor:'Civic Office Systems',status:'Active'},
  {id:'inv-03',organizationId:org.id,siteId:'site-bos',name:'Recycled paper, A4',sku:'OFF-PA-022',category:'Office supplies',quantity:22,reorderPoint:10,unit:'reams',site:'Boston Hub',vendor:'Common Goods Co.',status:'Active'},
  {id:'inv-04',organizationId:org.id,siteId:'site-chi',name:'Visitor access badges',sku:'SEC-BA-031',category:'Security',quantity:4,reorderPoint:12,unit:'packs',site:'Chicago Office',vendor:'Civic Office Systems',status:'Low stock'},
  {id:'inv-05',organizationId:org.id,siteId:'site-den',name:'First aid refill kit',sku:'SAF-KT-015',category:'Safety',quantity:9,reorderPoint:4,unit:'kits',site:'Denver Studio',vendor:'Northline Safety',status:'Active'}
 ],
 documents:[
  {id:'doc-01',organizationId:org.id,name:'Remote work principles',category:'People policy',owner:'Avery Chen',updated:'2025-03-05',access:'Organization',status:'Active'},
  {id:'doc-02',organizationId:org.id,name:'Vendor due diligence standard',category:'Governance',owner:'Mara Ellison',updated:'2025-03-02',access:'Operations',status:'Active'},
  {id:'doc-03',organizationId:org.id,name:'Q2 operating priorities',category:'Planning',owner:'Alex Morgan',updated:'2025-02-24',access:'Leadership',status:'Draft'},
  {id:'doc-04',organizationId:org.id,name:'Incident response guide',category:'Operations',owner:'Luis Moreno',updated:'2025-02-18',access:'Organization',status:'Active'},
  {id:'doc-05',organizationId:org.id,name:'Expense and travel policy',category:'Finance',owner:'Elliot Brooks',updated:'2025-02-10',access:'Organization',status:'Active'}
 ],
 approvals:[
  {id:'apr-01',organizationId:org.id,name:'Denver room booking system renewal',type:'Purchase request',requester:'Priya Nair',submitted:'2025-03-11',amount:'$4,280',approver:'Mara Ellison',status:'Pending'},
  {id:'apr-02',organizationId:org.id,name:'Research data agreement · Helio Labs',type:'Contract',requester:'Jonah Patel',submitted:'2025-03-10',amount:'$12,600',approver:'Alex Morgan',status:'Pending'},
  {id:'apr-03',organizationId:org.id,name:'Leadership offsite travel',type:'Expense',requester:'Alex Morgan',submitted:'2025-03-08',amount:'$2,145',approver:'Elliot Brooks',status:'Pending'},
  {id:'apr-04',organizationId:org.id,name:'Boston acoustic panel installation',type:'Facilities',requester:'Avery Chen',submitted:'2025-03-06',amount:'$3,760',approver:'Mara Ellison',status:'Pending'},
  {id:'apr-05',organizationId:org.id,name:'Q1 research subscription',type:'Purchase request',requester:'Theo Martin',submitted:'2025-03-04',amount:'$890',approver:'Jonah Patel',status:'Approved'}
 ],
 vendors:[
  {id:'ven-01',organizationId:org.id,name:'Form & Field Supply',contact:'Mila Jackson',email:'mila@formfield.co',category:'Workplace',status:'Active'},
  {id:'ven-02',organizationId:org.id,name:'Civic Office Systems',contact:'Sam Okafor',email:'sam@civicoffice.co',category:'Technology',status:'Active'},
  {id:'ven-03',organizationId:org.id,name:'Helio Labs',contact:'Nora Bell',email:'nora@heliolabs.io',category:'Research',status:'Pending'}
 ],
 workflows:[
  {id:'wf-01',organizationId:org.id,name:'New team member setup',owner:'People Operations',steps:8,completion:72,cadence:'As needed',status:'Active'},
  {id:'wf-02',organizationId:org.id,name:'Vendor onboarding review',owner:'Business Operations',steps:6,completion:48,cadence:'As needed',status:'In progress'},
  {id:'wf-03',organizationId:org.id,name:'Quarterly planning cycle',owner:'Leadership',steps:10,completion:86,cadence:'Quarterly',status:'In progress'},
  {id:'wf-04',organizationId:org.id,name:'Facilities maintenance request',owner:'Workplace Experience',steps:5,completion:100,cadence:'As needed',status:'Complete'}
 ],
 kpis:[
  {id:'kpi-01',organizationId:org.id,name:'Organizational health',value:'87',change:'+3.2 pts',target:'90',trend:[67,70,72,71,77,82,87],status:'Active'},
  {id:'kpi-02',organizationId:org.id,name:'Tasks on track',value:'82%',change:'+4.6 pts',target:'90%',trend:[60,68,66,73,74,80,82],status:'Active'},
  {id:'kpi-03',organizationId:org.id,name:'Approval turnaround',value:'1.8 days',change:'−0.4 days',target:'1.5 days',trend:[5,4,4,3,3,2,2],status:'Active'},
  {id:'kpi-04',organizationId:org.id,name:'Team pulse',value:'4.3 / 5',change:'+0.2',target:'4.5',trend:[55,62,68,67,72,79,86],status:'Active'}
 ],
 audit:[
  {id:'aud-01',organizationId:org.id,name:'Access permissions updated',actor:'Avery Chen',action:'Updated role access',target:'People Operations',timestamp:'2025-03-14 10:42',source:'Workspace',status:'Complete'},
  {id:'aud-02',organizationId:org.id,name:'Vendor record created',actor:'Luis Moreno',action:'Created vendor',target:'Helio Labs',timestamp:'2025-03-13 16:18',source:'Operations',status:'Complete'},
  {id:'aud-03',organizationId:org.id,name:'Policy document revised',actor:'Mara Ellison',action:'Updated document',target:'Vendor due diligence standard',timestamp:'2025-03-12 09:31',source:'Documents',status:'Complete'},
  {id:'aud-04',organizationId:org.id,name:'Approval decision recorded',actor:'Elliot Brooks',action:'Approved expense',target:'Q1 research subscription',timestamp:'2025-03-11 14:05',source:'Approvals',status:'Complete'},
  {id:'aud-05',organizationId:org.id,name:'Task marked at risk',actor:'Jonah Patel',action:'Changed task status',target:'Renew research data agreement',timestamp:'2025-03-11 11:20',source:'Workspace',status:'Complete'}
 ],
 insights:[
  {id:'ins-01',organizationId:org.id,name:'Approval queue is concentrating in workplace requests',category:'Operations',summary:'Three of five pending decisions relate to workplace spend or facilities. A weekly review could keep small purchases moving without slowing contract review.',confidence:'Sample observation',sourceRecords:['apr-01','apr-04','apr-02'],createdAt:'2025-03-14',status:'Active'},
  {id:'ins-02',organizationId:org.id,name:'Two sites are below their reorder threshold',category:'Inventory',summary:'Visitor badges in Chicago and ergonomic chairs are below set reorder points. Both have current vendor records for follow-up.',confidence:'Sample observation',sourceRecords:['inv-01','inv-04'],createdAt:'2025-03-13',status:'Active'},
  {id:'ins-03',organizationId:org.id,name:'Research agreement needs an owner check-in',category:'Governance',summary:'The agreement renewal task is marked at risk and an associated contract is awaiting approval. Confirming a single decision owner may clarify next steps.',confidence:'Sample observation',sourceRecords:['task-04','apr-02'],createdAt:'2025-03-12',status:'Active'}
 ],
 activity:[
  {id:'act-01',organizationId:org.id,name:'Approval recorded',actor:'Elliot Brooks',action:'approved',target:'Q1 research subscription',time:'18 min ago',status:'Complete'},
  {id:'act-02',organizationId:org.id,name:'Document updated',actor:'Mara Ellison',action:'updated',target:'Vendor due diligence standard',time:'1 hour ago',status:'Complete'},
  {id:'act-03',organizationId:org.id,name:'Task status changed',actor:'Jonah Patel',action:'flagged at risk',target:'Renew research data agreement',time:'3 hours ago',status:'At risk'},
  {id:'act-04',organizationId:org.id,name:'New team member',actor:'Grace Kim',action:'completed onboarding',target:'Workplace Experience',time:'Yesterday',status:'Complete'}
 ],
 expenses:[
  {id:'exp-01',organizationId:org.id,name:'Leadership offsite travel',owner:'Alex Morgan',category:'Travel',amount:'$2,145',submitted:'2025-03-08',status:'Pending'},
  {id:'exp-02',organizationId:org.id,name:'Research interview honoraria',owner:'Jonah Patel',category:'Research',amount:'$1,280',submitted:'2025-03-06',status:'Approved'},
  {id:'exp-03',organizationId:org.id,name:'Denver studio supplies',owner:'Priya Nair',category:'Workplace',amount:'$438',submitted:'2025-03-04',status:'Approved'},
  {id:'exp-04',organizationId:org.id,name:'Client workshop transit',owner:'Theo Martin',category:'Travel',amount:'$186',submitted:'2025-03-02',status:'Rejected'}
 ],
 attendance:[
  {id:'att-01',organizationId:org.id,name:'Mara Ellison',employee:'Mara Ellison',team:'Workplace Experience',schedule:'In office · Chicago',attendance:'Present',status:'Active'},
  {id:'att-02',organizationId:org.id,name:'Avery Chen',employee:'Avery Chen',team:'People Operations',schedule:'Remote',attendance:'Present',status:'Active'},
  {id:'att-03',organizationId:org.id,name:'Jonah Patel',employee:'Jonah Patel',team:'Research',schedule:'In office · Denver',attendance:'Present',status:'Active'},
  {id:'att-04',organizationId:org.id,name:'Priya Nair',employee:'Priya Nair',team:'Workplace Experience',schedule:'Planned leave',attendance:'Away',status:'Pending'},
  {id:'att-05',organizationId:org.id,name:'Grace Kim',employee:'Grace Kim',team:'People Operations',schedule:'Remote',attendance:'Present',status:'Active'}
 ],
 performance:[
  {id:'perf-01',organizationId:org.id,name:'Avery Chen',employee:'Avery Chen',role:'People Partner',team:'People Operations',rating:'Exceeds expectations',checkIn:'2025-03-10',status:'Complete'},
  {id:'perf-02',organizationId:org.id,name:'Jonah Patel',employee:'Jonah Patel',role:'Research Lead',team:'Research',rating:'On track',checkIn:'2025-03-07',status:'Complete'},
  {id:'perf-03',organizationId:org.id,name:'Priya Nair',employee:'Priya Nair',role:'Workplace Coordinator',team:'Workplace Experience',rating:'On track',checkIn:'2025-03-06',status:'Complete'},
  {id:'perf-04',organizationId:org.id,name:'Theo Martin',employee:'Theo Martin',role:'Senior Analyst',team:'Research',rating:'Check-in due',checkIn:'Due Mar 18',status:'Pending'},
  {id:'perf-05',organizationId:org.id,name:'Grace Kim',employee:'Grace Kim',role:'People Operations Specialist',team:'People Operations',rating:'Check-in due',checkIn:'Due Mar 20',status:'Pending'}
 ],
 reports:[
  {id:'rep-01',organizationId:org.id,name:'Operating health · March',category:'Executive',owner:'Alex Morgan',period:'March 2025',modified:'2025-03-14',status:'Active'},
  {id:'rep-02',organizationId:org.id,name:'People & team pulse',category:'People',owner:'Avery Chen',period:'Q1 2025',modified:'2025-03-12',status:'Active'},
  {id:'rep-03',organizationId:org.id,name:'Spend by site',category:'Finance',owner:'Elliot Brooks',period:'February 2025',modified:'2025-03-08',status:'Active'},
  {id:'rep-04',organizationId:org.id,name:'Open risk register',category:'Governance',owner:'Mara Ellison',period:'March 2025',modified:'2025-03-05',status:'Active'}
 ],
 users:[
  {id:'usr-01',organizationId:org.id,name:'Alex Morgan',email:'alex.morgan@northstar.co',role:'Organization admin',lastActive:'Now',status:'Active'},
  {id:'usr-02',organizationId:org.id,name:'Mara Ellison',email:'mara.ellison@northstar.co',role:'Operations manager',lastActive:'18 min ago',status:'Active'},
  {id:'usr-03',organizationId:org.id,name:'Avery Chen',email:'avery.chen@northstar.co',role:'People manager',lastActive:'1 hour ago',status:'Active'},
  {id:'usr-04',organizationId:org.id,name:'Owen Foster',email:'owen.foster@northstar.co',role:'Contributor',lastActive:'Yesterday',status:'Active'}
 ],
 roles:[
  {id:'role-01',organizationId:org.id,name:'Organization admin',users:2,permissions:'All modules, organization settings',scope:'Organization',status:'Active'},
  {id:'role-02',organizationId:org.id,name:'Operations manager',users:5,permissions:'Operations, approvals, documents',scope:'Assigned sites',status:'Active'},
  {id:'role-03',organizationId:org.id,name:'People manager',users:7,permissions:'People, attendance, performance',scope:'Department',status:'Active'},
  {id:'role-04',organizationId:org.id,name:'Contributor',users:24,permissions:'Assigned tasks and shared records',scope:'Assigned records',status:'Active'}
 ],
 modules:[
  {id:'mod-01',organizationId:org.id,name:'People',description:'Employee directory, teams and manager workflows',enabled:true,status:'Active'},
  {id:'mod-02',organizationId:org.id,name:'Operations',description:'Tasks, approvals, processes and assets',enabled:true,status:'Active'},
  {id:'mod-03',organizationId:org.id,name:'Governance',description:'Audit trail and verification interface',enabled:true,status:'Active'},
  {id:'mod-04',organizationId:org.id,name:'Intelligence',description:'Sample insights and report exploration',enabled:true,status:'Active'},
  {id:'mod-05',organizationId:org.id,name:'Documents',description:'Shared organizational knowledge',enabled:true,status:'Active'}
 ],
 integrations:[
  {id:'int-01',organizationId:org.id,name:'Identity provider',description:'Single sign-on connection',state:'Not connected',status:'Not connected'},
  {id:'int-02',organizationId:org.id,name:'Calendar',description:'Calendar and availability sync',state:'Not connected',status:'Not connected'},
  {id:'int-03',organizationId:org.id,name:'Finance system',description:'Expense and ledger connection',state:'Not connected',status:'Not connected'}
 ]
};

function clone<T>(value:T):T { return JSON.parse(JSON.stringify(value)) as T; }
export const demoService = {
 getSeeded(): AppData { return clone(seeded); },
 get(): AppData {
  try { const stored=localStorage.getItem(storageKey); if(stored) return JSON.parse(stored) as AppData; } catch {}
  return clone(seeded);
 },
 save(data:AppData):void { try { localStorage.setItem(storageKey,JSON.stringify(data)); } catch {} },
 reset():AppData { const fresh=clone(seeded); this.save(fresh); return fresh; },
 add<T extends BaseRecord>(data:AppData,key:CollectionKey,record:Omit<T,'id'|'organizationId'> & Partial<Pick<T,'id'|'organizationId'>>):AppData {
  const next=clone(data); const entry={...record,id:record.id ?? `${key.slice(0,3)}-${Date.now().toString(36)}`,organizationId:org.id,updatedAt:new Date().toISOString().slice(0,10)} as T;
    (next[key] as unknown as T[]).unshift(entry); this.save(next); return next;
 },
 update<T extends BaseRecord>(data:AppData,key:CollectionKey,id:string,patch:Partial<T>):AppData {
  const next=clone(data); (next as any)[key]=((next as any)[key] as T[]).map((r:T)=>r.id===id?{...r,...patch,updatedAt:new Date().toISOString().slice(0,10)}:r); this.save(next); return next;
 },
 updateOrganization(data:AppData,patch:Partial<AppData['organization']>):AppData { const next=clone(data); next.organization={...next.organization,...patch}; this.save(next); return next; },
 remove(data:AppData,key:CollectionKey,id:string):AppData { const next=clone(data); (next as any)[key]=((next as any)[key] as BaseRecord[]).filter((r:BaseRecord)=>r.id!==id); this.save(next); return next; }
};