import type { SnippetTemplate } from './snippet.templates'

export const HTML_SNIPPET_TEMPLATES: SnippetTemplate[] = [
  {
    title: 'Semantic HTML5 Page Structure',
    description: 'Basic semantic HTML5 structure with header, nav, main, and footer. Usage: Copy and customize for your project',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
</head>
<body>
  <header>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <section>
      <h1>Welcome</h1>
      <p>Content goes here</p>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2024 Your Company</p>
  </footer>
</body>
</html>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Responsive Navigation Bar',
    description: 'Mobile-friendly navigation bar with hamburger menu. Usage: Add toggle functionality with JavaScript',
    code: `<nav class="navbar">
  <div class="navbar-container">
    <a href="/" class="navbar-logo">Logo</a>
    <button class="hamburger" id="hamburger">
      <span></span>
      <span></span>
      <span></span>
    </button>
    <ul class="nav-menu" id="navMenu">
      <li><a href="/" class="nav-link">Home</a></li>
      <li><a href="/about" class="nav-link">About</a></li>
      <li><a href="/services" class="nav-link">Services</a></li>
      <li><a href="/contact" class="nav-link">Contact</a></li>
    </ul>
  </div>
</nav>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Form with Validation',
    description: 'HTML form with various input types and validation attributes. Usage: Customize fields as needed',
    code: `<form id="contactForm" method="POST" action="/submit">
  <div class="form-group">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
  </div>
  
  <div class="form-group">
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div class="form-group">
    <label for="message">Message:</label>
    <textarea id="message" name="message" rows="5" required></textarea>
  </div>
  
  <button type="submit">Send</button>
  <button type="reset">Clear</button>
</form>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Modal Dialog',
    description: 'Accessible modal dialog with overlay. Usage: Toggle display with JavaScript',
    code: `<div id="modal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>Modal Title</h2>
    <p>Modal content goes here</p>
    <button class="modal-btn">Action</button>
  </div>
</div>

<button id="openModal">Open Modal</button>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Responsive Grid Layout',
    description: 'CSS Grid layout that adapts to different screen sizes. Usage: Adjust grid-template-columns for your needs',
    code: `<div class="grid-container">
  <div class="grid-item">Item 1</div>
  <div class="grid-item">Item 2</div>
  <div class="grid-item">Item 3</div>
  <div class="grid-item">Item 4</div>
  <div class="grid-item">Item 5</div>
  <div class="grid-item">Item 6</div>
</div>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Card Component',
    description: 'Reusable card component with image, title, and description. Usage: Duplicate for multiple cards',
    code: `<div class="card">
  <img src="image.jpg" alt="Card image" class="card-image">
  <div class="card-content">
    <h3 class="card-title">Card Title</h3>
    <p class="card-description">This is a card description with some content.</p>
    <a href="#" class="card-link">Learn More</a>
  </div>
</div>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Accordion Component',
    description: 'Collapsible accordion with multiple sections. Usage: Toggle sections with JavaScript',
    code: `<div class="accordion">
  <div class="accordion-item">
    <button class="accordion-header">Section 1</button>
    <div class="accordion-content">
      <p>Content for section 1</p>
    </div>
  </div>
  
  <div class="accordion-item">
    <button class="accordion-header">Section 2</button>
    <div class="accordion-content">
      <p>Content for section 2</p>
    </div>
  </div>
  
  <div class="accordion-item">
    <button class="accordion-header">Section 3</button>
    <div class="accordion-content">
      <p>Content for section 3</p>
    </div>
  </div>
</div>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Breadcrumb Navigation',
    description: 'Breadcrumb trail for navigation hierarchy. Usage: Update links for your site structure',
    code: `<nav class="breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/products/electronics">Electronics</a></li>
    <li aria-current="page">Laptop</li>
  </ol>
</nav>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Responsive Table',
    description: 'Mobile-friendly table with horizontal scroll on small screens. Usage: Add data rows as needed',
    code: `<div class="table-container">
  <table class="responsive-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td data-label="Name">John Doe</td>
        <td data-label="Email">john@example.com</td>
        <td data-label="Phone">555-1234</td>
        <td data-label="Status">Active</td>
      </tr>
      <tr>
        <td data-label="Name">Jane Smith</td>
        <td data-label="Email">jane@example.com</td>
        <td data-label="Phone">555-5678</td>
        <td data-label="Status">Inactive</td>
      </tr>
    </tbody>
  </table>
</div>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Hero Section',
    description: 'Full-width hero section with background image and call-to-action. Usage: Customize text and image',
    code: `<section class="hero">
  <div class="hero-content">
    <h1>Welcome to Our Site</h1>
    <p>Discover amazing content and services</p>
    <a href="#" class="cta-button">Get Started</a>
  </div>
</section>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Testimonials Section',
    description: 'Section displaying customer testimonials with ratings. Usage: Add more testimonial items',
    code: `<section class="testimonials">
  <h2>What Our Customers Say</h2>
  <div class="testimonials-container">
    <div class="testimonial">
      <div class="stars">★★★★★</div>
      <p class="quote">"Great service and excellent support!"</p>
      <p class="author">- John Doe</p>
    </div>
    
    <div class="testimonial">
      <div class="stars">★★★★★</div>
      <p class="quote">"Highly recommended for everyone."</p>
      <p class="author">- Jane Smith</p>
    </div>
    
    <div class="testimonial">
      <div class="stars">★★★★☆</div>
      <p class="quote">"Good value for money."</p>
      <p class="author">- Bob Johnson</p>
    </div>
  </div>
</section>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Footer with Links',
    description: 'Comprehensive footer with multiple sections and links. Usage: Customize links and content',
    code: `<footer class="footer">
  <div class="footer-container">
    <div class="footer-section">
      <h4>About</h4>
      <ul>
        <li><a href="#">About Us</a></li>
        <li><a href="#">Our Team</a></li>
        <li><a href="#">Careers</a></li>
      </ul>
    </div>
    
    <div class="footer-section">
      <h4>Support</h4>
      <ul>
        <li><a href="#">Help Center</a></li>
        <li><a href="#">Contact Us</a></li>
        <li><a href="#">FAQ</a></li>
      </ul>
    </div>
    
    <div class="footer-section">
      <h4>Legal</h4>
      <ul>
        <li><a href="#">Privacy Policy</a></li>
        <li><a href="#">Terms of Service</a></li>
        <li><a href="#">Cookie Policy</a></li>
      </ul>
    </div>
    
    <div class="footer-section">
      <h4>Follow Us</h4>
      <ul>
        <li><a href="#">Twitter</a></li>
        <li><a href="#">Facebook</a></li>
        <li><a href="#">LinkedIn</a></li>
      </ul>
    </div>
  </div>
  
  <div class="footer-bottom">
    <p>&copy; 2024 Your Company. All rights reserved.</p>
  </div>
</footer>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Tabs Component',
    description: 'Tabbed interface with multiple content sections. Usage: Toggle tabs with JavaScript',
    code: `<div class="tabs">
  <div class="tab-buttons">
    <button class="tab-button active" data-tab="tab1">Tab 1</button>
    <button class="tab-button" data-tab="tab2">Tab 2</button>
    <button class="tab-button" data-tab="tab3">Tab 3</button>
  </div>
  
  <div class="tab-content">
    <div id="tab1" class="tab-pane active">
      <h3>Tab 1 Content</h3>
      <p>Content for tab 1</p>
    </div>
    
    <div id="tab2" class="tab-pane">
      <h3>Tab 2 Content</h3>
      <p>Content for tab 2</p>
    </div>
    
    <div id="tab3" class="tab-pane">
      <h3>Tab 3 Content</h3>
      <p>Content for tab 3</p>
    </div>
  </div>
</div>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Progress Bar',
    description: 'Visual progress indicator for tasks or uploads. Usage: Update value attribute dynamically',
    code: `<div class="progress-container">
  <label for="progress">Upload Progress:</label>
  <progress id="progress" value="65" max="100"></progress>
  <span class="progress-text">65%</span>
</div>

<div class="progress-bar-custom">
  <div class="progress-fill" style="width: 75%"></div>
</div>
<p>75% Complete</p>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Badge Component',
    description: 'Small badge elements for labels and notifications. Usage: Use with different classes for styling',
    code: `<span class="badge">New</span>
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-danger">Danger</span>
<span class="badge badge-info">Info</span>

<button>
  Notifications
  <span class="badge badge-count">5</span>
</button>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Alert Messages',
    description: 'Alert boxes for different message types. Usage: Show/hide with JavaScript',
    code: `<div class="alert alert-success">
  <strong>Success!</strong> Your action was completed successfully.
</div>

<div class="alert alert-info">
  <strong>Info:</strong> This is an informational message.
</div>

<div class="alert alert-warning">
  <strong>Warning:</strong> Please review this important information.
</div>

<div class="alert alert-danger">
  <strong>Error:</strong> Something went wrong. Please try again.
</div>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Pagination Controls',
    description: 'Pagination component for navigating through pages. Usage: Update active state dynamically',
    code: `<nav class="pagination">
  <a href="#" class="page-link prev">← Previous</a>
  
  <a href="#" class="page-link">1</a>
  <a href="#" class="page-link active">2</a>
  <a href="#" class="page-link">3</a>
  <a href="#" class="page-link">4</a>
  <span class="page-link disabled">...</span>
  <a href="#" class="page-link">10</a>
  
  <a href="#" class="page-link next">Next →</a>
</nav>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Dropdown Menu',
    description: 'Dropdown menu with nested items. Usage: Toggle visibility with JavaScript',
    code: `<div class="dropdown">
  <button class="dropdown-toggle">Menu</button>
  <ul class="dropdown-menu">
    <li><a href="#">Option 1</a></li>
    <li><a href="#">Option 2</a></li>
    <li><hr></li>
    <li><a href="#">Option 3</a></li>
    <li><a href="#">Option 4</a></li>
  </ul>
</div>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Tooltip Component',
    description: 'Tooltip that appears on hover. Usage: Position with CSS',
    code: `<div class="tooltip-container">
  <button class="tooltip-trigger">Hover me</button>
  <div class="tooltip">
    <p>This is a helpful tooltip message</p>
  </div>
</div>

<span class="tooltip-trigger" title="Tooltip text">
  Information icon
</span>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
  {
    title: 'Spinner/Loader',
    description: 'Loading spinner animation. Usage: Show during async operations',
    code: `<div class="spinner"></div>

<div class="spinner-dots">
  <div class="dot"></div>
  <div class="dot"></div>
  <div class="dot"></div>
</div>

<div class="spinner-ring">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>`,
    language: 'html',
    technologies: ['html'],
    categories: ['frontend'],
  },
]
