export function formatTimestampTestStatus(date: Date): string {
    return date.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

export function formatTimestampTestOutput(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
    });
}

// Safe JSON parse: Parse a JSON string and throw an error if it fails
export function safeJsonParse(json: string): any {
    try {
        return JSON.parse(json);
    } catch (error: any) {
        throw new Error(`Failed to parse JSON: ${error.message}`);
    }
}

// Safe JSON stringify: Stringify a JSON object and throw an error if it fails
export function safeJsonStringify(json: any): string {
    try {
        return JSON.stringify(json);
    } catch (error: any) {
        throw new Error(`Failed to stringify JSON: ${error.message}`);
    }
}