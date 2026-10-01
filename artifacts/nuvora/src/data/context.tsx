import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AppData, CollectionKey, BaseRecord } from './models';
import { demoService } from './service';

type DataContextValue = { data:AppData; add:(key:CollectionKey,record:any)=>void; update:(key:CollectionKey,id:string,patch:any)=>void; updateOrganization:(patch:Partial<AppData['organization']>)=>void; remove:(key:CollectionKey,id:string)=>void; reset:()=>void };
const DataContext=createContext<DataContextValue|null>(null);
export function DataProvider({children}:{children:ReactNode}) {
 const [data,setData]=useState<AppData>(()=>demoService.get());
 const value:DataContextValue={
  data,
  add:(key,record)=>setData(current=>demoService.add<BaseRecord>(current,key,record)),
  update:(key,id,patch)=>setData(current=>demoService.update<BaseRecord>(current,key,id,patch)),
  updateOrganization:(patch)=>setData(current=>demoService.updateOrganization(current,patch)),
  remove:(key,id)=>setData(current=>demoService.remove(current,key,id)),
  reset:()=>setData(demoService.reset())
 };
 return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
export function useDemoData() { const context=useContext(DataContext); if(!context) throw new Error('DataProvider is required'); return context; }