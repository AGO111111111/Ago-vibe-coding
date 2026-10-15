import test from 'node:test';
import assert from 'node:assert/strict';
import {empty,seed,ensureStages,updateStage,syncStageResult,routeProgress,milestoneProgress} from '../web/model.js';
test('stage conversion reuses existing work and history, creates only one execution record per empty stage',()=>{
 const s=empty();seed(s);const original=s.tasks[0],g=s.goals[0],m=g.milestones.find(m=>m.id===original.milestone);original.status='部分完成';s.sessions.push({task:original.id,note:'负数测试卡住'});assert.equal(ensureStages(s),true);assert.equal(m.taskId,original.id);assert.equal(m.status,'进行中');assert.equal(s.tasks.length,g.milestones.length);const ids=s.tasks.map(t=>t.id);assert.equal(ensureStages(s),false);assert.deepEqual(s.tasks.map(t=>t.id),ids);assert.equal(s.sessions[0].note,'负数测试卡住');assert.equal(original.name,'找出列表中的最大值');
});
test('direct progress and status edits persist across reloads and never grant learning mastery',()=>{
 const s=empty();seed(s);ensureStages(s);const g=s.goals[0],m=g.milestones[0],t=s.tasks.find(t=>t.id===m.taskId);updateStage(s,g,m,'progress','35');assert.equal(m.status,'进行中');assert.equal(t.status,'进行中');assert.equal(routeProgress(s,g).percent,7);assert.equal(ensureStages(s),false);assert.equal(milestoneProgress(s,g,m).percent,35);updateStage(s,g,m,'status','暂停');assert.equal(m.progress,35);assert.equal(t.status,'等待');updateStage(s,g,m,'status','已完成');assert.equal(m.progress,100);assert.equal(t.status,'完成');assert.equal(t.mastery,'未验收');updateStage(s,g,m,'progress','20');assert.equal(m.status,'进行中');updateStage(s,g,m,'status','未开始');assert.equal(m.progress,0);
});
test('invalid percentages and reverse dates leave the saved stage untouched',()=>{
 const s=empty();seed(s);ensureStages(s);const g=s.goals[0],m=g.milestones[0];for(const value of ['','abc','-1','101'])assert.throws(()=>updateStage(s,g,m,'progress',value));assert.equal(m.progress,0);updateStage(s,g,m,'start','2026-10-20');assert.throws(()=>updateStage(s,g,m,'end','2026-10-19'));assert.equal(m.end,'');updateStage(s,g,m,'end','2026-10-21');assert.equal(s.tasks.find(t=>t.id===m.taskId).due,'2026-10-21');
});
test('execution updates its own stage without changing other stages or past records',()=>{
 const s=empty();seed(s);ensureStages(s);const g=s.goals[0],m=g.milestones[0],t=s.tasks.find(t=>t.id===m.taskId);updateStage(s,g,m,'progress',40);t.status='完成';syncStageResult(s,t);assert.equal(m.progress,100);assert.equal(m.status,'已完成');assert.equal(g.milestones[1].progress,0);t.status='部分完成';syncStageResult(s,t);assert.equal(m.status,'进行中');assert.ok(m.progress<100);assert.equal(t.mastery,'未验收');
});
