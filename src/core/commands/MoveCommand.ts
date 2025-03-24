import { Position, DNode } from '../nodes'
import { isArr } from '../utils/types'

import { CommandType, Command } from './Command'

export interface MoveCommandStates {
  position: Position
}

export class MoveCommand extends Command<MoveCommandStates> {
  type: CommandType = 'MOVE'

  redo() {
    const nodes = isArr(this.target)
      ? this.target.map(id => this.engine.workspace?.findById(id))
      : [this.engine.workspace?.findById(this.target)]

    try {
      nodes.forEach(n => {
        if (n) {
          n.position = this.states.position
        }
      })
    } catch (e) {
      console.error('Move Cmd execute faile', this.serialize(), e)
    }
  }

  undo() {
    console.debug('undo', this.serialize())
    const nodes = isArr(this.target)
      ? this.target.map(id => this.engine.workspace?.findById(id))
      : [this.engine.workspace?.findById(this.target)]

    try {
      nodes.forEach(n => {
        if (n) {
          n.position = this.prevStates.position
        }
      })
    } catch (e) {
      console.error('Move Cmd undo faile', this.serialize(), e)
    }
  }
}
