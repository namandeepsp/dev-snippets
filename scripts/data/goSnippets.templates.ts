import type { SnippetTemplate } from './snippet.templates'

export const GO_SNIPPET_TEMPLATES: SnippetTemplate[] = [
	{
		title: 'Worker Pool Pattern',
		description:
			'Fixed-size worker pool for concurrent job processing. Usage: pool := NewPool(5); pool.Add(func() { fmt.Println("working") })',
		code: `package workerpool

type Job func()
type Pool struct {
    jobs chan Job
    done chan bool
}

func NewPool(size int) *Pool {
    p := &Pool{
        jobs: make(chan Job, 100),
        done: make(chan bool),
    }

    for i := 0; i < size; i++ {
        go func() {
            for job := range p.jobs {
                job()
            }
            p.done <- true
        }()
    }
    return p
}

func (p *Pool) Add(job Job) {
    p.jobs <- job
}

func (p *Pool) Stop() {
    close(p.jobs)
    for i := 0; i < cap(p.jobs); i++ {
        <-p.done
    }
}
// Usage: pool := NewPool(5); pool.Add(func() { fmt.Println("working") })`,
		language: 'go',
		technologies: ['golang'],
		categories: ['performance', 'backend'],
	},
	{
		title: 'Generic Filter Function',
		description:
			'Generic filter and map helpers using Go generics. Usage: adults := Filter(users, func(u User) bool { return u.Age >= 18 })',
		code: `package slicesutil

func Filter[T any](slice []T, predicate func(T) bool) []T {
    result := make([]T, 0, len(slice))
    for _, v := range slice {
        if predicate(v) {
            result = append(result, v)
        }
    }
    return result
}

func Map[T, U any](slice []T, transform func(T) U) []U {
    result := make([]U, len(slice))
    for i, v := range slice {
        result[i] = transform(v)
    }
    return result
}

// Usage: adults := Filter(users, func(u User) bool { return u.Age >= 18 })`,
		language: 'go',
		technologies: ['golang'],
		categories: ['utilities', 'data'],
	},
	{
		title: 'Rate Limiter',
		description:
			'Token-based rate limiter using time.Ticker. Usage: limiter := NewLimiter(10, time.Second)',
		code: `package ratelimit

import "time"

type Limiter struct {
    ticker *time.Ticker
    limit  chan struct{}
}

func NewLimiter(rate int, per time.Duration) *Limiter {
    l := &Limiter{
        ticker: time.NewTicker(per / time.Duration(rate)),
        limit:  make(chan struct{}),
    }

    go func() {
        for range l.ticker.C {
            l.limit <- struct{}{}
        }
    }()
    return l
}

func (l *Limiter) Wait() {
    <-l.limit
}

func (l *Limiter) Stop() {
    l.ticker.Stop()
    close(l.limit)
}
// Usage: limiter := NewLimiter(10, time.Second)`,
		language: 'go',
		technologies: ['golang'],
		categories: ['security', 'performance'],
	},
	{
		title: 'Context-Aware HTTP Client',
		description:
			'HTTP client with request context support. Usage: resp, err := client.Get(ctx, "https://api.example.com")',
		code: `package httpclient

import (
    "context"
    "net/http"
    "time"
)

type Client struct {
    httpClient *http.Client
    timeout    time.Duration
}

func NewClient(timeout time.Duration) *Client {
    return &Client{
        httpClient: &http.Client{
            Timeout: timeout,
        },
        timeout: timeout,
    }
}

func (c *Client) Get(ctx context.Context, url string) (*http.Response, error) {
    req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
    if err != nil {
        return nil, err
    }
    return c.httpClient.Do(req)
}

// Usage: resp, err := client.Get(ctx, "https://api.example.com")`,
		language: 'go',
		technologies: ['golang'],
		categories: ['network', 'api'],
	},
	{
		title: 'Semaphore Implementation',
		description:
			'Counting semaphore for limiting concurrent work. Usage: sem := NewSemaphore(5); sem.WithSemaphore(func() { /* critical section */ })',
		code: `package semaphore

type Semaphore struct {
    tokens chan struct{}
}

func NewSemaphore(size int) *Semaphore {
    return &Semaphore{
        tokens: make(chan struct{}, size),
    }
}

func (s *Semaphore) Acquire() {
    s.tokens <- struct{}{}
}

func (s *Semaphore) Release() {
    <-s.tokens
}

func (s *Semaphore) WithSemaphore(fn func()) {
    s.Acquire()
    defer s.Release()
    fn()
}
// Usage: sem := NewSemaphore(5); sem.WithSemaphore(func() { /* critical section */ })`,
		language: 'go',
		technologies: ['golang'],
		categories: ['performance', 'utilities'],
	},
	{
		title: 'Database Connection Pool Wrapper',
		description:
			'sql.DB wrapper with pool configuration and transactions. Usage: pool, _ := NewPool("pgx", dsn, 10, 5)',
		code: `package db

import (
    "database/sql"
    "time"
)

type Pool struct {
    *sql.DB
    maxOpenConns int
    maxIdleConns int
}

func NewPool(driver, dsn string, maxOpen, maxIdle int) (*Pool, error) {
    db, err := sql.Open(driver, dsn)
    if err != nil {
        return nil, err
    }

    db.SetMaxOpenConns(maxOpen)
    db.SetMaxIdleConns(maxIdle)
    db.SetConnMaxLifetime(time.Hour)

    return &Pool{DB: db, maxOpenConns: maxOpen, maxIdleConns: maxIdle}, nil
}

func (p *Pool) WithTx(fn func(*sql.Tx) error) error {
    tx, err := p.Begin()
    if err != nil {
        return err
    }

    if err := fn(tx); err != nil {
        tx.Rollback()
        return err
    }

    return tx.Commit()
}
`,
		language: 'go',
		technologies: ['golang'],
		categories: ['database', 'backend'],
	},
	{
		title: 'JWT Authentication Middleware',
		description:
			'HTTP middleware that validates JWT bearer tokens. Usage: http.Handle("/", middleware.Handler(next))',
		code: `package auth

import (
    "net/http"
    "strings"
    "github.com/golang-jwt/jwt"
)

type AuthMiddleware struct {
    secret []byte
}

func NewAuthMiddleware(secret string) *AuthMiddleware {
    return &AuthMiddleware{secret: []byte(secret)}
}

func (m *AuthMiddleware) Handler(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            http.Error(w, "missing token", http.StatusUnauthorized)
            return
        }

        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
            return m.secret, nil
        })

        if err != nil || !token.Valid {
            http.Error(w, "invalid token", http.StatusUnauthorized)
            return
        }

        next.ServeHTTP(w, r)
    })
}
`,
		language: 'go',
		technologies: ['golang'],
		categories: ['security', 'middleware'],
	},
	{
		title: 'Graceful Shutdown Handler',
		description:
			'Handle SIGINT/SIGTERM and shutdown with timeout. Usage: Graceful(func(ctx) error { return server.Shutdown(ctx) }, 30*time.Second)',
		code: `package shutdown

import (
    "context"
    "os"
    "os/signal"
    "syscall"
    "time"
)

func Graceful(shutdownFunc func(ctx context.Context) error, timeout time.Duration) {
    sigChan := make(chan os.Signal, 1)
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

    <-sigChan

    ctx, cancel := context.WithTimeout(context.Background(), timeout)
    defer cancel()

    if err := shutdownFunc(ctx); err != nil {
        os.Exit(1)
    }
    os.Exit(0)
}
// Usage: Graceful(func(ctx) error { return server.Shutdown(ctx) }, 30*time.Second)`,
		language: 'go',
		technologies: ['golang'],
		categories: ['infrastructure', 'backend'],
	},
	{
		title: 'Fan-Out/Fan-In Pattern',
		description:
			'Distribute work across workers and merge results. Usage: outputs := FanOut(input, 5); merged := FanIn(outputs...)',
		code: `package fan

func FanOut[T any](input <-chan T, workers int) []<-chan T {
    channels := make([]chan T, workers)
    outputs := make([]<-chan T, workers)

    for i := 0; i < workers; i++ {
        channels[i] = make(chan T)
        outputs[i] = channels[i]
    }

    go func() {
        defer func() {
            for _, ch := range channels {
                close(ch)
            }
        }()

        i := 0
        for val := range input {
            channels[i] <- val
            i = (i + 1) % workers
        }
    }()

    return outputs
}

func FanIn[T any](inputs ...<-chan T) <-chan T {
    output := make(chan T)

    for _, ch := range inputs {
        go func(c <-chan T) {
            for val := range c {
                output <- val
            }
        }(ch)
    }

    return output
}
// Usage: outputs := FanOut(input, 5); merged := FanIn(outputs...)`,
		language: 'go',
		technologies: ['golang'],
		categories: ['performance', 'architecture'],
	},
	{
		title: 'Simple Validator',
		description:
			'Minimal validation helper with error collection. Usage: v := New(); v.Required(req.Email, "email")',
		code: `package validator

type Validator struct {
    Errors map[string]string
}

func New() *Validator {
    return &Validator{Errors: make(map[string]string)}
}

func (v *Validator) Valid() bool {
    return len(v.Errors) == 0
}

func (v *Validator) Check(ok bool, key, message string) {
    if !ok {
        v.Errors[key] = message
    }
}

func (v *Validator) Required(value, key string) {
    v.Check(value != "", key, "this field is required")
}

func (v *Validator) MinLength(value string, min int, key string) {
    v.Check(len(value) >= min, key,
        "minimum length is "+string(rune(min)))
}
// Usage: v := New(); v.Required(req.Email, "email")`,
		language: 'go',
		technologies: ['golang'],
		categories: ['validation', 'utilities'],
	},
	{
		title: 'WebSocket Chat Hub',
		description:
			'Chat hub using Gorilla WebSocket with broadcast and clients. Usage: hub := NewHub(); go hub.Run(); http.HandleFunc("/ws", hub.HandleWebSocket)',
		code: `package chat

import (
    "encoding/json"
    "net/http"
    "sync"
    "github.com/gorilla/websocket"
)

type Hub struct {
    clients    map[*Client]bool
    broadcast  chan []byte
    register   chan *Client
    unregister chan *Client
    mu         sync.RWMutex
}

type Client struct {
    hub  *Hub
    conn *websocket.Conn
    send chan []byte
}

type Message struct {
    Type    string \`json:"type"\`
    Sender  string \`json:"sender"\`
    Content string \`json:"content"\`
    Room    string \`json:"room,omitempty"\`
}

func NewHub() *Hub {
    return &Hub{
        clients:    make(map[*Client]bool),
        broadcast:  make(chan []byte),
        register:   make(chan *Client),
        unregister: make(chan *Client),
    }
}

func (h *Hub) Run() {
    for {
        select {
        case client := <-h.register:
            h.mu.Lock()
            h.clients[client] = true
            h.mu.Unlock()

        case client := <-h.unregister:
            h.mu.Lock()
            if _, ok := h.clients[client]; ok {
                delete(h.clients, client)
                close(client.send)
            }
            h.mu.Unlock()

        case message := <-h.broadcast:
            h.mu.RLock()
            for client := range h.clients {
                select {
                case client.send <- message:
                default:
                    close(client.send)
                    delete(h.clients, client)
                }
            }
            h.mu.RUnlock()
        }
    }
}

func (h *Hub) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
    upgrader := websocket.Upgrader{
        CheckOrigin: func(r *http.Request) bool { return true },
    }

    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        return
    }

    client := &Client{
        hub:  h,
        conn: conn,
        send: make(chan []byte, 256),
    }

    h.register <- client

    go client.readPump()
    go client.writePump()
}

func (c *Client) readPump() {
    defer func() {
        c.hub.unregister <- c
        c.conn.Close()
    }()

    for {
        _, message, err := c.conn.ReadMessage()
        if err != nil {
            break
        }

        var msg Message
        if err := json.Unmarshal(message, &msg); err == nil {
            c.hub.broadcast <- message
        }
    }
}

func (c *Client) writePump() {
    defer c.conn.Close()

    for message := range c.send {
        err := c.conn.WriteMessage(websocket.TextMessage, message)
        if err != nil {
            break
        }
    }
}
// Usage: hub := NewHub(); go hub.Run(); http.HandleFunc("/ws", hub.HandleWebSocket)`,
		language: 'go',
		technologies: ['golang'],
		categories: ['network', 'backend'],
	},
	{
		title: 'Concurrent Pipeline with Stages',
		description:
			'Composable pipeline with concurrent stages. Usage: pipeline := RunPipeline(orders, StartStage, func(ch <-chan Order) <-chan Order { return ProcessStage(ch, 5) })',
		code: `package pipeline

type Stage[I, O any] func(<-chan I) <-chan O

func RunPipeline[T any](input <-chan T, stages ...Stage[T, T]) <-chan T {
    current := input

    for _, stage := range stages {
        current = stage(current)
    }

    return current
}

type Order struct {
    ID    int
    State string
}

func StartStage(input <-chan Order) <-chan Order {
    output := make(chan Order)

    go func() {
        defer close(output)
        for order := range input {
            order.State = "started"
            output <- order
        }
    }()

    return output
}

func ProcessStage(input <-chan Order, workers int) <-chan Order {
    output := make(chan Order)

    go func() {
        defer close(output)

        // Fan-out to workers
        workerInputs := make([]<-chan Order, workers)
        for i := 0; i < workers; i++ {
            workerInputs[i] = fanOutProcess(input, i)
        }

        // Fan-in results
        for order := range fanInProcess(workerInputs) {
            output <- order
        }
    }()

    return output
}

func fanOutProcess(input <-chan Order, id int) <-chan Order {
    output := make(chan Order)

    go func() {
        defer close(output)
        for order := range input {
            order.State = "processed"
            output <- order
        }
    }()

    return output
}

func fanInProcess(inputs []<-chan Order) <-chan Order {
    output := make(chan Order)

    for _, ch := range inputs {
        go func(c <-chan Order) {
            for order := range c {
                output <- order
            }
        }(ch)
    }

    return output
}

// Usage:
// orders := make(chan Order)
// pipeline := RunPipeline(orders, StartStage, func(ch <-chan Order) <-chan Order {
//     return ProcessStage(ch, 5)
// })`,
		language: 'go',
		technologies: ['golang'],
		categories: ['architecture', 'performance'],
	},
	{
		title: 'Generic Repository with Caching',
		description:
			'Repository wrapper with in-memory TTL cache. Usage: repo := NewCachedRepository(dbRepo, 5*time.Minute)',
		code: `package repository

import (
    "context"
    "sync"
    "time"
)

type Entity interface {
    GetID() string
}

type Repository[T Entity] interface {
    Find(ctx context.Context, id string) (T, error)
    Save(ctx context.Context, entity T) error
    Delete(ctx context.Context, id string) error
}

type CachedRepository[T Entity] struct {
    repo    Repository[T]
    cache   map[string]cacheEntry[T]
    mu      sync.RWMutex
    ttl     time.Duration
}

type cacheEntry[T Entity] struct {
    entity    T
    expiresAt time.Time
}

func NewCachedRepository[T Entity](repo Repository[T], ttl time.Duration) *CachedRepository[T] {
    return &CachedRepository[T]{
        repo:  repo,
        cache: make(map[string]cacheEntry[T]),
        ttl:   ttl,
    }
}

func (r *CachedRepository[T]) Find(ctx context.Context, id string) (T, error) {
    // Try cache first
    r.mu.RLock()
    entry, ok := r.cache[id]
    r.mu.RUnlock()

    if ok && time.Now().Before(entry.expiresAt) {
        return entry.entity, nil
    }

    // Cache miss, get from repository
    entity, err := r.repo.Find(ctx, id)
    if err != nil {
        return entity, err
    }

    // Store in cache
    r.mu.Lock()
    r.cache[id] = cacheEntry[T]{
        entity:    entity,
        expiresAt: time.Now().Add(r.ttl),
    }
    r.mu.Unlock()

    return entity, nil
}

func (r *CachedRepository[T]) Save(ctx context.Context, entity T) error {
    if err := r.repo.Save(ctx, entity); err != nil {
        return err
    }

    // Invalidate cache
    r.mu.Lock()
    delete(r.cache, entity.GetID())
    r.mu.Unlock()

    return nil
}

func (r *CachedRepository[T]) Delete(ctx context.Context, id string) error {
    if err := r.repo.Delete(ctx, id); err != nil {
        return err
    }

    r.mu.Lock()
    delete(r.cache, id)
    r.mu.Unlock()

    return nil
}

func (r *CachedRepository[T]) ClearCache() {
    r.mu.Lock()
    r.cache = make(map[string]cacheEntry[T])
    r.mu.Unlock()
}
`,
		language: 'go',
		technologies: ['golang'],
		categories: ['data', 'architecture'],
	},
	{
		title: 'Middleware Chain',
		description:
			'Composable middleware chain with logger, recoverer, and request ID. Usage: chain := NewChain(Logger, Recoverer, RequestID)',
		code: `package middleware

import (
    "log"
    "net/http"
    "time"
    "github.com/justinas/alice"
)

type Middleware func(http.Handler) http.Handler

type Chain struct {
    middlewares []Middleware
}

func NewChain(middlewares ...Middleware) Chain {
    return Chain{middlewares: append([]Middleware{}, middlewares...)}
}

func (c Chain) Then(handler http.Handler) http.Handler {
    for i := range c.middlewares {
        handler = c.middlewares[len(c.middlewares)-1-i](handler)
    }
    return handler
}

func (c Chain) ThenFunc(fn http.HandlerFunc) http.Handler {
    return c.Then(fn)
}

func (c Chain) Append(middlewares ...Middleware) Chain {
    newMiddlewares := make([]Middleware, 0, len(c.middlewares)+len(middlewares))
    newMiddlewares = append(newMiddlewares, c.middlewares...)
    newMiddlewares = append(newMiddlewares, middlewares...)
    return Chain{middlewares: newMiddlewares}
}

// Common middleware implementations
func Logger(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

func Recoverer(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                http.Error(w, "Internal Server Error", http.StatusInternalServerError)
                log.Printf("panic: %v", err)
            }
        }()
        next.ServeHTTP(w, r)
    })
}

func RequestID(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        requestID := r.Header.Get("X-Request-ID")
        if requestID == "" {
            requestID = generateRequestID()
        }
        w.Header().Set("X-Request-ID", requestID)
        next.ServeHTTP(w, r)
    })
}

func generateRequestID() string {
    return time.Now().Format("20060102150405") + "-" +
           string(rune(time.Now().UnixNano()))
}

// Usage: chain := NewChain(Logger, Recoverer, RequestID)
// http.Handle("/", chain.ThenFunc(myHandler))`,
		language: 'go',
		technologies: ['golang'],
		categories: ['middleware', 'backend'],
	},
	{
		title: 'Configuration Loader with Environment Support',
		description:
			'Load config from JSON file and override with env vars. Usage: loader := NewLoader(cfg, WithEnvPrefix("APP"), WithConfigFile("config.json"))',
		code: `package config

import (
    "encoding/json"
    "fmt"
    "os"
    "reflect"
    "strconv"
    "strings"
    "time"
)

type Loader struct {
    config     interface{}
    envPrefix  string
    configFile string
}

func NewLoader(config interface{}, opts ...LoaderOption) *Loader {
    l := &Loader{
        config:    config,
        envPrefix: "APP",
    }

    for _, opt := range opts {
        opt(l)
    }

    return l
}

type LoaderOption func(*Loader)

func WithEnvPrefix(prefix string) LoaderOption {
    return func(l *Loader) { l.envPrefix = prefix }
}

func WithConfigFile(path string) LoaderOption {
    return func(l *Loader) { l.configFile = path }
}

func (l *Loader) Load() error {
    // Load from file first
    if l.configFile != "" {
        if err := l.loadFromFile(); err != nil {
            return fmt.Errorf("failed to load config file: %w", err)
        }
    }

    // Override with environment variables
    if err := l.loadFromEnv(); err != nil {
        return fmt.Errorf("failed to load env vars: %w", err)
    }

    return nil
}

func (l *Loader) loadFromFile() error {
    data, err := os.ReadFile(l.configFile)
    if err != nil {
        return err
    }

    return json.Unmarshal(data, l.config)
}

func (l *Loader) loadFromEnv() error {
    val := reflect.ValueOf(l.config).Elem()
    typ := val.Type()

    for i := 0; i < val.NumField(); i++ {
        field := val.Field(i)
        fieldType := typ.Field(i)

        // Get env tag
        envTag := fieldType.Tag.Get("env")
        if envTag == "" {
            envTag = strings.ToUpper(fieldType.Name)
        }

        // Build full env name
        envName := strings.ToUpper(l.envPrefix + "_" + envTag)

        // Get env value
        envValue := os.Getenv(envName)
        if envValue == "" {
            continue
        }

        // Set field based on type
        if err := setFieldValue(field, envValue); err != nil {
            return fmt.Errorf("failed to set field %s: %w", fieldType.Name, err)
        }
    }

    return nil
}

func setFieldValue(field reflect.Value, value string) error {
    switch field.Kind() {
    case reflect.String:
        field.SetString(value)

    case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
        intVal, err := strconv.ParseInt(value, 10, 64)
        if err != nil {
            return err
        }
        field.SetInt(intVal)

    case reflect.Bool:
        boolVal, err := strconv.ParseBool(value)
        if err != nil {
            return err
        }
        field.SetBool(boolVal)

    case reflect.Struct:
        if field.Type() == reflect.TypeOf(time.Duration(0)) {
            duration, err := time.ParseDuration(value)
            if err != nil {
                return err
            }
            field.Set(reflect.ValueOf(duration))
        }
    }

    return nil
}

// Usage:
// type Config struct {
//     Port     int           \`json:"port" env:"PORT"\`
//     Timeout  time.Duration \`json:"timeout" env:"TIMEOUT"\`
// }
// cfg := &Config{}
// loader := NewLoader(cfg, WithEnvPrefix("APP"), WithConfigFile("config.json"))
// loader.Load()`,
		language: 'go',
		technologies: ['golang'],
		categories: ['devops', 'utilities'],
	},
	{
		title: 'Generic Cache with TTL',
		description:
			'Thread-safe cache with TTL and cleanup loop. Usage: cache := NewCache[string, User](5*time.Minute, 1*time.Minute)',
		code: `package cache

import (
    "sync"
    "time"
)

type Item[T any] struct {
    Value      T
    Expiration int64
}

type Cache[K comparable, V any] struct {
    items map[K]Item[V]
    mu    sync.RWMutex
    ttl   time.Duration
    stop  chan struct{}
}

func NewCache[K comparable, V any](ttl time.Duration, cleanupInterval time.Duration) *Cache[K, V] {
    c := &Cache[K, V]{
        items: make(map[K]Item[V]),
        ttl:   ttl,
        stop:  make(chan struct{}),
    }

    if cleanupInterval > 0 {
        go c.cleanupLoop(cleanupInterval)
    }

    return c
}

func (c *Cache[K, V]) Set(key K, value V) {
    c.mu.Lock()
    defer c.mu.Unlock()

    c.items[key] = Item[V]{
        Value:      value,
        Expiration: time.Now().Add(c.ttl).UnixNano(),
    }
}

func (c *Cache[K, V]) SetWithTTL(key K, value V, ttl time.Duration) {
    c.mu.Lock()
    defer c.mu.Unlock()

    c.items[key] = Item[V]{
        Value:      value,
        Expiration: time.Now().Add(ttl).UnixNano(),
    }
}

func (c *Cache[K, V]) Get(key K) (V, bool) {
    c.mu.RLock()
    item, exists := c.items[key]
    c.mu.RUnlock()

    if !exists {
        var zero V
        return zero, false
    }

    if time.Now().UnixNano() > item.Expiration {
        c.Delete(key)
        var zero V
        return zero, false
    }

    return item.Value, true
}

func (c *Cache[K, V]) GetOrSet(key K, factory func() V) V {
    if val, ok := c.Get(key); ok {
        return val
    }

    c.mu.Lock()
    defer c.mu.Unlock()

    // Double-check after acquiring lock
    if item, exists := c.items[key]; exists && time.Now().UnixNano() <= item.Expiration {
        return item.Value
    }

    val := factory()
    c.items[key] = Item[V]{
        Value:      val,
        Expiration: time.Now().Add(c.ttl).UnixNano(),
    }
    return val
}

func (c *Cache[K, V]) Delete(key K) {
    c.mu.Lock()
    defer c.mu.Unlock()
    delete(c.items, key)
}

func (c *Cache[K, V]) Clear() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.items = make(map[K]Item[V])
}

func (c *Cache[K, V]) cleanupLoop(interval time.Duration) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            c.cleanup()
        case <-c.stop:
            return
        }
    }
}

func (c *Cache[K, V]) cleanup() {
    c.mu.Lock()
    defer c.mu.Unlock()

    now := time.Now().UnixNano()
    for k, item := range c.items {
        if now > item.Expiration {
            delete(c.items, k)
        }
    }
}

func (c *Cache[K, V]) Stop() {
    close(c.stop)
}

func (c *Cache[K, V]) Len() int {
    c.mu.RLock()
    defer c.mu.RUnlock()
    return len(c.items)
}
// Usage: cache := NewCache[string, User](5*time.Minute, 1*time.Minute)`,
		language: 'go',
		technologies: ['golang'],
		categories: ['data', 'performance'],
	},
	{
		title: 'Circuit Breaker Pattern',
		description:
			'Circuit breaker with closed/open/half-open states. Usage: cb := NewCircuitBreaker(Config{Timeout: 5*time.Second, MaxFailures: 3})',
		code: `package circuitbreaker

import (
    "errors"
    "sync"
    "time"
)

type State int

const (
    StateClosed State = iota
    StateOpen
    StateHalfOpen
)

type CircuitBreaker struct {
    mu                sync.RWMutex
    state             State
    failures          int
    lastFailure       time.Time
    timeout           time.Duration
    maxFailures       int
    halfOpenMaxCalls  int
    halfOpenCalls     int
}

type Config struct {
    Timeout          time.Duration
    MaxFailures      int
    HalfOpenMaxCalls int
}

func NewCircuitBreaker(config Config) *CircuitBreaker {
    return &CircuitBreaker{
        state:             StateClosed,
        timeout:           config.Timeout,
        maxFailures:       config.MaxFailures,
        halfOpenMaxCalls:  config.HalfOpenMaxCalls,
    }
}

func (cb *CircuitBreaker) Execute(fn func() error) error {
    if !cb.allowRequest() {
        return errors.New("circuit breaker is open")
    }

    err := fn()

    cb.recordResult(err)
    return err
}

func (cb *CircuitBreaker) allowRequest() bool {
    cb.mu.Lock()
    defer cb.mu.Unlock()

    switch cb.state {
    case StateClosed:
        return true

    case StateOpen:
        if time.Since(cb.lastFailure) > cb.timeout {
            cb.state = StateHalfOpen
            cb.halfOpenCalls = 0
            return true
        }
        return false

    case StateHalfOpen:
        if cb.halfOpenCalls < cb.halfOpenMaxCalls {
            cb.halfOpenCalls++
            return true
        }
        return false

    default:
        return false
    }
}

func (cb *CircuitBreaker) recordResult(err error) {
    cb.mu.Lock()
    defer cb.mu.Unlock()

    if err == nil {
        // Success
        if cb.state == StateHalfOpen {
            cb.state = StateClosed
            cb.failures = 0
        }
        return
    }

    // Failure
    cb.failures++
    cb.lastFailure = time.Now()

    switch cb.state {
    case StateClosed:
        if cb.failures >= cb.maxFailures {
            cb.state = StateOpen
        }

    case StateHalfOpen:
        cb.state = StateOpen
    }
}

func (cb *CircuitBreaker) State() State {
    cb.mu.RLock()
    defer cb.mu.RUnlock()
    return cb.state
}

func (cb *CircuitBreaker) Reset() {
    cb.mu.Lock()
    defer cb.mu.Unlock()
    cb.state = StateClosed
    cb.failures = 0
    cb.halfOpenCalls = 0
}

// Usage: cb := NewCircuitBreaker(Config{Timeout: 5*time.Second, MaxFailures: 3})
// err := cb.Execute(func() error { return callExternalService() })`,
		language: 'go',
		technologies: ['golang'],
		categories: ['architecture', 'backend'],
	},
	{
		title: 'Event Bus with Topics',
		description:
			'Topic-based event bus with sync/async dispatch. Usage: bus := NewBus(true); bus.Publish(Event{Type: "user.created", Data: user})',
		code: `package eventbus

import (
    "sync"
)

type Event struct {
    Type string
    Data interface{}
}

type Handler func(Event)

type Bus struct {
    subscribers map[string][]Handler
    mu          sync.RWMutex
    async       bool
}

func NewBus(async bool) *Bus {
    return &Bus{
        subscribers: make(map[string][]Handler),
        async:       async,
    }
}

func (b *Bus) Subscribe(eventType string, handler Handler) func() {
    b.mu.Lock()
    defer b.mu.Unlock()

    b.subscribers[eventType] = append(b.subscribers[eventType], handler)

    // Return unsubscribe function
    return func() {
        b.mu.Lock()
        defer b.mu.Unlock()

        handlers := b.subscribers[eventType]
        for i, h := range handlers {
            if &h == &handler { // Compare function pointers
                b.subscribers[eventType] = append(handlers[:i], handlers[i+1:]...)
                break
            }
        }
    }
}

func (b *Bus) Publish(event Event) {
    b.mu.RLock()
    handlers, exists := b.subscribers[event.Type]
    b.mu.RUnlock()

    if !exists {
        return
    }

    if b.async {
        for _, handler := range handlers {
            go handler(event)
        }
    } else {
        for _, handler := range handlers {
            handler(event)
        }
    }
}

func (b *Bus) PublishAsync(event Event) <-chan struct{} {
    done := make(chan struct{})

    go func() {
        b.Publish(event)
        close(done)
    }()

    return done
}

func (b *Bus) HasSubscribers(eventType string) bool {
    b.mu.RLock()
    defer b.mu.RUnlock()

    handlers, exists := b.subscribers[eventType]
    return exists && len(handlers) > 0
}

func (b *Bus) ClearSubscribers(eventType string) {
    b.mu.Lock()
    defer b.mu.Unlock()

    delete(b.subscribers, eventType)
}

func (b *Bus) ClearAll() {
    b.mu.Lock()
    defer b.mu.Unlock()

    b.subscribers = make(map[string][]Handler)
}

// Usage:
// bus := NewBus(true)
// unsubscribe := bus.Subscribe("user.created", func(e Event) {
//     fmt.Println("User created:", e.Data)
// })
// defer unsubscribe()
// bus.Publish(Event{Type: "user.created", Data: user})`,
		language: 'go',
		technologies: ['golang'],
		categories: ['events', 'architecture'],
	},
	{
		title: 'Database Migration Tool',
		description:
			'SQL migration loader and runner with up/down support. Usage: m := NewMigrator(db, "schema_migrations"); m.LoadFromDirectory("./migrations")',
		code: `package migration

import (
    "database/sql"
    "fmt"
    "io/ioutil"
    "path/filepath"
    "sort"
    "strings"
    "time"
)

type Migration struct {
    ID        string
    Name      string
    UpSQL     string
    DownSQL   string
}

type Migrator struct {
    db         *sql.DB
    migrations []Migration
    tableName  string
}

func NewMigrator(db *sql.DB, tableName string) *Migrator {
    return &Migrator{
        db:        db,
        tableName: tableName,
    }
}

func (m *Migrator) LoadFromDirectory(dir string) error {
    files, err := filepath.Glob(filepath.Join(dir, "*.sql"))
    if err != nil {
        return err
    }

    // Group files by migration ID
    groups := make(map[string]map[string]string)

    for _, file := range files {
        basename := filepath.Base(file)
        parts := strings.Split(basename, "_")
        if len(parts) < 2 {
            continue
        }

        id := parts[0]
        if _, ok := groups[id]; !ok {
            groups[id] = make(map[string]string)
        }

        content, err := ioutil.ReadFile(file)
        if err != nil {
            return err
        }

        if strings.Contains(basename, ".up.") {
            groups[id]["up"] = string(content)
        } else if strings.Contains(basename, ".down.") {
            groups[id]["down"] = string(content)
        }
    }

    // Convert to migrations
    for id, sqls := range groups {
        m.migrations = append(m.migrations, Migration{
            ID:    id,
            Name:  id,
            UpSQL: sqls["up"],
            DownSQL: sqls["down"],
        })
    }

    // Sort by ID
    sort.Slice(m.migrations, func(i, j int) bool {
        return m.migrations[i].ID < m.migrations[j].ID
    })

    return nil
}

func (m *Migrator) EnsureTable() error {
    query := fmt.Sprintf(\`
        CREATE TABLE IF NOT EXISTS %s (
            id VARCHAR(50) PRIMARY KEY,
            applied_at TIMESTAMP NOT NULL,
            name VARCHAR(255) NOT NULL
        )
    \`, m.tableName)

    _, err := m.db.Exec(query)
    return err
}

func (m *Migrator) GetAppliedMigrations() (map[string]bool, error) {
    query := fmt.Sprintf("SELECT id FROM %s", m.tableName)
    rows, err := m.db.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    applied := make(map[string]bool)
    for rows.Next() {
        var id string
        if err := rows.Scan(&id); err != nil {
            return nil, err
        }
        applied[id] = true
    }

    return applied, rows.Err()
}

func (m *Migrator) Up(steps int) error {
    if err := m.EnsureTable(); err != nil {
        return err
    }

    applied, err := m.GetAppliedMigrations()
    if err != nil {
        return err
    }

    tx, err := m.db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    appliedCount := 0
    for _, migration := range m.migrations {
        if applied[migration.ID] {
            continue
        }

        if steps > 0 && appliedCount >= steps {
            break
        }

        if _, err := tx.Exec(migration.UpSQL); err != nil {
            return fmt.Errorf("failed to apply migration %s: %w", migration.ID, err)
        }

        query := fmt.Sprintf("INSERT INTO %s (id, applied_at, name) VALUES (?, ?, ?)", m.tableName)
        if _, err := tx.Exec(query, migration.ID, time.Now(), migration.Name); err != nil {
            return err
        }

        appliedCount++
    }

    return tx.Commit()
}

func (m *Migrator) Down(steps int) error {
    if err := m.EnsureTable(); err != nil {
        return err
    }

    applied, err := m.GetAppliedMigrations()
    if err != nil {
        return err
    }

    tx, err := m.db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    // Find migrations to revert (in reverse order)
    reverted := 0
    for i := len(m.migrations) - 1; i >= 0; i-- {
        migration := m.migrations[i]
        if !applied[migration.ID] {
            continue
        }

        if steps > 0 && reverted >= steps {
            break
        }

        if migration.DownSQL != "" {
            if _, err := tx.Exec(migration.DownSQL); err != nil {
                return fmt.Errorf("failed to revert migration %s: %w", migration.ID, err)
            }
        }

        query := fmt.Sprintf("DELETE FROM %s WHERE id = ?", m.tableName)
        if _, err := tx.Exec(query, migration.ID); err != nil {
            return err
        }

        reverted++
    }

    return tx.Commit()
}
// Usage: m := NewMigrator(db, "schema_migrations")
// m.LoadFromDirectory("./migrations")
// m.Up(0) // Apply all`,
		language: 'go',
		technologies: ['golang'],
		categories: ['database', 'infrastructure'],
	},
	{
		title: 'HTTP Server with Graceful Shutdown and Middleware',
		description:
			'HTTP server wrapper with middleware and graceful shutdown. Usage: server := NewServer(ServerConfig{Port: 8080})',
		code: `package server

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
)

type Server struct {
    httpServer *http.Server
    router     *http.ServeMux
    middlewares []func(http.Handler) http.Handler
}

type ServerConfig struct {
    Port         int
    ReadTimeout  time.Duration
    WriteTimeout time.Duration
    IdleTimeout  time.Duration
}

func NewServer(config ServerConfig) *Server {
    return &Server{
        router: http.NewServeMux(),
        httpServer: &http.Server{
            Addr:         fmt.Sprintf(":%d", config.Port),
            ReadTimeout:  config.ReadTimeout,
            WriteTimeout: config.WriteTimeout,
            IdleTimeout:  config.IdleTimeout,
        },
    }
}

func (s *Server) Use(middleware func(http.Handler) http.Handler) {
    s.middlewares = append(s.middlewares, middleware)
}

func (s *Server) Handle(pattern string, handler http.Handler) {
    // Apply middlewares
    for i := len(s.middlewares) - 1; i >= 0; i-- {
        handler = s.middlewares[i](handler)
    }
    s.router.Handle(pattern, handler)
}

func (s *Server) HandleFunc(pattern string, handlerFunc http.HandlerFunc) {
    s.Handle(pattern, handlerFunc)
}

func (s *Server) Start() error {
    s.httpServer.Handler = s.router

    // Graceful shutdown
    idleConnsClosed := make(chan struct{})
    go func() {
        sigint := make(chan os.Signal, 1)
        signal.Notify(sigint, syscall.SIGINT, syscall.SIGTERM)
        <-sigint

        log.Println("Shutting down server...")

        ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
        defer cancel()

        if err := s.httpServer.Shutdown(ctx); err != nil {
            log.Printf("HTTP server shutdown error: %v", err)
        }
        close(idleConnsClosed)
    }()

    log.Printf("Starting server on %s", s.httpServer.Addr)
    if err := s.httpServer.ListenAndServe(); err != http.ErrServerClosed {
        return err
    }

    <-idleConnsClosed
    log.Println("Server stopped")
    return nil
}

// Common middleware examples
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

func RecoveryMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("Panic recovered: %v", err)
                http.Error(w, "Internal Server Error", http.StatusInternalServerError)
            }
        }()
        next.ServeHTTP(w, r)
    })
}

func CORSMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        next.ServeHTTP(w, r)
    })
}

// Usage:
// server := NewServer(ServerConfig{Port: 8080, ReadTimeout: 5*time.Second})
// server.Use(LoggingMiddleware)
// server.Use(RecoveryMiddleware)
// server.HandleFunc("/api", apiHandler)
// server.Start()`,
		language: 'go',
		technologies: ['golang'],
		categories: ['network', 'backend'],
	},
]
