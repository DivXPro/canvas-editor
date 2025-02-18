export type CommandType = 'ADD' | 'DELETE' | 'MOVE' | 'RESIZE' | 'ROTATION' | 'GROUP'

export interface ICommand {
  type: CommandType
  target: string
  execute: () => void
  undo: () => void
}

export interface ICompositeCommand {
  subCommands: ICommand[]
  timestamp?: number
  commander?: string
  execute: () => void
  undo: () => void
}
