export const domains=['学习','学校','项目','运动','生活'];
export const day=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const uid=()=>crypto.randomUUID();
export function timeline(state,date){const rows=state.events.filter(e=>e.date===date).map(e=>({id:e.id,name:e.name,start:e.start,end:e.end,kind:'event'}));for(const t of state.tasks.filter(t=>t.plannedDate===date&&t.plannedTime&&t.status!=='完成')){const start=time(t.plannedTime),end=Math.min(1440,start+t.minutes);rows.push({id:t.id,name:t.name,start:t.plannedTime,end:`${String(Math.floor(end/60)).padStart(2,'0')}:${String(end%60).padStart(2,'0')}`,kind:'task'});}rows.sort((a,b)=>a.start.localeCompare(b.start));return rows.map((r,i)=>({...r,conflict:rows.some((other,j)=>i!==j&&r.start<other.end&&r.end>other.start)}));}
export function focusElapsed(session,now=Date.now()){return session?session.elapsed+(session.paused?0:Math.max(0,now-session.start)):0;}
export const empty=()=>({schema:2,tasks:[],goals:[],projects:[],events:[],automations:[],sessions:[],inbox:[],reviews:[],outcomes:[],settings:{energy:'正常',minutes:120,day:day()},notes:{}});
export function progress(state,goal){const tasks=state.tasks.filter(t=>t.goals.includes(goal.id));return {done:tasks.filter(t=>t.status==='完成').length,total:tasks.length,mastered:tasks.filter(t=>t.mastery==='已验收').length,minutes:state.sessions.filter(s=>tasks.some(t=>t.id===s.task)).reduce((a,s)=>a+s.minutes,0)};}
export function ensureMilestones(state){let changed=false;const pythonCriteria={'变量、条件与循环':'独立写出一个含条件判断和循环的程序，运行测试并解释每一步。','列表与函数':'独立完成列表遍历练习，通过给定测试并解释函数输入和返回值。','字典与文件':'完成一个保存和读取记录的小功能，验证重新运行后数据仍可读取。','异常处理':'给程序加入输入错误的处理，验证正常输入和错误输入两种结果。','完成一个小工具':'做出一个解决实际问题的小工具，保留代码、运行方式和验证结果。'};for(const g of state.goals){if(Array.isArray(g.milestones))continue;const python=g.name==='Python 基础：建立独立解题能力';g.milestones=(g.route||[]).map((name,i)=>({id:`${g.id}-step-${i}`,name,start:'',end:'',criteria:python?pythonCriteria[name]||'':'',notes:''}));changed=true;for(const t of state.tasks.filter(t=>t.goals.includes(g.id)&&!t.milestone&&t.template==='python-find-max-v1')){const m=g.milestones.find(m=>m.name.includes('列表'));if(m)t.milestone=m.id;}}return changed;}
export function milestoneProgress(state,goal,m){const tasks=state.tasks.filter(t=>t.goals.includes(goal.id)&&t.milestone===m.id),done=tasks.filter(t=>t.status==='完成').length,started=tasks.some(t=>['进行中','部分完成','完成'].includes(t.status)),manual=Number.isFinite(m.progress);return {tasks,total:tasks.length,done,percent:manual?Math.max(0,Math.min(100,m.progress)):tasks.length?Math.round(done/tasks.length*100):0,status:manual?m.status:tasks.length&&done===tasks.length?'已完成':started?'进行中':'未开始',mastered:tasks.filter(t=>t.mastery==='已验收').length};}
export const stageStatuses=['未开始','进行中','已完成','暂停'];
export function ensureStages(state){let changed=false;ensureMilestones(state);for(const g of state.goals)for(const m of g.milestones||[]){const prior=milestoneProgress(state,g,m);if(!Number.isFinite(m.progress)||!stageStatuses.includes(m.status)){m.progress=prior.percent;m.status=stageStatuses.includes(prior.status)?prior.status:'未开始';changed=true;}let t=state.tasks.find(t=>t.id===m.taskId)||state.tasks.find(t=>t.stageFor===m.id)||prior.tasks.find(t=>t.status!=='完成')||prior.tasks[0];if(!t){t={id:uid(),name:m.name,domain:g.domain||(g.name.includes('Python')?'学习':'项目'),kind:'核心',goals:[g.id],milestone:m.id,project:'',minutes:30,priority:2,due:m.end||'',load:'中',status:m.status==='已完成'?'完成':m.status==='暂停'?'等待':m.status==='进行中'?'进行中':'待办',steps:[],checked:[],materials:'',criteria:m.criteria||'',minimum:'',created:new Date().toISOString(),mastery:'未验收'};state.tasks.push(t);changed=true;}if(m.taskId!==t.id||t.stageFor!==m.id){m.taskId=t.id;t.stageFor=m.id;changed=true;}}return changed;}
export function updateStage(state,g,m,field,value){if(!['status','progress','start','end','criteria'].includes(field))throw Error('不支持的阶段字段');const next={...m};if(field==='progress'){const n=Number(value);if(String(value).trim()===''||!Number.isFinite(n)||n<0||n>100)throw Error('进度请输入 0–100');next.progress=Math.round(n);next.status=next.progress===100?'已完成':next.status==='暂停'?'暂停':next.progress>0?'进行中':'未开始';}else if(field==='status'){if(!stageStatuses.includes(value))throw Error('请选择有效状态');next.status=value;next.progress=value==='已完成'?100:value==='未开始'?0:Math.min(m.progress||0,99);}else next[field]=value;if(next.start&&next.end&&next.end<next.start)throw Error('结束日期不能早于开始日期。');Object.assign(m,next);const t=state.tasks.find(t=>t.id===m.taskId);if(t){if(field==='progress'||field==='status'){t.status=m.status==='已完成'?'完成':m.status==='暂停'?'等待':m.status==='进行中'?'进行中':'待办';}if(field==='criteria')t.criteria=m.criteria;if(field==='end')t.due=m.end;}return m;}
export function syncStageResult(state,t){const g=state.goals.find(g=>g.milestones?.some(m=>m.taskId===t.id)),m=g?.milestones.find(m=>m.taskId===t.id);if(!m)return;if(t.status==='完成'){m.status='已完成';m.progress=100;}else if(t.status==='等待'){m.status='暂停';m.progress=Math.min(m.progress||0,99);}else{m.status='进行中';m.progress=Math.min(m.progress||0,99);}}
export function routeProgress(state,goal){const rows=(goal.milestones||[]).map(m=>milestoneProgress(state,goal,m));return {total:rows.length,done:rows.filter(r=>r.status==='已完成').length,percent:rows.length?Math.round(rows.reduce((sum,r)=>sum+r.percent,0)/rows.length):0};}
export function estimate(state,t){const logs=state.sessions.filter(s=>state.tasks.find(x=>x.id===s.task)?.domain===t.domain&&s.status==='完成'&&s.estimate>0);const factor=logs.length?Math.max(.5,Math.min(2,logs.reduce((a,s)=>a+s.minutes/s.estimate,0)/logs.length)):1;return Math.max(5,Math.round(t.minutes*factor));}
export function available(state,now=new Date()){
 const intervals=state.events.filter(e=>e.date===day(now)).map(e=>[Math.max(now.getHours()*60+now.getMinutes(),time(e.start)),time(e.end)]).filter(([a,b])=>b>a).sort((a,b)=>a[0]-b[0]);
 let occupied=0,end=-1;for(const [a,b] of intervals){occupied+=Math.max(0,b-Math.max(a,end));end=Math.max(end,b);}
 return Math.max(0,Math.min(Math.max(0,state.settings.minutes-spentToday(state,now)),24*60-now.getHours()*60-now.getMinutes()-occupied));
}
const time=s=>{const [h,m]=s.split(':').map(Number);return h*60+m};
export function schedule(state,now=new Date()){
 const budget=available(state,now);const active=state.tasks.filter(t=>(!['完成','以后','等待'].includes(t.status)||reviewReady(t,now)));
 const rank=t=>{const due=t.due?Math.ceil((new Date(t.due+'T23:59:59')-now)/86400000):99;const logs=state.sessions.filter(s=>s.task===t.id||state.tasks.find(x=>x.id===s.task)?.goals.some(g=>t.goals.includes(g)));const last=logs.length?Math.max(...logs.map(s=>Date.parse(s.at))):Date.parse(t.created);const days=Math.max(0,(now-last)/86400000);const main=t.goals.some(g=>state.goals.find(x=>x.id===g)?.primary);const points=(4-t.priority)*20+(due<=1?90:due<=3?40:0)+Math.min(days,7)*6+(main?20:0)+(state.settings.energy==='很好'&&t.load==='高'?15:0);return {...t,score:points,estimate:estimate(state,t),reason:[due<=3?'临近或超过截止日期':null,main?'推进当前主目标':null,days>=3?'这条目标近期缺少推进':null,state.settings.energy==='低'?'按低精力安排':'匹配当前精力'].filter(Boolean).join(' · ')};};
 const ranked=active.map(rank).sort((a,b)=>b.score-a.score);let left=budget;const core=[];
 for(const t of ranked.filter(t=>t.kind==='核心')){const minimum=state.settings.energy==='低'&&t.load==='高';const duration=minimum?Math.min(15,t.estimate):t.estimate;if(duration<=left&&core.length<3){core.push({...t,duration,minimumAction:t.minimum,minimum});left-=duration;}}
 const quick=[];for(const t of ranked.filter(t=>t.kind==='轻量'))if(t.estimate<=left){quick.push(t);left-=t.estimate;}
 const urgent=ranked.filter(t=>t.due&&t.due<=day(now));const risk=urgent.reduce((a,t)=>a+t.estimate,0)>budget;
 return {core,quick,budget,risk,urgent,unscheduled:ranked.filter(t=>!core.some(c=>c.id===t.id)&&!quick.some(c=>c.id===t.id))};
}
export function mastery(t,independent,hints,passed,sessions){if(t.domain!=='学习')return '不适用';if(!passed)return '待补弱';if(!independent||hints>0)return '需独立复测';const previous=sessions.some(s=>s.task===t.id&&(!t.learningResetAt||Date.parse(s.at)>=Date.parse(t.learningResetAt))&&s.passed&&s.independent&&s.hints===0&&(Date.now()-Date.parse(s.at))>=2*86400000);return previous?'已验收':'待间隔复测';}
export const pythonExercise={
 name:'找出列表中的最大值',template:'python-find-max-v1',
 steps:['在电脑中新建 find_max.py，先独立实现函数','运行给定测试，检查实际输出','记录结果；需要帮助时再查看提示'],
 materials:'Python 官方教程：https://docs.python.org/zh-cn/3/tutorial/',lesson:'',
 criteria:'不用 max() 或排序；通过正常、单元素、全负数及空列表测试。能解释自己的实现。',
 minimum:'新建 find_max.py，写下 def find_max(nums):，先尝试十分钟。',
 exercise:{file:'find_max.py',prompt:'接收一个数字列表，返回其中最大的数字。空列表返回 None。为了练习遍历，暂不使用 max() 或排序。',
 starter:'def find_max(nums):\n    # 在这里写你的实现\n    pass',
 tests:'assert find_max([1, 5, 3]) == 5\nassert find_max([7]) == 7\nassert find_max([-5, -2, -9]) == -2\nassert find_max([]) is None\nprint("全部测试通过")',
 help:[{title:'提示 1',text:'如果暂时只看过列表的一部分，你需要记住什么，才能继续比较下一个数？'},
 {title:'提示 2',text:'先处理空列表。对于非空列表，可以把第一个数当作目前最大的数，再逐个比较剩余数字。不要从 0 开始，否则全负数会出错。'},
 {title:'相关知识讲解',text:'用 if not nums 判断空列表；nums[0] 取第一个元素；for num in nums[1:] 遍历剩余元素。变量可以保存当前比较结果，return 返回函数结果。'},
 {title:'参考实现',text:'def find_max(nums):\n    if not nums:\n        return None\n    largest = nums[0]\n    for num in nums[1:]:\n        if num > largest:\n            largest = num\n    return largest'}]}
};
export function seed(state){
 const goal={id:uid(),name:'Python 基础：建立独立解题能力',primary:true,focus:'列表遍历与边界处理',route:['变量、条件与循环','列表与函数','字典与文件','异常处理','完成一个小工具'],stage:0};state.goals.forEach(g=>g.primary=false);state.goals.push(goal);
 state.tasks.push({...structuredClone(pythonExercise),id:uid(),domain:'学习',kind:'核心',goals:[goal.id],project:'',minutes:30,priority:1,due:'',load:'高',status:'待办',created:new Date().toISOString(),checked:[],mastery:'未验收'});
 ensureMilestones(state);
}
export function spentToday(state,now=new Date()){return state.sessions.filter(s=>day(new Date(s.at))===day(now)).reduce((sum,s)=>sum+s.minutes,0);}
export function reviewPending(t){return t.domain==='学习'&&t.status==='完成'&&['待补弱','需独立复测','待间隔复测'].includes(t.mastery);}
export function reviewReady(t,now=new Date()){return reviewPending(t)&&(!t.reviewAt||Date.parse(t.reviewAt)<=now.getTime());}
export function normalize(state){
 let changed=false;
 if(state.settings.day!==day()){state.settings={...state.settings,day:day(),energy:'正常',minutes:120};changed=true;}
 if(!state.settings.budgetVersion){state.settings.minutes+=spentToday(state);state.settings.budgetVersion=1;changed=true;}
 return changed;
}
