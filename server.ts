// Run the combined Next.js and WebSocket server

import { spawn } from 'child_process';
import { getWebSocketServer, closeWebSocketServer } from '@/websocket/websocketServer';

console.log('Starting servers...');
console.log('- Next.js app: http://localhost:3000');
console.log('- WebSocket server: ws://localhost:3001');

// Start WebSocket server
getWebSocketServer(3001);

// Start Next.js development server
const nextProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Handle process termination
// SIGINT: Ctrl+C
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  nextProcess.kill('SIGINT');
  closeWebSocketServer();
  process.exit(0);
});

// Handle process termination
// SIGTERM: Terminate process
process.on('SIGTERM', () => {
  console.log('\nShutting down servers...');
  nextProcess.kill('SIGTERM');
  closeWebSocketServer();
  process.exit(0);
});
