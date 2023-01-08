import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { ScpClient } from './lib/scp-client';

export async function run(): Promise<boolean> {
  try {
    const host: string = core.getInput('host')
    const username: string = core.getInput('user')
    const password: string = core.getInput('password')
    const sourcePath: string = core.getInput('sourcePath')
    const targetPath: string = core.getInput('targetPath')

    const scpClient = new ScpClient({
      host,
      port: 22,
      username,
      password,
    })

    core.debug(new Date().toTimeString())

    core.debug('print file tree')

    await exec.exec('ls');

    core.debug('start upload files...')

    await scpClient.waitForReady();
    await scpClient.uploadDirectory(sourcePath, targetPath)

    core.debug('upload success!')

    await scpClient.close();

    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      core.setFailed(error.message)
    }
  }
  return false;
}

run()