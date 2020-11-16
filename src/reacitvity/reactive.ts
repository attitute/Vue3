


const mutableHandlers = {
    get(){},
    set(){}
}


export const reactive = (target:Object)=>{
   
    // 将对象变成响应式对象

    // 在vue2.0 defineProprety直接循环对象中的每一个属性，无法对不存在的属性做处理，还需要递归处理多级对象

    // vue3 proxy直接代理原对象 不需要循环监控各个属性 能监控到不存在的属性

    return createReactiveObject(target, mutableHandlers); // 高阶函数， 可以根据不同的参数实现不同的功能




}

function createReactiveObject(target:Object, baseHandler){

}