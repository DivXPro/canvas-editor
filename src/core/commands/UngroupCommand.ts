import { DGroup, IDGroupBase } from '../nodes'

import { Command, CommandType } from './Command'
import { ChildNodeState } from './GroupCommand'

export interface UngroupCommandStates {
  childNodeStates: ChildNodeState[]
  group: IDGroupBase
}

export class UngroupCommand extends Command<UngroupCommandStates> {
  type: CommandType = 'UNGROUP'
  redo() {
    const group = this.engine.workbench?.findById(this.target)

    if (group instanceof DGroup) {
      group.ungroup()
    }
  }
  undo() {
    const { children, ...schema } = this.states.group
    const group = new DGroup(this.engine, schema)

    if (group.parent) {
      group.parent.addChildAt(group, this.prevStates.group.index ?? 0)
    } else {
      this.engine.workbench.canvaNodes.splice(group.index, 0, group)
    }

    if (group instanceof DGroup) {
      this.prevStates.childNodeStates
        .sort((a, b) => a.index - b.index)
        .forEach(nodeState => {
          const node = this.engine.workbench.findById(nodeState.id)

          if (node) {
            node.joinGroup(group)
          }
        })
    }
  }
}
