export interface WebSocketMessage {
    type: 'test_output' | 'test_status' | 'error';
    data: {
        message: string;
        testName: string;
    };
    timestamp: string;
  }

function isWebSocketMessageType(typeValue: string): typeValue is 'test_output' | 'test_status' | 'error' {
  return typeValue === 'test_output' || typeValue === 'test_status' || typeValue === 'error';
}

export function isValidWebSocketMessage(message: any): WebSocketMessage | undefined {
  return typeof message === 'object' && 'type' in message && isWebSocketMessageType(message.type) && 'data' in message
  && typeof message.data === 'object' && 'message' in message.data && typeof message.data.message === 'string' 
  && 'testName' in message.data && typeof message.data.testName === 'string'
  && 'timestamp' in message && typeof message.timestamp === 'string' ? message as WebSocketMessage : undefined;
}