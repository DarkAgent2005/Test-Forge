# TestForge AI - Quick Reference Guide

## 🚀 30-Second Quick Start

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev
# Now running on http://localhost:5000

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
# Now running on http://localhost:5173
```

**Open:** [http://localhost:5173](http://localhost:5173)

---

## 📋 Essential Commands

### Backend
```bash
npm run dev              # Development mode (auto-restart)
npm start                # Production mode
npm test                 # Run tests (when implemented)

# Check if running
curl http://localhost:5000/health
```

### Frontend
```bash
npm run dev            # Development server
npm run build          # Production build
npm run preview        # Preview production build
npm run lint           # ESLint check
```

---

## 🔑 Environment Variables

### Backend `.env` (Required)
```env
GEMINI_API_KEY=sk-xxx...  # Get from https://makersuite.google.com/app/apikey
```

### Backend `.env` (Optional)
```env
MONGO_URI=mongodb://localhost:27017/testforge
PORT=5000
FRONTEND_URL=http://localhost:5173
DEBUG=false
```

---

## ✨ Key Features at a Glance

| Feature | Where |
|---------|-------|
| Dark/Light Mode | Header (top-right icon) |
| Search Tests | Filters panel |
| Filter by Status | Filters panel |
| Sort Options | Filters panel |
| Analytics Charts | Top of results |
| Expand Test Details | Click test card |
| Copy JSON | Copy button in expanded card |
| Gemini Analysis | Bottom of failed test |

---

## 🧪 Quick Test URLs

Try these free APIs to test:

```
✅ JSONPlaceholder (Works great for testing):
   https://jsonplaceholder.typicode.com/posts/1
   https://jsonplaceholder.typicode.com/users

✅ GitHub API (Public):
   https://api.github.com/repos/facebook/react

✅ OpenWeather (With key):
   https://api.openweathermap.org/data/2.5/weather?q=London

✅ Stripe Docs API:
   https://stripe.com/api

✅ Local Testing:
   http://localhost:3000/api/users  (if you have a local server)
```

---

## 📊 Dashboard Overview

### Summary Cards (Top)
- **Total Tests** - All tests run
- **Passed** - Green, successful tests
- **Failed** - Red, failed tests
- **Status** - Badge showing overall result

### Charts (Middle)
- **Pie Chart** - Pass/fail ratio and percentage
- **Line Chart** - Response times for each test

### Filters (Below Charts)
- Search by name/status
- Filter by Pass/Fail
- Sort by: Time, Response Time, Name
- Ascending/Descending order

### Results (Bottom)
- Click any test card to expand
- View request/response JSON
- See AI failure explanation
- Copy JSON to clipboard

---

## 🔍 Test Execution Workflow

```
1. Enter API URL
   ↓
2. Select HTTP Method (GET, POST, etc)
   ↓
3. Add Body (if needed, only for POST/PUT/PATCH)
   ↓
4. Click "Generate & Run Tests"
   ↓
5. AI generates 5-10 test cases
   ↓
6. Tests execute in parallel (5 at a time)
   ↓
7. Results show with pass/fail status
   ↓
8. Click on failed tests for AI analysis
```

---

## 📈 Performance Tips

- **Fewer tests run faster** - Keep to essential tests
- **Responses under 1s** - Consider timeout for slow APIs
- **Network latency** - Local tests are fastest
- **Parallel execution** - Up to 5 tests at once
- **Retry logic** - Automatic 2 retries with backoff

---

## 🛠️ Common Use Cases

### Case 1: Test a REST API
1. Enter: `https://api.example.com/users`
2. Select: `GET`
3. Leave body empty
4. Run and view results

### Case 2: Test POST with Body
1. Enter: `https://api.example.com/users`
2. Select: `POST`
3. Body: `{"name":"John","email":"john@example.com"}`
4. Run and view results

### Case 3: Test Error Handling
1. Enter any API URL
2. AI automatically generates invalid test cases
3. See how API handles bad input
4. View AI recommendations for fixes

