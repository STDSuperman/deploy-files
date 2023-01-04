import { describe, it, vi, expect } from 'vitest';
import { run } from '../'

const mockInputData = {
  host: '117.78.2.',
  user: 'root',
  password: '',
  sourcePath: './dist',
  targetPath: '/home/test-dir'
}

describe('test deploy files', () => {
  vi.mock('@actions/core', () => {
    return {
      getInput(key: keyof typeof mockInputData) {
        return mockInputData[key];
      },
      setFailed: vi.fn(),
      debug: console.debug,
    }
  })

  it('should deploy files', async () => {
    expect(await run()).toBeTruthy();
  });
});