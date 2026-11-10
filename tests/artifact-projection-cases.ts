export const artifactProjectionCases = [
 {name:"artifact list",argv:["builds","artifacts","list","42","--limit","2"],path:"/app/rest/builds/id:42/artifacts",locator:"count:3,recursive:false,hidden:false,browseArchives:true"},
 {name:"artifact children",argv:["builds","artifacts","children","42","logs","--limit","2"],path:"/app/rest/builds/id:42/artifacts/logs",locator:"count:3,recursive:false,hidden:false,browseArchives:true"},
 {name:"artifact metadata",argv:["builds","artifacts","metadata","42","logs"],path:"/app/rest/builds/id:42/artifacts/metadata/logs",locator:undefined},
].map(c=>({...c,defaultFields:c.locator ? "count,file(name,size,modificationTime,children($none),content($none))":"name,size,modificationTime",
baselineResponse:c.locator ? {file:[]}:{name:"logs",size:0},
baselineResult:c.locator ? {count:0,items:[],hasMore:false}:{name:"logs",size:0},
human:c.locator ? "No files found.\n":"name: logs\nsize: 0\n",stderr:"",
fields:(s:string)=>c.locator ? `count,file(${s})`:s,
response:<T>(v:T)=>c.locator ? {file:[v]}:v,
result:<T>(v:T)=>c.locator ? {count:1,items:[v],hasMore:false}:v}));
