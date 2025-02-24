import { DGroup } from '../nodes'
import { isArr } from '../utils/types'

import { Command, CommandType } from './Command'
import { GroupNodeState } from './GroupSelectionCommand'

export interface UngroupCommandStates {
  groupStates: GroupNodeState[]
}

export class UngroupCommand extends Command<UngroupCommandStates> {
  type: CommandType = 'UNGROUP'
  execute() {
    const groups = isArr(this.target)
      ? this.target.map(id => this.engine.workbench?.findById(id))
      : [this.engine.workbench?.findById(this.target)]

    groups.forEach(group => {
      if (group instanceof DGroup) {
        group.ungroup()
      }
    })
  }
  undo() {
    this.prevStates.groupStates.forEach(state => {
      const group = this.engine.workbench.history.disposedNodes.get(state.id)

      if (group instanceof DGroup) {
        group.parent?.addChildAt(group, state.index)
        state.nodes
          .sort((a, b) => a.index - b.index)
          .forEach(nodeState => {
            const node = this.engine.workbench.findById(nodeState.id)

            if (node) {
              node.joinGroup(group)
            }
          })
      }
    })
  }
}
