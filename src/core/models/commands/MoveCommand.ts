import { Vector2, DNode } from '../../elements'
import { Engine } from '../Engine'

import { ICommand, CommandType } from './Command'

export interface MoveCommandStates {
  position: Vector2
}

export class MoveCommand implements ICommand {
  engine: Engine
  type: CommandType = 'MOVE'
  target: string
  states: MoveCommandStates
  prevStates: MoveCommandStates

  constructor(node: DNode, engine: Engine, states: MoveCommandStates, prevStates?: MoveCommandStates) {
    this.engine = engine
    this.target = node.id
    this.states = states
    this.prevStates = prevStates ?? {
      position: node.position,
    }
  }
  execute() {
    const node = this.engine.operation?.findById(this.target) as DNode

    try {
      node.position = this.states.position
    } catch (e) {
      console.error('Move Cmd execute faile', this.serialize(), e)
    }
  }

  undo() {
    const node = this.engine.operation?.findById(this.target) as DNode

    try {
      node.position = this.prevStates.position
    } catch (e) {
      console.error('Move Cmd undo faile', this.serialize(), e)
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
