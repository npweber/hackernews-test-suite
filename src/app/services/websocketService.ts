import { isValidWebSocketMessage, WebSocketMessage } from '@/types/websocketMessage';
import { safeJsonParse, safeJsonStringify } from '@/app/util/util';

// TestWebSocketService class: Handles the web socket connection for the 
// console output listener and console output poster
export class TestWebSocketService {
  private ws: WebSocket | null = null;
  private url: string;

  constructor(url: string = 'ws://localhost:3001') {
    this.url = url;
  }

  connect(onMessage: (message: WebSocketMessage) => void, onStatusChange: (connected: boolean) => void) : void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('TestWebSocketService: Connected');
        onStatusChange(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = safeJsonParse(event.data);
          console.log(`TestWebSocketService: Received message: ${message.type} from web socket server.`);
          onMessage(message);
        } catch (error) {
          console.warn(`TestWebSocketService: WARNING: Could not handle message: ${error}`);
        }
      };

      this.ws.onclose = () => {
        console.log('TestWebSocketService: Disconnected');
        onStatusChange(false);
      };

      this.ws.onerror = (error) => {
        this.disconnect();
        onStatusChange(false);
        console.error(`TestWebSocketService: ERROR: WebSocket error: ${error}`);
      };
    } catch (error: any) {
      this.disconnect();
      onStatusChange(false);
      console.error(`TestWebSocketService: ERROR: Failed to create connection: ${error}`);
    }
  }

  disconnect() : void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /* Send a message to the web socket server */
  send(message: WebSocketMessage) : void {
    if (this.ws && this.isConnected()) {
      if (isValidWebSocketMessage(message)) {
          try {
            this.ws.send(safeJsonStringify(message));
            console.log('TestWebSocketService: Sent message to web socket server.');
          } catch (error) {
            console.warn(`TestWebSocketService: WARNING: Could not send message: ${error}`);
          }
      } else {
        console.warn('TestWebSocketService: WARNING: Cannot send message. Invalid message format');
      }
    } else {
      console.warn('TestWebSocketService: WARNING: Cannot send message. Not connected');
    }
  }
  
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
