const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname==='/api/workspace'){
  const user=request.headers.get('oai-authenticated-user-id');
  if(!user)return json({error:'请先登录后再读取或保存工作台。'},401);
  if(!env.DB)return json({error:'云端数据库尚未就绪，请稍后重试。'},503);
  try{
   if(request.method==='GET'){
    const row=await env.DB.prepare('SELECT data, revision FROM workspaces WHERE user_id = ?').bind(user).first();
    return json({data:row?JSON.parse(row.data):null,revision:row?.revision||0});
   }
   if(request.method!=='PUT')return json({error:'不支持的操作'},405);
   const origin=request.headers.get('Origin');
   if(origin && origin!==url.origin)return json({error:'来源不匹配'},403);
   const raw=await request.text();if(raw.length>1500000)return json({error:'记录过大，请先导出归档。'},413);
   const {data,revision}=JSON.parse(raw);
   if(!data||data.schema!==2||!Array.isArray(data.tasks)||!Array.isArray(data.goals)||!Array.isArray(data.events)||!Array.isArray(data.sessions)||!Array.isArray(data.reviews)||!Number.isInteger(revision)||revision<0)return json({error:'工作台数据格式无效'},400);
   const sql=revision===0?'INSERT INTO workspaces (user_id,data,revision,updated_at) VALUES (?,?,1,?) ON CONFLICT(user_id) DO NOTHING':'UPDATE workspaces SET data=?, revision=revision+1, updated_at=? WHERE user_id=? AND revision=?';
   const now=new Date().toISOString();
   const args=revision===0?[user,JSON.stringify(data),now]:[JSON.stringify(data),now,user,revision];
   const result=await env.DB.prepare(sql).bind(...args).run();
   if(!result.meta.changes)return json({error:'另一台设备已更新。请先导出当前草稿，再加载云端版本，避免覆盖。'},409);
   return json({revision:revision+1});
  }catch(e){console.error('Workspace storage failed',e.message);return json({error:'保存或读取失败；当前输入仍保留，请重试。'},500);}
 }
 const path=url.pathname==='/'?'/index.html':url.pathname;
 if(!Object.hasOwn(assets,path))return new Response('Not found',{status:404});
 const type=path.endsWith('.css')?'text/css':path.endsWith('.js')?'text/javascript':'text/html';
 return new Response(assets[path],{headers:{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'self' https://chatgpt.com"}});
}};
