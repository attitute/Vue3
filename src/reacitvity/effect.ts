export const effect = (fn, options= {})=>{
    
  // 需要让传递来的fn 变成响应式的effect， 数据有变化这个fn就执行
  const effect = createReactiveEffect(fn);
  effect()
}

export const effectStack:any = []
function createReactiveEffect(fn){
  const effect = function reactiveEffect(){
    effectStack.push(effect)
    fn()
  }
  return effect
}