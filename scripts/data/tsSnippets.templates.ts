import type { SnippetTemplate } from './snippet.templates'

export const TS_SNIPPET_TEMPLATES: SnippetTemplate[] = [
    {
        title: 'Generic API Client with Type Safety',
        description: 'A singleton API client with typed GET/POST responses. Usage: const api = ApiClient.getInstance("https://api"); api.get<User>("/me")',
        code: `interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

class ApiClient {
  private static instance: ApiClient;
  private baseURL: string;

  private constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  static getInstance(baseURL: string): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(baseURL);
    }
    return ApiClient.instance;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(\`\${this.baseURL}\${endpoint}\`);
    return response.json();
  }

  async post<T, U>(endpoint: string, data: U): Promise<ApiResponse<T>> {
    const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['api', 'utilities'],
    },
    {
        title: 'Type-Safe Event Emitter',
        description: 'Typed event emitter with on, emit, and off methods. Usage: emitter.on("userLogin", data => data.userId)',
        code: `type EventMap = Record<string, any>;

class TypedEventEmitter<T extends EventMap> {
  private listeners: Map<keyof T, Set<(data: T[keyof T]) => void>> = new Map();

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as (data: T[keyof T]) => void);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener as (data: T[keyof T]) => void);
    }
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['events', 'utilities'],
    },
    {
        title: 'Discriminated Union Result Type',
        description: 'Result type for success/error outcomes with a type guard. Usage: if (isSuccess(result)) { ... }',
        code: `type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return { success: false, error: new Error('Division by zero') };
  }
  return { success: true, data: a / b };
}

function handleDivide(result: Result<number>) {
  if (result.success) {
    console.log('Result:', result.data);
  } else {
    console.error('Error:', result.error.message);
  }
}

function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success === true;
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['types', 'utilities'],
    },
    {
        title: 'Generic Repository Pattern',
        description: 'A typed repository interface with an in-memory implementation. Usage: const repo = new InMemoryRepository<User>()',
        code: `interface Entity {
  id: string | number;
}

interface Repository<T extends Entity> {
  findById(id: T['id']): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: T['id'], data: Partial<T>): Promise<T | null>;
  delete(id: T['id']): Promise<boolean>;
}

class InMemoryRepository<T extends Entity> implements Repository<T> {
  private items: Map<T['id'], T> = new Map();

