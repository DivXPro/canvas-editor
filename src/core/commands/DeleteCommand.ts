import { INodeBase } from '../nodes'

import { CommandType, Command } from './Command'

export interface DeleteCommandStates {
  node: INodeBase
}

export class DeleteCommand extends Command<DeleteCommandStates> {
  type: CommandType = 'DELETE'

  redo() {
    const node = this.engine.workspace?.findById(this.target)

    node?.delete()
  }

  undo() {
    const node = this.engine.workspace.generateElement(this.prevStates.node, this.prevStates.node.parentId)

    node?.parent?.addChildAt(node, this.prevStates.node.index ?? 0)
  }
}
