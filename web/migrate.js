import {legacySeed} from './legacy-seed.js';
import {empty,pythonExercise,ensureMilestones} from './model.js';
export function migrate(state){
 let changed=false;
 if(state.pythonMigration!==1){
  const sample=empty();legacySeed(sample);const old=sample.tasks[0],goal=sample.goals[0];
  const fields=['name','steps','materials','lesson','criteria','minimum'];
  for(const t of state.tasks){
   if(!fields.every(k=>JSON.stringify(t[k])===JSON.stringify(old[k])))continue;
   t.previousLearningContent={...Object.fromEntries(fields.map(k=>[k,structuredClone(t[k])])),mastery:t.mastery,checked:t.checked,status:t.status};
   Object.assign(t,structuredClone(pythonExercise),{checked:[],mastery:'未验收',status:'待办'});
   t.learningResetAt=new Date().toISOString();delete t.reviewAt;
   for(const g of state.goals.filter(g=>t.goals.includes(g.id))){
    if(['name','focus','route'].every(k=>JSON.stringify(g[k])===JSON.stringify(goal[k]))){g.previousLearningContent={name:g.name,focus:g.focus,route:g.route,stage:g.stage};Object.assign(g,{name:'Python 基础：建立独立解题能力',focus:'列表遍历与边界处理',route:['变量、条件与循环','列表与函数','字典与文件','异常处理','完成一个小工具'],stage:0});}
   }
  }
  state.pythonMigration=1;changed=true;
 }
 if(!Array.isArray(state.automations)){state.automations=[];changed=true;}
 if(state.automationMigration!==1){
  const imported=[
   {id:'chatgpt-weekly-learning',title:'每周学习与成果复盘',frequency:'weekly',weekdays:[1],time:'08:00',description:'每周一整理本周学习重点，结合真实提交和卡点安排下一步。',enabled:true,source:'ChatGPT 定时任务'},
   {id:'chatgpt-weekly-python',title:'每周 Python 实践与验收',frequency:'weekly',weekdays:[4],time:'19:00',description:'每周四安排一个轻量 Python 练习，并在周日留下验收机会。',enabled:true,source:'ChatGPT 定时任务'},
   {id:'chatgpt-meal-plan',title:'出租屋一周餐食与采购计划',frequency:'weekly',weekdays:[6],time:'08:00',description:'每周六生成接下来七天的餐食与采购计划。',enabled:true,source:'ChatGPT 定时任务'},
   {id:'chatgpt-dots-reminder',title:'Dots Plus 开放提醒',frequency:'daily',weekdays:[0,1,2,3,4,5,6],time:'10:00',description:'每天检查是否已向 Plus 用户开放 Dots；仅在有结果时提醒。',enabled:true,source:'ChatGPT 定时任务',mergedCount:2}
  ];
  for(const item of imported)if(!state.automations.some(a=>a.id===item.id)){state.automations.push(item);changed=true;}
  state.automationMigration=1;changed=true;
 }
 if(ensureMilestones(state))changed=true;
 return changed;
}
