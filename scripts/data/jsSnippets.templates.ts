import type { SnippetTemplate } from './snippet.templates'

export const JS_SNIPPET_TEMPLATES: SnippetTemplate[] = [
	{
		title: 'Deep Clone Object',
		description:
			'Create a deep copy of any object using JSON serialization. Usage: const clonedObj = deepClone(originalObj)',
		code: `const deepClone = obj => JSON.parse(JSON.stringify(obj));`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities'],
	},
	{
		title: 'Check if Array is Empty',
		description:
			'Safely check if a value is an empty array. Usage: isEmpty([]) // true',
		code: `const isEmpty = arr => !Array.isArray(arr) || arr.length === 0;`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities'],
	},
	{
		title: 'Generate Random Hex Color',
		description:
			'Generate a random hex color code. Usage: randomColor() // "#3e2f1b"',
		code: `const randomColor = () => \`#\${Math.floor(Math.random()*16777215).toString(16)}\`;`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities'],
	},
	{
		title: 'Copy to Clipboard',
		description:
			'Copy any text to the clipboard using the Clipboard API. Usage: copyToClipboard("Hello World")',
		code: `const copyToClipboard = text => navigator.clipboard?.writeText(text);`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities'],
	},
	{
		title: 'Check if Element has Class',
		description:
			'Check whether a DOM element contains a specific CSS class. Usage: hasClass(document.body, "dark-mode")',
		code: `const hasClass = (el, className) => el.classList.contains(className);`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['frontend'],
	},
	{
		title: 'Debounce Function',
		description:
			'Delay function execution until after a specified wait time has elapsed since the last call. Usage: window.addEventListener("resize", debounce(handleResize, 200))',
		code: `const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities', 'performance'],
	},
	{
		title: 'Local Storage with Expiry',
		description:
			'Set and get localStorage values with a TTL expiry. Usage: storage.set("token", "abc123", 3600000) for 1 hour expiry',
		code: `const storage = {
  set: (key, value, ttl) => {
    const item = { value, expiry: Date.now() + ttl };
    localStorage.setItem(key, JSON.stringify(item));
  },
  get: (key) => {
    const item = JSON.parse(localStorage.getItem(key));
    return item?.expiry > Date.now() ? item.value : null;
  }
};`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities', 'frontend'],
	},
	{
		title: 'Format Currency',
		description:
			'Format a number as a localized currency string using Intl.NumberFormat. Usage: formatCurrency(1234.56) // "$1,234.56"',
		code: `const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities'],
	},
	{
		title: 'Group Array by Key',
		description:
			'Group an array of objects by a specific key into a dictionary. Usage: groupBy(users, "role")',
		code: `const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
};`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities'],
	},
	{
		title: 'Flatten Nested Array',
		description:
			'Recursively flatten an arbitrarily nested array. Usage: flattenDeep([1, [2, [3, [4]]]]) // [1, 2, 3, 4]',
		code: `const flattenDeep = (arr) => {
  return arr.reduce((acc, val) =>
    Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
};`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities'],
	},
	{
		title: 'Throttle Function',
		description:
			'Limit how often a function can be called over time. Usage: window.addEventListener("scroll", throttle(handleScroll, 100))',
		code: `const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities', 'performance'],
	},
	{
		title: 'Query String Parser',
		description:
			'Parse URL query string parameters into a key-value object. Usage: parseQueryString("?page=2&sort=asc") // { page: "2", sort: "asc" }',
		code: `const parseQueryString = (url = window.location.href) => {
  const queryString = url.split('?')[1] || '';
  return queryString.split('&').reduce((params, pair) => {
    const [key, value] = pair.split('=');
    if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    return params;
  }, {});
};`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities', 'frontend'],
	},
	{
		title: 'Custom Event Emitter',
		description:
			'A lightweight pub/sub event emitter with on, off, emit, and once support. Usage: const emitter = new EventEmitter(); emitter.on("data", handler)',
		code: `class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }

  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities', 'backend'],
	},
	{
		title: 'Data Validator',
		description:
			'A simple rule-based data validator supporting required, min length, and email rules. Usage: validator.validate({ email: "test" }, { email: "required|email" })',
		code: `const validator = {
  rules: {},

  addRule(name, validationFn, message) {
    this.rules[name] = { validate: validationFn, message };
  },

  validate(data, rules) {
    const errors = [];

    Object.entries(rules).forEach(([field, fieldRules]) => {
      const value = data[field];
      fieldRules.split('|').forEach(rule => {
        if (rule === 'required' && !value) {
          errors.push(\`\${field} is required\`);
        } else if (rule.startsWith('min:') && value?.length < parseInt(rule.split(':')[1])) {
          errors.push(\`\${field} is too short\`);
        } else if (rule === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
          errors.push(\`\${field} must be a valid email\`);
        }
      });
    });

    return { isValid: errors.length === 0, errors };
  }
};`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['utilities', 'backend'],
	},
	{
		title: 'Rate Limiter',
		description:
			'In-memory rate limiter that tracks requests per key within a sliding time window. Usage: const limiter = new RateLimiter(10, 60000) for 10 requests per minute',
		code: `class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    const validRequests = userRequests.filter(time => now - time < this.timeWindow);

    if (validRequests.length >= this.maxRequests) return false;

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  getRemainingRequests(key) {
    const userRequests = this.requests.get(key) || [];
    const validRequests = userRequests.filter(time => Date.now() - time < this.timeWindow);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['backend', 'security'],
	},
	{
		title: 'Simple State Manager',
		description:
			'A Redux-like state manager with reducers, dispatch, and subscriptions. Usage: const store = new Store({ count: 0 }); store.dispatch({ type: "INCREMENT" })',
		code: `class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.subscribers = new Set();
    this.reducers = {};
  }

  addReducer(actionType, reducer) {
    this.reducers[actionType] = reducer;
  }

  dispatch(action) {
    if (this.reducers[action.type]) {
      const newState = this.reducers[action.type](this.state, action.payload);
      this.state = { ...this.state, ...newState };
      this.notify();
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  getState() {
    return { ...this.state };
  }
}`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['frontend', 'utilities'],
	},
	{
		title: 'Image Lazy Loader',
		description:
			'Lazy load images using IntersectionObserver when they enter the viewport. Usage: lazyLoad.init() — add data-src attribute to img tags instead of src',
		code: `const lazyLoad = {
  init() {
    this.images = document.querySelectorAll('[data-src]');
    this.observer = new IntersectionObserver(this.loadImage.bind(this), {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    this.images.forEach(img => this.observer.observe(img));
  },

  loadImage(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.onload = () => {
          img.classList.add('loaded');
          img.removeAttribute('data-src');
        };
        this.observer.unobserve(img);
      }
    });
  },

  destroy() {
    this.observer.disconnect();
  }
};`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['frontend', 'performance'],
	},
	{
		title: 'Pagination Helper',
		description:
			'A full-featured paginator with page navigation and smart page number generation with dots. Usage: const paginator = new Paginator(items, 10); paginator.getPage(2)',
		code: `class Paginator {
  constructor(items, pageSize = 10) {
    this.items = items;
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.totalPages = Math.ceil(items.length / pageSize);
  }

  getPage(page) {
    if (page < 1 || page > this.totalPages) return [];
    this.currentPage = page;
    const start = (page - 1) * this.pageSize;
    return this.items.slice(start, start + this.pageSize);
  }

  nextPage() { return this.getPage(this.currentPage + 1); }
  prevPage() { return this.getPage(this.currentPage - 1); }
  firstPage() { return this.getPage(1); }
  lastPage() { return this.getPage(this.totalPages); }

  getPageNumbers() {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || (i >= this.currentPage - delta && i <= this.currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  }
}`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['frontend', 'utilities'],
	},
	{
		title: 'Form Validation with Real-time Feedback',
		description:
			'A class-based form validator with real-time input/blur validation, inline error messages, and submit handling. Usage: new FormValidator(formEl, { email: "required|email", name: "required|min:3" })',
		code: `class FormValidator {
  constructor(form, rules) {
    this.form = form;
    this.rules = rules;
    this.errors = new Map();
    this.setupValidation();
  }

  setupValidation() {
    Object.keys(this.rules).forEach(fieldName => {
      const input = this.form.querySelector(\`[name="\${fieldName}"]\`);
      if (input) {
        input.addEventListener('input', () => this.validateField(fieldName));
        input.addEventListener('blur', () => this.validateField(fieldName));
      }
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validateAll()) this.onSuccess?.(new FormData(this.form));
    });
  }

  validateField(fieldName) {
    const input = this.form.querySelector(\`[name="\${fieldName}"]\`);
    const value = input.value;
    const rules = this.rules[fieldName].split('|');
    let errorMessage = '';

    for (const rule of rules) {
      if (rule === 'required' && !value) {
        errorMessage = 'This field is required'; break;
      } else if (rule === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
        errorMessage = 'Invalid email format'; break;
      } else if (rule.startsWith('min:') && value.length < parseInt(rule.split(':')[1])) {
        errorMessage = \`Minimum length is \${rule.split(':')[1]}\`; break;
      }
    }

    if (errorMessage) {
      this.errors.set(fieldName, errorMessage);
      this.showError(fieldName, errorMessage);
    } else {
      this.errors.delete(fieldName);
      this.clearError(fieldName);
    }

    return !errorMessage;
  }

  validateAll() {
    let isValid = true;
    Object.keys(this.rules).forEach(fieldName => {
      if (!this.validateField(fieldName)) isValid = false;
    });
    return isValid;
  }

  showError(fieldName, message) {
    const input = this.form.querySelector(\`[name="\${fieldName}"]\`);
    const errorDiv = this.getOrCreateErrorElement(fieldName);
    errorDiv.textContent = message;
    input.classList.add('error');
  }

  clearError(fieldName) {
    const input = this.form.querySelector(\`[name="\${fieldName}"]\`);
    const errorDiv = this.form.querySelector(\`.error-\${fieldName}\`);
    if (errorDiv) errorDiv.remove();
    input.classList.remove('error');
  }

  getOrCreateErrorElement(fieldName) {
    let errorDiv = this.form.querySelector(\`.error-\${fieldName}\`);
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = \`error-\${fieldName} error-message\`;
      const input = this.form.querySelector(\`[name="\${fieldName}"]\`);
      input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
    return errorDiv;
  }
}`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['frontend', 'utilities'],
	},
	{
		title: 'Data Table with Sorting and Filtering',
		description:
			'A dynamic HTML table renderer with column sorting and per-column text filtering. Usage: const table = new DataTable(data, [{ key: "name", label: "Name" }], containerEl)',
		code: `class DataTable {
  constructor(data, columns, container) {
    this.originalData = data;
    this.data = [...data];
    this.columns = columns;
    this.container = container;
    this.sortColumn = null;
    this.sortDirection = 'asc';
    this.filters = {};
    this.render();
  }

  render() {
    const filteredData = this.applyFilters();
    const sortedData = this.applySorting(filteredData);

    let html = '<table><thead><tr>';
    this.columns.forEach(col => {
      html += \`<th onclick="table.sort('\${col.key}')">\${col.label}\`;
      if (this.sortColumn === col.key) html += this.sortDirection === 'asc' ? ' ↑' : ' ↓';
      html += '</th>';
    });
    html += '</tr><tr class="filters">';
    this.columns.forEach(col => {
      html += \`<td><input type="text" data-filter="\${col.key}" placeholder="Filter \${col.label}..." value="\${this.filters[col.key] || ''}"></td>\`;
    });
    html += '</tr></thead><tbody>';
    sortedData.forEach(row => {
      html += '<tr>';
      this.columns.forEach(col => { html += \`<td>\${row[col.key]}</td>\`; });
      html += '</tr>';
    });
    html += '</tbody></table>';

    this.container.innerHTML = html;
    this.attachEvents();
  }

  attachEvents() {
    this.container.querySelectorAll('.filters input').forEach(input => {
      input.addEventListener('input', (e) => {
        this.filters[e.target.dataset.filter] = e.target.value;
        this.render();
      });
    });
  }

  sort(key) {
    this.sortDirection = this.sortColumn === key && this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortColumn = key;
    this.render();
  }

  applyFilters() {
    return this.originalData.filter(row =>
      Object.entries(this.filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        return String(row[key]).toLowerCase().includes(filterValue.toLowerCase());
      })
    );
  }

  applySorting(data) {
    if (!this.sortColumn) return data;
    return [...data].sort((a, b) => {
      const aVal = a[this.sortColumn], bVal = b[this.sortColumn];
      if (typeof aVal === 'number') return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      const cmp = String(aVal).localeCompare(String(bVal));
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  addRow(newRow) { this.originalData.push(newRow); this.render(); }
  deleteRows(filterFn) { this.originalData = this.originalData.filter(row => !filterFn(row)); this.render(); }
}`,
		language: 'javascript',
		technologies: ['javascript'],
		categories: ['frontend', 'utilities'],
	},
]
