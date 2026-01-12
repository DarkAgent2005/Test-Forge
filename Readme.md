# TestForge AI - Production-Grade API Testing Platform

A modern, AI-powered API testing platform built with **React + Tailwind CSS + Framer Motion** and **Node.js + Express**, powered by **Google Gemini AI**.

## 🌟 Features

### Frontend (Next-Gen UI/UX)
- ✨ **Modern Design System** - Consistent, polished UI with 2xl rounded cards and glassmorphism effects
- 🎨 **Dark/Light Mode** - Toggle between themes with persistent storage
- 🎬 **Smooth Animations** - Framer Motion page transitions, card entry animations, and interactive hover effects
- 📊 **Advanced Analytics Dashboard** 
  - Summary stat cards with trend indicators
  - Pie chart for pass/fail ratio visualization
  - Line chart for response time trends
- 🔍 **Smart Filtering & Search**
  - Filter by test status (Pass/Fail)
  - Real-time search across test names
  - Sort by response time, name, or execution order
  - Ascending/descending sort
- 📱 **Fully Responsive** - Mobile, tablet, and desktop optimized
- ♿ **Accessibility** - Semantic HTML, ARIA labels, keyboard navigation
- 🪝 **State Management** - Zustand for clean, efficient state handling

### Backend (Enterprise-Grade)
- ⚡ **Parallel Test Execution** - Execute up to 5-10 tests concurrently for better performance
- 🔄 **Robust Retry Logic** - Exponential backoff (500ms → 1000ms → 2000ms) with smart retry decisions
- 🤖 **Advanced AI Integration** 
  - Intelligent test case generation using Gemini 1.5 Flash
  - Comprehensive edge case coverage
  - AI-powered failure analysis with actionable fix suggestions
- 📝 **Structured Logging** - JSON-formatted logs for all operations
- 🛡️ **Error Handling** - Graceful error handling with meaningful error codes
- 💾 **Database Integration** - Optional MongoDB support for test history
- 🔐 **Security** - CORS configuration, input validation, API key protection via environment variables

