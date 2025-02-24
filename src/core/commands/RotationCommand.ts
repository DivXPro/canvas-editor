import { DNode } from '../nodes'
import { isArr } from '../utils/types'

import { CommandType, Command } from './Command'

export interface RotationCommandStates {
  rotation: number
}

export class RotationCommand extends Command<RotationCommandStates> {
  type: CommandType = 'ROTATION'

  execute() {
    const nodes = isArr(this.target)
      ? this.target.map(id => this.engine.workbench?.findById(id))
      : [this.engine.workbench?.findById(this.target)]

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
    console.debug('undo', this.serialize())
    const nodes = isArr(this.target)
      ? this.target.map(id => this.engine.workbench?.findById(id))
      : [this.engine.workbench?.findById(this.target)]

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
