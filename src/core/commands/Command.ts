import { DNode } from '../elements'
import { Engine } from '../models'

export type CommandType = 'ADD' | 'DELETE' | 'MOVE' | 'RESIZE' | 'ROTATION' | 'GROUP'

export interface ICommand<States> {
  type: CommandType
  target: string
  states: States
  prevStates: States
  execute: () => void
  undo: () => void
}

export interface ICompositeCommand<States> {
  subCommands: ICommand<States>[]
  timestamp?: number
  commander?: string
  execute: () => void
  undo: () => void
}

export abstract class Command<States> implements ICommand<States> {
  engine: Engine
  type: CommandType = 'ADD'
  target: string
  states: States
  prevStates: States

  constructor(node: DNode, engine: Engine, states: States, prevStates: States) {
    this.engine = engine
    this.target = node.id
    this.states = { ...states }
    this.prevStates = { ...prevStates }
  }
  execute() {
    console.error('This method must be implemented in subclass')
  }
  undo() {
    console.error('This method must be implemented in subclass')
  }

  serialize() {
    return {
      type: this.type,
      target: this.target,
      prevStates: this.prevStates,
      states: this.states,
    }
  }
}
