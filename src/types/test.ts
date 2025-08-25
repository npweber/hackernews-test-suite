export interface Test {
  id: string;
  name: string;
  status: 'not run' | 'running' | 'failed' | 'passed';
  failedAt?: string;
  passedAt?: string;
}