export class Registry {
  dependencies: Map<string, any> = new Map();

  private static instance: Registry;

  private constructor() {}

  static getInstance(): Registry {
    if (!Registry.instance) {
      Registry.instance = new Registry();
    }
    return Registry.instance;
  }

  register(name: string, dependency: any) {
    this.dependencies.set(name, dependency);
  }

  get(name: string) {
    const dependency = this.dependencies.get(name);
    if (!dependency) throw new Error(`Dependency ${name} not found`);
    return dependency;
  }
}

export function inject(name: string) {
  return function (target: any, propertyKey: string) {
    target[propertyKey] = new Proxy({}, {
      get: function (_, property: string) {
        return Registry.getInstance().get(name)[property];
      }
    })
  }
}
