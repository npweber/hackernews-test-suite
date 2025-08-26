import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketMessage, isValidWebSocketMessage } from '@/types/websocketMessage';
import { safeJsonParse, safeJsonStringify } from '@/app/lib/util';

// TestWebSocketServer class: Handles communication between the ConsoleOutputPoster and the ConsoleOutputListener clients
export class TestWebSocketServer {
  private wss: WebSocketServer;

  /* Set of connected clients: Maximum of 2 clients (ConsoleOutputPoster and ConsoleOutputListener) */
  private clients: Set<WebSocket> = new Set();

  constructor(port: number = 3001) {
    this.wss = new WebSocketServer({ port });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
        if(this.getConnectedClientsCount() < 2) {
            this.clients.add(ws);
            console.log('TestWebSocketServer: New client connected. Total clients: ' + this.getConnectedClientsCount());

            // Handle incoming messages from the ConsoleOutputPoster client
            ws.on('message', (message: string) => {
                try {
                    this.handleMessage(ws, safeJsonParse(message));
                } catch (error) {
                    console.warn(`TestWebSocketServer: WARNING: Handling message failed: ${error}. Message: ${message}`);
                }
            });

            ws.on('close', () => {
                this.clients.delete(ws);  
                console.log(`TestWebSocketServer: Client disconnected. Total clients: ${this.getConnectedClientsCount()}`);
            });

            ws.on('error', (error) => {
                console.error(`TestWebSocketServer: ERROR: Client error: ${error}`);
                this.clients.delete(ws);
            });
        } else {
            this.sendToClient(ws, {
                type: 'error',
                data: { message: 'MAX_CLIENTS_REACHED', testName: 'NONE' },
                timestamp: new Date().toISOString()
            });
        }
    });
    console.log(`TestWebSocketServer: Started on port ${this.wss.options.port}`);
  }

  // Handle a message from the ConsoleOutputPoster, and send it to the ConsoleOutputListener
  // (2 clients: ConsoleOutputPoster and ConsoleOutputListener)
  private handleMessage(ws: WebSocket, message: WebSocketMessage) : void {
    // Get the other client (ConsoleOutputListener)
    const otherClient = Array.from(this.clients).find(client => client !== ws);
    // If the other client (ConsoleOutputListener) is found, send the message to it.
    if (otherClient) {
        switch (message.type) {
            case 'test_output': {
                console.log(`TestWebSocketServer: Received test output: "${message.data.message}" for test: "${message.data.testName}" from ConsoleOutputPoster.`);
                this.sendToClient(otherClient, message);
                break;
            }
            default:
                throw new Error(`Unknown message type: ${message.type}`);
        }
    } else {
      throw new Error('No ConsoleOutputListener to send message to.');
    }
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage) : void {
    if (ws.readyState === WebSocket.OPEN) {
      if (isValidWebSocketMessage(message)) {
        try {
          ws.send(safeJsonStringify(message));
          console.log('TestWebSocketServer: Sent message to client.');
        } catch (error) {
          console.warn(`TestWebSocketServer: WARNING: Could not send message: ${error}`);
        }
      } else {
        console.warn('TestWebSocketServer: WARNING: Cannot send message. Invalid message format');
      }
    } else {
      console.warn('TestWebSocketServer: WARNING: Client is not open. Could not send message.');
    }
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public close() : void {
    this.wss.close();
    console.log('TestWebSocketServer: Closed');
  }
}

let websocketServer: TestWebSocketServer | null = null;

export function getWebSocketServer(port?: number): TestWebSocketServer {
  if (!websocketServer) {
    websocketServer = new TestWebSocketServer(port);
  }
  return websocketServer;
}

export function closeWebSocketServer() : void {
  if (websocketServer) {
    websocketServer.close();
    websocketServer = null;
  }
}