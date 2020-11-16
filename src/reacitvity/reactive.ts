import { isObject } from "../shared";
import { mutableHandlers } from "./baseHandlers";



export const reactive = (target:Object)=>{
   
    // 将对象变成响应式对象
    // 在vue2.0 defineProprety直接循环对象中的每一个属性，无法对不存在的属性做处理，还需要递归处理多级对象

    // vue3 proxy直接代理原对象 不需要循环监控各个属性 能监控到不存在的属性

    return createReactiveObject(target, mutableHandlers); // 高阶函数， 可以根据不同的参数实现不同的功能

}

const reactiveMap = new WeakMap() // 看MDN key必须是对象 对象引用被清空也不存在内存泄漏问题
// tsconfig.json配置 noImplicitAny:false 不写类型默认就是any
function createReactiveObject(target:Object, baseHandler){
    if(!isObject(target)) {
        return target
    }
    // 如果对象已经被代理 就不需要再次代理
    let existProxy = reactiveMap.get(target)

    if(existProxy){
        return existProxy
    }

    const proxy = new Proxy(target,baseHandler)
    reactiveMap.set(target, proxy)
    return proxy
}