import { isArray } from "../shared";

export const effect = (fn, options= {})=>{
    
  // 需要让传递来的fn 变成响应式的effect， 数据有变化这个fn就执行
  const effect = createReactiveEffect(fn);
  effect() // 默认更新一次
}

export const effectStack:any = [] // 为了让当前effect与属性对应上
export let activeEffect:Object // 储存当前的effect
function createReactiveEffect(fn){
  const effect = function reactiveEffect(){
    if (!effectStack.includes(effect)){ // 同一个effect 不执行
      try{
        effectStack.push(effect)
        activeEffect = effect
        return fn() // 让函数执行
      }finally{
        effectStack.pop()
        activeEffect = effectStack[effectStack.length-1]
      }
    }
  }
  return effect
}

const targetMap = new WeakMap() // 好处之前reactive就说过了 弱引用

// 建立属性与effect之间的关联
// {target:{key:[effect集合]}} target是属性 对应的也是一个映射表
export function track(target, key) {
  if(activeEffect == undefined)return // 当前没有effect 不需要收集
  let depsMap = targetMap.get(target) // WeakMap ：弱引用（外层结束里层自动销毁） 属性名能存对象 没内存泄漏
  if (!depsMap){ // 判断target
    targetMap.set(target,(depsMap = new Map())) // 不需要wakeMap套wakeMap
  }
  let dep = depsMap.get(key)
  if (!dep){ // 判断key
    depsMap.set(key,(dep = new Set())) // 使用set原因 set是不会有相同值的数组
  }
  if (!dep.has(activeEffect)){ // 判断是否有effect集合
    dep.add(activeEffect)
  }
  console.log(targetMap)
}

function run (effects){
  if(effects) effects.forEach(effect=>effect()) 
}

export function trigger(target, type, key, value) {
  const depsMap = targetMap.get(target)
  // console.log(depsMap)
  if (!depsMap) return // 属性变化 但没有依赖 直接 跳过

  if(key == 'length' && isArray(target)){ // 只要改了length就触发
    depsMap.forEach((dep,key)=>{ // map的foreach方法 第一个是值第二个是属性名
      if(key == 'length' || key >= value){ // 依赖中的key大于当前赋值 即更新（length 如果比取值小才会有影响）
        run(dep)
    }
    })

  }else {
    if(key != undefined) { // 只要key存在 并且收集过依赖
      let effects = depsMap.get(key)
      run(effects)
    }

    switch (type){
      case 'add': // 添加属性
        if(isArray(target)){
          if(parseInt(key) == key){ 
            run(depsMap.get('length')) // 数组通过索引 新增值 触发length变化
          }
        }
        break;
    }
  }
}