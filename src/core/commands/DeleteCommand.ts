import { INodeBase } from '../nodes'

import { CommandType, Command } from './Command'

export interface DeleteCommandStates {
  node: INodeBase
}

export class DeleteCommand extends Command<DeleteCommandStates> {
  type: CommandType = 'DELETE'

  redo() {
    const node = this.engine.workbench?.findById(this.target)

    node?.destory()
  }

  undo() {
    const node = this.engine.workbench.generateElement(this.prevStates.node, this.prevStates.node.parentId)

    node?.parent?.addChildAt(node, this.prevStates.node.index ?? 0)
  }
}
