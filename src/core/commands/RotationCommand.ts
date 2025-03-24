import { isArr } from '../utils/types'

import { CommandType, Command } from './Command'

export interface RotationCommandStates {
  rotation: number
}

export class RotationCommand extends Command<RotationCommandStates> {
  type: CommandType = 'ROTATION'

  redo() {
    const nodes = isArr(this.target)
      ? this.target.map(id => this.engine.workspace?.findById(id))
      : [this.engine.workspace?.findById(this.target)]

    try {
      nodes.forEach(n => {
        if (n) {
          n.rotation = this.states.rotation
        }
      })
    } catch (e) {
      console.error('Rotate Cmd execute failed', this.serialize(), e)
    }
  }

  undo() {
    const nodes = isArr(this.target)
      ? this.target.map(id => this.engine.workspace?.findById(id))
      : [this.engine.workspace?.findById(this.target)]

    try {
      nodes.forEach(n => {
        if (n) {
          n.rotation = this.prevStates.rotation
        }
      })
    } catch (e) {
      console.error('Rotate Cmd undo failed', this.serialize(), e)
    }
  }
}
