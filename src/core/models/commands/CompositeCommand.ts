import { ICommand, ICompositeCommand } from './Command'

export interface CompositeCommandProps {
  subCommands?: ICommand[]
  timestamp?: number
  commander?: string
}

export class CompositeCommand implements ICompositeCommand {
  subCommands: ICommand[] = []
  timestamp?: number
  commander?: string
  constructor(props: CompositeCommandProps) {
    this.subCommands = props.subCommands ?? []
    this.timestamp = props.timestamp
    this.commander = props.commander
  }

  add(cmd: ICommand) {
    this.subCommands.push(cmd)
  }

  execute() {
    this.subCommands.forEach(cmd => cmd.execute())
  }
  undo = () => {
    this.subCommands.forEach(cmd => cmd.undo())
  }
}
