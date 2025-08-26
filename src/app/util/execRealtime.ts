import { exec, ExecOptions } from 'child_process';

// Interface for the output of the realtime executor
export interface RealtimeOutput {
  line: string;
  timestamp: string;
  type: 'stdout' | 'stderr';
}

// Interface for the result of the realtime executor
export interface ExecRealtimeResult {
  success: boolean;
  exitCode: number;
  output: RealtimeOutput[];
  error?: string;
}

/**
 * Executes a command and captures stdout/stderr in real time
 * @param command - The command to execute
 * @param options - Exec options
 * @param onOutput - Callback for each line of output (optional)
 * @returns Promise that resolves with the execution result
 */
export function execRealtime(
  command: string,
  options: ExecOptions = {},
  onOutput?: (output: RealtimeOutput) => void
): Promise<ExecRealtimeResult> {
  return new Promise((resolve, reject) => {
    const output: RealtimeOutput[] = [];
    let stdoutBuffer = '';
    let stderrBuffer = '';

    // Execute the command and use a callback to handle the output/result
    const childProcess = exec(command, options, (error, stdout, stderr) => {
      // Process any remaining buffered stdout
      if (stdoutBuffer.trim()) {
        const lines = stdoutBuffer.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          const outputLine: RealtimeOutput = {
            line: line.trim(),
            timestamp: new Date().toISOString(),
            type: 'stdout'
          };
          output.push(outputLine);
          onOutput?.(outputLine);
        });
      }

      // Process any remaining buffered stderr
      if (stderrBuffer.trim()) {
        const lines = stderrBuffer.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          const outputLine: RealtimeOutput = {
            line: line.trim(),
            timestamp: new Date().toISOString(),
            type: 'stderr'
          };
          output.push(outputLine);
          onOutput?.(outputLine);
        });
      }

      // Create the result object
      const result: ExecRealtimeResult = {
        success: !error,
        exitCode: error ? (error as any).code || 1 : 0,
        output,
        error: error?.message
      };

      // If an error occurs, reject the promise
      if (error) {
        reject(result);
      // If no error occurs, resolve the promise
      } else {
        resolve(result);
      }
    });

    // Capture stdout in real time
    if (childProcess.stdout) {
      childProcess.stdout.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stdoutBuffer += chunk;

        // Process complete lines of stdout
        const lines = stdoutBuffer.split('\n');
        stdoutBuffer = lines.pop() || ''; // Keep incomplete line in buffer

        // Process each line of stdout and add it to the output array
        lines.forEach(line => {
          if (line.trim()) {
            const outputLine: RealtimeOutput = {
              line: line.trim(),
              timestamp: new Date().toISOString(),
              type: 'stdout'
            };
            output.push(outputLine);
            onOutput?.(outputLine);
          }
        });
      });
    }

    // Capture stderr in real time
    if (childProcess.stderr) {
      childProcess.stderr.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stderrBuffer += chunk;

        // Process complete lines of stderr
        const lines = stderrBuffer.split('\n');
        stderrBuffer = lines.pop() || ''; // Keep incomplete line in buffer

        // Process each line of stderr and add it to the output array
        lines.forEach(line => {
          if (line.trim()) {
            const outputLine: RealtimeOutput = {
              line: line.trim(),
              timestamp: new Date().toISOString(),
              type: 'stderr'
            };
            output.push(outputLine);
            onOutput?.(outputLine);
          }
        });
      });
    }

    // Handle process errors and reject the promise
    childProcess.on('error', (error: Error) => {
      const errorOutput: RealtimeOutput = {
        line: `Process error: ${error.message}`,
        timestamp: new Date().toISOString(),
        type: 'stderr'
      };
      output.push(errorOutput);
      onOutput?.(errorOutput);

      reject({
        success: false,
        exitCode: -1,
        output,
        error: error.message
      });
    });
  });
}

/**
 * Executes any command with real-time output
 * @param command - The command to execute
 * @param onOutput - Callback for each line of output
 * @returns Promise with the execution result
 */
export function execCommandRealtime(
  command: string,
  onOutput?: (output: RealtimeOutput) => void
): Promise<ExecRealtimeResult> {
  return execRealtime(command, {}, onOutput);
}
