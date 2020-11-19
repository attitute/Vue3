(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VueReactivity = {}));
}(this, (function (exports) { 'use strict';

  var isObject = function (val) { return typeof val === 'object' && val !== null; };
  var isArray = function (val) { return Array.isArray(val); };
  var hasOwn = function (target, key) { return Object.prototype.hasOwnProperty.call(target, key); };
  var hasChange = function (oldv, nv) { return oldv !== nv; };

  var effect = function (fn, options) {
      // 需要让传递来的fn 变成响应式的effect， 数据有变化这个fn就执行
      var effect = createReactiveEffect(fn);
      effect(); // 默认更新一次
  };
  var effectStack = []; // 为了让当前effect与属性对应上
  var activeEffect; // 储存当前的effect
  function createReactiveEffect(fn) {
      var effect = function reactiveEffect() {
          if (!effectStack.includes(effect)) { // 同一个effect 不执行
              try {
                  effectStack.push(effect);
                  activeEffect = effect;
                  return fn(); // 让函数执行
              }
              finally {
                  effectStack.pop();
                  activeEffect = effectStack[effectStack.length - 1];
              }
          }
      };
      return effect;
  }
  var targetMap = new WeakMap(); // 好处之前reactive就说过了 弱引用
  // 建立属性与effect之间的关联
  // {target:{key:[effect集合]}} target是属性 对应的也是一个映射表
  function track(target, key) {
      if (activeEffect == undefined)
          return; // 当前没有effect 不需要收集
      var depsMap = targetMap.get(target); // WeakMap ：弱引用（外层结束里层自动销毁） 属性名能存对象 没内存泄漏
      if (!depsMap) { // 判断target
          targetMap.set(target, (depsMap = new Map())); // 不需要wakeMap套wakeMap
      }
      var dep = depsMap.get(key);
      if (!dep) { // 判断key
          depsMap.set(key, (dep = new Set())); // 使用set原因 set是不会有相同值的数组
      }
      if (!dep.has(activeEffect)) { // 判断是否有effect集合
          dep.add(activeEffect);
      }
      console.log(targetMap);
  }
  function run(effects) {
      if (effects)
          effects.forEach(function (effect) { return effect(); });
  }
  function trigger(target, type, key, value) {
      var depsMap = targetMap.get(target);
      // console.log(depsMap)
      if (!depsMap)
          return; // 属性变化 但没有依赖 直接 跳过
      if (key == 'length' && isArray(target)) { // 只要改了length就触发
          depsMap.forEach(function (dep, key) {
              if (key == 'length' || key >= value) { // 依赖中的key大于当前赋值 即更新（length 如果比取值小才会有影响）
                  run(dep);
              }
          });
      }
      else {
          if (key != undefined) { // 只要key存在 并且收集过依赖
              var effects = depsMap.get(key);
              run(effects);
          }
          switch (type) {
              case 'add': // 添加属性
                  if (isArray(target)) {
                      if (parseInt(key) == key) {
                          run(depsMap.get('length')); // 数组通过索引 新增值 触发length变化
                      }
                  }
                  break;
          }
      }
  }

  // Proxy 和 Reflect连用( reflect会取代object一系列的方法)
  var mutableHandlers = {
      // 当取值时 应该将effect存起来
      get: function (target, key, recevier) {
          // return target[key] 等价
          var res = Reflect.get(target, key, recevier);
          track(target, key); // 属性和effect之间关联
          // 如果对象是响应式 那么再次变成响应式
          return isObject(res) ? reactive(res) : res;
      },
      // 设置值 通知对应的effect更新
      set: function (target, key, value, recevier) {
          var oldValue = target[key];
          // 修改值还是更新值
          var hadKey = isArray(target) && (parseInt(key, 10) == key) ? Number(key) < target.length : hasOwn(target, key);
          // target[key] = value 等价
          var result = Reflect.set(target, key, value, recevier);
          if (!hadKey) {
              trigger(target, 'add', key, value); // 新增操作
          }
          else if (hasChange(oldValue, value)) { // 判断对象值有咩有修改
              trigger(target, 'set', key, value); // 修改操作
          }
          return result;
      }
  };

  var reactive = function (target) {
      // 将对象变成响应式对象
      // 在vue2.0 defineProprety直接循环对象中的每一个属性，无法对不存在的属性做处理，还需要递归处理多级对象
      // vue3 proxy直接代理原对象 不需要循环监控各个属性 能监控到不存在的属性
      return createReactiveObject(target, mutableHandlers); // 高阶函数， 可以根据不同的参数实现不同的功能
  };
  var reactiveMap = new WeakMap(); // 看MDN key必须是对象 对象引用被清空也不存在内存泄漏问题
  // tsconfig.json配置 noImplicitAny:false 不写类型默认就是any
  function createReactiveObject(target, baseHandler) {
      if (!isObject(target)) {
          return target;
      }
      var existProxy = reactiveMap.get(target);
      // 如果对象已经被代理 就不需要再次代理
      if (existProxy) {
          return existProxy;
      }
      var proxy = new Proxy(target, baseHandler);
      reactiveMap.set(target, proxy);
      return proxy;
  }

  exports.effect = effect;
  exports.reactive = reactive;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=bundle.js.map
