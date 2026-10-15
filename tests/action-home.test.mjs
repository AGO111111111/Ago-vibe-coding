import test from 'node:test';
import assert from 'node:assert/strict';
import {empty,seed,timeline,focusElapsed} from '../web/model.js';
test('timeline combines fixed events and explicitly scheduled tasks, marking overlaps without inventing slots',()=>{
 const s=empty();seed(s);const t=s.tasks[0];t.plannedDate='2026-10-13';t.plannedTime='09:30';t.minutes=30;s.events=[{id:'class',name:'课程',date:'2026-10-13',start:'09:00',end:'10:00'}];const rows=timeline(s,'2026-10-13');assert.equal(rows.length,2);assert.equal(rows[0].kind,'event');assert.equal(rows[1].kind,'task');assert.equal(rows[1].end,'10:00');assert.ok(rows.every(r=>r.conflict));assert.equal(timeline(s,'2026-10-14').length,0);
 t.plannedTime='10:00';assert.ok(timeline(s,'2026-10-13').every(r=>!r.conflict));t.status='完成';assert.equal(timeline(s,'2026-10-13').length,1);delete t.plannedTime;t.status='待办';assert.equal(timeline(s,'2026-10-13').length,1);
});
test('focus time excludes pauses and includes only resumed work',()=>{
 const session={start:1000,elapsed:0,paused:false};assert.equal(focusElapsed(session,11000),10000);session.elapsed=focusElapsed(session,11000);session.paused=true;assert.equal(focusElapsed(session,61000),10000);session.start=61000;session.paused=false;assert.equal(focusElapsed(session,66000),15000);assert.equal(focusElapsed(null,66000),0);
});