  async findById(id: T['id']): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.items.values());
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const id = Date.now() as T['id'];
    const item = { ...data, id } as T;
    this.items.set(id, item);
    return item;
  }

  async update(id: T['id'], data: Partial<T>): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...data };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: T['id']): Promise<boolean> {
    return this.items.delete(id);
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['data', 'backend'],
    },
    {
        title: 'Conditional Types for API Responses',
        description: 'Typed response shapes by HTTP status with a unified handler. Usage: const res = createResponse(data, 200)',
        code: `type ApiResponse<T, Status extends number> = {
  data: T;
  status: Status;
  timestamp: string;
};

type SuccessResponse<T> = ApiResponse<T, 200 | 201 | 204>;
type ErrorResponse = ApiResponse<{ message: string; code: string }, 400 | 401 | 403 | 404 | 500>;

type HandlerResponse<T> = SuccessResponse<T> | ErrorResponse;

function createResponse<T, S extends number>(
  data: T,
  status: S,
  isError: boolean = status >= 400
): HandlerResponse<T> {
  return {
    data,
    status,
    timestamp: new Date().toISOString(),
    ...(isError && { error: true }),
  } as HandlerResponse<T>;
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['api', 'types'],
    },
    {
        title: 'Generic Form Validator with Type Inference',
        description: 'Rule-based validator with inferred field types. Usage: validator.validate(formData)',
        code: `interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

class FormValidator<T extends Record<string, any>> {
  private errors: Partial<Record<keyof T, string[]>> = {};

  constructor(private rules: ValidationRules<T>) {}

  validate(data: T): boolean {
    this.errors = {};
    let isValid = true;

    (Object.keys(this.rules) as Array<keyof T>).forEach(field => {
      const fieldRules = this.rules[field];
      const value = data[field];

      fieldRules?.forEach(rule => {
        if (!rule.validate(value)) {
          if (!this.errors[field]) this.errors[field] = [];
          this.errors[field]!.push(rule.message);
          isValid = false;
        }
      });
    });

    return isValid;
  }

  getErrors(): Partial<Record<keyof T, string[]>> {
    return this.errors;
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['validation', 'utilities'],
    },
    {
        title: 'Type-Safe Local Storage',
        description: 'Typed localStorage wrapper. Usage: storage.set("theme", "dark")',
        code: `class TypedStorage<T extends Record<string, any>> {
  constructor(private storage: Storage = localStorage) {}

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.storage.setItem(key as string, JSON.stringify(value));
  }

  get<K extends keyof T>(key: K): T[K] | null {
    const item = this.storage.getItem(key as string);
    return item ? JSON.parse(item) : null;
  }

  remove<K extends keyof T>(key: K): void {
    this.storage.removeItem(key as string);
  }

  clear(): void {
    this.storage.clear();
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['storage', 'frontend'],
    },
    {
        title: 'Generic Debounce with Type Preservation',
        description: 'Debounce while preserving parameter and this types. Usage: const debounced = debounce(fn, 300)',
        code: `function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(context, args);
      timeout = null;
    }, wait);
  };
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['performance', 'utilities'],
    },
    {
        title: 'Dependency Injection Container',
        description: 'Lightweight DI container with factories and singleton support. Usage: container.registerClass(UserService, UserService, true)',
        code: `type Token<T> = string | symbol | { new (...args: any[]): T };

interface Factory<T> {
  (container: Container): T;
}

class Container {
  private instances = new Map<Token<any>, any>();
  private factories = new Map<Token<any>, Factory<any>>();
  private singletons = new Set<Token<any>>();

  register<T>(token: Token<T>, factory: Factory<T>, singleton: boolean = false): void {
    this.factories.set(token, factory);
    if (singleton) {
      this.singletons.add(token);
    }
  }

  registerClass<T>(token: Token<T>, Class: { new (...args: any[]): T }, singleton: boolean = false): void {
    this.register(token, () => this.construct(Class), singleton);
  }

  resolve<T>(token: Token<T>): T {
    if (this.singletons.has(token)) {
      if (!this.instances.has(token)) {
        const factory = this.factories.get(token);
        if (!factory) {
          throw new Error(\`No factory registered for token: \${String(token)}\`);
        }
        this.instances.set(token, factory(this));
      }
      return this.instances.get(token);
    }

    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(\`No factory registered for token: \${String(token)}\`);
    }

    return factory(this);
  }

  private construct<T>(Class: { new (...args: any[]): T }): T {
    const paramTypes = Reflect.getMetadata('design:paramtypes', Class) || [];
    const dependencies = paramTypes.map((param: Token<any>) => this.resolve(param));
    return new Class(...dependencies);
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['architecture', 'backend'],
    },
    {
        title: 'Type-Safe Redux-like State Manager',
        description: 'Typed store with reducers, dispatch, and selectors. Usage: store.addReducer("USER_LOGIN", reducer)',
        code: `type Action<T = any> = {
  type: string;
  payload?: T;
};

type Reducer<S, A extends Action = Action> = (state: S, action: A) => S;
type Selector<S, R> = (state: S) => R;

class Store<T extends Record<string, any>> {
  private state: T;
  private reducers: Map<string, Reducer<any>> = new Map();
  private subscribers: Set<(state: T) => void> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  addReducer<K extends keyof T & string>(actionType: string, reducer: Reducer<T[K]>): void {
    this.reducers.set(actionType, reducer);
  }

  dispatch<A extends Action>(action: A): void {
    const reducer = this.reducers.get(action.type);

    if (reducer) {
      const stateKey = this.getStateKeyForAction(action.type);
      if (stateKey) {
        const currentSlice = this.state[stateKey];
        const newSlice = reducer(currentSlice, action);

        if (currentSlice !== newSlice) {
          this.state = {
            ...this.state,
            [stateKey]: newSlice,
          };
          this.notifySubscribers();
        }
      }
    }
  }

  private getStateKeyForAction(actionType: string): keyof T | null {
    return (Object.keys(this.state).find(key =>
      actionType.startsWith(key.toUpperCase())
    ) as keyof T) || null;
  }

  select<R>(selector: Selector<T, R>): R {
    return selector(this.state);
  }

  subscribe(callback: (state: T) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(cb => cb(this.state));
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['state', 'frontend'],
    },
    {
        title: 'Advanced Generic Mapper',
        description: 'Define mappings between source and target types. Usage: ObjectMapper.createMap<UserEntity, UserDTO>(...)',
        code: `type Mapper<TSource, TTarget> = {
  [K in keyof TTarget]: (source: TSource) => TTarget[K];
};

class ObjectMapper {
  private static mappings = new Map<string, Mapper<any, any>>();

  static createMap<TSource, TTarget>(
    sourceType: string,
    targetType: string,
    mapper: Mapper<TSource, TTarget>
  ): void {
    const key = \`\${sourceType}_TO_\${targetType}\`;
    this.mappings.set(key, mapper);
  }

  static map<TSource, TTarget>(source: TSource, sourceType: string, targetType: string): TTarget {
    const key = \`\${sourceType}_TO_\${targetType}\`;
    const mapper = this.mappings.get(key) as Mapper<TSource, TTarget> | undefined;

    if (!mapper) {
      throw new Error(\`No mapping found for \${sourceType} to \${targetType}\`);
    }

    const result = {} as TTarget;

    (Object.keys(mapper) as Array<keyof TTarget>).forEach(key => {
      const mapFn = mapper[key];
      result[key] = mapFn(source);
    });

    return result;
  }

  static mapArray<TSource, TTarget>(sources: TSource[], sourceType: string, targetType: string): TTarget[] {
    return sources.map(source => this.map(source, sourceType, targetType));
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['data', 'utilities'],
    },
    {
        title: 'Type-Safe Event Bus with Middleware',
        description: 'Typed event bus with middleware and async handling. Usage: eventBus.on("userLoggedIn", handler, { async: true })',
        code: `type EventHandler<T = any> = (event: T) => void | Promise<void>;
type Middleware<T = any> = (event: T, next: () => void) => void;

interface EventBusConfig {
  async?: boolean;
  once?: boolean;
}

class TypedEventBus<T extends Record<string, any>> {
  private handlers: Map<keyof T, Set<EventHandler<any>>> = new Map();
  private middleware: Middleware[] = [];
  private config: Map<keyof T, EventBusConfig> = new Map();

  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>, config?: EventBusConfig): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    this.handlers.get(event)!.add(handler);

    if (config) {
      this.config.set(event, { ...this.config.get(event), ...config });
    }

    return () => this.off(event, handler);
  }

  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): () => void {
    const wrappedHandler = async (data: T[K]) => {
      await handler(data);
      this.off(event, wrappedHandler);
    };

    return this.on(event, wrappedHandler, { once: true });
  }

  off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  use(middleware: Middleware): void {
    this.middleware.push(middleware);
  }

  async emit<K extends keyof T>(event: K, data: T[K]): Promise<void> {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    const config = this.config.get(event) || {};
    const emitToHandler = async (handler: EventHandler<T[K]>) => {
      const runMiddleware = (index: number) => {
        if (index < this.middleware.length) {
          this.middleware[index](data, () => runMiddleware(index + 1));
        } else {
          handler(data);
        }
      };

      if (config.async) {
        await Promise.resolve(runMiddleware(0));
      } else {
        runMiddleware(0);
      }
    };

    const promises = Array.from(handlers).map(handler => emitToHandler(handler));

    if (config.async) {
      await Promise.all(promises);
    }
  }

  clearEvent<K extends keyof T>(event: K): void {
    this.handlers.delete(event);
    this.config.delete(event);
  }

  clearAll(): void {
    this.handlers.clear();
    this.config.clear();
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['events', 'architecture'],
    },
    {
        title: 'Generic State Machine',
        description: 'A typed finite state machine with transitions. Usage: machine.send("process")',
        code: `type StateMachineConfig<TState extends string, TEvent extends string> = {
  initialState: TState;
  states: {
    [K in TState]: {
      on: {
        [K2 in TEvent]?: {
          target: TState;
          action?: (context: any) => void;
        };
      };
    };
  };
};

class StateMachine<TState extends string, TEvent extends string> {
  private currentState: TState;
  private context: any;
  private listeners: Set<(state: TState) => void> = new Set();

  constructor(private config: StateMachineConfig<TState, TEvent>, initialContext: any = {}) {
    this.currentState = config.initialState;
    this.context = initialContext;
  }

  send(event: TEvent): boolean {
    const stateConfig = this.config.states[this.currentState];
    const transition = stateConfig.on[event];

    if (!transition) {
      return false;
    }

    this.currentState = transition.target;

    if (transition.action) {
      transition.action(this.context);
    }

    this.listeners.forEach(listener => listener(this.currentState));

    return true;
  }

  can(event: TEvent): boolean {
    return !!this.config.states[this.currentState].on[event];
  }

  getState(): TState {
    return this.currentState;
  }

  getContext(): any {
    return { ...this.context };
  }

  updateContext(updater: (context: any) => any): void {
    this.context = updater(this.context);
  }

  onStateChange(listener: (state: TState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['state', 'architecture'],
    },
    {
        title: 'Advanced Type Predicates with Custom Guards',
        description: 'Utility type guards for safe runtime checks. Usage: if (TypeGuards.isJSON(value)) { ... }',
        code: `type Primitive = string | number | boolean | null | undefined;
type JSONValue = Primitive | JSONValue[] | { [key: string]: JSONValue };

class TypeGuards {
  static isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  static isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  static isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  }

  static isNull(value: unknown): value is null {
    return value === null;
  }

  static isUndefined(value: unknown): value is undefined {
    return value === undefined;
  }

  static isArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] {
    if (!Array.isArray(value)) return false;
    if (!itemGuard) return true;
    return value.every(item => itemGuard(item));
  }

  static isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  static isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  static isPromise<T = unknown>(value: unknown): value is Promise<T> {
    return value instanceof Promise || (
      TypeGuards.isObject(value) &&
      typeof (value as any).then === 'function'
    );
  }

  static isJSON(value: unknown): value is JSONValue {
    if (value === null) return true;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return true;
    }
    if (Array.isArray(value)) {
      return value.every(item => this.isJSON(item));
    }
    if (typeof value === 'object') {
      return Object.values(value as object).every(val => this.isJSON(val));
    }
    return false;
  }

  static hasProperty<K extends string>(obj: unknown, prop: K): obj is Record<K, unknown> {
    return TypeGuards.isObject(obj) && prop in obj;
  }

  static hasProperties<T extends string>(obj: unknown, props: T[]): obj is Record<T, unknown> {
    return TypeGuards.isObject(obj) && props.every(prop => prop in obj);
  }

  static isOfType<T>(value: unknown, typeGuard: (value: unknown) => value is T): value is T {
    return typeGuard(value);
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['types', 'utilities'],
    },
    {
        title: 'Generic Cache with TTL and Invalidation',
        description: 'In-memory cache with TTL, size limit, and eviction policies. Usage: cache.getOrSet("user:1", () => user)',
        code: `interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  invalidationPolicy?: 'lru' | 'lfu' | 'fifo';
}

class TypedCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>();
  private readonly ttl: number;
  private readonly maxSize: number;
  private readonly policy: Required<CacheOptions>['invalidationPolicy'];

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl || 5 * 60 * 1000;
    this.maxSize = options.maxSize || 100;
    this.policy = options.invalidationPolicy || 'lru';
  }

  set(key: K, value: V, customTtl?: number): void {
    this.ensureCapacity();

    const entry: CacheEntry<V> = {
      value,
      expiresAt: Date.now() + (customTtl || this.ttl),
      createdAt: Date.now(),
      hits: 0,
    };

    this.cache.set(key, entry);
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    entry.hits++;
    return entry.value;
  }

  getOrSet(key: K, factory: () => V, customTtl?: number): V {
    const existing = this.get(key);
    if (existing !== undefined) return existing;

    const value = factory();
    this.set(key, value, customTtl);
    return value;
  }

  async getOrSetAsync(key: K, factory: () => Promise<V>, customTtl?: number): Promise<V> {
    const existing = this.get(key);
    if (existing !== undefined) return existing;

    const value = await factory();
    this.set(key, value, customTtl);
    return value;
  }

  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  keys(): K[] {
    this.cleanup();
    return Array.from(this.cache.keys());
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  private ensureCapacity(): void {
    if (this.cache.size < this.maxSize) return;

    this.cleanup();

    if (this.cache.size < this.maxSize) return;

    const entries = Array.from(this.cache.entries());

    switch (this.policy) {
      case 'lru':
        entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
        break;
      case 'lfu':
        entries.sort((a, b) => a[1].hits - b[1].hits);
        break;
      case 'fifo':
        entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
        break;
    }

    const toRemove = entries.slice(0, Math.ceil(this.maxSize * 0.2));
    toRemove.forEach(([key]) => this.cache.delete(key));
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestEntry: number | null;
  } {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, e) => sum + e.hits, 0);
    const totalEntries = entries.length;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalEntries > 0 ? totalHits / totalEntries : 0,
      oldestEntry: entries.length > 0
        ? Math.min(...entries.map(e => e.createdAt))
        : null,
    };
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['performance', 'data'],
    },
    {
        title: 'Type-Safe Event Sourcing',
        description: 'Event sourcing core with aggregates and in-memory store. Usage: account.openAccount("acc-123")',
        code: `type DomainEvent<T = any> = {
  type: string;
  data: T;
  timestamp: Date;
  version: number;
  aggregateId: string;
};

interface EventStore {
  saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
}

class InMemoryEventStore implements EventStore {
  private events: DomainEvent[] = [];

  async saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void> {
    const existingEvents = await this.getEvents(aggregateId);

    if (existingEvents.length !== expectedVersion) {
      throw new Error('Concurrency conflict');
    }

    this.events.push(...events);
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return this.events.filter(e => e.aggregateId === aggregateId);
  }
}

abstract class AggregateRoot<TState> {
  private changes: DomainEvent[] = [];
  protected state!: TState;
  protected version: number = 0;

  protected abstract applyEvent(event: DomainEvent): void;

  protected applyChange(event: DomainEvent): void {
    this.applyEvent(event);
    this.changes.push(event);
  }

  getChanges(): DomainEvent[] {
    return [...this.changes];
  }

  getVersion(): number {
    return this.version;
  }

  loadFromHistory(events: DomainEvent[]): void {
    events.forEach(event => {
      this.applyEvent(event);
      this.version++;
    });
  }

  clearChanges(): void {
    this.changes = [];
  }
}

interface AccountEventData {
  accountId: string;
  amount: number;
}

class AccountAggregate extends AggregateRoot<{ balance: number }> {
  constructor() {
    super();
    this.state = { balance: 0 };
  }

  protected applyEvent(event: DomainEvent): void {
    switch (event.type) {
      case 'AccountOpened':
        this.state.balance = 0;
        break;
      case 'MoneyDeposited':
        this.state.balance += (event.data as AccountEventData).amount;
        break;
      case 'MoneyWithdrawn':
        this.state.balance -= (event.data as AccountEventData).amount;
        break;
    }
  }

  openAccount(accountId: string): void {
    this.applyChange({
      type: 'AccountOpened',
      data: { accountId, amount: 0 },
      timestamp: new Date(),
      version: this.version + 1,
      aggregateId: accountId,
    });
  }

  deposit(accountId: string, amount: number): void {
    if (amount <= 0) throw new Error('Invalid amount');

    this.applyChange({
      type: 'MoneyDeposited',
      data: { amount, accountId },
      timestamp: new Date(),
      version: this.version + 1,
      aggregateId: accountId,
    });
  }

  withdraw(accountId: string, amount: number): void {
    if (amount <= 0) throw new Error('Invalid amount');
    if (this.state.balance < amount) throw new Error('Insufficient funds');

    this.applyChange({
      type: 'MoneyWithdrawn',
      data: { amount, accountId },
      timestamp: new Date(),
      version: this.version + 1,
      aggregateId: accountId,
    });
  }
}

class Repository<T extends AggregateRoot<any>> {
  constructor(private eventStore: EventStore, private aggregateType: new () => T) {}

  async save(aggregate: T): Promise<void> {
    const changes = aggregate.getChanges();
    if (changes.length === 0) return;

    await this.eventStore.saveEvents(
      changes[0].aggregateId,
      changes,
      aggregate.getVersion()
    );

    aggregate.clearChanges();
  }

  async load(aggregateId: string): Promise<T> {
    const events = await this.eventStore.getEvents(aggregateId);
    const aggregate = new this.aggregateType();
    aggregate.loadFromHistory(events);
    return aggregate;
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['architecture', 'backend'],
    },
    {
        title: 'Generic Data Pipeline with Type Transformations',
        description: 'Composable pipeline with typed steps and error handling. Usage: pipeline.addStep(...).execute(input)',
        code: `type PipelineStep<TInput, TOutput> = {
  process: (input: TInput) => TOutput | Promise<TOutput>;
  name?: string;
};

type PipelineContext = {
  metadata: Record<string, any>;
  errors: Error[];
  startTime: number;
};

class DataPipeline<TInput, TOutput> {
  private steps: Array<PipelineStep<any, any>> = [];
  private errorHandlers: Array<(error: Error, context: PipelineContext) => void> = [];
  private context: PipelineContext = {
    metadata: {},
    errors: [],
    startTime: Date.now(),
  };

  addStep<TIntermediate>(step: PipelineStep<TInput | TIntermediate, TIntermediate>): DataPipeline<TInput, TIntermediate> {
    this.steps.push(step);
    return this as any;
  }

  addErrorHandler(handler: (error: Error, context: PipelineContext) => void): this {
    this.errorHandlers.push(handler);
    return this;
  }

  withMetadata(key: string, value: any): this {
    this.context.metadata[key] = value;
    return this;
  }

  async execute(input: TInput): Promise<TOutput> {
    this.context.startTime = Date.now();
    let currentValue: any = input;

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];

      try {
        this.context.metadata[\`step_\${i}_start\`] = Date.now();

        const result = await step.process(currentValue);
        currentValue = result;

        this.context.metadata[\`step_\${i}_end\`] = Date.now();

        if (step.name) {
          this.context.metadata[\`step_\${i}_name\`] = step.name;
        }
      } catch (error) {
        const pipelineError = error instanceof Error ? error : new Error(String(error));
        this.context.errors.push(pipelineError);

        for (const handler of this.errorHandlers) {
          await handler(pipelineError, this.context);
        }

        throw new Error(\`Pipeline failed at step \${i}: \${pipelineError.message}\`);
      }
    }

    return currentValue as TOutput;
  }

  getContext(): PipelineContext {
    return { ...this.context };
  }

  reset(): void {
    this.context = {
      metadata: {},
      errors: [],
      startTime: Date.now(),
    };
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['data', 'architecture'],
    },
    {
        title: 'Advanced Builder Pattern with Type Constraints',
        description: 'SQL and Mongo query builders with typed methods. Usage: new SQLQueryBuilder().select(...).from("users")',
        code: `interface QueryBuilder<T> {
  build(): T;
}

class SQLQueryBuilder implements QueryBuilder<string> {
  private table: string = '';
  private fields: string[] = ['*'];
  private conditions: string[] = [];
  private joins: string[] = [];
  private groupByFields: string[] = [];
  private havingConditions: string[] = [];
  private orderByFields: string[] = [];
  private limitValue?: number;
  private offsetValue?: number;

  select(...fields: string[]): this {
    this.fields = fields.length ? fields : ['*'];
    return this;
  }

  from(table: string): this {
    this.table = table;
    return this;
  }

  where(condition: string, params?: Record<string, any>): this {
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        condition = condition.replace(\`:\${key}\`, this.escapeValue(value));
      });
    }
    this.conditions.push(condition);
    return this;
  }

  join(table: string, onCondition: string): this {
    this.joins.push(\`JOIN \${table} ON \${onCondition}\`);
    return this;
  }

  leftJoin(table: string, onCondition: string): this {
    this.joins.push(\`LEFT JOIN \${table} ON \${onCondition}\`);
    return this;
  }

  groupBy(...fields: string[]): this {
    this.groupByFields.push(...fields);
    return this;
  }

  having(condition: string): this {
    this.havingConditions.push(condition);
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByFields.push(\`\${field} \${direction}\`);
    return this;
  }

  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  offset(offset: number): this {
    this.offsetValue = offset;
    return this;
  }

  build(): string {
    if (!this.table) {
      throw new Error('Table name is required');
    }

    const parts: string[] = [
      \`SELECT \${this.fields.join(', ')}\`,
      \`FROM \${this.table}\`,
      ...this.joins,
    ];

    if (this.conditions.length) {
      parts.push(\`WHERE \${this.conditions.join(' AND ')}\`);
    }

    if (this.groupByFields.length) {
      parts.push(\`GROUP BY \${this.groupByFields.join(', ')}\`);
    }

    if (this.havingConditions.length) {
      parts.push(\`HAVING \${this.havingConditions.join(' AND ')}\`);
    }

    if (this.orderByFields.length) {
      parts.push(\`ORDER BY \${this.orderByFields.join(', ')}\`);
    }

    if (this.limitValue !== undefined) {
      parts.push(\`LIMIT \${this.limitValue}\`);
    }

    if (this.offsetValue !== undefined) {
      parts.push(\`OFFSET \${this.offsetValue}\`);
    }

    return parts.join(' ');
  }

  private escapeValue(value: any): string {
    if (typeof value === 'string') {
      return \`'\${value.replace(/'/g, "''")}'\`;
    }
    if (value === null || value === undefined) {
      return 'NULL';
    }
    return String(value);
  }
}

type MongoOperator = '$eq' | '$gt' | '$gte' | '$lt' | '$lte' | '$in' | '$ne';

type MongoCondition<T> = {
  [K in MongoOperator]?: T extends any[] ? T : T | T[];
};

type MongoQuery<T> = {
  [K in keyof T]?: T[K] | MongoCondition<T[K]>;
};

class MongoQueryBuilder<T extends Record<string, any>> implements QueryBuilder<MongoQuery<T>> {
  private query: MongoQuery<T> = {};
  private options: {
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
    projection?: Record<string, 1 | 0>;
  } = {};

  where<K extends keyof T>(field: K, value: T[K]): this {
    this.query[field] = value;
    return this;
  }

  whereIn<K extends keyof T>(field: K, values: T[K][]): this {
    this.query[field] = { $in: values } as any;
    return this;
  }

  whereBetween<K extends keyof T>(field: K, min: T[K], max: T[K]): this {
    this.query[field] = { $gte: min, $lte: max } as any;
    return this;
  }

  whereOperator<K extends keyof T>(
    field: K,
    operator: Exclude<MongoOperator, '$in'>,
    value: T[K]
  ): this {
    this.query[field] = { [operator]: value } as any;
    return this;
  }

  and(builders: Array<MongoQueryBuilder<T>>): this {
    const conditions = builders.map(b => b.build());
    (this.query as any)['$and'] = conditions;
    return this;
  }

  or(builders: Array<MongoQueryBuilder<T>>): this {
    const conditions = builders.map(b => b.build());
    (this.query as any)['$or'] = conditions;
    return this;
  }

  limit(limit: number): this {
    this.options.limit = limit;
    return this;
  }

  skip(skip: number): this {
    this.options.skip = skip;
    return this;
  }

  sort(field: keyof T, order: 'asc' | 'desc' = 'asc'): this {
    this.options.sort = { [field as string]: order === 'asc' ? 1 : -1 };
    return this;
  }

  select(fields: Array<keyof T>): this {
    this.options.projection = fields.reduce((acc, field) => {
      acc[field as string] = 1;
      return acc;
    }, {} as Record<string, 1>);
    return this;
  }

  build(): MongoQuery<T> {
    return {
      ...this.query,
      ...this.options,
    };
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['data', 'utilities'],
    },
    {
        title: 'Reactive Observable with Operators',
        description: 'Minimal Observable with map, filter, debounceTime, and take. Usage: Observable.from([1,2,3]).map(...)',
        code: `type Observer<T> = {
  next: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
};

type Subscription = {
  unsubscribe: () => void;
};

class Observable<T> {
  constructor(private producer: (observer: Observer<T>) => (() => void) | void) {}

  subscribe(observer: Partial<Observer<T>>): Subscription {
    let isUnsubscribed = false;
    let teardown: (() => void) | void;

    const safeObserver: Observer<T> = {
      next: (value) => {
        if (!isUnsubscribed && observer.next) {
          try {
            observer.next(value);
          } catch (err) {
            this.error(err instanceof Error ? err : new Error(String(err)));
          }
        }
      },
      error: (error) => {
        if (!isUnsubscribed && observer.error) {
          observer.error(error);
          this.complete();
        }
      },
      complete: () => {
        if (!isUnsubscribed && observer.complete) {
          observer.complete();
        }
        this.unsubscribe();
      },
    };

    try {
      teardown = this.producer(safeObserver);
    } catch (error) {
      safeObserver.error(error instanceof Error ? error : new Error(String(error)));
    }

    return {
      unsubscribe: () => {
        isUnsubscribed = true;
        if (teardown) teardown();
      },
    };
  }

  private unsubscribe(): void {}

  map<U>(fn: (value: T) => U): Observable<U> {
    return new Observable<U>((observer) => {
      const subscription = this.subscribe({
        next: (value) => observer.next(fn(value)),
        error: (err) => observer.error?.(err),
        complete: () => observer.complete?.(),
      });

      return () => subscription.unsubscribe();
    });
  }

  filter(predicate: (value: T) => boolean): Observable<T> {
    return new Observable<T>((observer) => {
      const subscription = this.subscribe({
        next: (value) => {
          if (predicate(value)) {
            observer.next(value);
          }
        },
        error: (err) => observer.error?.(err),
        complete: () => observer.complete?.(),
      });

      return () => subscription.unsubscribe();
    });
  }

  debounceTime(ms: number): Observable<T> {
    return new Observable<T>((observer) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const subscription = this.subscribe({
        next: (value) => {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => observer.next(value), ms);
        },
        error: (err) => observer.error?.(err),
        complete: () => observer.complete?.(),
      });

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        subscription.unsubscribe();
      };
    });
  }

  take(count: number): Observable<T> {
    return new Observable<T>((observer) => {
      let taken = 0;

      const subscription = this.subscribe({
        next: (value) => {
          if (taken < count) {
            taken++;
            observer.next(value);

            if (taken >= count) {
              observer.complete?.();
              subscription.unsubscribe();
            }
          }
        },
        error: (err) => observer.error?.(err),
        complete: () => observer.complete?.(),
      });

      return () => subscription.unsubscribe();
    });
  }

  static from<T>(values: T[]): Observable<T> {
    return new Observable<T>((observer) => {
      values.forEach(value => observer.next(value));
      observer.complete?.();
      return () => {};
    });
  }

  static interval(ms: number): Observable<number> {
    return new Observable<number>((observer) => {
      let count = 0;
      const id = setInterval(() => observer.next(count++), ms);

      return () => clearInterval(id);
    });
  }

  static fromEvent<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    eventName: K
  ): Observable<HTMLElementEventMap[K]> {
    return new Observable<HTMLElementEventMap[K]>((observer) => {
      const handler = (event: HTMLElementEventMap[K]) => observer.next(event);

      element.addEventListener(eventName, handler as EventListener);

      return () => element.removeEventListener(eventName, handler as EventListener);
    });
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['utilities', 'frontend'],
    },
    {
        title: 'Type-Safe WebSocket Client',
        description: 'Typed WebSocket client with reconnect, heartbeat, and request/response. Usage: client.send<Req, Res>("type", data)',
        code: `type WebSocketMessage<T = any> = {
  type: string;
  id: string;
  data: T;
  timestamp: number;
};

type MessageHandler<T> = (message: WebSocketMessage<T>) => void;

type WebSocketOptions = {
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
};

class TypedWebSocketClient {
  private ws: WebSocket | null = null;
  private messageHandlers = new Map<string, Set<MessageHandler<any>>>();
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timeout: ReturnType<typeof setTimeout>;
  }>();
  private reconnectAttempts = 0;
  private heartbeatInterval?: ReturnType<typeof setInterval>;

  constructor(private url: string, private options: WebSocketOptions = {}) {
    this.options = {
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...options,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.stopHeartbeat();

        if (this.options.reconnect) {
          this.reconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }

  send<T, R = any>(type: string, data: T, timeout: number = 5000): Promise<R> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('WebSocket not connected'));
    }

    const id = this.generateId();
    const message: WebSocketMessage<T> = {
      type,
      id,
      data,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(\`Request timeout for type: \${type}\`));
      }, timeout);

      this.pendingRequests.set(id, { resolve, reject, timeout: timeoutId });

      this.ws!.send(JSON.stringify(message));
    });
  }

  on<T>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }

    this.messageHandlers.get(type)!.add(handler);

    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  off<T>(type: string, handler: MessageHandler<T>): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  disconnect(): void {
    this.options.reconnect = false;
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const pendingRequest = this.pendingRequests.get(message.id);
    if (pendingRequest) {
      clearTimeout(pendingRequest.timeout);
      this.pendingRequests.delete(message.id);

      if (message.type === 'error') {
        pendingRequest.reject(message.data);
      } else {
        pendingRequest.resolve(message.data);
      }
      return;
    }

    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= (this.options.maxReconnectAttempts || 5)) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;

    setTimeout(() => {
      console.log(\`Reconnecting... Attempt \${this.reconnectAttempts}\`);
      this.connect().catch(() => {});
    }, this.options.reconnectInterval);
  }

  private startHeartbeat(): void {
    if (this.options.heartbeatInterval) {
      this.heartbeatInterval = setInterval(() => {
        this.send('ping', {}).catch(() => {});
      }, this.options.heartbeatInterval);
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  private generateId(): string {
    return \`\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
  }
}`,
        language: 'typescript',
        technologies: ['typescript'],
        categories: ['network', 'backend'],
    },
]
