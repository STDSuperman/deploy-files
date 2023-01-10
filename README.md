# Github Action of Deploy Files

An action that deploys the files to the server and executes some commands.

# Usage

### Parameters


|  Parameter  |  Type  |                         Description                          | Default |   Example   |
| :---------: | :----: | :----------------------------------------------------------: | :-----: | :---------: |
|    host     | String |                         Server Host                          |    \    | 1.13.23.242 |
|    user     | String |                         Server User                          |    \    |    root     |
|    port     | String |                       Server Ssh Port                        |    \    |     22      |
|  password   | String |                       Server Password                        |    \    |   1234567   |
| targetPath  | String |                      Server Target Path                      |    \    |  /home/dir  |
| sourcePath  | String |          Path of the file or folder to be deployed           |    \    |   ./dist    |
| preCommands | String | The command to execute before deploying the file, Multiple are separated by newline characters |    \    | rm -rf 1.ts |
|  commands   | String | The command to execute after deploying the file, Multiple are separated by newline characters |    \    | touch 1.ts  |
|  serverCwd  | String |             The working directory of the command             |    ~    |    /home    |


### Workflow Example

```yml
- name: DeployStep
  uses: STDSuperman/deploy-files@master
  with:
    host: ${{ secrets.SERVER_HOST }}
    user: ${{ secrets.SERVER_USER }}
    port: '22'
    password: ${{ secrets.SERVER_PASSWORD }}
    targetPath: '/home/test-dir'
    sourcePath: './dist'
    preCommands: |
      rm -rf 1.ts
      rm -rf 2.ts
    commands: |
      touch 1.ts
      touch 2.ts
```

