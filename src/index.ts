import * as core from '@actions/core'
import { ScpClient } from './lib/scp-client'
import { logger } from './lib/logger'
import { parseCommandStr } from './utils'

export async function run(): Promise<boolean> {
  try {
    const host: string = core.getInput('host')
    const username: string = core.getInput('user')
    const password: string = core.getInput('password')
    const sourcePath: string = core.getInput('sourcePath')
    const port: string = core.getInput('port')
    const targetPath: string = core.getInput('targetPath')
    const commandStr: string = core.getInput('commands')
    const serverCwd: string = core.getInput('serverCwd') || '~'
    const preCommandStr: string = core.getInput('preCommands')
    const postCommands: string[] = parseCommandStr(commandStr)
    const preCommands: string[] = parseCommandStr(preCommandStr)

    const scpClient = new ScpClient({
      host,
      port: Number(port || 22),
      username,
      password,
    })

    await scpClient.waitForReady()

    if (preCommands?.length) {
      logger.log('start exec pre commands...')
      await Promise.all(
        preCommands.map((command) => scpClient.exec(command, serverCwd))
      )
      logger.log('pre command exec success!')
    }

    logger.log('start upload files...')
    await scpClient.uploadDirectory(sourcePath, targetPath)
    logger.log('upload success!')

    if (postCommands?.length) {
      logger.log('start exec commands...')
      await Promise.all(
        postCommands.map((command) => scpClient.exec(command, serverCwd))
      )
      logger.log('command exec success!')
    }

    await scpClient.close()

    return true
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      core.setFailed(error.message)
    }
  }
  return false
}

!process.env.TEST && run()
