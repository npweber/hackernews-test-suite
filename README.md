# Hacker News Test Suite

**A solution to Question 1 on the QA Wolf Take-home Assessment.**

A real-time test execution and monitoring application built with Next.js, React, and Playwright. This application allows you to run Playwright tests individually or in batches while providing real-time console output through WebSocket connections.

## 🚀 Features

- **Real-time Test Execution**: Run Playwright tests with live console output
- **Individual & Batch Testing**: Execute single tests or run all tests sequentially
- **WebSocket Integration**: Real-time communication between test execution and UI
- **Test Status Tracking**: Monitor test status (not run, running, passed, failed)
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **TypeScript Support**: Full type safety throughout the application

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router
- **React 19** with hooks for state management
- **Tailwind CSS** for styling
- **TypeScript** for type safety

### Backend
- **Next.js API Routes** for REST endpoints
- **WebSocket Server** for real-time communication
- **File System** for test data persistence

### Testing
- **Playwright** for browser automation
- **Real-time Test Execution** with live output capture
- **Multi-browser Support** (Chrome, Firefox, Safari, Mobile)

## 📁 Project Structure

```
hackernews-test-suite/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── run-test/      # Test execution endpoint
│   │   │   └── tests/         # Test management endpoint
│   │   ├── component/         # React components
│   │   ├── lib/              # Utility functions
│   │   ├── services/         # WebSocket service
│   │   └── page.tsx          # Main application page
│   ├── hackernews-tests/     # Playwright test files
│   ├── types/                # TypeScript type definitions
│   └── websocket/            # WebSocket server
├── public/                   # Static assets
├── playwright.config.ts      # Playwright configuration
└── package.json             # Dependencies and scripts
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackernews-test-suite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the NEXT development server + WebSocketServer**
   ```bash
   npm run server
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Usage

### Running Tests

1. **Individual Test Execution**
   - Click the "Run" button next to any test in the list
   - Monitor real-time output in the console panel
   - View test status updates (running → passed/failed)

2. **Batch Test Execution**
   - Click the "Run All" button to execute all tests sequentially
   - Tests run with a 1-second delay between executions
   - Monitor progress through the console output

3. **Real-time Monitoring**
   - Watch live console output as tests execute
   - View connection status (Connected/Disconnected)
   - See test results and timestamps

### Test Management

- **Test Discovery**: Tests are automatically loaded from `src/hackernews-tests/`
- **Status Tracking**: Test status is persisted in JSON files
- **Real-time Updates**: Status changes are reflected immediately in the UI

## 🔧 API Endpoints

### GET `/api/tests`
Retrieves all available tests from the test directory.

**Response:**
```json
{
  "tests": [
    {
      "id": "1",
      "name": "sample",
      "status": "passed",
      "passedAt": "8/26, 10:32:40"
    }
  ]
}
```

### PUT `/api/tests`
Updates a test's status and metadata.

**Request Body:**
```json
{
  "test": {
    "id": "1",
    "name": "sample",
    "status": "running",
    "failedAt": null,
    "passedAt": null
  }
}
```

### POST `/api/run-test`
Executes a specific test with real-time output.

**Request Body:**
```json
{
  "testName": "sample"
}
```

## 🔌 WebSocket Communication

The application uses WebSocket connections for real-time communication:

### Message Types

1. **Test Output** (`test_output`)
   ```json
   {
     "type": "test_output",
     "timestamp": "2024-01-01T12:00:00.000Z",
     "data": {
       "testName": "sample",
       "message": "Test output line"
     }
   }
   ```

2. **Error Messages** (`error`)
   ```json
   {
     "type": "error",
     "timestamp": "2024-01-01T12:00:00.000Z",
     "data": {
       "message": "Error description"
     }
   }
   ```

## 🧪 Adding New Tests

1. **Create Test File**
   Add a new `.spec.ts` file in `src/hackernews-tests/`:
   ```typescript
   import { test, expect } from '@playwright/test';

   test('my new test', async ({ page }) => {
     await page.goto('https://example.com');
     await expect(page).toHaveTitle('Example Domain');
   });
   ```

2. **Create Test Metadata**
   Add a corresponding `.json` file with test metadata:
   ```json
   {
     "id": "2",
     "name": "my-new-test",
     "status": "not run"
   }
   ```

3. **Test Discovery**
   The application will automatically detect and load the new test.

## 🎨 UI Components

### StatusDisplay
Shows test status with appropriate styling:
- **Not Run**: Gray
- **Running**: Blue with "..."
- **Passed**: Green with timestamp
- **Failed**: Red with timestamp

### ConsoleOutput
Displays real-time test output with:
- Auto-scrolling to latest output
- Connection status indicator
- Line count display
- Monospace font for readability

## 🚀 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run server` - Start NEXT development server + WebSocket server

## 🔧 Configuration

### Playwright Configuration
The `playwright.config.ts` file configures:
- Test directory: `./src/hackernews-tests`
- Parallel execution settings
- Browser support (Chrome, Firefox, Safari, Mobile)
- Reporting (HTML, JSON, JUnit)
- Screenshots and video capture on failure

### Environment Variables
- `CI` - Enables CI-specific settings (retries, single worker)
- `PORT` - Server port (defaults to 3000)

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Ensure the WebSocket server is running
   - Check for port conflicts
   - Verify firewall settings

2. **Tests Not Loading**
   - Check file permissions in `src/hackernews-tests/`
   - Verify JSON file format
   - Check browser console for errors

3. **Test Execution Fails**
   - Ensure Playwright is properly installed
   - Check test file syntax
   - Verify target URLs are accessible