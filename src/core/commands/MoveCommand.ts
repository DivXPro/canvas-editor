import { Position, DNode } from '../elements'

import { CommandType, Command } from './Command'

export interface MoveCommandStates {
  position: Position
}

export class MoveCommand extends Command<MoveCommandStates> {
  type: CommandType = 'MOVE'

  execute() {
    const node = this.engine.workbench?.findById(this.target) as DNode

    try {
      node.position = this.states.position
    } catch (e) {
      console.error('Move Cmd execute faile', this.serialize(), e)
    }
  }

  undo() {
    console.debug('undo', this.serialize())
    const node = this.engine.workbench?.findById(this.target) as DNode

    try {
      node.position = this.prevStates.position
    } catch (e) {
      console.error('Move Cmd undo faile', this.serialize(), e)
    }
  }
}