### Developer Experience
- 📦 **Clean Architecture** - Modular folder structure with clear separation of concerns
- 🚀 **Production-Ready** - Error boundaries, loading states, proper error messages
- 🧪 **Type Safety** - Consistent data validation across frontend and backend
- 🎯 **Performance Optimized** - Memoization, lazy loading, efficient re-renders

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16.x or higher
- **npm** or **yarn**
- **Google Gemini API Key** ([Get one free](https://makersuite.google.com/app/apikey))

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=mongodb://localhost:27017/testforge  # Optional
PORT=5000
FRONTEND_URL=http://localhost:5173
DEBUG=false
EOF

# Start development server
npm run dev

# In production:
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file (optional, defaults to localhost)
cat > .env.local << EOF
VITE_API_URL=http://localhost:5000
EOF

# Start development server
npm run dev

# Build for production
npm run build
```

**Access the app:** Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
TestForge/
├── backend/
│   ├── models/
│   │   └── TestResult.js          # MongoDB schema for test results
│   ├── utils/
│   │   ├── gemini.js              # Gemini AI integration with improved prompts
│   │   ├── logger.js              # Structured logging utility
│   │   └── retry.js               # Exponential backoff retry logic
│   ├── server.js                  # Express server with all endpoints
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # Reusable UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   └── ThemeToggle.jsx
│   │   │   ├── Header.jsx         # Main header with theme toggle
│   │   │   ├── Container.jsx      # Layout container
│   │   │   ├── StatCard.jsx       # Dashboard stat cards
│   │   │   ├── Charts.jsx         # Recharts visualizations
│   │   │   ├── TestInputForm.jsx  # API endpoint configuration
│   │   │   ├── ResultsView.jsx    # Results dashboard with filtering
│   │   │   └── TestCard.jsx       # Individual test result card
│   │   ├── context/
│   │   │   └── ThemeContext.jsx   # Dark/Light mode context
│   │   ├── store/
│   │   │   └── testStore.js       # Zustand state management
│   │   ├── lib/
│   │   │   ├── cn.js              # Tailwind class merger
│   │   │   └── constants.js       # App constants
│   │   ├── App.jsx                # Main app component
│   │   ├── api.js                 # API client functions
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

### POST `/generate-tests`
Generate AI-powered test cases for an API endpoint.

**Request:**
```json
{
  "url": "https://api.example.com/users",
  "method": "GET",
  "body": "Optional description or context"
}
```

**Response:**
```json
[
  {
    "name": "Valid request",
    "input": { "page": 1, "limit": 10 },
    "expectedStatus": 200
  },
  {
    "name": "Invalid format",
    "input": { "page": "invalid" },
    "expectedStatus": 400
  }
]
```

### POST `/run-tests`
Execute tests against the specified endpoint.

**Request:**
```json
{
  "url": "https://api.example.com/users",
  "method": "GET",
  "testCases": [...]
}
```

**Response:**
```json
{
  "summary": {
    "url": "...",
    "method": "GET",
    "totalTests": 5,
    "passedTests": 4,
    "failedTests": 1,
    "overallStatus": "FAIL",
    "passRate": 80,
    "executedAt": "2024-01-15T10:30:00Z"
  },
  "results": [...]
}
```

### GET `/results`
Fetch test execution history (limited to 50 most recent).

### GET `/health`
Health check endpoint for monitoring.

---

## 🎨 Design System

### Color Palette
- **Primary**: Emerald (#10B981) & Cyan (#06B6D4)
- **Success**: Emerald (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Amber (#F59E0B)
- **Background**: Gray-950 to Black gradient

### Spacing & Typography
- Base unit: 4px
- Typography: Inter-like system fonts
- Border radius: 2xl (16px) for main components
- Shadows: Soft, layered shadows for depth

### Components Library
All components use:
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- Consistent variant system (primary, secondary, ghost, danger)

---

## 🚦 Environment Variables

### Backend (.env)
```env
# Required
GEMINI_API_KEY=your_api_key_here

# Optional
MONGO_URI=mongodb://localhost:27017/testforge
PORT=5000
FRONTEND_URL=http://localhost:5173
DEBUG=false
NODE_ENV=development
```

### Frontend (.env.local)
```env
# Optional - defaults to http://localhost:5000
VITE_API_URL=http://localhost:5000
```

---

## 📊 Features Deep Dive

### Test Execution Flow
1. **Input** → User enters API endpoint URL, method, and optional body
2. **Generation** → AI generates 5-10 comprehensive test cases covering edge cases
3. **Execution** → Tests run in parallel (max 5 concurrent) with automatic retry logic
4. **Analysis** → Failed tests get AI-powered root cause analysis
5. **Visualization** → Results displayed with charts, filters, and sorting

### AI Prompt Engineering
- Uses Gemini 1.5 Flash for speed and cost-effectiveness
- Structured prompts ensuring JSON output
- Parameters: temperature 0.7 (generation), 0.5 (analysis)
- Fallback explanations for robustness

### Performance Optimizations
- ⚡ Parallel test execution (5-10 concurrent)
- 🔄 Smart retry logic (3 attempts max with exponential backoff)
- 📦 Component memoization to prevent unnecessary re-renders
- 🖼️ Lazy loading for charts and heavy components
- 🗜️ Compressed state management with Zustand

---

## 🔒 Security Best Practices

✅ **Implemented:**
- Environment variables for sensitive keys
- CORS configuration
- Input validation on both frontend and backend
- XSS protection via React's built-in escaping
- Optional MongoDB connection with validation
- Structured error messages (no sensitive data exposed)

---

## 📈 Scalability Considerations

**Ready for production scale:**
- Horizontal scaling via stateless backend
- Database-backed session for test history
- Redis-ready caching layer (future enhancement)
- Configurable concurrency limits
- Rate limiting ready (use nginx/reverse proxy)
- Structured logging for monitoring/alerting

---

## 🛠️ Development Guide

### Adding New Components

```jsx
// Use the cn() utility for class merging
import { cn } from '@/lib/cn';

export function MyComponent({ className, variant = 'default' }) {
  return (
    <div className={cn('base-styles', variant && variantMap[variant], className)}>
      Content
    </div>
  );
}
```

### Using Animations

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  Content
</motion.div>
```

### State Management

```jsx
import { useTestStore } from '@/store/testStore';

function MyComponent() {
  const results = useTestStore(s => s.results);
  const setResults = useTestStore(s => s.setResults);
  
  // Use as needed
}
```

---

## 🧪 Testing

### Backend API
```bash
# Health check
curl http://localhost:5000/health

# Generate tests
curl -X POST http://localhost:5000/generate-tests \
  -H "Content-Type: application/json" \
  -d '{"url":"https://jsonplaceholder.typicode.com/posts","method":"GET"}'

# Run tests
curl -X POST http://localhost:5000/run-tests \
  -H "Content-Type: application/json" \
  -d '{"url":"...","method":"GET","testCases":[...]}'
```

---

## 📝 Example: Testing JSONPlaceholder API

1. Open TestForge at [http://localhost:5173](http://localhost:5173)
2. Enter URL: `https://jsonplaceholder.typicode.com/posts/1`
3. Select Method: `GET`
4. Click "Generate & Run Tests"
5. View results with AI-generated test cases and real-time execution

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Gemini API Key errors
- Verify key in `.env` file
- Check quotas at [Google AI Studio](https://makersuite.google.com/app/usage)
- Ensure billing is enabled

### CORS errors
- Verify `FRONTEND_URL` in backend `.env`
- Check browser console for actual error
- Ensure frontend is on listed origin

### MongoDB connection fails
- MongoDB is optional; app works without it
- If needed, start MongoDB: `mongod --dbpath ./data`
- Verify connection string in `.env`

---

## 🎯 Future Enhancements

- [ ] WebSocket support for real-time test streaming
- [ ] Saved test suites and scheduling
- [ ] Performance benchmarking over time
- [ ] OAuth2 integration
- [ ] Load testing capabilities
- [ ] API documentation auto-generation
- [ ] CI/CD pipeline integration
- [ ] Team collaboration features
- [ ] Custom assertion rules
- [ ] JUnit/JSON report exports

---

## 📄 License

MIT License - Feel free to use in your projects!

---

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 💬 Support

For issues, questions, or suggestions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/testforge/issues)
- Email: support@testforge.dev
- Documentation: See this README

---

**Happy Testing! 🚀**

Built with ❤️ using React, Tailwind CSS, Framer Motion, Node.js, Express, and Google Gemini AI.
