import { EventEmitter } from 'events'
import { Client as SSHClient, SFTPWrapper } from 'ssh2'
import type { ConnectConfig, TransferOptions, Stats, InputAttributes } from 'ssh2'
import { win32, posix } from 'path'
import assert from 'assert'
import path from 'path'
import fs from 'fs'

interface IConfig extends ConnectConfig {
  remoteOsType?: 'posix' | 'win32';
}

export class ScpClient extends EventEmitter {
  private sftpWrapper: SFTPWrapper | null = null
  private sshClient: SSHClient | null = null
  private remotePathSep = posix.sep;

  constructor(
    public config: IConfig
  ) {
    super();
    this.initSsh();
  }

  public async uploadFile(
    sourcePath: string,
    targetPath: string,
    options?: TransferOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      assert(this.sftpWrapper, 'ssh is not connected!');
      this.sftpWrapper.fastPut(sourcePath, targetPath, options || {}, (err) => {
        if (err) {
          console.error('fast put error: ' + err.message)
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  public async stat(remotePath: string): Promise<Stats> {
    return new Promise((resolve, reject) => {
      assert(this.sftpWrapper, 'ssh is not connected!');
      this.sftpWrapper.stat(remotePath, (err, stats) => {
        if (err) {
          console.error('stat error: ' + err.message)
          reject(err)
        } else {
          resolve(stats)
        }
      })
    })
  }

  public async checkExist(remotePath: string): Promise<string> {
    try {
      console.log('start check exist');
      const stats = await this.stat(remotePath)

      if (stats.isDirectory()) {
        return 'd'
      }
      if (stats.isSymbolicLink()) {
        return 'l'
      }
      if (stats.isFile()) {
        return '-'
      }
      return ''
    } catch (error) {
      return ''
    }
  }

  public async mkdir(remotePath: string, attributes: InputAttributes = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      assert(this.sftpWrapper, 'ssh is not connected!');
      console.log('start mkdir');
      this.sftpWrapper.mkdir(remotePath, attributes, (err) => {
        if (err) {
          console.error('mkdir error: ' + err.message)
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  public async uploadDirectory(src: string, dest: string): Promise<void> {
    console.log('start upload directory');
    const isExist = await this.checkExist(dest)
    if (!isExist) {
      await this.mkdir(dest)
    }

    const dirEntries = fs.readdirSync(src, {
      encoding: 'utf8',
      withFileTypes: true,
    })

    for (const e of dirEntries) {
      if (e.isDirectory()) {
        const newSrc = path.join(src, e.name)
        const newDst = this.normalizeFilePath(dest, e.name)
        await this.uploadDirectory(newSrc, newDst)
      } else if (e.isFile()) {
        const newSrc = path.join(src, e.name)
        const newDst = this.normalizeFilePath(dest, e.name)
        await this.uploadFile(newSrc, newDst)
      }
    }
  }

  public async exec(command: string, cwd: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.sshClient?.exec(`cd ${cwd} && ${command}`, {}, (err, channel) => {
        if (err) {
          reject(err)
          console.error('exec: ', err);
        }

        channel.on('exit', (...args) => {
          resolve()
        })
      })
    })
  }

  public close() {
    if (this.sshClient && this.sftpWrapper) {
      this.sshClient.end()
      this.sshClient = null
      this.sftpWrapper = null
    }
  }

  public async waitForReady(cb = () => void 0): Promise<void> {
    return new Promise((resolve, reject) => {
      const resolveFn = async () => {
        await cb();
        resolve();
      }

      if (this.sftpWrapper) resolveFn();

      this.on('ready', resolveFn);
      this.on('error', reject);
      this.on('close', reject);
    })
  }

  private normalizeFilePath(...args: string[]): string {
    if (this.remotePathSep === path.win32.sep) {
      return path.win32.join(...args)
    }
    return path.posix.join(...args)
  }

  private initSsh() {
    const ssh = new SSHClient()
    ssh.on('connect', () => {
      console.log('ssh connected')
      this.emit('connect')
    })

    ssh.on('ready', () => {
      ssh.sftp((err, sftp: SFTPWrapper) => {
        if (err) { throw err }
        this.sftpWrapper = sftp
        this.emit('ready')
      })
    })

    ssh.on('error', (err: Error) => {
      console.error(err)
      this.emit('error', err)
    })

    ssh.on('end', () => {
      console.log('ssh connection end')
      this.emit('end')
    })

    ssh.on('close', () => {
      console.log('ssh connection closed')
      this.sftpWrapper = null
      this.emit('close')
    })

    ssh.connect(this.config)
    this.sshClient = ssh

    if (this.config.remoteOsType === 'win32') {
      this.remotePathSep = win32.sep
    }
  }
}