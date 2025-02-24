import { DGroup } from '../nodes'

import { Command, CommandType } from './Command'

export type GroupNodeState = {
  id: string
  index: number
  parent?: string
  nodes: ChildNode[]
}

export type ChildNode = {
  id: string
  index: number
}

export interface GroupSelectionCommandStates {
  groupStates: GroupNodeState[]
}

export class GroupSelectionCommand extends Command<GroupSelectionCommandStates> {
  type: CommandType = 'GROUP'
  execute() {
    const nodes = this.prevStates.groupStates
      .map(state => state.nodes.map(node => node.id))
      .flat()
      .map(nodeId => this.engine.workbench.findById(nodeId))
      .filter(node => node != null)

    this.engine.workbench.selection.groupNodes(nodes)
  }
  undo() {
    this.states.groupStates.forEach(state => {
      const group = this.engine.workbench.findById(state.id)

      if (group instanceof DGroup) {
        group.ungroup()
      }
      state.nodes
        .sort((a, b) => a.index - b.index)
        .forEach(nodeState => {
          const node = this.engine.workbench.findById(nodeState.id)

          node?.setIndex(nodeState.index)
        })
    })
  }
}
