

export const isObject = (val:unknown):val is Object => typeof val === 'object' && val !== null

export const isArray = (val:unknown):val is [] => Array.isArray(val)

export const hasOwn = (target:unknown,key)=> Object.prototype.hasOwnProperty.call(target,key)

export const hasChange = (oldv,nv)=> oldv !== nv