---

## 🐛 Troubleshooting Quick Fixes

| Problem | Fix |
|---------|-----|
| "Cannot find module" | `rm -rf node_modules && npm install` |
| Port in use | `PORT=5001 npm run dev` |
| CORS error | Check frontend URL in backend `.env` |
| No Gemini key | Add `GEMINI_API_KEY` to backend/.env |
| Button not responding | Refresh page (`Ctrl+R` / `Cmd+R`) |
| Tests not running | Check backend is running (`npm run dev` in backend) |

---

## 🎨 Keyboard Shortcuts

```
Tab          - Navigate between form fields
Enter        - Submit form / Expand/collapse test card
Ctrl/Cmd+C   - Copy (when code highlighted)
Shift+Click  - Multi-select (if implemented)
```

---

## 📊 Understanding Results

```json
{
  "summary": {
    "totalTests": 5,        // Total test cases generated
    "passedTests": 4,       // Passed tests
    "failedTests": 1,       // Failed tests
    "overallStatus": "FAIL", // PASS or FAIL
    "passRate": 80          // Percentage passed
  },
  "results": [              // Individual test results
    {
      "name": "Valid request",
      "status": "PASS",     // PASS or FAIL_AFTER_RETRY
      "responseTime": 145,  // Milliseconds
      "retryCount": 0,      // How many retries needed
      "expectedStatus": 200,
      "actualStatus": 200,
      "aiExplanation": "...", // For failures only
      "aiFixSuggestion": "..." // For failures only
    }
  ]
}
```

---

## 🔐 Security Notes

- ✅ API keys stored in `.env` (never commit)
- ✅ CORS configured for your domain
- ✅ Input validation on both sides
- ✅ No sensitive data in logs
- ✅ Use HTTPS in production

---

## 📱 Responsive Breakpoints

```
Mobile:   < 640px   (2-column layout)
Tablet:   640-1024px (3-column layout)
Desktop:  > 1024px   (4-column layout)
```

---

## 🌙 Dark/Light Mode

- **Auto Detection**: Matches system preference on first load
- **Manual Toggle**: Click icon in header
- **Persistent**: Saved to localStorage
- **Smooth Transition**: No page flicker

---

## 💾 Data Persistence

If MongoDB is configured:
- Test results saved automatically after each run
- Access history via API: `GET /results`
- Last 50 results stored
- Optional - works without MongoDB

---

## 🚀 Deployment Checklist

- [ ] Add `GEMINI_API_KEY` to production environment
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Build frontend: `npm run build`
- [ ] Test on staging first
- [ ] Set `NODE_ENV=production`
- [ ] Use PM2 or similar for process management
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring/logging
- [ ] Backup database (if using MongoDB)

---

## 📚 Complete Documentation

See [Readme.md](./Readme.md) for detailed documentation including:
- Complete API reference
- Architecture overview
- Development guidelines
- Troubleshooting guide
- Future roadmap

---

## 🎯 What's New in This Version

✨ **UI/UX Enhancements**
- Modern design system with Tailwind
- Dark/light mode toggle
- Smooth animations throughout
- Professional dashboard layout

⚡ **Performance**
- Parallel test execution (5x faster)
- Exponential backoff retry logic
- Optimized React components
- Efficient state management

🤖 **AI Integration**
- Better Gemini prompts
- Improved test case generation
- AI-powered failure analysis
- JSON validation and cleanup

📊 **Analytics**
- Pass/fail pie chart
- Response time line chart
- Test filtering and sorting
- Detailed metrics display

---

## 🎉 You're Ready!

Your TestForge AI is now **production-ready**. Start testing APIs! 🚀

Questions? Check the [Readme.md](Readme.md) or review the code comments.

---

**Quick Links:**
- [Full Documentation](./Readme.md)
- [Upgrade Details](./UPGRADE_SUMMARY.md)
- [Gemini API](https://makersuite.google.com/app/apikey)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
