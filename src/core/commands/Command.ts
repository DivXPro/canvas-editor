import { DNode } from '../nodes'
import { Engine } from '../models'
import { isArr } from '../utils/types'

export type CommandType = 'ADD' | 'DELETE' | 'MOVE' | 'RESIZE' | 'ROTATION' | 'GROUP' | 'UNGROUP'

export interface ICommand<States> {
  type: CommandType
  target: string | string[]
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
  target: string | string[]
  states: States
  prevStates: States

  constructor(nodes: DNode | DNode[], engine: Engine, states: States, prevStates: States) {
    this.engine = engine
    this.target = isArr(nodes) ? nodes.map(n => n.id) : nodes.id
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
