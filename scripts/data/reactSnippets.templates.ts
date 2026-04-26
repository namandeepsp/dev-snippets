import type { SnippetTemplate } from './snippet.templates'

export const REACT_SNIPPET_TEMPLATES: SnippetTemplate[] = [
	{
		title: 'useState Hook Basic',
		description:
			'Basic state management with useState hook. Usage: const [count, setCount] = useState(0)',
		code: `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['hooks', 'library'],
	},
	{
		title: 'useEffect Hook',
		description:
			'Side effects management with useEffect. Runs after render and cleanup on unmount. Usage: useEffect(() => { /* effect */ }, [dependencies])',
		code: `import { useState, useEffect } from 'react';

export function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });

    return () => {
      // Cleanup function
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{JSON.stringify(data)}</div>;
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['hooks', 'utilities'],
	},
	{
		title: 'useContext Hook',
		description:
			'Access context values without prop drilling. Usage: const value = useContext(MyContext)',
		code: `import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

export function ThemedComponent() {
  const theme = useContext(ThemeContext);

  return (
    <div style={{ background: theme === 'dark' ? '#333' : '#fff' }}>
      Current theme: {theme}
    </div>
  );
}

export function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedComponent />
    </ThemeContext.Provider>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['hooks', 'library'],
	},
	{
		title: 'useReducer Hook',
		description:
			'Complex state management with useReducer. Usage: const [state, dispatch] = useReducer(reducer, initialState)',
		code: `import { useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    default:
      return state;
  }
}

