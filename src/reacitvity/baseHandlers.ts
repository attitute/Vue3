
// Proxy 和 Reflect连用( reflect会取代object一系列的方法)

import { track } from "../reacitvity/effect";
import { hasChange, hasOwn, isArray, isObject } from "../shared";
import { activeEffect, effectStack } from "./effect"
import { reactive } from "./reactive";

export const mutableHandlers = {
  // 当取值时 应该将effect存起来
  get(target, key, recevier){
    // return target[key] 等价
    let res = Reflect.get(target,key,recevier)
    track(target, key) // 属性和effect之间关联
    // 如果对象是响应式 那么再次变成响应式
    return isObject(res) ? reactive(res) : res
  },
  // 设置值 通知对应的effect更新
  set(target, key, value, recevier){
    const oldValue = target[key]
    // 修改值还是更新值
    const hadKey = isArray(target) && (parseInt(key,10) == key) ? Number(key) < target.length : hasOwn(target,key)
    // target[key] = value 等价
    let result = Reflect.set(target, key, value, recevier);

    if(!hadKey){
      // trigger(target,'add',key,value) // 新增操作
    }else if(hasChange(oldValue,value)) { // 判断对象值有咩有修改
      // trigger(target,'set',key,value) // 修改操作
    }
    return result
  }
}