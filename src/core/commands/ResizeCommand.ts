import { DNode, Size } from '../elements'
import { Engine } from '../models/Engine'

import { ICommand, CommandType } from './Command'

export interface ResizeCommandStates {
  size: Size
}

export class ResizeCommand implements ICommand {
  engine: Engine
  type: CommandType = 'RESIZE'
  target: string
  states: ResizeCommandStates
  prevStates: ResizeCommandStates

  constructor(node: DNode, engine: Engine, states: ResizeCommandStates, prevStates?: ResizeCommandStates) {
    this.engine = engine
    this.target = node.id
    this.states = states
    this.prevStates = prevStates ?? {
      size: node.size,
    }
  }
  execute() {
    const node = this.engine.operation?.findById(this.target) as DNode

    try {
      node.size = this.states.size
    } catch (e) {
      console.error('Resize Cmd execute faile', this.serialize(), e)
    }
  }

  undo() {
    const node = this.engine.operation?.findById(this.target) as DNode

    try {
      node.size = this.prevStates.size
    } catch (e) {
      console.error('Resize Cmd undo faile', this.serialize(), e)
    }
  }

  serialize() {
    return {
      target: this.target,
      state: this.states,
      prevState: this.prevStates,
      states: this.states,
    }
  }
}
