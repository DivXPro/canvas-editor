import { DNode, ResizeHandle, Size } from '../elements'

import { CommandType, Command } from './Command'

export interface ResizeCommandStates {
  size: Size
  handle: ResizeHandle
}

export class ResizeCommand extends Command<ResizeCommandStates> {
  type: CommandType = 'RESIZE'

  execute() {
    const node = this.engine.workbench?.findById(this.target) as DNode

    try {
      node.resize(this.states.handle, this.states.size)
    } catch (e) {
      console.error('Resize Cmd execute faile', this.serialize(), e)
    }
  }

  undo() {
    const node = this.engine.workbench?.findById(this.target) as DNode

    try {
      node.resize(this.prevStates.handle, this.prevStates.size)
    } catch (e) {
      console.error('Resize Cmd undo faile', this.serialize(), e)
    }
  }
}
