import { describe, it, vi, expect } from 'vitest';
import { run } from '../'
import dotenv from 'dotenv';
dotenv.config();

const mockInputData = {
  host: process.env.SERVER_HOST,
  user: process.env.SERVER_USER,
  password: process.env.SERVER_PASSWORD,
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