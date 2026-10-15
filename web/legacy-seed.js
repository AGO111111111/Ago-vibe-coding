export function legacySeed(state){
 const goal={id:uid(),name:'Java 基础：建立独立解题能力',primary:true,focus:'数组遍历与边界处理',route:['数组与循环','方法与对象','集合与异常','数据库','Spring Boot'],stage:0};state.goals.push(goal);
 state.tasks.push({id:uid(),name:'独立实现数组最大值',domain:'学习',kind:'核心',goals:[goal.id],project:'',minutes:30,priority:1,due:'',load:'高',status:'待办',created:new Date().toISOString(),steps:['阅读任务中的短讲解','先写正常数组、单元素、负数数组三个测试','独立实现方法并运行测试','记录错误与下一次复测时间'],checked:[],materials:'Oracle Java 数组教程：https://docs.oracle.com/javase/tutorial/java/nutsandbolts/arrays.html',lesson:'数组下标从 0 开始，最后一个下标是 length - 1。求最大值时，用第一个元素初始化 max，再从下标 1 开始比较，避免全负数数组被错误地返回 0。调用前检查空数组，并明确约定抛出异常或返回其他结果。示例：int max = values[0]; for (int i = 1; i < values.length; i++) { if (values[i] > max) max = values[i]; }',criteria:'独立写出实现；通过正常、单元素、全负数三个测试；解释空数组如何处理。',minimum:'打开编辑器，写出方法签名和一个测试数组。',mastery:'未验收'});
}

import {uid} from "./model.js";
