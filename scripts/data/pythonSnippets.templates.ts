import type { SnippetTemplate } from './snippet.templates'

export const PYTHON_SNIPPET_TEMPLATES: SnippetTemplate[] = [
    {
        title: 'Decorator for Timing Functions',
        description: 'Measure execution time of a function. Usage: @timer on a function definition.',
        code: `import time
from functools import wraps
from typing import Callable, Any

def timer(func: Callable) -> Callable:
    @wraps(func)
    def wrapper(*args, **kwargs) -> Any:
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "done"
# Usage: result = slow_function()`,
        language: 'python',
        technologies: ['python'],
        categories: ['utilities', 'performance'],
    },
    {
        title: 'Context Manager for Database Connections',
        description: 'Context manager for safe SQLite connection handling. Usage: with database_connection("test.db") as conn: ...',
        code: `import sqlite3
from contextlib import contextmanager
from typing import Generator

@contextmanager
def database_connection(db_path: str) -> Generator[sqlite3.Connection, None, None]:
    conn = None
    try:
        conn = sqlite3.connect(db_path)
        yield conn
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

# Usage:
# with database_connection("test.db") as conn:
#     cursor = conn.execute("SELECT * FROM users")`,
        language: 'python',
        technologies: ['python'],
        categories: ['database', 'utilities'],
    },
    {
        title: 'Singleton Pattern with Metaclass',
        description: 'Singleton implementation using a metaclass. Usage: db1 = DatabaseConnection(); db2 = DatabaseConnection()',
        code: `class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]

class DatabaseConnection(metaclass=SingletonMeta):
    def __init__(self):
        self.connected = False

    def connect(self):
        self.connected = True
        return self

# Usage: db1 = DatabaseConnection(); db2 = DatabaseConnection()  # Same instance`,
        language: 'python',
        technologies: ['python'],
        categories: ['architecture', 'backend'],
    },
    {
        title: 'Retry Decorator',
        description: 'Retry function calls with exponential backoff. Usage: @retry(max_attempts=3, delay=0.5)',
        code: `import time
from functools import wraps
from typing import Type, Union, Tuple

def retry(max_attempts: int = 3, delay: float = 1.0,
          exceptions: Union[Type[Exception], Tuple[Type[Exception], ...]] = Exception):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts - 1:
                        raise
                    time.sleep(delay * (attempt + 1))  # Exponential backoff
            return None
        return wrapper
    return decorator

@retry(max_attempts=3, delay=0.5, exceptions=(ConnectionError, TimeoutError))
def unstable_network_call():
    # Risky operation
    pass`,
        language: 'python',
        technologies: ['python'],
        categories: ['utilities', 'network'],
    },
    {
        title: 'Async Rate Limiter',
        description: 'Async callable rate limiter. Usage: result = await limiter(api_call, "data")',
        code: `import asyncio
import time
from typing import Callable, Any

class RateLimiter:
    def __init__(self, max_calls: int, period: float):
        self.max_calls = max_calls
        self.period = period
        self.calls = []

    async def __call__(self, func: Callable, *args, **kwargs) -> Any:
        now = time.time()
        self.calls = [c for c in self.calls if c > now - self.period]

        if len(self.calls) >= self.max_calls:
            sleep_time = self.calls[0] + self.period - now
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)

        self.calls.append(time.time())
        return await func(*args, **kwargs)

# Usage:
# limiter = RateLimiter(10, 1.0)
# result = await limiter(api_call, "data")`,
        language: 'python',
        technologies: ['python'],
        categories: ['performance', 'network'],
    },
    {
        title: 'Property Descriptor with Validation',
        description: 'Descriptor for validated attribute assignments. Usage: person = Person("John", 30)',
        code: `class ValidatedAttribute:
    def __init__(self, validator):
        self.validator = validator
        self.data = {}

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return self.data.get(id(obj), None)

    def __set__(self, obj, value):
        if not self.validator(value):
            raise ValueError(f"Invalid value: {value}")
        self.data[id(obj)] = value

    def __delete__(self, obj):
        if id(obj) in self.data:
            del self.data[id(obj)]

class Person:
    age = ValidatedAttribute(lambda x: 0 <= x <= 150)
    name = ValidatedAttribute(lambda x: isinstance(x, str) and len(x) > 0)

    def __init__(self, name, age):
        self.name = name
        self.age = age

# Usage: person = Person("John", 30)`,
        language: 'python',
        technologies: ['python'],
        categories: ['types', 'validation'],
    },
    {
        title: 'Pipeline Pattern with Generators',
        description: 'Pipeline with sync and generator-based execution. Usage: pipeline.add_stage(...).execute(5)',
        code: `from typing import Generator, Any, Callable

class Pipeline:
    def __init__(self):
        self.stages = []

    def add_stage(self, stage_func: Callable) -> 'Pipeline':
        self.stages.append(stage_func)
        return self

    def execute(self, data: Any) -> Any:
        result = data
        for stage in self.stages:
            result = stage(result)
        return result

    def execute_async(self, data: Any) -> Generator:
        result = data
        for stage in self.stages:
            result = stage(result)
            yield result

# Usage:
# pipeline = Pipeline()
# pipeline.add_stage(lambda x: x * 2).add_stage(lambda x: x + 1)
# result = pipeline.execute(5)  # 11`,
        language: 'python',
        technologies: ['python'],
        categories: ['architecture', 'utilities'],
    },
    {
        title: 'Observer Pattern',
        description: 'Observer/Subject pattern with notifications. Usage: subject.attach(Logger())',
        code: `from abc import ABC, abstractmethod
from typing import List, Any

class Observer(ABC):
    @abstractmethod
    def update(self, subject: 'Subject') -> None:
        pass

class Subject:
    def __init__(self):
        self._observers: List[Observer] = []
        self._state: Any = None

    def attach(self, observer: Observer) -> None:
        self._observers.append(observer)

    def detach(self, observer: Observer) -> None:
        self._observers.remove(observer)

    def notify(self) -> None:
        for observer in self._observers:
            observer.update(self)

    @property
    def state(self) -> Any:
        return self._state

    @state.setter
    def state(self, value: Any) -> None:
        self._state = value
        self.notify()

# Usage:
# class Logger(Observer):
#     def update(self, subject): print(f"State changed: {subject.state}")`,
        language: 'python',
        technologies: ['python'],
        categories: ['events', 'architecture'],
    },
    {
        title: 'Fluent Interface Builder',
        description: 'Fluent SQL-like query builder. Usage: QueryBuilder().select("id").from_table("users").build()',
        code: `class QueryBuilder:
    def __init__(self):
        self._select = []
        self._from = None
        self._where = []
        self._order_by = []
        self._limit = None

    def select(self, *fields):
        self._select.extend(fields)
        return self

    def from_table(self, table):
        self._from = table
        return self

    def where(self, condition):
        self._where.append(condition)
        return self

    def order_by(self, field, direction='ASC'):
        self._order_by.append(f"{field} {direction}")
        return self

    def limit(self, limit):
        self._limit = limit
        return self

    def build(self):
        query = f"SELECT {', '.join(self._select) if self._select else '*'}"
        query += f" FROM {self._from}"
        if self._where:
            query += f" WHERE {' AND '.join(self._where)}"
        if self._order_by:
            query += f" ORDER BY {', '.join(self._order_by)}"
        if self._limit:
            query += f" LIMIT {self._limit}"
        return query

# Usage: query = (QueryBuilder()
#                .select("id", "name")
#                .from_table("users")
#                .where("age > 18")
#                .order_by("name")
#                .limit(10)
#                .build())`,
        language: 'python',
        technologies: ['python'],
        categories: ['data', 'utilities'],
    },
    {
        title: 'Coroutine-based State Machine',
        description: 'Simple coroutine state machine. Usage: machine = state_machine(); next(machine); machine.send("start")',
        code: `def state_machine():
    """Simple coroutine-based state machine"""
    state = 'idle'
    while True:
        if state == 'idle':
            print("State: IDLE - Waiting for start")
            event = yield
            if event == 'start':
                state = 'running'

        elif state == 'running':
            print("State: RUNNING - Processing")
            event = yield
            if event == 'pause':
                state = 'paused'
            elif event == 'stop':
                state = 'idle'

        elif state == 'paused':
            print("State: PAUSED - Suspended")
            event = yield
            if event == 'resume':
                state = 'running'
            elif event == 'stop':
                state = 'idle'

# Usage:
# machine = state_machine()
# next(machine)  # Prime coroutine
# machine.send('start')
# machine.send('pause')`,
        language: 'python',
        technologies: ['python'],
        categories: ['state', 'architecture'],
    },
    {
        title: 'Async Web Scraper with Rate Limiting',
        description: 'Async scraper with concurrency, retries, and rate limiting. Usage: async with AsyncScraper() as s: await s.scrape_many(urls, parser)',
        code: `import asyncio
import aiohttp
from typing import List, Dict, Any, Optional
import logging

class AsyncScraper:
    def __init__(self, max_concurrent: int = 10, rate_limit: float = 1.0):
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.rate_limit = rate_limit
        self.session: Optional[aiohttp.ClientSession] = None
        self.results: List[Dict[str, Any]] = []
        self.logger = logging.getLogger(__name__)

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def fetch_url(self, url: str, retries: int = 3) -> Optional[str]:
        for attempt in range(retries):
            try:
                async with self.semaphore:
                    async with self.session.get(url, timeout=10) as response:
                        if response.status == 200:
                            return await response.text()
                        else:
                            self.logger.warning(f"Status {response.status} for {url}")
            except Exception as e:
                self.logger.error(f"Attempt {attempt + 1} failed for {url}: {e}")
                if attempt < retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
        return None

    async def scrape_url(self, url: str, parser: callable) -> Dict[str, Any]:
        html = await self.fetch_url(url)
        if html:
            data = parser(html, url)
            data['url'] = url
            data['timestamp'] = asyncio.get_event_loop().time()
            return data
        return {'url': url, 'error': 'Failed to fetch'}

    async def scrape_many(self, urls: List[str], parser: callable) -> List[Dict[str, Any]]:
        tasks = []
        for url in urls:
            task = asyncio.create_task(self.scrape_url(url, parser))
            tasks.append(task)
            await asyncio.sleep(self.rate_limit)  # Rate limiting

        results = await asyncio.gather(*tasks, return_exceptions=True)

        for result in results:
            if isinstance(result, Exception):
                self.logger.error(f"Scraping error: {result}")
            else:
                self.results.append(result)

        return self.results

    def save_results(self, filepath: str, format: str = 'json'):
        import json
        import csv

        if format == 'json':
            with open(filepath, 'w') as f:
                json.dump(self.results, f, indent=2)
        elif format == 'csv':
            if self.results:
                with open(filepath, 'w', newline='') as f:
                    writer = csv.DictWriter(f, fieldnames=self.results[0].keys())
                    writer.writeheader()
                    writer.writerows(self.results)

# Usage:
# async def parse_page(html, url):
#     return {'title': html.split('<title>')[1].split('</title>')[0]}
#
# async def main():
#     async with AsyncScraper(max_concurrent=5) as scraper:
#         urls = ['https://example.com/page1', 'https://example.com/page2']
#         results = await scraper.scrape_many(urls, parse_page)
#         scraper.save_results('output.json')`,
        language: 'python',
        technologies: ['python'],
        categories: ['network', 'performance'],
    },
    {
        title: 'Event-Driven Architecture with Async Handlers',
        description: 'Event bus with priority queue and async workers. Usage: bus.subscribe("user.created", handler)',
        code: `import asyncio
from typing import Dict, List, Callable, Any
from enum import Enum
from dataclasses import dataclass
from datetime import datetime
import uuid

class EventPriority(Enum):
    LOW = 0
    MEDIUM = 1
    HIGH = 2
    CRITICAL = 3

@dataclass
class Event:
    type: str
    data: Any
    priority: EventPriority = EventPriority.MEDIUM
    id: str = None
    timestamp: datetime = None

    def __post_init__(self):
        self.id = self.id or str(uuid.uuid4())
        self.timestamp = self.timestamp or datetime.now()

class EventBus:
    def __init__(self, max_workers: int = 10):
        self.handlers: Dict[str, List[Callable]] = {}
        self.queue: asyncio.PriorityQueue = asyncio.PriorityQueue()
        self.max_workers = max_workers
        self.workers = []
        self.running = False

    def subscribe(self, event_type: str, handler: Callable) -> Callable:
        if event_type not in self.handlers:
            self.handlers[event_type] = []
        self.handlers[event_type].append(handler)

        return lambda: self.handlers[event_type].remove(handler)

    def publish(self, event: Event) -> None:
        priority_value = -event.priority.value
        asyncio.create_task(self.queue.put((priority_value, event.timestamp, event)))

    async def start(self):
        self.running = True
        self.workers = [
            asyncio.create_task(self._worker(f"worker-{i}"))
            for i in range(self.max_workers)
        ]

    async def stop(self):
        self.running = False
        for _ in range(self.max_workers):
            await self.queue.put((0, datetime.now(), None))
        await asyncio.gather(*self.workers, return_exceptions=True)

    async def _worker(self, name: str):
        while self.running:
            try:
                _, _, event = await self.queue.get()
                if event is None:
                    break

                await self._process_event(event)
            except Exception as e:
                print(f"Worker {name} error: {e}")

    async def _process_event(self, event: Event):
        handlers = self.handlers.get(event.type, [])
        if not handlers:
            print(f"No handlers for event type: {event.type}")
            return

        tasks = []
        for handler in handlers:
            if asyncio.iscoroutinefunction(handler):
                tasks.append(asyncio.create_task(handler(event)))
            else:
                loop = asyncio.get_event_loop()
                tasks.append(loop.run_in_executor(None, handler, event))

        await asyncio.gather(*tasks, return_exceptions=True)

# Usage:
# bus = EventBus()
# async def user_created_handler(event):
#     print(f"User created: {event.data}")
# bus.subscribe("user.created", user_created_handler)
# await bus.start()
# bus.publish(Event("user.created", {"id": 1, "name": "John"}))`,
        language: 'python',
        technologies: ['python'],
        categories: ['events', 'architecture'],
    },
    {
        title: 'Generic Repository Pattern with SQLAlchemy',
        description: 'Async generic repository for SQLAlchemy models. Usage: repo = Repository(User, session)',
        code: `from typing import TypeVar, Generic, Type, List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.exc import IntegrityError
import logging

T = TypeVar('T')

class Repository(Generic[T]):
    def __init__(self, model: Type[T], session: AsyncSession):
        self.model = model
        self.session = session
        self.logger = logging.getLogger(f"{__name__}.{model.__name__}")

    async def create(self, **kwargs) -> T:
        """Create a new entity"""
        try:
            instance = self.model(**kwargs)
            self.session.add(instance)
            await self.session.flush()
            await self.session.refresh(instance)
            return instance
        except IntegrityError as e:
            await self.session.rollback()
            self.logger.error(f"Integrity error creating {self.model.__name__}: {e}")
            raise

    async def get(self, id: Any) -> Optional[T]:
        """Get entity by ID"""
        result = await self.session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def find(self, **filters) -> List[T]:
        """Find entities by filters"""
        query = select(self.model)
        for key, value in filters.items():
            if hasattr(self.model, key):
                query = query.where(getattr(self.model, key) == value)

        result = await self.session.execute(query)
        return result.scalars().all()

    async def find_one(self, **filters) -> Optional[T]:
        """Find one entity by filters"""
        results = await self.find(**filters)
        return results[0] if results else None

    async def update(self, id: Any, **kwargs) -> Optional[T]:
        """Update entity by ID"""
        try:
            instance = await self.get(id)
            if not instance:
                return None

            for key, value in kwargs.items():
                if hasattr(instance, key):
                    setattr(instance, key, value)

            await self.session.flush()
            await self.session.refresh(instance)
            return instance
        except Exception as e:
            await self.session.rollback()
            self.logger.error(f"Error updating {self.model.__name__} {id}: {e}")
            raise

    async def delete(self, id: Any) -> bool:
        """Delete entity by ID"""
        try:
            result = await self.session.execute(
                delete(self.model).where(self.model.id == id)
            )
            return result.rowcount > 0
        except Exception as e:
            await self.session.rollback()
            self.logger.error(f"Error deleting {self.model.__name__} {id}: {e}")
            raise

    async def paginate(self, page: int = 1, per_page: int = 20,
                       **filters) -> Dict[str, Any]:
        """Paginate results"""
        query = select(self.model)

        for key, value in filters.items():
            if hasattr(self.model, key):
                query = query.where(getattr(self.model, key) == value)

        count_query = select(self.model).from_self().alias().count()
        total = await self.session.scalar(count_query)

        query = query.limit(per_page).offset((page - 1) * per_page)
        result = await self.session.execute(query)
        items = result.scalars().all()

        return {
            'items': items,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page,
        }

    async def bulk_create(self, items: List[Dict[str, Any]]) -> List[T]:
        """Create multiple entities"""
        instances = []
        try:
            for item in items:
                instance = self.model(**item)
                self.session.add(instance)
                instances.append(instance)

            await self.session.flush()
            return instances
        except Exception as e:
            await self.session.rollback()
            self.logger.error(f"Error in bulk create: {e}")
            raise

# Usage:
# class User(Base):
#     __tablename__ = 'users'
#     id = Column(Integer, primary_key=True)
#     name = Column(String)
#     email = Column(String, unique=True)
#
# repo = Repository(User, session)
# user = await repo.create(name="John", email="john@example.com")`,
        language: 'python',
        technologies: ['python'],
        categories: ['database', 'architecture'],
    },
    {
        title: 'Advanced Caching System',
        description: 'Async LRU cache with TTL, stats, and persistence. Usage: value = await cache.get_or_set("user:1", factory)',
        code: `from typing import TypeVar, Generic, Optional, Callable, Any
from datetime import datetime, timedelta
import pickle
import hashlib
import asyncio
from collections import OrderedDict
import logging

T = TypeVar('T')

class CacheEntry(Generic[T]):
    def __init__(self, value: T, ttl: int):
        self.value = value
        self.expires_at = datetime.now() + timedelta(seconds=ttl)
        self.hits = 0
        self.created_at = datetime.now()

class Cache(Generic[T]):
    def __init__(self, max_size: int = 1000, default_ttl: int = 300):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self._cache: OrderedDict[str, CacheEntry[T]] = OrderedDict()
        self._lock = asyncio.Lock()
        self.logger = logging.getLogger(__name__)

    def _make_key(self, *args, **kwargs) -> str:
        key_parts = [str(arg) for arg in args]
        key_parts.extend(f"{k}:{v}" for k, v in sorted(kwargs.items()))
        key = ":".join(key_parts)
        return hashlib.md5(key.encode()).hexdigest()

    async def get(self, key: str) -> Optional[T]:
        async with self._lock:
            if key not in self._cache:
                return None

            entry = self._cache[key]

            if datetime.now() > entry.expires_at:
                del self._cache[key]
                return None

            entry.hits += 1
            self._cache.move_to_end(key)

            return entry.value

    async def set(self, key: str, value: T, ttl: Optional[int] = None):
        async with self._lock:
            if len(self._cache) >= self.max_size:
                self._evict_lru()

            self._cache[key] = CacheEntry(value, ttl or self.default_ttl)

    async def delete(self, key: str):
        async with self._lock:
            if key in self._cache:
                del self._cache[key]

    async def clear(self):
        async with self._lock:
            self._cache.clear()

    async def get_or_set(self, key: str, factory: Callable[[], T],
                         ttl: Optional[int] = None) -> T:
        value = await self.get(key)
        if value is not None:
            return value

        value = factory()
        await self.set(key, value, ttl)
        return value

    async def get_or_set_async(self, key: str, factory: Callable[[], Any],
                               ttl: Optional[int] = None) -> T:
        value = await self.get(key)
        if value is not None:
            return value

        if asyncio.iscoroutinefunction(factory):
            value = await factory()
        else:
            value = await asyncio.to_thread(factory)

        await self.set(key, value, ttl)
        return value

    def _evict_lru(self):
        if self._cache:
            self._cache.popitem(last=False)

    async def stats(self) -> dict:
        async with self._lock:
            total_entries = len(self._cache)
            if total_entries == 0:
                return {}

            total_hits = sum(entry.hits for entry in self._cache.values())
            avg_hits = total_hits / total_entries
            oldest = min(entry.created_at for entry in self._cache.values())
            newest = max(entry.created_at for entry in self._cache.values())

            return {
                'size': total_entries,
                'max_size': self.max_size,
                'total_hits': total_hits,
                'avg_hits_per_entry': avg_hits,
                'oldest_entry': oldest.isoformat(),
                'newest_entry': newest.isoformat(),
            }

    async def save_to_disk(self, filepath: str):
        async with self._lock:
            with open(filepath, 'wb') as f:
                pickle.dump(dict(self._cache), f)

    async def load_from_disk(self, filepath: str):
        try:
            with open(filepath, 'rb') as f:
                data = pickle.load(f)
                async with self._lock:
                    self._cache = OrderedDict(data)
        except FileNotFoundError:
            self.logger.warning(f"Cache file {filepath} not found")

# Usage:
# cache = Cache[str](max_size=1000, default_ttl=60)
# value = await cache.get_or_set("user:1", lambda: fetch_user_from_db(1))`,
        language: 'python',
        technologies: ['python'],
        categories: ['performance', 'data'],
    },
    {
        title: 'Message Queue with Priorities',
        description: 'Priority queue for async message processing. Usage: queue.publish(Message({"event": "user_login"}, priority=MessagePriority.HIGH))',
        code: `import asyncio
from typing import Any, Optional, Callable
from enum import Enum
from dataclasses import dataclass, field
import heapq
import uuid

class MessagePriority(Enum):
    LOW = 3
    NORMAL = 2
    HIGH = 1
    CRITICAL = 0

@dataclass(order=True)
class Message:
    priority: int
    timestamp: float
    id: str = field(compare=False)
    data: Any = field(compare=False)
    message_type: str = field(compare=False)

    def __init__(self, data: Any, message_type: str = "default",
                 priority: MessagePriority = MessagePriority.NORMAL):
        self.priority = priority.value
        self.timestamp = asyncio.get_event_loop().time()
        self.id = str(uuid.uuid4())
        self.data = data
        self.message_type = message_type

class MessageQueue:
    def __init__(self, max_size: int = 1000):
        self.queue: list = []
        self.max_size = max_size
        self.consumers: dict[str, list[Callable]] = {}
        self.running = False
        self.processing = False
        self.stats = {
            'messages_published': 0,
            'messages_processed': 0,
            'messages_failed': 0,
            'queue_size': 0,
        }

    def publish(self, message: Message) -> bool:
        if len(self.queue) >= self.max_size:
            return False

        heapq.heappush(self.queue, message)
        self.stats['messages_published'] += 1
        self.stats['queue_size'] = len(self.queue)
        return True

    def subscribe(self, consumer_id: str, callback: Callable):
        if consumer_id not in self.consumers:
            self.consumers[consumer_id] = []
        self.consumers[consumer_id].append(callback)

    def unsubscribe(self, consumer_id: str, callback: Optional[Callable] = None):
        if consumer_id in self.consumers:
            if callback:
                self.consumers[consumer_id].remove(callback)
            else:
                del self.consumers[consumer_id]

    async def process_messages(self):
        self.running = True
        while self.running:
            if not self.queue:
                await asyncio.sleep(0.1)
                continue

            message = heapq.heappop(self.queue)
            self.stats['queue_size'] = len(self.queue)

            await self._process_message(message)

    async def _process_message(self, message: Message):
        self.processing = True
        try:
            consumers = []
            for consumer_list in self.consumers.values():
                consumers.extend(consumer_list)

            if not consumers:
                print(f"No consumers for message: {message.message_type}")
                return

            tasks = []
            for consumer in consumers:
                if asyncio.iscoroutinefunction(consumer):
                    task = asyncio.create_task(consumer(message))
                else:
                    task = asyncio.create_task(
                        asyncio.to_thread(consumer, message)
                    )
                tasks.append(task)

            await asyncio.gather(*tasks, return_exceptions=True)
            self.stats['messages_processed'] += 1

        except Exception as e:
            self.stats['messages_failed'] += 1
            print(f"Error processing message {message.id}: {e}")
        finally:
            self.processing = False

    async def start(self):
        self.task = asyncio.create_task(self.process_messages())

    async def stop(self):
        self.running = False
        if hasattr(self, 'task'):
            await self.task

    def get_stats(self):
        return {**self.stats}

# Usage:
# queue = MessageQueue()
# async def log_consumer(message):
#     print(f"Log: {message.data}")
# queue.subscribe("logger", log_consumer)
# await queue.start()
# queue.publish(Message({"event": "user_login"}, priority=MessagePriority.HIGH))`,
        language: 'python',
        technologies: ['python'],
        categories: ['architecture', 'backend'],
    },
    {
        title: 'Data Pipeline with Transformations',
        description: 'Async pipeline with stages and error handlers. Usage: pipeline.add_stage(PipelineStage("extract", fn))',
        code: `from typing import TypeVar, Generic, List, Any, Callable
from dataclasses import dataclass
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging

T = TypeVar('T')
U = TypeVar('U')

@dataclass
class PipelineContext:
    data: Any
    metadata: dict
    errors: list

class PipelineStage(Generic[T, U]):
    def __init__(self, name: str,
                 transform: Callable[[T, PipelineContext], U],
                 workers: int = 1):
        self.name = name
        self.transform = transform
        self.workers = workers

    async def process(self, items: List[Any], context: PipelineContext) -> List[Any]:
        if self.workers == 1:
            return [self.transform(item, context) for item in items]

        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor(max_workers=self.workers) as executor:
            futures = [
                loop.run_in_executor(executor, self.transform, item, context)
                for item in items
            ]
            return await asyncio.gather(*futures, return_exceptions=True)

class DataPipeline(Generic[T, U]):
    def __init__(self, name: str = "pipeline"):
        self.name = name
        self.stages: List[PipelineStage] = []
        self.error_handlers: List[Callable] = []
        self.logger = logging.getLogger(f"pipeline.{name}")

    def add_stage(self, stage: PipelineStage) -> 'DataPipeline':
        self.stages.append(stage)
        return self

    def add_error_handler(self, handler: Callable) -> 'DataPipeline':
        self.error_handlers.append(handler)
        return self

    async def execute(self, data: T, **metadata) -> U:
        context = PipelineContext(
            data=data,
            metadata=metadata,
            errors=[],
        )

        current_items = [data] if not isinstance(data, list) else data

        for i, stage in enumerate(self.stages):
            try:
                self.logger.info(f"Executing stage {i+1}: {stage.name}")

                if asyncio.iscoroutinefunction(stage.transform):
                    processed = []
                    for item in current_items:
                        result = await stage.transform(item, context)
                        processed.append(result)
                    current_items = processed
                else:
                    current_items = await stage.process(current_items, context)

                for result in current_items:
                    if isinstance(result, Exception):
                        raise result

            except Exception as e:
                self.logger.error(f"Stage {stage.name} failed: {e}")
                context.errors.append(e)

                for handler in self.error_handlers:
                    if asyncio.iscoroutinefunction(handler):
                        await handler(e, stage, context)
                    else:
                        handler(e, stage, context)

                if not self.should_continue_on_error(e):
                    raise

        return current_items[0] if len(current_items) == 1 else current_items

    def should_continue_on_error(self, error: Exception) -> bool:
        return False

# Usage:
# def extract_emails(text: str, ctx: PipelineContext) -> list:
#     import re
#     return re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
#
# def remove_duplicates(emails: list, ctx: PipelineContext) -> list:
#     return list(set(emails))
#
# pipeline = DataPipeline[str, list]("email-extractor")
# pipeline.add_stage(PipelineStage("extract", extract_emails))
# pipeline.add_stage(PipelineStage("dedupe", remove_duplicates))
# result = await pipeline.execute("Contact john@email.com and jane@email.com")`,
        language: 'python',
        technologies: ['python'],
        categories: ['data', 'architecture'],
    },
    {
        title: 'Distributed Lock Implementation',
        description: 'Redis-based distributed lock with renewal. Usage: async with lock.acquire_context(): ...',
        code: `import asyncio
import uuid
from typing import Optional, Callable
import aioredis
from contextlib import asynccontextmanager

class DistributedLock:
    def __init__(self, redis_client, lock_key: str,
                 timeout: int = 30, retry_interval: float = 0.1):
        self.redis = redis_client
        self.lock_key = f"lock:{lock_key}"
        self.timeout = timeout
        self.retry_interval = retry_interval
        self.lock_value = None
        self.lock_acquired = False
        self.renew_task = None

    async def acquire(self, blocking: bool = True) -> bool:
        self.lock_value = str(uuid.uuid4())

        while True:
            acquired = await self.redis.set(
                self.lock_key,
                self.lock_value,
                nx=True,
                px=self.timeout * 1000
            )

            if acquired:
                self.lock_acquired = True
                self.renew_task = asyncio.create_task(self._auto_renew())
                return True

            if not blocking:
                return False

            await asyncio.sleep(self.retry_interval)

    async def release(self):
        if self.renew_task:
            self.renew_task.cancel()
            try:
                await self.renew_task
            except asyncio.CancelledError:
                pass

        if self.lock_acquired:
            lua_script = """
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
            """

            await self.redis.eval(
                lua_script,
                keys=[self.lock_key],
                args=[self.lock_value]
            )
            self.lock_acquired = False

    async def _auto_renew(self):
        try:
            while self.lock_acquired:
                await asyncio.sleep(self.timeout / 3)

                if not self.lock_acquired:
                    break

                lua_script = """
                if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("pexpire", KEYS[1], ARGV[2])
                else
                    return 0
                end
                """

                result = await self.redis.eval(
                    lua_script,
                    keys=[self.lock_key],
                    args=[self.lock_value, self.timeout * 1000]
                )

                if not result:
                    self.lock_acquired = False
                    break
        except asyncio.CancelledError:
            pass

    @asynccontextmanager
    async def acquire_context(self, blocking: bool = True):
        try:
            acquired = await self.acquire(blocking)
            yield acquired
        finally:
            if self.lock_acquired:
                await self.release()

    async def execute_with_lock(self, func: Callable, *args, **kwargs):
        async with self.acquire_context() as acquired:
            if not acquired:
                raise TimeoutError("Could not acquire lock")

            if asyncio.iscoroutinefunction(func):
                return await func(*args, **kwargs)
            else:
                return await asyncio.to_thread(func, *args, **kwargs)

class LockManager:
    def __init__(self, redis_url: str = "redis://localhost"):
        self.redis_url = redis_url
        self.redis = None
        self.locks = {}

    async def connect(self):
        self.redis = await aioredis.from_url(self.redis_url)

    async def disconnect(self):
        if self.redis:
            await self.redis.close()

    def get_lock(self, name: str, timeout: int = 30) -> DistributedLock:
        if name not in self.locks:
            self.locks[name] = DistributedLock(self.redis, name, timeout)
        return self.locks[name]

# Usage:
# manager = LockManager()
# await manager.connect()
# lock = manager.get_lock("resource:123")
# async with lock.acquire_context():
#     await process_resource()`,
        language: 'python',
        technologies: ['python'],
        categories: ['infrastructure', 'backend'],
    },
    {
        title: 'GraphQL-like Query Resolver',
        description: 'Simple query parser and resolver with middleware. Usage: resolver.parse_query("users {id, name} where age > 18 limit 10")',
        code: `from typing import Dict, Any, Optional, Callable, List
from dataclasses import dataclass, field
from enum import Enum
import re
import asyncio

class QueryOperator(Enum):
    EQ = "="
    NE = "!="
    GT = ">"
    LT = "<"
    GTE = ">="
    LTE = "<="
    IN = "in"
    LIKE = "like"

@dataclass
class QueryCondition:
    field: str
    operator: QueryOperator
    value: Any

@dataclass
class Query:
    resource: str
    fields: List[str] = field(default_factory=list)
    conditions: List[QueryCondition] = field(default_factory=list)
    limit: Optional[int] = None
    offset: int = 0
    order_by: Optional[str] = None
    order_direction: str = "asc"

class QueryResolver:
    def __init__(self):
        self.resolvers: Dict[str, Callable] = {}
        self.middlewares: List[Callable] = []

    def resolver(self, resource: str):
        def decorator(func: Callable):
            self.resolvers[resource] = func
            return func
        return decorator

    def use(self, middleware: Callable):
        self.middlewares.append(middleware)

    async def resolve(self, query: Query) -> Any:
        context = {"query": query, "result": None}
        for middleware in self.middlewares:
            await middleware(context)

        resolver = self.resolvers.get(query.resource)
        if not resolver:
            raise ValueError(f"No resolver for resource: {query.resource}")

        if asyncio.iscoroutinefunction(resolver):
            result = await resolver(query)
        else:
            result = resolver(query)

        return result

    def parse_query(self, query_string: str) -> Query:
        patterns = {
            'resource': r'^(\w+)',
            'fields': r'\{([^}]+)\}',
            'conditions': r'where\s+(.+)',
            'limit': r'limit\s+(\d+)',
            'offset': r'offset\s+(\d+)',
            'order': r'order by\s+(\w+)\s+(asc|desc)',
        }

        resource_match = re.match(patterns['resource'], query_string)
        if not resource_match:
            raise ValueError("Invalid query format")

        resource = resource_match.group(1)

        fields_match = re.search(patterns['fields'], query_string)
        fields = []
        if fields_match:
            fields = [f.strip() for f in fields_match.group(1).split(',')]

        conditions = []
        conditions_match = re.search(patterns['conditions'], query_string)
        if conditions_match:
            condition_str = conditions_match.group(1).split('limit')[0].strip()
            _ = re.split(r'\s+(and|or)\s+', condition_str)

        limit_match = re.search(patterns['limit'], query_string)
        limit = int(limit_match.group(1)) if limit_match else None

        offset_match = re.search(patterns['offset'], query_string)
        offset = int(offset_match.group(1)) if offset_match else 0

        order_match = re.search(patterns['order'], query_string)
        order_by = None
        order_direction = "asc"
        if order_match:
            order_by = order_match.group(1)
            order_direction = order_match.group(2)

        return Query(
            resource=resource,
            fields=fields,
            conditions=conditions,
            limit=limit,
            offset=offset,
            order_by=order_by,
            order_direction=order_direction,
        )

# Usage:
# resolver = QueryResolver()
# @resolver.resolver("users")
# async def resolve_users(query):
#     return await db.fetch_users(query)
# query = resolver.parse_query("users {id, name} where age > 18 limit 10")
# result = await resolver.resolve(query)`,
        language: 'python',
        technologies: ['python'],
        categories: ['data', 'architecture'],
    },
    {
        title: 'Background Task Scheduler',
        description: 'Async task scheduler with intervals and status tracking. Usage: @scheduler.schedule(interval=60, name="data_sync")',
        code: `import asyncio
from typing import Callable, Dict, Any, Optional, List
from datetime import datetime, timedelta
from enum import Enum
import logging
import traceback

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ScheduledTask:
    def __init__(self, func: Callable, interval: int,
                 name: Optional[str] = None, max_runs: int = None):
        self.func = func
        self.interval = interval
        self.name = name or func.__name__
        self.max_runs = max_runs
        self.status = TaskStatus.PENDING
        self.runs = 0
        self.last_run: Optional[datetime] = None
        self.next_run: datetime = datetime.now()
        self.error: Optional[str] = None
        self.result: Any = None

class TaskScheduler:
    def __init__(self, max_concurrent: int = 10):
        self.tasks: Dict[str, ScheduledTask] = {}
        self.running = False
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.logger = logging.getLogger(__name__)

    def schedule(self, interval: int, name: Optional[str] = None,
                 max_runs: int = None):
        def decorator(func: Callable):
            task_name = name or func.__name__
            task = ScheduledTask(func, interval, task_name, max_runs)
            self.tasks[task_name] = task
            return func
        return decorator

    async def start(self):
        self.running = True
        self.scheduler_task = asyncio.create_task(self._run_scheduler())

    async def stop(self):
        self.running = False
        if hasattr(self, 'scheduler_task'):
            self.scheduler_task.cancel()
            try:
                await self.scheduler_task
            except asyncio.CancelledError:
                pass

    async def _run_scheduler(self):
        while self.running:
            now = datetime.now()

            for task in self.tasks.values():
                if task.status == TaskStatus.PENDING and task.next_run <= now:
                    if task.max_runs and task.runs >= task.max_runs:
                        task.status = TaskStatus.COMPLETED
                        continue

                    asyncio.create_task(self._run_task(task))

            await asyncio.sleep(1)

    async def _run_task(self, task: ScheduledTask):
        async with self.semaphore:
            task.status = TaskStatus.RUNNING
            task.last_run = datetime.now()

            try:
                self.logger.info(f"Starting task: {task.name}")

                if asyncio.iscoroutinefunction(task.func):
                    task.result = await task.func()
                else:
                    task.result = await asyncio.to_thread(task.func)

                task.status = TaskStatus.COMPLETED
                self.logger.info(f"Completed task: {task.name}")

            except Exception as e:
                task.status = TaskStatus.FAILED
                task.error = traceback.format_exc()
                self.logger.error(f"Task {task.name} failed: {e}")

            finally:
                task.runs += 1
                task.next_run = datetime.now() + timedelta(seconds=task.interval)
                task.status = TaskStatus.PENDING

    def get_task_status(self, name: str) -> Optional[Dict[str, Any]]:
        task = self.tasks.get(name)
        if not task:
            return None

        return {
            'name': task.name,
            'status': task.status.value,
            'runs': task.runs,
            'last_run': task.last_run.isoformat() if task.last_run else None,
            'next_run': task.next_run.isoformat(),
            'error': task.error,
            'result': task.result,
        }

    def list_tasks(self) -> List[Dict[str, Any]]:
        return [self.get_task_status(name) for name in self.tasks]

# Usage:
# scheduler = TaskScheduler(max_concurrent=5)
# @scheduler.schedule(interval=60, name="data_sync", max_runs=10)
# async def sync_data():
#     return await fetch_and_sync()
# await scheduler.start()
# status = scheduler.get_task_status("data_sync")
# await scheduler.stop()`,
        language: 'python',
        technologies: ['python'],
        categories: ['infrastructure', 'backend'],
    },
    {
        title: 'API Rate Limiter with Multiple Strategies',
        description: 'Token bucket and sliding window rate limiting. Usage: limiter = RateLimiter(TokenBucket(capacity=100, refill_rate=10))',
        code: `from typing import Dict, Optional, Callable
import time
import asyncio
from collections import defaultdict, deque
import hashlib

class RateLimitStrategy:
    def is_allowed(self, key: str) -> bool:
        raise NotImplementedError

    def get_remaining(self, key: str) -> int:
        raise NotImplementedError

    def get_reset_time(self, key: str) -> int:
        raise NotImplementedError

class TokenBucket(RateLimitStrategy):
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens: Dict[str, float] = defaultdict(lambda: capacity)
        self.last_refill: Dict[str, float] = defaultdict(time.time)

    def is_allowed(self, key: str) -> bool:
        self._refill(key)

        if self.tokens[key] >= 1:
            self.tokens[key] -= 1
            return True
        return False

    def _refill(self, key: str):
        now = time.time()
        elapsed = now - self.last_refill[key]
        self.tokens[key] = min(
            self.capacity,
            self.tokens[key] + elapsed * self.refill_rate
        )
        self.last_refill[key] = now

    def get_remaining(self, key: str) -> int:
        self._refill(key)
        return int(self.tokens[key])

    def get_reset_time(self, key: str) -> int:
        self._refill(key)
        tokens_needed = self.capacity - self.tokens[key]
        return int(tokens_needed / self.refill_rate) if tokens_needed > 0 else 0

class SlidingWindow(RateLimitStrategy):
    def __init__(self, max_requests: int, window_size: int):
        self.max_requests = max_requests
        self.window_size = window_size
        self.requests: Dict[str, deque] = defaultdict(lambda: deque())

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        window = self.requests[key]

        while window and window[0] < now - self.window_size:
            window.popleft()

        if len(window) < self.max_requests:
            window.append(now)
            return True
        return False

    def get_remaining(self, key: str) -> int:
        now = time.time()
        window = self.requests[key]
        while window and window[0] < now - self.window_size:
            window.popleft()
        return max(0, self.max_requests - len(window))

    def get_reset_time(self, key: str) -> int:
        window = self.requests[key]
        if not window or len(window) < self.max_requests:
            return 0
        oldest = window[0]
        return max(0, int(oldest + self.window_size - time.time()))

class RateLimiter:
    def __init__(self, strategy: RateLimitStrategy):
        self.strategy = strategy
        self.middleware = []

    def use(self, middleware: Callable):
        self.middleware.append(middleware)

    def limit(self, key_func: Optional[Callable] = None):
        def decorator(func: Callable):
            async def wrapper(*args, **kwargs):
                if key_func:
                    key = key_func(*args, **kwargs)
                else:
                    key_data = f"{func.__name__}:{args}:{kwargs}"
                    key = hashlib.md5(key_data.encode()).hexdigest()

                context = {'key': key, 'allowed': True}
                for m in self.middleware:
                    if asyncio.iscoroutinefunction(m):
                        await m(context)
                    else:
                        m(context)

                if not context['allowed']:
                    raise Exception("Rate limit exceeded")

                if not self.strategy.is_allowed(key):
                    retry_after = self.strategy.get_reset_time(key)
                    raise Exception(f"Rate limit exceeded. Try again in {retry_after}s")

                return await func(*args, **kwargs)
            return wrapper
        return decorator

    def get_headers(self, key: str) -> Dict[str, str]:
        return {
            'X-RateLimit-Limit': str(self.strategy.max_requests if hasattr(self.strategy, 'max_requests') else self.strategy.capacity),
            'X-RateLimit-Remaining': str(self.strategy.get_remaining(key)),
            'X-RateLimit-Reset': str(int(time.time()) + self.strategy.get_reset_time(key)),
        }

# Usage:
# limiter = RateLimiter(TokenBucket(capacity=100, refill_rate=10))
# @limiter.limit(key_func=lambda user_id: f"user:{user_id}")
# async def api_call(user_id: str, data: dict):
#     return await process_request(data)
# limiter = RateLimiter(SlidingWindow(max_requests=60, window_size=60))
# try:
#     result = await api_call("user123", {"action": "test"})
# except Exception as e:
#     print(f"Rate limited: {e}")`,
        language: 'python',
        technologies: ['python'],
        categories: ['security', 'api'],
    },
]
