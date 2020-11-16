(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VueReactivity = {}));
}(this, (function (exports) { 'use strict';

  var effect = function (fn, options) {
      // 需要让传递来的fn 变成响应式的effect， 数据有变化这个fn就执行
      var effect = createReactiveEffect(fn);
      effect();
  };
  var effectStack = [];
  function createReactiveEffect(fn) {
      var effect = function reactiveEffect() {
          effectStack.push(effect);
          fn();
      };
      return effect;
  }

  var isObject = function (val) { return typeof val === 'object' && val !== null; };

  // Proxy 和 Reflect连用( reflect会取代object一系列的方法)
  var mutableHandlers = {
      // 当取值时 应该将effect存起来
      get: function (target, key, recevier) {
          // return target[key] 等价
          return Reflect.get(target, key, recevier);
      },
      // 设置值 通知对应的effect更新
      set: function (target, key, value, recevier) {
          var result = Reflect.set(target, key, value, recevier);
          effectStack.forEach(function (effect) { return effect(); }); // 每次设置值执行一次reffect
          // target[key] = value 等价
          console.log(result);
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
      // 如果对象已经被代理 就不需要再次代理
      var existProxy = reactiveMap.get(target);
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
