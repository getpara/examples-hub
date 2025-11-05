export function autoBind(instance) {
  let proto = instance;

  while (proto && proto !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(proto)) {
      const value = instance[key];

      if (typeof value === 'function' && key !== 'constructor') {
        try {
          instance[key] = value.bind(instance);
        } catch {
          // continue
        }
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
}
