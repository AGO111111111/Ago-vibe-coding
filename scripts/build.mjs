import {readFile,mkdir,writeFile} from 'node:fs/promises';
const files=['index.html','style.css','apple.css','app.js','model.js','legacy-seed.js','migrate.js'];
const assets={};
for(const name of files)assets['/'+name]=await readFile('web/'+name,'utf8');
await mkdir('dist/server',{recursive:true});
await writeFile('dist/server/index.js','const assets='+JSON.stringify(assets)+';\n'+await readFile('server/worker.js','utf8'));
console.log('Built worker and '+files.length+' browser assets.');
