import { Command, ICompositeCommand } from './Command'

export interface CompositeCommandProps<States> {
  subCommands?: Command<States>[]
  timestamp?: number
  commander?: string
}

export class CompositeCommand implements ICompositeCommand<any> {
  subCommands: Command<any>[] = []
  timestamp?: number
  commander?: string
  constructor(props: CompositeCommandProps<any>) {
    this.subCommands = props.subCommands ?? []
    this.timestamp = props.timestamp
    this.commander = props.commander
  }

  add(cmd: Command<any>) {
    this.subCommands.push(cmd)
  }

  execute() {
    this.subCommands.forEach(cmd => cmd.execute())
  }
  undo = () => {
    this.subCommands.forEach(cmd => cmd.undo())
  }
}
