import { DNode } from '../nodes'
import { Engine } from '../models'

export type CommandType = 'ADD' | 'DELETE' | 'MOVE' | 'RESIZE' | 'ROTATION' | 'GROUP' | 'UNGROUP'

export interface ICommand<States> {
  type: CommandType
  target: string | string[]
  states: States
  prevStates: States
  redo: () => void
  undo: () => void
}

export interface ICompositeCommand<States> {
  subCommands: ICommand<States>[]
  timestamp?: number
  commander?: string
  redo: () => void
  undo: () => void
}

export abstract class Command<States> implements ICommand<States> {
  engine: Engine
  type: CommandType = 'ADD'
  target: string
  states: States
  prevStates: States

  constructor(nodes: DNode, engine: Engine, states: States, prevStates: States) {
    this.engine = engine
    this.target = nodes.id
    this.states = { ...states }
    this.prevStates = { ...prevStates }
  }
  redo() {
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
