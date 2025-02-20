import { Position } from '../../elements'

import { AbstractMutationElementEvent, IMutationElementEventData } from './AbstractMutationElementEvent'

export interface NodeTransformData extends IMutationElementEventData {
  transform: {
    position?: Position
    rotation?: number
  }
}

export class NodeTransformEvent extends AbstractMutationElementEvent<NodeTransformData> {
  type = 'node:transform'
}
