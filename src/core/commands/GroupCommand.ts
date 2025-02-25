import { DGroup, IDGroupBase } from '../nodes'

import { Command, CommandType } from './Command'

export type ChildNodeState = {
  id: string
  index: number
}

export interface GroupCommandStates {
  group: IDGroupBase
  nodes: ChildNodeState[]
}

export class GroupCommand extends Command<GroupCommandStates> {
  type: CommandType = 'GROUP'

  redo() {
    const { children, ...schema } = this.states.group
    const group = new DGroup(this.engine, schema)

    if (group.parent) {
      group.parent.addChildAt(group, this.states.group.index ?? 0)
    } else {
      this.engine.workbench.canvaNodes.splice(group.index, 0, group)
    }

    this.states.nodes
      .sort((a, b) => a.index - b.index)
      .forEach(nodeState => {
        const node = this.engine.workbench.findById(nodeState.id)

        if (node) {
          node.joinGroupAt(group, nodeState.index)
        }
      })
  }

  undo() {
    const group = this.engine.workbench.findById(this.target)

    if (group instanceof DGroup) {
      group.ungroup()
    }
    this.prevStates.nodes
      .sort((a, b) => a.index - b.index)
      .forEach(nodeState => {
        const node = this.engine.workbench.findById(nodeState.id)

        node?.setIndex(nodeState.index)
      })
  }
}
