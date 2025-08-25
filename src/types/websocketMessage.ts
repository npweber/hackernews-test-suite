// WebSocketMessage interface: Represents a web socket message
export interface WebSocketMessage {
    /* Type of message: test output, test status, or error */
    type: 'test_output' | 'test_status' | 'error';
    /* Data of the message */
    data: {
        message: string;
        testName: string;
    };
    /* Timestamp of the message */
    timestamp: string;
  }

/* Check if a string is a valid web socket message type */
function isWebSocketMessageType(typeValue: string): typeValue is 'test_output' | 'test_status' | 'error' {
  return typeValue === 'test_output' || typeValue === 'test_status' || typeValue === 'error';
}

/* Check if a message is a valid web socket message */
export function isValidWebSocketMessage(message: any): undefined | WebSocketMessage {
  return typeof message === 'object' && 'type' in message && isWebSocketMessageType(message.type) && 'data' in message
  && typeof message.data === 'object' && 'message' in message.data && typeof message.data.message === 'string' 
  && 'testName' in message.data && typeof message.data.testName === 'string'
  && 'timestamp' in message && typeof message.timestamp === 'string' ? message as WebSocketMessage : undefined;
}