import { DNode, ResizeHandle, Size } from '../nodes'
import { isArr } from '../utils/types'

import { CommandType, Command } from './Command'

export interface ResizeCommandStates {
  size: Size
  handle: ResizeHandle
}

export class ResizeCommand extends Command<ResizeCommandStates> {
  type: CommandType = 'RESIZE'

  redo() {
    const nodes = isArr(this.target)
      ? this.target.map(id => this.engine.workbench?.findById(id))
      : [this.engine.workbench?.findById(this.target)]

    try {
      nodes.forEach(n => {
        if (n instanceof DNode) {
          n.resize(this.states.handle, this.states.size)
        }
      })
    } catch (e) {
      console.error('Resize Cmd execute faile', this.serialize(), e)
    }
  }

  undo() {
    const nodes = isArr(this.target)
      ? this.target.map(id => this.engine.workbench?.findById(id))
      : [this.engine.workbench?.findById(this.target)]

    try {
      nodes.forEach(n => {
        if (n instanceof DNode) {
          n.resize(this.prevStates.handle, this.prevStates.size)
        }
      })
    } catch (e) {
      console.error('Resize Cmd undo faile', this.serialize(), e)
    }
  }
}
