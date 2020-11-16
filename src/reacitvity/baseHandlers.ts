
// Proxy 和 Reflect连用( reflect会取代object一系列的方法)

import { effectStack } from "./effect"

export const mutableHandlers = {
  // 当取值时 应该将effect存起来
  get(target, key, recevier){
    // return target[key] 等价
    return Reflect.get(target,key,recevier)
  },
  // 设置值 通知对应的effect更新
  set(target, key, value, recevier){
    let result = Reflect.set(target, key, value, recevier);
    effectStack.forEach(effect=>effect()) // 每次设置值执行一次reffect
    // target[key] = value 等价
    console.log(result)
    return result
    console.log('set')
  }
}