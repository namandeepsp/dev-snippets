import type { FirestoreSnippet } from '../../src/features/snippets/core/snippet.types'
import { createSnippetFile } from '../../src/features/snippets/core/snippet.utils'

export type SnippetTemplate = Pick<
	FirestoreSnippet,
	| 'title'
	| 'description'
	| 'files'
	| 'primaryLanguage'
	| 'technologies'
	| 'categories'
>

function createTemplate(
	title: string,
	description: string,
	code: string,
	language: string,
	technologies: string[],
	categories: string[],
): SnippetTemplate {
	return {
		title,
		description,
		files: [createSnippetFile(code, language as any)],
		primaryLanguage: language as any,
		technologies: technologies as any,
		categories: categories as any,
	}
}

export const SNIPPET_TEMPLATES_PART1: SnippetTemplate[] = [
	createTemplate(
		'Debounced Search Hook',
		'React hook to debounce input changes and reduce API calls',
		`import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}`,
		'typescript',
		['react', 'typescript'],
		['frontend', 'framework'],
	),
	createTemplate(
		'Deep Clone Object',
		'Create a deep copy of nested objects and arrays',
		`function deepClone(obj) {
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
		'javascript',
		['javascript'],
		['language', 'utilities'],
	),
	createTemplate(
		'Async Retry with Exponential Backoff',
		'Retry failed async operations with increasing delays',
		`async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
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
		'typescript',
		['typescript'],
		['language', 'utilities'],
	),
	createTemplate(
		'Local Storage Hook',
		'React hook for syncing state with localStorage',
		`import { useState, useEffect } from 'react';

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
		'typescript',
		['react', 'typescript'],
		['frontend', 'framework'],
	),
	createTemplate(
		'Throttle Function',
		'Limit function execution rate for performance',
		`function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}`,
		'javascript',
		['javascript'],
		['language', 'utilities'],
	),
	createTemplate(
		'Binary Search Implementation',
		'Efficient search in sorted arrays with O(log n) complexity',
		`def binary_search(arr, target):
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
		'python',
		['python'],
		['language', 'algorithms'],
	),
	createTemplate(
		'Decorator for Function Timing',
		'Measure execution time of any function',
		`import time
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
		'python',
		['python'],
		['language', 'utilities'],
	),
	createTemplate(
		'LRU Cache Implementation',
		'Least Recently Used cache with O(1) operations',
		`from collections import OrderedDict

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
		'python',
		['python'],
		['language', 'data-structures'],
	),
	createTemplate(
		'Flatten Nested List',
		'Recursively flatten arbitrarily nested lists',
		`def flatten(nested_list):
    result = []
    for item in nested_list:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result`,
		'python',
		['python'],
		['language', 'utilities'],
	),
	createTemplate(
		'Context Manager for File Operations',
		'Safe file handling with automatic cleanup',
		`class FileManager:
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
		'python',
		['python'],
		['language', 'utilities'],
	),
	createTemplate(
		'HTTP Server with Graceful Shutdown',
		'Handle shutdown signals properly in Go HTTP servers',
		`package main

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
		'go',
		['golang'],
		['language', 'backend'],
	),
	createTemplate(
		'Worker Pool Pattern',
		'Concurrent task processing with limited goroutines',
		`package main

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
		'go',
		['golang'],
		['language', 'backend'],
	),
	createTemplate(
		'Rate Limiter with Token Bucket',
		'Control request rate using token bucket algorithm',
		`package main

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
		'go',
		['golang'],
		['language', 'backend'],
	),
	createTemplate(
		'Generic Stack Implementation',
		'Type-safe stack using Go generics',
		`package main

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
		'go',
		['golang'],
		['language', 'data-structures'],
	),
	createTemplate(
		'Circuit Breaker Pattern',
		'Prevent cascading failures in distributed systems',
		`package main

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
		'go',
		['golang'],
		['language', 'backend'],
	),
	createTemplate(
		'Upsert with ON CONFLICT',
		'Insert or update records in PostgreSQL',
		`INSERT INTO user_settings (user_id, theme, timezone, updated_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (user_id)
DO UPDATE SET
  theme = EXCLUDED.theme,
  timezone = EXCLUDED.timezone,
  updated_at = NOW();`,
		'sql',
		['sql', 'postgres-sql'],
		['database', 'backend'],
	),
	createTemplate(
		'Recursive CTE for Hierarchical Data',
		'Query tree structures like org charts or categories',
		`WITH RECURSIVE category_tree AS (
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
		'sql',
		['sql', 'postgres-sql'],
		['database', 'backend'],
	),
	createTemplate(
		'Window Functions for Running Totals',
		'Calculate cumulative sums and rankings',
		`SELECT 
  order_date,
  amount,
  SUM(amount) OVER (ORDER BY order_date) as running_total,
  ROW_NUMBER() OVER (ORDER BY amount DESC) as rank
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY order_date;`,
		'sql',
		['sql', 'postgres-sql'],
		['database', 'backend'],
	),
	createTemplate(
		'Pivot Table with CASE',
		'Transform rows into columns for reporting',
		`SELECT 
  product_id,
  SUM(CASE WHEN EXTRACT(MONTH FROM order_date) = 1 THEN amount ELSE 0 END) as jan,
  SUM(CASE WHEN EXTRACT(MONTH FROM order_date) = 2 THEN amount ELSE 0 END) as feb,
  SUM(CASE WHEN EXTRACT(MONTH FROM order_date) = 3 THEN amount ELSE 0 END) as mar
FROM orders
WHERE EXTRACT(YEAR FROM order_date) = 2024
GROUP BY product_id;`,
		'sql',
		['sql', 'postgres-sql'],
		['database', 'backend'],
	),
	createTemplate(
		'Find Duplicate Records',
		'Identify and handle duplicate entries',
		`SELECT email, COUNT(*) as count
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
		'sql',
		['sql', 'postgres-sql'],
		['database', 'backend'],
	),
]
