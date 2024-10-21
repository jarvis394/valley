// Borrowed/modified from https://github.com/jenseng/abuse-the-platform/blob/2993a7e846c95ace693ce61626fa072174c8d9c7/app/utils/singleton.ts

/**
 * Remembers and retrieves a value by a given name, or the value generated by `getValue` if the name doesn't exist.
 * The return type is inferred from the return type of `getValue`.
 *
 * @template Value
 * @param {string} name - The name under which to remember the value.
 * @param {() => Value} getValue - The function that generates the value to remember.
 * @returns {Value} - The remembered value.
 */
export function remember<Value>(name: string, getValue: () => Value): Value {
  const thusly = globalThis as unknown as {
    __valley_remember: Map<string, Value>
  }
  thusly.__valley_remember ??= new Map()
  if (!thusly.__valley_remember.has(name)) {
    thusly.__valley_remember.set(name, getValue())
  }
  return thusly.__valley_remember.get(name) as Value
}

/**
 * Forgets a remembered value by a given name. Does not throw if the name doesn't exist.
 *
 * @param {string} name - The name under which the value was remembered.
 * @return {boolean} - A remembered value existed and has been forgotten.
 */
export function forget(name: string): boolean {
  const thusly = globalThis as unknown as {
    __valley_remember: Map<string, unknown>
  }
  thusly.__valley_remember ??= new Map()
  return thusly.__valley_remember.delete(name)
}
