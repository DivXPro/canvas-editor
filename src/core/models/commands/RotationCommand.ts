import { DNode } from '../../elements'
import { Engine } from '../Engine'

import { ICommand, CommandType } from './Command'

export interface RotationCommandStates {
  rotation: number
}

export class RotationCommand implements ICommand {
  engine: Engine
  type: CommandType = 'ROTATION'
  target: string
  states: RotationCommandStates
  prevStates: RotationCommandStates

  constructor(node: DNode, engine: Engine, states: RotationCommandStates, prevStates?: RotationCommandStates) {
    this.engine = engine
    this.target = node.id
    this.states = states
    this.prevStates = prevStates ?? {
      rotation: node.rotation,
    }
  }
  execute() {
    const node = this.engine.operation?.findById(this.target) as DNode

    try {
      node.rotation = this.states.rotation
    } catch (e) {
      console.error('Rotate Cmd execute faile', this.serialize(), e)
    }
  }

  undo() {
    const node = this.engine.operation?.findById(this.target) as DNode

    try {
      node.rotation = this.prevStates.rotation
    } catch (e) {
      console.error('Rotate Cmd undo faile', this.serialize(), e)
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
