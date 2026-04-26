import type { FirestoreSnippet } from '../../src/features/snippets/core/snippet.types'

export type SnippetTemplate = Pick<
	FirestoreSnippet,
	'title' | 'description' | 'code' | 'language' | 'technologies' | 'categories'
>

export const SNIPPET_TEMPLATES_PART1: SnippetTemplate[] = [
	{
		title: 'Debounced Search Hook',
		description: 'React hook to debounce input changes and reduce API calls',
		code: `import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}`,
		language: 'typescript',
		technologies: ['react', 'typescript'],
		categories: ['frontend', 'framework'],
	},
	{
		title: 'Deep Clone Object',
		description: 'Create a deep copy of nested objects and arrays',
		code: `function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['language', 'utilities'],
	},
	{
		title: 'Async Retry with Exponential Backoff',
		description: 'Retry failed async operations with increasing delays',
		code: `async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}`,
		language: 'typescript',
		technologies: ['typescript'],
		categories: ['language', 'utilities'],
	},
	{
		title: 'Local Storage Hook',
		description: 'React hook for syncing state with localStorage',
		code: `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
		language: 'typescript',
		technologies: ['react', 'typescript'],
		categories: ['frontend', 'framework'],
	},
	{
		title: 'Throttle Function',
		description: 'Limit function execution rate for performance',
		code: `function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['language', 'utilities'],
	},
	{
		title: 'Binary Search Implementation',
		description: 'Efficient search in sorted arrays with O(log n) complexity',
		code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1`,
		language: 'python',
		technologies: ['python'],
		categories: ['language', 'algorithms'],
	},
	{
		title: 'Decorator for Function Timing',
		description: 'Measure execution time of any function',
		code: `import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"{func.__name__} took {end - start:.4f}s")
        return result
    return wrapper`,
		language: 'python',
		technologies: ['python'],
		categories: ['language', 'utilities'],
	},
	{
		title: 'LRU Cache Implementation',
		description: 'Least Recently Used cache with O(1) operations',
		code: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cache = OrderedDict()
        self.capacity = capacity
    
    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]
    
    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
		language: 'python',
		technologies: ['python'],
		categories: ['language', 'data-structures'],
	},
	{
		title: 'Flatten Nested List',
		description: 'Recursively flatten arbitrarily nested lists',
		code: `def flatten(nested_list):
    result = []
    for item in nested_list:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result`,
		language: 'python',
		technologies: ['python'],
		categories: ['language', 'utilities'],
	},
	{
		title: 'Context Manager for File Operations',
		description: 'Safe file handling with automatic cleanup',
		code: `class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None
    
    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()`,
		language: 'python',
		technologies: ['python'],
		categories: ['language', 'utilities'],
	},
	{
		title: 'HTTP Server with Graceful Shutdown',
		description: 'Handle shutdown signals properly in Go HTTP servers',
		code: `package main

import (
    "context"
    "net/http"
    "os"
    "os/signal"
    "time"
)

func main() {
    srv := &http.Server{Addr: ":8080"}
    
    go func() {
        if err := srv.ListenAndServe(); err != http.ErrServerClosed {
            panic(err)
        }
    }()
    
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, os.Interrupt)
    <-quit
    
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    srv.Shutdown(ctx)
}`,
		language: 'go',
		technologies: ['golang'],
		categories: ['language', 'backend'],
	},
	{
		title: 'Worker Pool Pattern',
		description: 'Concurrent task processing with limited goroutines',
		code: `package main

func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }
    
    for j := 1; j <= 9; j++ {
        jobs <- j
    }
    close(jobs)
    
    for a := 1; a <= 9; a++ {
        <-results
    }
}`,
		language: 'go',
		technologies: ['golang'],
		categories: ['language', 'backend'],
	},
	{
		title: 'Rate Limiter with Token Bucket',
		description: 'Control request rate using token bucket algorithm',
		code: `package main

import (
    "sync"
    "time"
)

type RateLimiter struct {
    tokens    int
    capacity  int
    rate      time.Duration
    mu        sync.Mutex
}

func NewRateLimiter(capacity int, rate time.Duration) *RateLimiter {
    rl := &RateLimiter{
        tokens:   capacity,
        capacity: capacity,
        rate:     rate,
    }
    go rl.refill()
    return rl
}

func (rl *RateLimiter) Allow() bool {
    rl.mu.Lock()
    defer rl.mu.Unlock()
    
    if rl.tokens > 0 {
        rl.tokens--
        return true
    }
    return false
}

func (rl *RateLimiter) refill() {
    ticker := time.NewTicker(rl.rate)
    for range ticker.C {
        rl.mu.Lock()
        if rl.tokens < rl.capacity {
            rl.tokens++
        }
        rl.mu.Unlock()
    }
}`,
		language: 'go',
		technologies: ['golang'],
		categories: ['language', 'backend'],
	},
	{
		title: 'Generic Stack Implementation',
		description: 'Type-safe stack using Go generics',
		code: `package main

type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false
    }
    item := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return item, true
}

func (s *Stack[T]) Peek() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false
    }
    return s.items[len(s.items)-1], true
}`,
		language: 'go',
		technologies: ['golang'],
		categories: ['language', 'data-structures'],
	},
	{
		title: 'Circuit Breaker Pattern',
		description: 'Prevent cascading failures in distributed systems',
		code: `package main

import (
    "errors"
    "sync"
    "time"
)

type CircuitBreaker struct {
    maxFailures  int
    resetTimeout time.Duration
    failures     int
    lastFailTime time.Time
    state        string
    mu           sync.Mutex
}

func NewCircuitBreaker(maxFailures int, resetTimeout time.Duration) *CircuitBreaker {
    return &CircuitBreaker{
        maxFailures:  maxFailures,
        resetTimeout: resetTimeout,
        state:        "closed",
    }
}

func (cb *CircuitBreaker) Call(fn func() error) error {
    cb.mu.Lock()
    defer cb.mu.Unlock()
    
    if cb.state == "open" {
        if time.Since(cb.lastFailTime) > cb.resetTimeout {
            cb.state = "half-open"
        } else {
            return errors.New("circuit breaker is open")
        }
    }
    
    err := fn()
    if err != nil {
        cb.failures++
        cb.lastFailTime = time.Now()
        if cb.failures >= cb.maxFailures {
            cb.state = "open"
        }
        return err
    }
    
    cb.failures = 0
    cb.state = "closed"
    return nil
}`,
		language: 'go',
		technologies: ['golang'],
		categories: ['language', 'backend'],
	},
	{
		title: 'Upsert with ON CONFLICT',
		description: 'Insert or update records in PostgreSQL',
		code: `INSERT INTO user_settings (user_id, theme, timezone, updated_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (user_id)
DO UPDATE SET
  theme = EXCLUDED.theme,
  timezone = EXCLUDED.timezone,
  updated_at = NOW();`,
		language: 'sql',
		technologies: ['sql', 'postgres-sql'],
		categories: ['database', 'backend'],
	},
	{
		title: 'Recursive CTE for Hierarchical Data',
		description: 'Query tree structures like org charts or categories',
		code: `WITH RECURSIVE category_tree AS (
  SELECT id, name, parent_id, 1 as level
  FROM categories
  WHERE parent_id IS NULL
  
  UNION ALL
  
  SELECT c.id, c.name, c.parent_id, ct.level + 1
  FROM categories c
  INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree
ORDER BY level, name;`,
		language: 'sql',
		technologies: ['sql', 'postgres-sql'],
		categories: ['database', 'backend'],
	},
	{
		title: 'Window Functions for Running Totals',
		description: 'Calculate cumulative sums and rankings',
		code: `SELECT 
  order_date,
  amount,
  SUM(amount) OVER (ORDER BY order_date) as running_total,
  ROW_NUMBER() OVER (ORDER BY amount DESC) as rank
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY order_date;`,
		language: 'sql',
		technologies: ['sql', 'postgres-sql'],
		categories: ['database', 'backend'],
	},
	{
		title: 'Pivot Table with CASE',
		description: 'Transform rows into columns for reporting',
		code: `SELECT 
  product_id,
  SUM(CASE WHEN EXTRACT(MONTH FROM order_date) = 1 THEN amount ELSE 0 END) as jan,
  SUM(CASE WHEN EXTRACT(MONTH FROM order_date) = 2 THEN amount ELSE 0 END) as feb,
  SUM(CASE WHEN EXTRACT(MONTH FROM order_date) = 3 THEN amount ELSE 0 END) as mar
FROM orders
WHERE EXTRACT(YEAR FROM order_date) = 2024
GROUP BY product_id;`,
		language: 'sql',
		technologies: ['sql', 'postgres-sql'],
		categories: ['database', 'backend'],
	},
	{
		title: 'Find Duplicate Records',
		description: 'Identify and handle duplicate entries',
		code: `SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- Delete duplicates keeping the oldest
DELETE FROM users
WHERE id NOT IN (
  SELECT MIN(id)
  FROM users
  GROUP BY email
);`,
		language: 'sql',
		technologies: ['sql', 'postgres-sql'],
		categories: ['database', 'backend'],
	},
]
