import test from 'node:test';
import assert from 'node:assert/strict';
import {empty,seed,ensureMilestones,milestoneProgress,routeProgress} from '../web/model.js';
import {migrate} from '../web/migrate.js';
test('existing routes become stable milestones, preserving unrelated tasks and history',()=>{
 const s=empty();s.goals.push({id:'goal',name:'主路线',route:['基础','实践']});s.tasks.push({id:'custom',name:'自定义',goals:['goal'],status:'部分完成'});s.sessions.push({task:'custom',note:'保留卡点'});
 assert.equal(ensureMilestones(s),true);const ids=s.goals[0].milestones.map(m=>m.id);assert.equal(ensureMilestones(s),false);assert.deepEqual(s.goals[0].milestones.map(m=>m.id),ids);assert.equal(s.tasks[0].milestone,undefined);assert.equal(s.sessions[0].note,'保留卡点');
});
test('progress is derived from task completion, empty milestones stay zero and mastery stays separate',()=>{
 const s=empty();seed(s);const g=s.goals[0],m=g.milestones.find(m=>m.id===s.tasks[0].milestone);assert.ok(m);assert.equal(milestoneProgress(s,g,m).status,'未开始');
 s.tasks[0].status='部分完成';assert.equal(milestoneProgress(s,g,m).status,'进行中');assert.equal(milestoneProgress(s,g,m).percent,0);
 s.tasks[0].status='完成';const p=milestoneProgress(s,g,m);assert.equal(p.percent,100);assert.equal(p.mastered,0);assert.equal(routeProgress(s,g).percent,20);assert.equal(routeProgress(s,g).done,1);
 s.tasks.push({...s.tasks[0],id:'other',status:'待办'});assert.equal(milestoneProgress(s,g,m).percent,50);assert.equal(routeProgress(s,g).percent,10);
 s.tasks.push({...s.tasks[0],id:'unrelated',goals:['other-goal'],status:'完成'});assert.equal(milestoneProgress(s,g,m).total,2);
});
test('migration does not duplicate milestones or overwrite user dates and criteria',()=>{
 const s=empty();seed(s);migrate(s);s.goals[0].milestones[0].start='2026-10-15';s.goals[0].milestones[0].criteria='真实成果';assert.equal(migrate(s),false);assert.equal(s.goals[0].milestones[0].start,'2026-10-15');assert.equal(s.goals[0].milestones[0].criteria,'真实成果');
});
