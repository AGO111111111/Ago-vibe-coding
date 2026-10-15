import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as model from '../web/model.js';
import {legacySeed} from '../web/legacy-seed.js';
import {migrate} from '../web/migrate.js';
test('legacy conversion preserves identity/history, snapshots content, and leaves custom tasks alone',()=>{
 const s=model.empty();legacySeed(s);const id=s.tasks[0].id,gid=s.goals[0].id;s.sessions.push({task:id,note:'old work'});const custom=structuredClone(s.tasks[0]);custom.id='custom';custom.lesson='自己的讲解';s.tasks.push(custom);
 assert.equal(migrate(s),true);assert.equal(s.tasks[0].id,id);assert.equal(s.goals[0].id,gid);assert.equal(s.sessions[0].note,'old work');assert.equal(s.tasks[0].template,'python-find-max-v1');assert.match(s.tasks[0].previousLearningContent.lesson,/int max/);assert.equal(s.tasks[1].lesson,'自己的讲解');assert.equal(s.tasks[1].template,undefined);assert.equal(migrate(s),false);
 assert.equal(model.mastery(s.tasks[0],true,0,true,[{task:id,passed:true,independent:true,hints:0,at:new Date(Date.now()-3*86400000).toISOString()}]),'待间隔复测');
});
test('daily budget subtracts today only and rolls over',()=>{
 const s=model.empty(),now=new Date();now.setHours(9,0,0,0);s.settings.budgetVersion=1;s.sessions=[{at:now.toISOString(),minutes:30},{at:new Date(now-86400000).toISOString(),minutes:50}];assert.equal(model.available(s,now),90);
 s.settings.day='2000-01-01';s.settings.minutes=5;model.normalize(s);assert.equal(s.settings.minutes,120);
});
test('completed learning comes back only when its review is due',()=>{
 const s=model.empty();model.seed(s);const t=s.tasks[0];t.status='完成';t.mastery='待间隔复测';t.reviewAt=new Date(Date.now()+86400000).toISOString();assert.equal(model.schedule(s).core.length,0);assert.equal(model.reviewPending(t),true);t.reviewAt=new Date(Date.now()-1000).toISOString();assert.equal(model.schedule(s).core[0].id,t.id);t.mastery='已验收';assert.equal(model.schedule(s).core.length,0);
});
test('learning screen withholds help until requested and retains explicit local execution instructions',()=>{
 const elements=new Map();const node=k=>{if(!elements.has(k))elements.set(k,{innerHTML:'',textContent:'',style:{},classList:{toggle(){}},addEventListener(){},showModal(){this.open=true},close(){this.open=false}});return elements.get(k)};
 const context=vm.createContext({...model,migrate,document:{querySelector:node,querySelectorAll:()=>[],addEventListener(){}},location:{hash:''},window:{addEventListener(){}},fetch:()=>new Promise(()=>{}),setTimeout,clearTimeout,setInterval,clearInterval,console,structuredClone});
 const source=readFileSync('web/app.js','utf8').replace(/^import .*;\n/gm,'');vm.runInContext(source,context);
 vm.runInContext('state=empty();seed(state);ready=true;openLearning(state.tasks[0]);',context);let html=node('#dialogBody').innerHTML;assert.match(html,/find_max.py/);assert.match(html,/assert find_max/);assert.doesNotMatch(html,/largest = nums|如果暂时只看过/);assert.match(html,/我卡住了/);
 vm.runInContext('state.tasks[0].helpSeen=[0];openLearning(state.tasks[0]);',context);html=node('#dialogBody').innerHTML;assert.match(html,/如果暂时只看过/);assert.doesNotMatch(html,/largest = nums/);
 vm.runInContext('state.tasks[0].status="完成";state.tasks[0].mastery="待间隔复测";learningResult(state.tasks[0]);',context);assert.match(node('#dialogBody').innerHTML,/待复测/);
});
