# TestForge AI - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                │
│                    (http://localhost:5174)                          │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTPS/HTTP
                              │
    ┌─────────────────────────┴─────────────────────────┐
    │          REACT FRONTEND (Vite SPA)                │
    │                                                    │
    │  ┌────────────────────────────────────────────┐  │
    │  │         Header + Navigation                │  │
    │  │  (Dark/Light Mode Toggle + Logo)           │  │
    │  └────────────────────────────────────────────┘  │
    │                                                    │
    │  ┌──────────────────┐  ┌──────────────────────┐  │
    │  │  TestInputForm   │  │   ResultsView        │  │
    │  │  (Left Sidebar)  │  │   (Main Content)     │  │
    │  │                  │  │                      │  │
    │  │ • URL input      │  │ • Summary cards      │  │
    │  │ • Method select  │  │ • Charts (Pie/Line)  │  │
    │  │ • Body textarea  │  │ • Filter/Search      │  │
    │  │ • Submit button  │  │ • Test results       │  │
    │  └──────────────────┘  └──────────────────────┘  │
    │                                                    │
    │  ┌────────────────────────────────────────────┐  │
    │  │    Zustand Store (State Management)        │  │
    │  │                                            │  │
    │  │  • results, loading, error                 │  │
    │  │  • filters, sortBy, sortOrder              │  │
    │  │  • history (up to 50)                      │  │
    │  └────────────────────────────────────────────┘  │
    │                                                    │
    │  ┌────────────────────────────────────────────┐  │
    │  │      Theme Context (Dark/Light Mode)       │  │
    │  │      localStorage persistence              │  │
    │  └────────────────────────────────────────────┘  │
    └────────────────────┬────────────────────────────┘
                         │ API Calls (axios)
                         │ JSON Request/Response
                         ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │        EXPRESS BACKEND (Node.js Server)                        │
    │         Running on http://localhost:5000                       │
    │                                                                  │
    │  ┌──────────────────────────────────────────────────────────┐  │
    │  │              API Endpoints                              │  │
    │  │                                                          │  │
    │  │  POST /generate-tests                                   │  │
    │  │    └─→ Calls Gemini AI → Returns test cases            │  │
    │  │                                                          │  │
    │  │  POST /run-tests                                         │  │
    │  │    ├─→ Parallel Execution (5 at a time)                │  │
    │  │    ├─→ Retry Logic (Exponential Backoff)               │  │
    │  │    ├─→ AI Failure Analysis (for failed tests)          │  │
    │  │    └─→ Returns detailed results                         │  │
    │  │                                                          │  │
    │  │  GET /results                                            │  │
    │  │    └─→ Returns last 50 test runs (from DB)             │  │
    │  │                                                          │  │
    │  │  GET /health                                             │  │
    │  │    └─→ Returns server status                            │  │
    │  └──────────────────────────────────────────────────────────┘  │
    │                                                                  │
    │  ┌──────────────────────────────────────────────────────────┐  │
    │  │            Utilities & Modules                           │  │
    │  │                                                          │  │
    │  │  ┌─ gemini.js                                            │  │
    │  │  │  ├─ generateTestCases()                               │  │
    │  │  │  └─ explainFailure()                                  │  │
    │  │  │                                                       │  │
    │  │  ├─ logger.js                                            │  │
    │  │  │  └─ Structured JSON logging                           │  │
    │  │  │                                                       │  │
    │  │  └─ retry.js                                             │  │
    │  │     └─ retryWithBackoff() utility                        │  │
    │  └──────────────────────────────────────────────────────────┘  │
    │                                                                  │
    │  ┌──────────────────────────────────────────────────────────┐  │
    │  │         External API Testing                             │  │
    │  │                                                          │  │
    │  │  • Axios requests to target API                          │  │
    │  │  • Parallel execution                                    │  │
    │  │  • Automatic retry with backoff                          │  │
    │  │  • Error handling and response capture                   │  │
    │  └──────────────────────────────────────────────────────────┘  │
    └────────┬──────────────────────────────────────────────────────┘
             │
             ├─────────────────────────────────┐
             │                                  │
             ▼                                  ▼
    ┌─────────────────────┐        ┌────────────────────────┐
    │  Google Gemini API  │        │  MongoDB (Optional)    │
    │                     │        │                        │
    │ • Test generation   │        │ • Test results store   │
    │ • Failure analysis  │        │ • History tracking     │
    │ • JSON responses    │        │ • Analytics data       │
    └─────────────────────┘        └────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
User Input
   ↓
┌────────────────────────────────────┐
│ Frontend Form (TestInputForm)      │
│ ├─ URL                             │
│ ├─ HTTP Method                     │
│ └─ Request Body (optional)         │
└────────────────────┬───────────────┘
                     │
                     ▼
         ┌─────────────────────┐
         │ Zustand Store       │
         │ setLoading(true)    │
         │ setResults(null)    │
         └────────────┬────────┘
                      │
                      ▼
         ┌─────────────────────────────┐
         │ API: /generate-tests        │
         │ Request: {url, method, body}│
         └────────────┬────────────────┘
                      │
                      ▼
         ┌──────────────────────────────┐
         │ Backend: generateTestCases() │
         │ • Call Gemini API            │
         │ • Parse response             │
         │ • Return test cases          │
         └────────────┬─────────────────┘
                      │
                      ▼ Test Cases Generated
         ┌──────────────────────────────┐
         │ {                            │
         │   name: "Test Name",         │
         │   input: {...},              │
         │   expectedStatus: 200        │
         │ }[]                          │
         └────────────┬─────────────────┘
                      │
                      ▼
         ┌─────────────────────────────┐
         │ API: /run-tests             │
         │ Request: {url, test cases}  │
         └────────────┬────────────────┘
                      │
                      ▼
      ┌──────────────────────────────────┐
      │ Backend: Parallel Execution      │
      │ ├─ Execute max 5 tests at once   │
      │ ├─ Measure response time         │
      │ ├─ Capture request/response      │
      │ ├─ Compare with expected status  │
      │ └─ Trigger retry if needed       │
      └────────────┬─────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         ▼                    ▼
    ┌─────────────┐    ┌──────────────┐
    │ Test PASS   │    │ Test FAIL    │
    └──────┬──────┘    └────────┬─────┘
           │                    │
           │              ┌─────▼──────────┐
           │              │ Failed Test    │
           │              │ Call Gemini:   │
           │              │ • Explanation  │
           │              │ • Suggestion   │
           │              └────────┬───────┘
           │                       │
           └───────────┬───────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │ Test Results:           │
         │ {                       │
         │   name, status,         │
         │   responseTime,         │
         │   retryCount,           │
         │   request/responseBody, │
         │   aiExplanation,        │
         │   aiFixSuggestion       │
         │ }[]                     │
         └────────────┬────────────┘
                      │
                      ▼ Save to DB (optional)
         ┌─────────────────────────┐
         │ MongoDB TestResult      │
         │ (if configured)         │
         └────────────┬────────────┘
                      │
                      ▼ Return Results
         ┌──────────────────────────┐
         │ Response: {              │
         │   summary: {...},        │
         │   results: {...}         │
         │ }                        │
         └────────────┬─────────────┘
                      │
                      ▼
      ┌────────────────────────────────┐
      │ Frontend: ResultsView          │
      │ • Display summary cards        │
      │ • Render charts                │
      │ • Show test results            │
      │ • Apply filters/sorting        │
      └────────────┬───────────────────┘
                   │
                   ▼
         ┌──────────────────────┐
         │ Update Zustand Store │
         │ ├─ setResults(data)  │
         │ ├─ setLoading(false) │
         │ └─ addToHistory()    │
         └──────────────────────┘
```

---

## 🗂️ Component Hierarchy

```
App (Root)
│
├─ Header
│  ├─ Logo + Brand Name
│  ├─ ThemeToggle
│  └─ Navigation
│
├─ Container (Layout Wrapper)
│  │
│  └─ Grid (2 columns: lg:12)
│     │
│     ├─ Column 1 (lg:col-span-4)
│     │  └─ TestInputForm
│     │     ├─ Input[URL]
│     │     ├─ Select[Method]
│     │     ├─ Textarea[Body]
│     │     └─ Button[Submit]
│     │
│     ├─ Column 2 (lg:col-span-8)
│     │  ├─ AnimatePresence (Mode: wait)
│     │  │
│     │  ├─ Loading State
│     │  │  └─ Spinner + Text
│     │  │
│     │  ├─ Error State
│     │  │  └─ Alert Card
│     │  │
│     │  └─ Results State (ResultsView)
│     │     ├─ StatCard[] (4 cards)
│     │     │  ├─ Total Tests
│     │     │  ├─ Passed
│     │     │  ├─ Failed
│     │     │  └─ Status
│     │     │
│     │     ├─ Charts Grid (2 columns)
│     │     │  ├─ PassFailChart (PieChart)
│     │     │  └─ ResponseTimeChart (LineChart)
│     │     │
│     │     ├─ Summary Status Bar (method + URL)
│     │     │
│     │     ├─ Filters Panel
│     │     │  ├─ Search Input
│     │     │  ├─ Status Buttons
│     │     │  └─ Sort Options
│     │     │
│     │     └─ TestCard[] (Results)
│     │        ├─ Header (always visible)
│     │        │  ├─ Icon
│     │        │  ├─ Test Name
│     │        │  ├─ Status Badges
│     │        │  └─ Stats (time, retries)
│     │        │
│     │        └─ Details (expanded)
│     │           ├─ Request JSON
│     │           ├─ Response JSON
│     │           └─ AI Analysis (if failed)
│     │              ├─ Root Cause
│     │              └─ Fix Suggestion
│     │
│     └─ Footer
│        └─ Copyright + Link
│
└─ Background Effects
   ├─ Gradient overlay
   └─ Blur circles
```

---

## 🔄 State Management (Zustand Store)

```
testStore
│
├─ State
│  ├─ results: null | {summary, results[]}
│  ├─ loading: boolean
│  ├─ error: null | string
│  ├─ history: TestResult[]
│  └─ UI State
│     ├─ filters
│     │  ├─ status: 'PASS' | 'FAIL_AFTER_RETRY' | null
│     │  └─ searchQuery: string
│     ├─ sortBy: 'time' | 'responseTime' | 'name'
│     └─ sortOrder: 'asc' | 'desc'
│
├─ Actions
│  ├─ setResults(results)
│  ├─ setLoading(loading)
│  ├─ setError(error)
│  ├─ clearError()
│  ├─ clearResults()
│  ├─ addToHistory(result)
│  ├─ setFilter(status)
│  ├─ setSearchQuery(query)
│  ├─ setSortBy(sortBy)
│  └─ setSortOrder(sortOrder)
│
└─ Computed
   └─ getFilteredResults()
      ├─ Apply status filter
      ├─ Apply search filter
      └─ Sort results
```

---

## 🔌 API Contract

### POST /generate-tests
```
Request:
{
  "url": "string (required)",
  "method": "GET|POST|PUT|DELETE|PATCH (required)",
  "body": "string|object (optional)"
}

Response [200]:
[
  {
    "name": "string",
    "input": "object|string",
    "expectedStatus": "number"
  }
]

Response [400]:
{
  "error": "string",
  "code": "MISSING_PARAMS|INVALID_URL|..."
}

Response [500]:
{
  "error": "string",
  "code": "GENERATION_FAILED"
}
```

### POST /run-tests
```
Request:
{
  "url": "string (required)",
  "method": "string (required)",
  "testCases": "array (required)"
}

Response [200]:
{
  "summary": {
    "url": "string",
    "method": "string",
    "totalTests": "number",
    "passedTests": "number",
    "failedTests": "number",
    "overallStatus": "PASS|FAIL",
    "passRate": "number",
    "dbId": "string|null",
    "executedAt": "ISO8601"
  },
  "results": [
    {
      "name": "string",
      "status": "PASS|FAIL_AFTER_RETRY",
      "responseTime": "number",
      "retryCount": "number",
      "expectedStatus": "number",
      "actualStatus": "number",
      "requestBody": "any",
      "responseBody": "any",
      "aiExplanation": "string|null",
      "aiFixSuggestion": "string|null"
    }
  ]
}
```

---

## 📦 Dependency Graph

```
Frontend Dependencies:
├─ React 19.2.4
│  ├─ react-dom 19.2.4
│  ├─ react-router-dom 7.13.2
│  └─ (other React dependencies)
│
├─ Styling & UI
│  ├─ Tailwind CSS 4.2.2
│  ├─ @tailwindcss/vite 4.2.2
│  └─ tailwind-merge 3.5.0
│
├─ Animations
│  └─ framer-motion 12.38.0
│
├─ State Management
│  └─ zustand (state store)
│
├─ HTTP Client
│  └─ axios 1.14.0
│
├─ Icons
│  └─ lucide-react 1.7.0
│
├─ Utilities
│  ├─ clsx 2.1.1
│  └─ (dev tools)
│
└─ Build Tools
   ├─ Vite 8.0.1
   ├─ @vitejs/plugin-react 6.0.1
   └─ ESLint tools

Backend Dependencies:
├─ Web Framework
│  └─ express 5.2.1
│
├─ Middleware
│  └─ cors 2.8.6
│
├─ Database
│  └─ mongoose 9.3.3
│
├─ HTTP Client
│  └─ axios 1.14.0
│
├─ AI Integration
│  └─ @google/genai 1.47.0
│
├─ Configuration
│  └─ dotenv 17.3.1
│
└─ Development
   └─ nodemon 3.1.14
```

---

## 🔐 Security Architecture

```
Environment Variables (.env files)
│
├─ GEMINI_API_KEY ────┐
├─ MONGO_URI          ├─ Never committed to git
├─ FRONTEND_URL       ├─ Loaded at runtime
└─ DEBUG              ┘

CORS Configuration
│
├─ Whitelist frontend origin
├─ Allow credentials
└─ Set security headers

Input Validation
│
├─ URL format validation
├─ HTTP method validation
├─ Request body sanitization
└─ Type checking

Error Handling
│
├─ No sensitive data in logs
├─ Meaningful error codes
├─ Graceful failures
└─ Error recovery

Data Protection
│
├─ Optional MongoDB encryption
├─ No credentials in responses
├─ Lean database queries
└─ Automatic cleanup
```

---

## 📊 Data Models

### Frontend: Test Result (from API)
```javascript
{
  name: String,
  input: Object | String,
  expectedStatus: Number,
  actualStatus: Number,
  status: 'PASS' | 'FAIL_AFTER_RETRY',
  responseTime: Number,
  retryCount: Number,
  requestBody: Any,
  responseBody: Any,
  aiExplanation: String | null,
  aiFixSuggestion: String | null,
}
```

### Backend: MongoDB TestResult
```javascript
{
  url: String,
  method: String,
  overallStatus: 'PASS' | 'FAIL',
  totalTests: Number,
  passedTests: Number,
  failedTests: Number,
  results: [{
    // Same as above
  }],
  createdAt: Date,
}
```

---

## 🎬 Animation Layers

```
Global Animations
├─ Background gradient float
├─ Blur circles animation
└─ Gradient shimmer (optional)

Page Transitions
├─ Fade in/out
└─ Slide up/down

Component Animations
├─ Card entrance (spring physics)
├─ Hover scale + shadow
├─ Loading spinner
└─ Expand/collapse

Interactive Feedback
├─ Button click (scale 95%)
├─ Hover glow effect
├─ Toggle smooth transition
└─ Copy success feedback
```

---

## 🔧 Configuration & Environment

```
Frontend Configuration
├─ API_BASE = http://localhost:5000
├─ HTTP_METHODS = ['GET', 'POST', ...]
├─ COLORS = {...}
├─ SHADOWS = {...}
├─ TRANSITIONS = {...}
└─ ANIMATION_VARIANTS = {...}

Backend Configuration
├─ PORT = 5000 (from .env)
├─ MONGO_URI = mongodb://... (optional)
├─ FRONTEND_URL = for CORS
├─ GEMINI_API_KEY = (required)
└─ DEBUG = false (or true)

Runtime Configuration
├─ MAX_CONCURRENT = 5 (test execution)
├─ MAX_RETRIES = 2 (per test)
├─ INITIAL_RETRY_DELAY = 500ms
├─ BACKOFF_MULTIPLIER = 1.5
└─ MAX_DELAY = 5000ms
```

---

This architecture ensures:
- ✅ **Scalability** - Horizontal scaling ready
- ✅ **Maintainability** - Clear separation of concerns
- ✅ **Performance** - Optimized data flow
- ✅ **Security** - Multiple layers of protection
- ✅ **Reliability** - Error handling at all levels
- ✅ **User Experience** - Responsive and animated
