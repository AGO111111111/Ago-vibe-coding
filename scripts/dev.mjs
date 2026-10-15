import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync} from 'node:fs';
import worker from '../dist/server/index.js';
import {binding} from './sqlite-adapter.mjs';
mkdirSync('.local',{recursive:true});
const db=new DatabaseSync('.local/dev.sqlite');
db.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
for(const name of readdirSync('drizzle').filter(n=>n.endsWith('.sql'))){if(!db.prepare('SELECT name FROM local_migrations WHERE name=?').get(name)){db.exec(readFileSync('drizzle/'+name,'utf8'));db.prepare('INSERT INTO local_migrations (name) VALUES (?)').run(name);}}
const DB=binding(db);
http.createServer(async(req,res)=>{try{const chunks=[];for await(const c of req)chunks.push(c);const headers=new Headers(req.headers);headers.set('oai-authenticated-user-id','local-preview-user');const r=new Request('http://localhost:4174'+req.url,{method:req.method,headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});const out=await worker.fetch(r,{DB});res.writeHead(out.status,Object.fromEntries(out.headers));res.end(Buffer.from(await out.arrayBuffer()));}catch(e){res.writeHead(500);res.end(String(e));}}).listen(4174,'127.0.0.1',()=>console.log('Local: http://localhost:4174'));
