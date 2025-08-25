'use client';

import React, { useState, useEffect } from 'react';

import StatusDisplay from '@/app/component/statusDisplay';
import ConsoleOutput from '@/app/component/consoleOutput';
import { Test } from '@/types/test';
import { WebSocketMessage } from '@/types/websocketMessage';
import { TestWebSocketService } from '@/app/services/websocketService';
import { safeJsonStringify } from '@/app/lib/util';

export default function Home() {
  /* State variables: tests and running all flag */
  const [tests, setTests] = useState<Test[]>([]);
  const [isRunningAll, setIsRunningAll] = useState(false);

  /* Console output, connection status, 
  and ConsoleOutputListener (web socket service) state variables */
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [consoleOutputListener] = useState(() => new TestWebSocketService());

  /* Fetch tests from server */
  useEffect(() => {
    fetch('/api/tests').then(async (res: Response) => {
      const data: { tests: Test[] } | { error: string } = await res.json();
      if ('tests' in data && data.tests) {
        setTests(prev => [...prev, ...data.tests]);
        console.log(`Client: Fetched ${tests.map.length} tests from server.`);
      }
      else if('error' in data && data.error) {
        console.error(`Client: Failed to fetch tests: ${data.error}`);
      }
      else {
        console.error(`Client: Failed to fetch tests: ${safeJsonStringify(data) || 'Unknown error'}`);
      }
    });
  }, []);

  /* ConsoleOutputListener websocket setup */
  useEffect(() => {
    /* Handle a message from the web socket server */
    const handleWebSocketMessage: (message: WebSocketMessage) => void = async (message: WebSocketMessage) => {
      switch (message.type) {
        /* If the message is type test_output, append it to the console output */
        case 'test_output': {
          setConsoleOutput(prev => [...prev, `[${message.timestamp}] ${message.data.message}`]);
          break;
        }
        /* If the message is type error, handle the error */
        case 'error': {
          /* If the error is that the web socket server is full, disconnect and log an error */
          if (message.data.message === 'MAX_CLIENTS_REACHED') {
            consoleOutputListener.disconnect();
            console.error('TestWebSocketService: ERROR: WebSocket server is full. Could not be connected.');
          }
          /* If the error is any other type, disconnect and log the error */
          else {
            consoleOutputListener.disconnect();
            console.error(`TestWebSocketService: ERROR: ${message.data.message}`);
          }
        }
      }
    };

    /* If the connection status changes, update the connection status state variable */
    const handleWebSocketStatusChange = (connected: boolean) => setIsWebSocketConnected(connected);

    /* Connect to the web socket server */
    consoleOutputListener.connect(handleWebSocketMessage, handleWebSocketStatusChange);

    /* Disconnect from the web socket server when the component unmounts */
    return () => {
      consoleOutputListener.disconnect();
    };
  }, [consoleOutputListener]);

  /* Run a test by test id on the client */
  const runTest = async (testId: string) => {
    /* Clear the console output */
    setConsoleOutput(() => []);

    /* Find the test in the tests array */
    const test = tests.find(t => t.id === testId) as Test;

    if (test) {
      test.status = 'running';

      /* Update the test status to running */
      setTests(prev => prev.map(t => t.id === testId ? test : t));

      /* Log the test status */
      console.log(`Client: Test "${test.name}" status "running" on client.`);

      // TODO: Run the test on the server

      // TODO: Update the test status on the server
    }
    else {
      console.error(`Client: Test "${testId}" not found.`);
    }
  }

  /* Run all tests */
  const runAllTests = async () => {
    setIsRunningAll(true);
    
    for (const test of tests) {
      await runTest(test.id);
      /* Small delay between tests */
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunningAll(false);
  };

  return (
    <>
      {/* Left Panel - Tests List Section */}
      <div className="flex-1 border-2 p-6">
        <div className="h-full flex flex-col">
          {/* Header with Title and Run All Button */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-800">
              Tests
            </h2>
            <button
              onClick={runAllTests}
              disabled={isRunningAll}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isRunningAll ? 'Running All...' : 'Run All'}
            </button>
          </div>

          {/* Horizontal Rule */}
          <hr className="my-4 border-1"></hr>

          {/* Tests List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                  {/* Script Icon */}
                  <div className="flex items-center w-8">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M6 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Test Name */}
                  <div className="flex-1 ml-4">
                    <span className="font-mono text-sm text-gray-800">{test.name}</span>
                  </div>

                  {/* Test Status */}
                  <div className="flex-1 text-center">
                    <StatusDisplay status={test.status} failedAt={test.failedAt} passedAt={test.passedAt} />
                  </div>

                  {/* Run Button */}
                  <div className="flex items-center w-20 justify-end">
                    <button
                      onClick={() => runTest(test.id)}
                      disabled={test.status === 'running' || isRunningAll}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                    >
                      {test.status === 'running' ? 'Running' : 'Run'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Console Output Section */}
      <div className="flex-1 border-2 p-6">
        <ConsoleOutput 
          output={consoleOutput} 
          isConnected={isWebSocketConnected} 
        />
      </div>
    </>
  );
}