export function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['hooks', 'library'],
	},
	{
		title: 'useCallback Hook',
		description:
			'Memoize callback functions to prevent unnecessary re-renders in child components. Usage: const memoizedCallback = useCallback(() => {}, [dependencies])',
		code: `import { useState, useCallback } from 'react';

export function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <Child onClick={handleClick} />
    </div>
  );
}

function Child({ onClick }) {
  console.log('Child rendered');
  return <button onClick={onClick}>Increment</button>;
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['hooks', 'performance'],
	},
	{
		title: 'useMemo Hook',
		description:
			'Memoize expensive computations to avoid recalculation on every render. Usage: const memoizedValue = useMemo(() => expensiveComputation(), [dependencies])',
		code: `import { useState, useMemo } from 'react';

export function ExpensiveComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  const expensiveValue = useMemo(() => {
    console.log('Computing expensive value...');
    return count * 2;
  }, [count]);

  return (
    <div>
      <p>Count: {count}, Expensive: {expensiveValue}</p>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['hooks', 'performance'],
	},
	{
		title: 'useRef Hook',
		description:
			'Access DOM elements directly or store mutable values that persist across renders. Usage: const ref = useRef(null)',
		code: `import { useRef } from 'react';

export function TextInput() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus</button>
      <button onClick={clearInput}>Clear</button>
    </div>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['hooks', 'frontend'],
	},
	{
		title: 'Custom Hook - useLocalStorage',
		description:
			'Custom hook to sync state with localStorage. Usage: const [value, setValue] = useLocalStorage("key", defaultValue)',
		code: `import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export function App() {
  const [name, setName] = useLocalStorage('name', 'Guest');
  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <p>Hello, {name}!</p>
    </div>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['hooks', 'hooks'],
	},
	{
		title: 'Custom Hook - useFetch',
		description:
			'Custom hook for data fetching with loading and error states. Usage: const { data, loading, error } = useFetch(url)',
		code: `import { useState, useEffect } from 'react';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const json = await response.json();
        if (isMounted) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [url]);

  return { data, loading, error };
}

export function UserList() {
  const { data, loading, error } = useFetch('/api/users');
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['hooks', 'hooks', 'utilities'],
	},
	{
		title: 'Controlled Form Component',
		description:
			'Form with controlled inputs where React state is the single source of truth. Usage: <input value={state} onChange={handleChange} />',
		code: `import { useState } from 'react';

export function ControlledForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
      <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
      <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Message" />
      <button type="submit">Submit</button>
    </form>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['frontend', 'library'],
	},
	{
		title: 'Conditional Rendering',
		description:
			'Different patterns for conditional rendering in React. Usage: {condition ? <A /> : <B />} or {condition && <A />}',
		code: `import { useState } from 'react';

export function ConditionalRender() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('user');

  return (
    <div>
      {/* Ternary operator */}
      {isLoggedIn ? (
        <p>Welcome back!</p>
      ) : (
        <p>Please log in</p>
      )}

      {/* Logical AND */}
      {isLoggedIn && <button onClick={() => setIsLoggedIn(false)}>Logout</button>}

      {/* Switch-like pattern */}
      {userRole === 'admin' && <div>Admin Panel</div>}
      {userRole === 'user' && <div>User Dashboard</div>}
      {userRole === 'guest' && <div>Guest View</div>}

      {/* Render nothing */}
      {isLoggedIn ? <Dashboard /> : null}
    </div>
  );
}

function Dashboard() {
  return <div>Dashboard Content</div>;
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['frontend', 'utilities'],
	},
	{
		title: 'List Rendering with Keys',
		description:
			'Render lists efficiently with proper key usage. Usage: {items.map(item => <Item key={item.id} {...item} />)}',
		code: `import { useState } from 'react';

export function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', done: false },
    { id: 2, text: 'Build a project', done: false }
  ]);

  const addTodo = () => {
    const newTodo = {
      id: Date.now(),
      text: 'New todo',
      done: false
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div>
      <button onClick={addTodo}>Add Todo</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => removeTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['frontend', 'utilities'],
	},
	{
		title: 'Component Composition',
		description:
			'Build complex UIs by composing smaller components. Usage: <Parent><Child /></Parent>',
		code: `export function Card({ title, children, footer }) {
  return (
    <div className="card">
      <div className="card-header">{title}</div>
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

export function Button({ variant = 'primary', children, ...props }) {
  return (
    <button className={\`btn btn-\${variant}\`} {...props}>
      {children}
    </button>
  );
}

export function App() {
  return (
    <Card
      title="Welcome"
      footer={<Button>Close</Button>}
    >
      <p>This is a composed component</p>
      <Button variant="secondary">Learn More</Button>
    </Card>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['frontend', 'frontend'],
	},
	{
		title: 'Props Destructuring',
		description:
			'Destructure props for cleaner component code. Usage: function Component({ prop1, prop2, ...rest }) {}',
		code: `export function UserCard({ id, name, email, avatar, role = 'user', ...rest }) {
  return (
    <div className="user-card" {...rest}>
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{email}</p>
      <span className="badge">{role}</span>
    </div>
  );
}

export function UserList({ users }) {
  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard
          key={user.id}
          {...user}
          className="user-card-item"
        />
      ))}
    </div>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['frontend', 'utilities'],
	},
	{
		title: 'Event Handling',
		description:
			'Handle user events like clicks, input changes, and form submissions. Usage: onClick={handleClick}, onChange={handleChange}',
		code: `import { useState } from 'react';

export function EventDemo() {
  const [count, setCount] = useState(0);
  const [input, setInput] = useState('');

  const handleClick = (e) => {
    console.log('Button clicked', e);
    setCount(count + 1);
  };

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed:', input);
    }
  };

  const handleMouseEnter = () => {
    console.log('Mouse entered');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <div>
      <button onClick={handleClick}>Clicked {count} times</button>
      <input
        value={input}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        onMouseEnter={handleMouseEnter}
      />
      <form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['events', 'frontend'],
	},
	{
		title: 'Higher Order Component (HOC)',
		description:
			'Reuse component logic by wrapping components with HOC. Usage: const EnhancedComponent = withTheme(MyComponent)',
		code: `import { useState } from 'react';

export function withTheme(Component) {
  return function ThemedComponent(props) {
    const [theme, setTheme] = useState('light');

    const toggleTheme = () => {
      setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
      <div style={{
        background: theme === 'dark' ? '#333' : '#fff',
        color: theme === 'dark' ? '#fff' : '#000'
      }}>
        <Component {...props} theme={theme} toggleTheme={toggleTheme} />
      </div>
    );
  };
}

function MyComponent({ theme, toggleTheme }) {
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

export const ThemedComponent = withTheme(MyComponent);`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['design', 'design'],
	},
	{
		title: 'Render Props Pattern',
		description:
			'Share code between components using a function as a child. Usage: <DataProvider render={data => <Component data={data} />} />',
		code: `import { useState } from 'react';

export function DataProvider({ render }) {
  const [data, setData] = useState({ count: 0 });

  const updateData = (newData) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  return render(data, updateData);
}

export function App() {
  return (
    <DataProvider
      render={(data, updateData) => (
        <div>
          <p>Count: {data.count}</p>
          <button onClick={() => updateData({ count: data.count + 1 })}>
            Increment
          </button>
        </div>
      )}
    />
  );
}

// Alternative with children as function
export function MouseTracker({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div onMouseMove={handleMouseMove}>
      {children(position)}
    </div>
  );
}

export function App2() {
  return (
    <MouseTracker>
      {(position) => (
        <p>Mouse position: {position.x}, {position.y}</p>
      )}
    </MouseTracker>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['design', 'design'],
	},
	{
		title: 'Error Boundary',
		description:
			'Catch errors in child components and display fallback UI. Usage: <ErrorBoundary><App /></ErrorBoundary>',
		code: `import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', border: '1px solid red' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function BuggyComponent() {
  throw new Error('This component has a bug!');
}

export function App() {
  return (
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['utilities', 'design'],
	},
	{
		title: 'Lazy Loading Components',
		description:
			'Code splitting with React.lazy and Suspense for better performance. Usage: const LazyComponent = lazy(() => import("./Component"))',
		code: `import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));
const Dashboard = lazy(() => import('./Dashboard'));

export function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading component...</div>}>
        <HeavyComponent />
      </Suspense>

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

// HeavyComponent.tsx
export default function HeavyComponent() {
  return <div>This is a heavy component loaded lazily</div>;
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['performance', 'performance'],
	},
	{
		title: 'Portal Component',
		description:
			'Render components outside the DOM hierarchy using createPortal. Usage: ReactDOM.createPortal(<Modal />, document.body)',
		code: `import { createPortal } from 'react-dom';
import { useState } from 'react';

export function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>Modal Title</h2>
        <p>Modal content goes here</p>
      </Modal>
    </div>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['frontend', 'design'],
	},
	{
		title: 'Debounced Search Input',
		description:
			'Search input with debounced API calls to avoid excessive requests. Usage: <SearchInput onSearch={handleSearch} />',
		code: `import { useState, useEffect, useRef } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function SearchInput({ onSearch }) {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    if (!debouncedInput) {
      setResults([]);
      return;
    }

    setLoading(true);
    fetch(\`/api/search?q=\${debouncedInput}\`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        onSearch?.(data);
      })
      .finally(() => setLoading(false));
  }, [debouncedInput, onSearch]);

  return (
    <div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Search..."
      />
      {loading && <p>Searching...</p>}
      <ul>
        {results.map((result, i) => (
          <li key={i}>{result}</li>
        ))}
      </ul>
    </div>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['hooks', 'performance', 'utilities'],
	},
	{
		title: 'Infinite Scroll Component',
		description:
			'Infinite scroll with IntersectionObserver for loading more items as user scrolls. Usage: <InfiniteScroll onLoadMore={handleLoadMore} />',
		code: `import { useEffect, useRef, useState } from 'react';

export function InfiniteScroll({ onLoadMore, hasMore, children }) {
  const observerTarget = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);
          onLoadMore?.().finally(() => setIsLoading(false));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div>
      {children}
      <div ref={observerTarget} style={{ height: '20px' }}>
        {isLoading && <p>Loading more...</p>}
      </div>
    </div>
  );
}

export function ItemList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = async () => {
    const response = await fetch(\`/api/items?page=\${page + 1}\`);
    const newItems = await response.json();
    setItems(prev => [...prev, ...newItems]);
    setPage(prev => prev + 1);
    setHasMore(newItems.length > 0);
  };

  return (
    <InfiniteScroll onLoadMore={handleLoadMore} hasMore={hasMore}>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </InfiniteScroll>
  );
}`,
		language: 'typescript',
		technologies: ['react'],
		categories: ['performance', 'design', 'utilities'],
	},
]
