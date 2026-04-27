import type { SnippetTemplate } from './snippet.templates'

export const SQL_SNIPPET_TEMPLATES: SnippetTemplate[] = [
	{
		title: 'Basic SELECT Query',
		description:
			'Simple SELECT query to retrieve all columns from a table. Usage: SELECT * FROM users',
		code: `SELECT * FROM users;`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'SELECT with WHERE Clause',
		description:
			'Filter results based on conditions. Usage: SELECT * FROM users WHERE age > 18',
		code: `SELECT * FROM users WHERE age > 18 AND status = 'active';`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'JOIN Multiple Tables',
		description:
			'Combine data from multiple tables using INNER JOIN. Usage: Join users with orders',
		code: `SELECT u.id, u.name, o.order_id, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.total > 100;`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'LEFT JOIN with NULL Check',
		description:
			'Left join to include unmatched rows from left table. Usage: Find users without orders',
		code: `SELECT u.id, u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
HAVING COUNT(o.id) = 0;`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'Aggregate Functions',
		description:
			'Use COUNT, SUM, AVG, MIN, MAX for data aggregation. Usage: Calculate statistics',
		code: `SELECT 
  COUNT(*) as total_users,
  AVG(age) as average_age,
  MIN(age) as youngest,
  MAX(age) as oldest,
  SUM(balance) as total_balance
FROM users;`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'GROUP BY with HAVING',
		description:
			'Group results and filter groups using HAVING clause. Usage: Find departments with high salaries',
		code: `SELECT department, COUNT(*) as emp_count, AVG(salary) as avg_salary
FROM employees
GROUP BY department
HAVING AVG(salary) > 50000
ORDER BY avg_salary DESC;`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'DISTINCT Values',
		description: 'Remove duplicate rows from results. Usage: Get unique cities',
		code: `SELECT DISTINCT city, country FROM users ORDER BY city;`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'ORDER BY with LIMIT',
		description:
			'Sort results and limit number of rows returned. Usage: Get top 10 products',
		code: `SELECT id, name, price FROM products
ORDER BY price DESC
LIMIT 10;`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'CASE Statement',
		description:
			'Conditional logic in SQL queries. Usage: Categorize users by age groups',
		code: `SELECT id, name, age,
  CASE 
    WHEN age < 18 THEN 'Minor'
    WHEN age BETWEEN 18 AND 65 THEN 'Adult'
    ELSE 'Senior'
  END as age_group
FROM users;`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'Subquery in WHERE',
		description:
			'Use subquery to filter results. Usage: Find users who made purchases',
		code: `SELECT * FROM users
WHERE id IN (
  SELECT DISTINCT user_id FROM orders WHERE total > 0
);`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'INSERT INTO Statement',
		description: 'Add new records to a table. Usage: Insert user data',
		code: `INSERT INTO users (name, email, age, created_at)
VALUES ('John Doe', 'john@example.com', 28, NOW());`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'INSERT Multiple Rows',
		description:
			'Insert multiple records in one statement. Usage: Bulk insert users',
		code: `INSERT INTO users (name, email, age) VALUES
('Alice', 'alice@example.com', 25),
('Bob', 'bob@example.com', 30),
('Charlie', 'charlie@example.com', 35);`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'UPDATE Statement',
		description: 'Modify existing records. Usage: Update user status',
		code: `UPDATE users
SET status = 'inactive', updated_at = NOW()
WHERE last_login < DATE_SUB(NOW(), INTERVAL 90 DAY);`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'DELETE with Condition',
		description:
			'Remove records matching a condition. Usage: Delete inactive users',
		code: `DELETE FROM users
WHERE status = 'inactive' AND updated_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'UNION Query',
		description:
			'Combine results from multiple SELECT statements. Usage: Merge data from different tables',
		code: `SELECT name, email FROM users WHERE status = 'active'
UNION
SELECT name, email FROM archived_users WHERE status = 'active'
ORDER BY name;`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'Window Functions',
		description:
			'Calculate running totals and rankings. Usage: Rank employees by salary',
		code: `SELECT id, name, salary, department,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rank,
  SUM(salary) OVER (PARTITION BY department) as dept_total
FROM employees;`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'Common Table Expression (CTE)',
		description:
			'Create temporary named result sets. Usage: Simplify complex queries',
		code: `WITH active_users AS (
  SELECT id, name, email FROM users WHERE status = 'active'
),
user_orders AS (
  SELECT user_id, COUNT(*) as order_count FROM orders GROUP BY user_id
)
SELECT au.id, au.name, COALESCE(uo.order_count, 0) as orders
FROM active_users au
LEFT JOIN user_orders uo ON au.id = uo.user_id;`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'String Functions',
		description: 'Manipulate text data. Usage: Format and search strings',
		code: `SELECT 
  UPPER(name) as name_upper,
  LOWER(email) as email_lower,
  SUBSTRING(phone, 1, 3) as area_code,
  CONCAT(first_name, ' ', last_name) as full_name,
  LENGTH(description) as desc_length
FROM users;`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'Date Functions',
		description: 'Work with dates and timestamps. Usage: Filter by date ranges',
		code: `SELECT id, name, created_at,
  DATEDIFF(NOW(), created_at) as days_since_signup,
  DATE_FORMAT(created_at, '%Y-%m-%d') as signup_date
FROM users
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY created_at DESC;`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['queries', 'database'],
	},
	{
		title: 'CREATE INDEX for Performance',
		description:
			'Create indexes to speed up queries. Usage: Index frequently searched columns',
		code: `CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
CREATE UNIQUE INDEX idx_users_username ON users(username);`,
		language: 'sql',
		technologies: ['sql'],
		categories: ['database', 'performance'],
	},
]
