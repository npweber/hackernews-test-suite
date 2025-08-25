import { NextRequest, NextResponse } from 'next/server';

import { execCommandRealtime, RealtimeOutput } from '@/app/lib/execRealtime';
import { TestWebSocketService } from '@/app/services/websocketService';
import { WebSocketMessage } from '@/types/websocketMessage';
import { formatTimestampTestOutput } from '@/app/lib/util';

// POST /api/run-test: Run a test by name
export async function POST(request: NextRequest) : Promise<NextResponse<{ message: string } | { error: string }>> {
    let response: NextResponse<{ message: string } | { error: string }>;
    if (!request.body) {
        response = NextResponse.json({ error: 'No request body provided' }, { status: 400 });
    }
    else {
        const { testName } : { testName: string } = await request.json();
        if (!testName) {
            response = NextResponse.json({ error: 'No test name provided' }, { status: 400 });
        }
        else {
            console.log(`POST /api/run-test: Running test: "${testName}"`);
            response = await runTestOnServer(testName.concat('.spec.ts'));
            if (response.status == 200) 
                console.log(`POST /api/run-test: Test "${testName}" ran successfully`);
        }
    }
    return response;
}

// runTestOnServer: Run a test on the server by test file name
async function runTestOnServer(testFile: string): Promise<NextResponse<{ message: string } | { error: string }>> {
    return new Promise<NextResponse<{ message: string } | { error: string }>>((resolve, reject) => {
        // ConsoleOutputPoster: Web socket service to post test output to the web socket server
        const consoleOutputPoster: TestWebSocketService = new TestWebSocketService();

        // ConsoleOutputPoster: Web socket message handler: Handles errors from the web socket server
        // Only needs to handle errors from the web socket server. All other message types are not sent to it.
        const handleWebSocketMessage: (message: WebSocketMessage) => void = (message: WebSocketMessage) => {
            if (message.type === 'error') {
                if (message.data.message == 'MAX_CLIENTS_REACHED') {
                    consoleOutputPoster.disconnect();
                    console.error('TestWebSocketService: ERROR: WebSocket server is full. Could not be connected.');
                    reject(NextResponse.json({ error: 'TestWebSocketService: ERROR: WebSocket server is full. Could not be connected.' }, { status: 500 }));
                }
                else {
                    consoleOutputPoster.disconnect();
                    console.error(`TestWebSocketService: ERROR: ${message.data.message}`);
                    reject(NextResponse.json({ error: `TestWebSocketService: ERROR: ${message.data.message}` }, { status: 500 }));
                }
            }
        };

        // ConsoleOutputPoster: Web socket connection status change handler:
        // On web socket status change to connected: true, run the test
        const handleWebSocketStatusChange: (connected: boolean) => void = (connected: boolean) => {
            if (connected && consoleOutputPoster.isConnected()) {
                const command: string = `npx playwright test ${testFile}`;
                const testName: string = testFile.split('.')[0];

                // Use execCommandRealtime to run the test using the playwright test <file> command
                console.log(`POST /api/run-test: Running test script: ${testFile}`);
                execCommandRealtime(command, (onOutput: RealtimeOutput) => {
                    if (connected && consoleOutputPoster.isConnected()) {
                        consoleOutputPoster.send({
                            type: 'test_output',
                            data: { message: onOutput.line, testName: testName },
                            timestamp: formatTimestampTestOutput(new Date())
                        });
                    }
                }).then(() => {
                    consoleOutputPoster.disconnect();
                    resolve(NextResponse.json({ message: `Test "${testName}" ran successfully` }, { status: 200 }));
                }).catch((error: any) => {
                    consoleOutputPoster.disconnect();
                    reject(NextResponse.json({ error: `Failed to run test "${testName}": ${error.message}` }, { status: 500 }));
                });
            }
        }

        // Connect to the web socket server to run the test while posting the console output to the web socket server
        consoleOutputPoster.connect(handleWebSocketMessage, handleWebSocketStatusChange);
    });
}