export const parseCommandStr = (cmd: string): string[] => {
  return cmd?.split(/\n+/) || []
}
