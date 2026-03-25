import { SnippetTemplate } from './snippet.templates';

export const expressSnippets: SnippetTemplate[] = [
  {
    title: 'Basic Express Server',
    description: 'Create a simple Express server with a single route',
    code: `import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Middleware Setup',
    description: 'Configure common middleware for Express app',
    code: `import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.path}\`);
  next();
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Route Parameters',
    description: 'Handle dynamic route parameters',
    code: `app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ userId: id });
});

app.get('/posts/:postId/comments/:commentId', (req, res) => {
  const { postId, commentId } = req.params;
  res.json({ postId, commentId });
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Query Parameters',
    description: 'Extract and use query parameters from URL',
    code: `app.get('/search', (req, res) => {
  const { q, limit = 10, offset = 0 } = req.query;
  res.json({
    query: q,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  });
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'POST Request Handler',
    description: 'Handle POST requests with body parsing',
    code: `app.post('/users', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newUser = { id: Date.now(), name, email };
  res.status(201).json(newUser);
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Error Handling Middleware',
    description: 'Centralized error handling middleware',
    code: `app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({ error: message });
});

app.get('/error', (req, res, next) => {
  const error = new Error('Something went wrong');
  error.status = 400;
  next(error);
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Custom Middleware',
    description: 'Create and use custom middleware functions',
    code: `const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = { id: 1, token };
  next();
};

app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Protected route', user: req.user });
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Static Files',
    description: 'Serve static files from a directory',
    code: `import path from 'path';

app.use(express.static('public'));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Router Module',
    description: 'Organize routes using Express Router',
    code: `import { Router } from 'express';

const userRouter = Router();

userRouter.get('/', (req, res) => {
  res.json({ users: [] });
});

userRouter.post('/', (req, res) => {
  res.status(201).json({ id: 1, ...req.body });
});

app.use('/api/users', userRouter);`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Request Validation',
    description: 'Validate request data before processing',
    code: `const validateUser = (req, res, next) => {
  const { name, email } = req.body;
  
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid name' });
  }
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  next();
};

app.post('/users', validateUser, (req, res) => {
  res.status(201).json(req.body);
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'JSON Response',
    description: 'Send JSON responses with proper status codes',
    code: `app.get('/data', (req, res) => {
  res.json({ success: true, data: { id: 1, name: 'John' } });
});

app.post('/data', (req, res) => {
  res.status(201).json({ 
    success: true, 
    message: 'Created', 
    data: req.body 
  });
});

app.delete('/data/:id', (req, res) => {
  res.status(204).send();
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Request Logging',
    description: 'Log incoming requests with details',
    code: `app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path} - \${res.statusCode} (\${duration}ms)\`);
  });
  
  next();
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'CORS Configuration',
    description: 'Configure CORS for specific origins',
    code: `import cors from 'cors';

const corsOptions = {
  origin: ['http://localhost:3000', 'https://example.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Environment Variables',
    description: 'Load and use environment variables',
    code: `import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_URL = process.env.DATABASE_URL;

app.listen(PORT, () => {
  console.log(\`Server running in \${NODE_ENV} mode on port \${PORT}\`);
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Async Route Handler',
    description: 'Handle async operations in route handlers',
    code: `const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/data', asyncHandler(async (req, res) => {
  const data = await fetchDataFromDB();
  res.json(data);
}));`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'File Upload',
    description: 'Handle file uploads with multer',
    code: `import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    message: 'File uploaded',
    filename: req.file.filename,
    size: req.file.size,
  });
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Redirect Response',
    description: 'Redirect requests to different URLs',
    code: `app.get('/old-path', (req, res) => {
  res.redirect('/new-path');
});

app.get('/external', (req, res) => {
  res.redirect(301, 'https://example.com');
});

app.get('/conditional', (req, res) => {
  if (req.query.admin) {
    res.redirect('/admin');
  } else {
    res.redirect('/user');
  }
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Response Headers',
    description: 'Set custom response headers',
    code: `app.get('/api/data', (req, res) => {
  res.set('X-Custom-Header', 'value');
  res.set('Cache-Control', 'no-cache');
  res.set({
    'Content-Type': 'application/json',
    'X-API-Version': '1.0',
  });
  
  res.json({ data: 'example' });
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Request Body Limits',
    description: 'Configure request body size limits',
    code: `app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.post('/upload-data', (req, res) => {
  const size = JSON.stringify(req.body).length;
  res.json({ received: size, message: 'Data received' });
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
  {
    title: 'Health Check Endpoint',
    description: 'Create a health check endpoint for monitoring',
    code: `app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/ready', (req, res) => {
  const isReady = checkDatabaseConnection();
  const status = isReady ? 200 : 503;
  res.status(status).json({ ready: isReady });
});`,
    technologies: ['express'],
    categories: ['backend'],
    language: 'javascript',
  },
];
